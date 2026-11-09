/* SafeEducation prototype self-test. Runs only with ?selftest: index.html?selftest
 * Result: <html data-selftest="pass|fail">, report in <pre id="selftest-log">.
 * Each step names the requirement of SafeEducation_Specification.md it protects. A new button, form or behaviour gets a step here.
 * Steps are independent: every step starts from reset() — profile «Школа», role «Директор», mode «Учебный день», no dialog, no sheet. */
(function(){
'use strict';
if(!/[?&]selftest\b/.test(location.search)) return;
const L=window.SE, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const steps=[]; const step=(name,fn)=>steps.push({name,fn});
function ok(cond,msg){if(!cond) throw new Error(msg)}
function eq(a,b,msg){if(a!==b) throw new Error(`${msg}: ожидалось ${JSON.stringify(b)}, получено ${JSON.stringify(a)}`)}
async function go(route){if(location.hash!=='#'+route){location.hash='#'+route;await sleep(30)} L.render()}
const click=sel=>{const el=typeof sel==='string'?$(sel):sel; ok(el,`нет элемента ${sel}`); el.click(); return el};
const setVal=(sel,v)=>{const el=$(sel);ok(el,`нет поля ${sel}`);el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}))};
async function reset(){L.closeDlg();L.closeSheet();L.S.ds='data';L.S.offline=false;$('#pp-offline').checked=false;
  if(L.S.profile!=='school'||L.S.evac||L.S.mode!=='day'){L.S.evac=null;L.switchProfile('school')}
  L.S.role='director';$('#pp-role').value='director';await go('home')}
const ROUTES=['home','post','video','attendance','events','rollcall','people','journals','reports','service','settings','audit'];

/* ---------- ядро, навигация, профили ---------- */
step('Все разделы открываются без ошибок, у каждого заголовок и текущий пункт меню · SKD-UI-03',async()=>{
  await reset();
  for(const r of ROUTES){await go(r); ok($('#view').children.length>0,`раздел ${r} пуст`); ok($('#page-title').textContent.trim(),`нет заголовка ${r}`);
    eq($('#nav .nav-item[aria-current=page]')?.getAttribute('href'),'#'+r,`текущий пункт меню на ${r}`)}
});
step('Профиль меняет словарь интерфейса: школа → «Класс», детсад → «Группа», «Приём и выдача» только в детсаду · SKD-UI-04, DOU-01',async()=>{
  await reset(); ok(!$('#nav a[href="#handover"]'),'в школе есть пункт «Приём и выдача»'); await go('attendance'); ok(/Класс/.test($('#view').textContent),'нет слова «Класс»');
  L.switchProfile('kinder'); await go('attendance'); ok(/Группа/.test($('#view').textContent),'нет слова «Группа»'); ok($('#nav a[href="#handover"]'),'в детсаду нет «Приём и выдача»');
  ok(/Воспитанники/.test((await go('home'),$('#view').textContent)),'нет «Воспитанники» на главной');
});
step('Главная: «Сейчас в здании» = сумма категорий · SKD-PRS-01',async()=>{
  await reset(); const ib=L.inBuilding(); eq(ib.total,ib.kids+ib.staff+ib.vis+ib.con,'сумма'); eq($('#k-in').textContent.trim(),String(ib.total),'число на экране');
  click('[data-act=inbuilding]'); ok($('#sheet').hasAttribute('data-open'),'список «кто в здании» не открылся'); ok(/Сейчас в здании/.test($('#sheet').textContent),'нет заголовка');
});
step('Сверка: пришли + отсутствуют = по списку, по объекту и по каждой группе · SKD-PRS-02',async()=>{
  await reset(); const s=L.stats(L.db.kids); eq(s.came+s.absent,s.list,'объект');
  for(const g of L.db.groups){const k=L.db.kids.filter(x=>x.g===g.id),t=L.stats(k);eq(t.came+t.absent,t.list,`группа ${g.id}`)}
  eq($('#k-came').textContent.trim(),String(s.came),'«Пришли» на экране'); eq($('#k-abs').textContent.trim(),String(s.absent),'«Отсутствуют» на экране');
});
step('Проход СКУД увеличивает «Сейчас в здании» · SKD-PRS-01',async()=>{
  await reset(); const before=L.inBuilding().kids; const k=L.simPass(); ok(k,'проход не смоделирован'); eq(L.inBuilding().kids,before+1,'счётчик детей'); L.render(); eq($('#k-in').textContent.trim(),String(L.inBuilding().total),'экран не обновился');
});
step('Автообновление: при потере связи — плашка «данные устарели» · SKD-DSH-02',async()=>{
  await reset(); const sw=$('#pp-offline'); sw.checked=true; sw.dispatchEvent(new Event('change',{bubbles:true})); ok(!$('#stale').hidden,'плашки нет'); ok(/устарели/.test($('#stale').textContent),'нет текста');
  sw.checked=false; sw.dispatchEvent(new Event('change',{bubbles:true})); ok($('#stale').hidden,'плашка не скрылась');
});

/* ---------- посещаемость ---------- */
step('Журнал посещаемости: фильтр по классу и ФИО, по 50 строк · SKD-PRS-07',async()=>{
  await reset(); L.S.att.tab='journal'; await go('attendance');
  const g=L.db.groups[5].id; setVal('#att-g',g); const rows=$$('#att-res tbody tr'); ok(rows.length>0,'пусто'); ok(rows.every(r=>r.children[1].textContent===g),'чужой класс в выдаче');
  setVal('#att-g',''); ok($$('#att-res tbody tr').length===50,'не 50 строк на странице'); ok(/по 50 строк/.test($('#att-res').textContent),'нет пейджера');
  const k=L.db.kids[10]; setVal('#att-q',k.fio.split(' ')[0]); ok($$('#att-res tbody tr').some(r=>r.textContent.includes(k.fio)),'поиск по ФИО не нашёл');
});
step('Причина отсутствия сохраняется и пишется в аудит · SKD-PRS-05, SKD-AUD-01',async()=>{
  await reset(); const k=L.db.kids.find(x=>x.day.st==='absent'&&!x.day.reason); ok(k,'нет отсутствующего без причины'); const n=L.S.audit.length;
  L.openKid(k.id); setVal('#k-reason','болезнь'); click('[data-act=reason-save]'); eq(k.day.reason,'болезнь','причина'); ok(L.S.audit.length>n&&/Причина отсутствия/.test(L.S.audit[0].action),'нет записи аудита');
});
step('«Требует проверки»: исправление статуса с автором в аудите · SKD-PRS-06',async()=>{
  await reset(); L.S.att.tab='check'; await go('attendance'); const b=$('[data-act=fix][data-v=in]'); ok(b,'нет строк «требует проверки»'); const k=L.db.kids.find(x=>x.id===b.dataset.id);
  b.click(); eq(k.day.st,'in','статус'); ok(/Исправлен статус/.test(L.S.audit[0].action)&&L.S.audit[0].user===L.S.audit[0].user,'нет записи аудита'); eq(L.S.audit[0].user,'Морозова Т. В.','автор исправления');
});
step('Классный руководитель видит только свой класс; аудит и видео ему недоступны · раздел 9, критерий приёмки 9',async()=>{
  await reset(); L.S.role='teacher'; await go('attendance'); ok(L.S.route==='attendance','не открылся свой класс');
  L.S.att.tab='journal'; L.render(); const g=L.db.P.teacher.grp; ok($$('#att-res tbody tr').every(r=>r.children[1].textContent===g),'видны чужие классы');
  ok(!$('#nav a[href="#audit"]')&&!$('#nav a[href="#video"]'),'в меню есть аудит или видео'); await go('audit'); ok(/Нет доступа/.test($('#view').textContent),'аудит открылся');
});

/* ---------- состояние систем ---------- */
step('Светофор: неисправность — жёлтый, подсказка с числом устройств, клик ведёт в «Обслуживание» · SKD-SYS-01/02',async()=>{
  await reset(); const s=L.db.sys.find(x=>x.id==='video'); eq(L.sysState(s),'warn','состояние');
  const row=$('.sys[data-sys=video]'); ok(row.querySelector('.light.warn'),'нет жёлтого'); ok(/Неисправных устройств: \d+ из \d+/.test(row.dataset.tip),'нет числа в подсказке');
  row.click(); await sleep(30); L.render(); eq(L.S.route,'service','переход');
});
step('Камера, перехваченная СРВИ, — «недоступна» и без заявки · критерий приёмки 8',async()=>{
  await reset(); const c=L.db.cams.find(x=>x.srvi); ok(c,'нет такой камеры'); await go('video'); ok(/Камера недоступна/.test($('#view').textContent),'нет статуса');
  ok(!L.db.tickets.some(t=>t.dev.includes(c.name)),'создана заявка'); ok(!L.db.sys.flatMap(s=>s.faults).some(f=>f.dev.includes(c.name)),'камера в неисправностях');
});
step('Видео Live: увеличенный режим со стрелками и переходом в архив · SKD-DSH-04',async()=>{
  await reset(); click('.cam[data-act=cam-open]'); ok($('#dlg').open,'не открылась'); const t1=$('#dlg .dialog-title').textContent; click('#dlg [data-act=cam-step][data-d="1"]'); ok($('#dlg .dialog-title').textContent!==t1,'стрелка не переключила'); click('#dlg [data-act=cam-arch]'); ok(/Архив/.test($('#dlg').textContent),'нет архива'); L.closeDlg();
});

/* ---------- события ---------- */
step('Событие закрывается только с результатом, отметка — в аудите · SKD-EVT-03',async()=>{
  await reset(); const e=L.db.events.find(x=>x.status==='new'); L.openEvent(e.id); click('[data-act=ev-done]'); eq(e.status,'new','закрылось без результата'); ok(/Выберите результат/.test($('#ev-err').textContent),'нет подсказки');
  click('[data-act=ev-res][data-v="ложное"]'); click('[data-act=ev-done]'); eq(e.status,'done','не закрылось'); eq(e.result,'ложное','результат'); ok(/Событие обработано/.test(L.S.audit[0].action),'нет аудита');
});
step('Неподтверждённая тревога через 60 с эскалируется · SKD-EVT-03',async()=>{
  await reset(); L.A['sim-fight'](); const e=L.db.events[0]; ok(!e.esc,'эскалация сразу'); L.tick(new Date(+e.t+L.ESC_AFTER+1000)); ok(e.esc,'не эскалировалось');
});
step('Ответ родителя «не знаю» поднимает событие ответственному и администрации · SKD-NTF-04',async()=>{
  await reset(); const n=L.db.events.length; const k=L.simDontKnow(); ok(L.db.events.length===n+1,'нет события'); eq(L.db.events[0].type,'dontknow','тип'); eq(L.db.events[0].person,k.id,'ребёнок');
});

/* ---------- режимы, эвакуация ---------- */
step('Сработка СПС: «Эвакуация», снимок «кто в здании», двери разблокированы · SKD-MOD-05, SKD-EVC-01',async()=>{
  await reset(); const inside=L.db.kids.filter(k=>['in','check'].includes(k.day.st)).length; L.A['sim-fire']();
  eq(L.S.mode,'evac','режим'); eq(L.S.doors,'unlocked','двери'); eq(L.S.evac.snap.length,inside,'снимок'); await go('home'); ok(/Не учтено/.test($('#view').textContent),'нет счётчика не учтённых');
  ok(!$('#view').textContent.includes('Последние события'),'главная не перестроилась (SKD-UI-05)');
});
step('Пожар отменяет ЧС · SKD-MOD-05',async()=>{
  await reset(); L.setMode('lock','тест'); eq(L.S.doors,'locked_in','ЧС не включилась'); L.A['sim-fire'](); eq(L.S.mode,'evac','режим'); eq(L.S.doors,'unlocked','двери не разблокированы'); ok(L.S.evac.cancelledLock,'нет отметки об отмене ЧС');
});
step('Перекличка: отметка учителя уменьшает «не учтено»; без связи — очередь · SKD-EVC-02/03',async()=>{
  await reset(); L.A['sim-fire'](); const before=L.evacCounts().left; L.S.role='teacher'; await go('rollcall');
  click('[data-act=rc-mark][data-v=safe]'); eq(L.evacCounts().left,before-1,'счётчик');
  L.S.offline=true; click('.kid:not(.safe) [data-act=rc-mark][data-v=safe]'); eq(L.evacCounts().left,before-1,'офлайн-отметка применилась сразу'); eq(L.S.evac.queue.length,1,'нет очереди');
  const sw=$('#pp-offline'); sw.checked=false; sw.dispatchEvent(new Event('change',{bubbles:true})); eq(L.evacCounts().left,before-2,'очередь не дослана');
});
step('Учебная тревога: без уведомлений родителям, протокол в журнале тренировок · SKD-EVC-05, SKD-REG-03',async()=>{
  await reset(); const n=L.S.drills.length; L.setMode('drill','плановая'); ok(L.S.evac.drill,'не учебная'); await go('home'); ok(/не отправляются/.test($('#view').textContent),'нет пометки про уведомления'); ok(!$('[data-act=mass-notify]'),'есть кнопка оповещения родителей');
  L.S.evac.snap.forEach(x=>L.markKid(x.id,'safe')); click('[data-act=evac-end]'); eq(L.S.drills.length,n+1,'нет протокола'); eq(L.S.mode,'day','режим не вернулся');
});
step('ЧС включается удержанием 2 с, а не щелчком · SKD-MOD-02',async()=>{
  await reset(); L.A.mode({dataset:{m:'lock'}}); const b=$('#hold-lock'); ok(b,'нет кнопки удержания'); b.click(); eq(L.S.mode,'day','включилось щелчком');
  b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); await sleep(2150); eq(L.S.mode,'lock','удержание не сработало'); ok(/Режим: Учебный день → ЧС/.test(L.S.audit[0].action),'нет аудита');
});
step('Смена режима требует причину и пишется в аудит · SKD-MOD-02, SKD-MOD-06',async()=>{
  await reset(); L.A.mode({dataset:{m:'event'}}); click('[data-act=mode-ok]'); eq(L.S.mode,'day','включился без причины'); setVal('#md-r','Мероприятие по плану'); click('[data-act=mode-ok]'); eq(L.S.mode,'event','не включился'); ok(/Мероприятие/.test(L.S.audit[0].action),'нет аудита');
});

/* ---------- люди, пост, журналы ---------- */
step('Блокировка пропуска только с причиной · SKD-PPL-05',async()=>{
  await reset(); await go('people'); const b=$('[data-act=block]'); const id=b.dataset.id; b.click(); click('[data-act=block-ok]'); ok($('#dlg').open,'закрылось без причины'); eq($('#bl-r').getAttribute('aria-invalid'),'true','поле не помечено');
  setVal('#bl-r','Утерян'); click('[data-act=block-ok]'); const k=L.db.kids.find(x=>x.id===id)||L.db.staff.find(x=>x.id===id); eq(k.cardSt,'blocked','не заблокирован'); ok(/Пропуск заблокирован/.test(L.S.audit[0].action),'нет аудита');
});
step('Посетитель: обязательные поля, стоп-лист, учёт в «в здании» · SKD-PPL-07',async()=>{
  await reset(); await go('people'); const v0=L.inBuilding().vis; click('[data-act=visitor]'); click('[data-act=visitor-ok]'); ok($('#dlg').open,'зарегистрирован без полей');
  setVal('#vi-f','Зуев Игорь'); setVal('#vi-d','•••• 1234'); $('#vi-t').selectedIndex=1; click('[data-act=visitor-ok]'); ok(/стоп-листом/.test($('#vi-stop').textContent),'совпадение не показано'); eq(L.inBuilding().vis,v0,'впущен по стоп-листу');
  setVal('#vi-f','Ткачёва Ирина Олеговна'); click('[data-act=visitor-ok]'); eq(L.inBuilding().vis,v0+1,'посетитель не учтён');
});
step('Проверка КТС подтверждается событием, а не галочкой · SKD-REG-02',async()=>{
  await reset(); L.S.kts=null; L.S.role='guard'; await go('post'); ok(/не выполнена/.test($('#view').textContent),'нет напоминания'); click('[data-act=kts-test]'); ok(L.S.kts&&/Тест КТС/.test(L.S.kts.ev),'нет записи'); eq(L.db.events[0].type,'kts','нет события КТС');
});
step('Детсад: выдача лицу не из списка заблокирована до подтверждения по телефону · DOU-02',async()=>{
  await reset(); L.switchProfile('kinder'); await go('handover'); const b=$('[data-act=ho-give]'); ok(b,'нет кнопки выдачи'); const k=L.db.kids.find(x=>x.id===b.dataset.id); b.click();
  click('[data-act=tp-stranger]'); ok(/заблокирована/.test($('#dlg').textContent),'нет блокировки'); setVal('#st-fio','Сидорова Анна Петровна'); click('[data-act=give-ok]'); ok(!k.day.handed,'выдан без подтверждения');
  $('#st-ok').checked=true; click('[data-act=give-ok]'); ok(k.day.handed&&k.day.handed.phone,'не выдан после подтверждения');
});
step('Аудит: только добавление, цепочка хешей сходится · SKD-AUD-01',async()=>{
  await reset(); eq(L.verifyChain(),-1,'цепочка до правки'); const e=L.S.audit[3], keep=e.obj; e.obj='подделка'; ok(L.verifyChain()>=0,'подделка не обнаружена'); e.obj=keep; eq(L.verifyChain(),-1,'цепочка после отката');
});
step('Блоки данных: загрузка, пусто, ошибка с «Повторить» · SKD-DSH',async()=>{
  await reset(); L.S.att.tab='journal'; await go('attendance');
  for(const [ds,sel] of [['loading','.skeleton'],['empty','.empty'],['error','.empty']]){L.S.ds=ds; L.render(); ok($(sel,$('#att-res')),`нет состояния ${ds}`)}
  L.S.ds='error'; L.render(); ok(/Повторить/.test($('#att-res').textContent),'ошибка без «Повторить»'); L.S.ds='data';
});

/* ---------- run ---------- */
window.addEventListener('load',async()=>{
  await sleep(50); const log=[]; let fail=0;
  for(const s of steps){try{await s.fn(); log.push('✅ '+s.name)}catch(e){fail++; log.push('❌ '+s.name+' — '+(e&&e.message||e))}}
  await reset();
  log.push('', `Итог: ${steps.length-fail} из ${steps.length} прошли`);
  const pre=document.createElement('pre'); pre.id='selftest-log'; pre.textContent=log.join('\n');
  pre.style.cssText='position:fixed;right:8px;bottom:8px;z-index:99;max-width:min(680px,90vw);max-height:60vh;overflow:auto;margin:0;padding:10px;background:var(--one-popup);color:var(--one-fg);border:1px solid var(--one-border);border-radius:6px;font:12px/1.5 var(--one-font-mono);white-space:pre-wrap';
  document.body.append(pre); document.documentElement.dataset.selftest=fail?'fail':'pass';
  console.log(pre.textContent);
});
})();
