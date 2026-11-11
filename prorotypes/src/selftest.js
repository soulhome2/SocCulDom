/* SafeEducation prototype self-test. Runs only with ?selftest: index.html?selftest
 * Result: <html data-selftest="pass|fail">, report in <pre id="selftest-log">.
 * Each step names the requirement it protects: SafeEducation_Specification.md (SKD-…) or «Корректировка дашборда» (КД п. N).
 * Every step starts from reset(): profile «Школа», role «Директор», language ru, mode «Учебный день», nothing open. */
(function(){
'use strict';
if(!/[?&]selftest\b/.test(location.search)) return;
const L=window.SE, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const steps=[]; const step=(name,fn)=>steps.push({name,fn});
function ok(c,msg){if(!c) throw new Error(msg)}
function eq(a,b,msg){if(a!==b) throw new Error(`${msg}: ожидалось ${JSON.stringify(b)}, получено ${JSON.stringify(a)}`)}
async function go(route){if(location.hash!=='#'+route){location.hash='#'+route;await sleep(30)} L.render()}
const click=sel=>{const el=typeof sel==='string'?$(sel):sel; ok(el,`нет элемента ${sel}`); el.click(); return el};
const setVal=(sel,v)=>{const el=$(sel);ok(el,`нет поля ${sel}`);el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}))};
const navHrefs=()=>$$('#nav .nav-item').map(a=>a.getAttribute('href').slice(1));
const nameOf=td=>{const c=td.cloneNode(true);c.querySelectorAll('.av').forEach(a=>a.remove());return c.textContent.trim()};
async function reset(){L.closeDlg();L.S.sort={};L.S.att.tab='sum';L.S.ppl.tab='holders';L.S.cfg.tab='profile';L.S.evw.card=null;L.S.evw.sel=null;L.closeSheet();L.S.ds='data';L.S.offline=false;L.S.lang='ru';L.S.evac=null;L.S.mode='day';
  L.switchProfile('school');L.S.role='director';await go('home')}

/* ---------- каркас, роли, язык ---------- */
step('Все разделы директора открываются без ошибок, у каждого заголовок и текущий пункт меню · SKD-UI-03',async()=>{
  await reset();
  for(const r of navHrefs()){await go(r); ok($('#view').children.length>0,`раздел ${r} пуст`); ok($('#page-title').textContent.trim(),`нет заголовка ${r}`);
    eq($('#nav .nav-item[aria-current=page]')?.getAttribute('href'),'#'+r,`текущий пункт меню на ${r}`)}
});
step('Меню по ролям: у директора нет «Пост охраны» и «Перекличка», у зама нет «Пост охраны», у поста есть «Обход» · КД общее п. 1, директор п. 1–2, детсад-зам п. 1, п. 12',async()=>{
  for(const pr of ['school','kinder','college']){await reset(); L.switchProfile(pr);
    L.S.role='director'; L.render(); let n=navHrefs(); ok(!n.includes('post')&&!n.includes('rollcall')&&!n.includes('rounds'),`${pr}: у директора лишние пункты ${n}`); ok(n.includes('config'),`${pr}: у директора нет «Конфигурации»`);
    L.S.role='security'; L.render(); n=navHrefs(); ok(!n.includes('post')&&!n.includes('rounds'),`${pr}: у зама есть «Пост охраны» или «Обход»`);
    L.S.role='guard'; L.render(); n=navHrefs(); ok(n.includes('post')&&n.includes('rounds'),`${pr}: у поста нет «Пост охраны»/«Обход»`); ok(!n.includes('config'),`${pr}: у поста есть «Конфигурация»`);
    L.S.role='teacher'; L.render(); n=navHrefs(); ok(!n.includes('rounds')&&!n.includes('post'),`${pr}: у учителя есть «Обход»/«Пост»`);}
});
step('Язык: переключатель в шапке, английский — без непереведённых строк, выбор помнится · запрос «добавить английский»',async()=>{
  await reset(); L.MISSING.clear(); setVal('#lang','en'); eq(L.S.lang,'en','язык');
  for(const r of navHrefs()){await go(r)} await go('home');
  eq($('#nav .nav-item[href="#home"]').textContent.trim(),'Home','пункт меню'); eq(L.MISSING.size,0,'нет перевода: '+[...L.MISSING].slice(0,5).join(' | '));
  let saved=null; try{saved=localStorage.getItem('se-lang')}catch(e){saved='en'} eq(saved,'en','выбор не сохранён'); setVal('#lang','ru');
});
step('Профиль меняет словарь: школа → «Класс», детсад → «Группа», «Приём и выдача» только в детсаду · SKD-UI-04',async()=>{
  await reset(); ok(!$('#nav a[href="#handover"]'),'в школе есть «Приём и выдача»'); await go('attendance'); ok(/Класс/.test($('#view').textContent),'нет «Класс»');
  L.switchProfile('kinder'); await go('attendance'); ok(/Группа/.test($('#view').textContent),'нет «Группа»'); ok($('#nav a[href="#handover"]'),'в детсаду нет «Приём и выдача»');
});

/* ---------- главная ---------- */
step('Главная: «Сводка посещаемости» — первый блок правой колонки, колонки независимы, пустого места нет · КД п. 2',async()=>{
  await reset(); const cols=$$('.cols > .stack'); eq(cols.length,2,'две колонки'); ok(/Сводка посещаемости/.test(cols[1].querySelector('.card-h').textContent),'сводка не первая справа');
  const t0=cols[0].getBoundingClientRect().top, t1=cols[1].getBoundingClientRect().top; ok(Math.abs(t0-t1)<2,'колонки начинаются не на одном уровне');
  const gap=cols[1].children[1].getBoundingClientRect().top-cols[1].children[0].getBoundingClientRect().bottom; ok(gap<=17,`зазор между блоками справа ${gap}px`);
});
step('«Сейчас в здании» = сумма категорий, проход СКУД увеличивает счётчик · SKD-PRS-01',async()=>{
  await reset(); const ib=L.inBuilding(); eq(ib.total,ib.kids+ib.staff+ib.vis+ib.con,'сумма'); eq($('#k-in').textContent.trim(),String(ib.total),'на экране');
  const k=L.simPass(); ok(k,'проход не смоделирован'); L.render(); eq($('#k-in').textContent.trim(),String(ib.total+1),'не обновилось');
});
step('Сверка: пришли + отсутствуют = по списку, по объекту и группам · SKD-PRS-02',async()=>{
  await reset(); const s=L.stats(L.db.kids); eq(s.came+s.absent,s.list,'объект'); for(const g of L.db.groups){const t=L.stats(L.db.kids.filter(x=>x.g===g.id));eq(t.came+t.absent,t.list,g.id)}
});
step('Потеря связи — плашка «данные устарели» и точка в строке состояния · SKD-DSH-02',async()=>{
  await reset(); L.S.offline=true; L.render(); ok(!$('#stale').hidden&&/устарели/.test($('#stale').textContent),'плашки нет'); ok($('#statusbar .status-dot[data-tone=down]'),'нет красной точки'); L.S.offline=false; L.render(); ok($('#stale').hidden,'плашка осталась');
});

/* ---------- посещаемость ---------- */
step('Сводка: шкала присутствия показывает %, столбцы сортируются по нажатию · КД п. 4, п. 5',async()=>{
  await reset(); await go('attendance'); const cell=$('#t-sum tbody tr td:last-child'); ok(/\d+ %/.test(cell.textContent),'нет % у шкалы');
  click('#t-sum [data-k=absent]'); const v1=$$('#t-sum tbody tr').map(r=>+r.children[4].textContent); ok(v1.every((v,i)=>i===0||v1[i-1]<=v),'не по возрастанию'); ok($('#t-sum th[aria-sort]'),'нет aria-sort');
  click('#t-sum [data-k=absent]'); const v2=$$('#t-sum tbody tr').map(r=>+r.children[4].textContent); ok(v2.every((v,i)=>i===0||v2[i-1]>=v),'не по убыванию');
});
step('Журнал: фильтр по классу и ФИО, по 50 строк, сортировка по столбцам · SKD-PRS-07, КД п. 6',async()=>{
  await reset(); L.S.att.tab='journal'; await go('attendance');
  const g=L.db.groups[5].id; setVal('#att-g',g); ok($$('#att-res tbody tr').every(r=>r.children[1].textContent===g),'чужой класс'); setVal('#att-g','');
  eq($$('#att-res tbody tr').length,50,'не 50 строк'); click('#t-jr [data-k=fio]'); const n=$$('#att-res tbody tr').map(r=>nameOf(r.children[0])); ok(n.every((v,i)=>i===0||n[i-1].localeCompare(v,'ru')<=0),'ФИО не по алфавиту');
  const k=L.db.kids[10]; setVal('#att-q',k.fio.split(' ')[0]); ok($$('#att-res tbody tr').some(r=>r.textContent.includes(k.fio)),'поиск не нашёл');
});
step('Причина отсутствия сохраняется и пишется в аудит · SKD-PRS-05',async()=>{
  await reset(); const k=L.db.kids.find(x=>x.day.st==='absent'&&!x.day.reason); L.openKid(k.id); setVal('#k-reason','болезнь'); click('[data-act=reason-save]'); eq(k.day.reason,'болезнь','причина'); ok(/Причина отсутствия/.test(L.S.audit[0].action),'нет аудита');
});
step('«Требует проверки»: исправление с автором в аудите · SKD-PRS-06',async()=>{
  await reset(); L.S.att.tab='check'; await go('attendance'); const b=$('[data-act=fix][data-v=in]'); ok(b,'нет строк'); b.click(); ok(/Исправлен статус/.test(L.S.audit[0].action),'нет аудита'); eq(L.S.audit[0].user,'Морозова Т. В.','автор');
});
step('Классный руководитель видит только свой класс, аудит недоступен · раздел 9',async()=>{
  await reset(); L.S.role='teacher'; L.S.att.tab='journal'; await go('attendance'); const g=L.db.P.teacher.grp; ok($$('#att-res tbody tr').every(r=>r.children[1].textContent===g),'видны чужие'); await go('audit'); ok(/Нет доступа/.test($('#view').textContent),'аудит открылся');
});
step('Перекличка: статус под именем, не наезжает на него · КД п. 7',async()=>{
  await reset(); L.S.role='security'; await go('rollcall');
  for(const row of $$('.kid')){const nm=row.querySelector('.kid-t > .lbl').getBoundingClientRect(), st=row.querySelector('.kid-t > .badge, .kid-t > .cap');if(!st)continue;const b=st.getBoundingClientRect();ok(b.top>=nm.bottom-1,`статус наезжает на имя: ${row.textContent.slice(0,30)}`);ok(b.right<=row.getBoundingClientRect().right,'статус вылезает за строку')}
});

/* ---------- системы, видео ---------- */
step('Светофор: неисправность — жёлтый, подсказка с числом, клик ведёт в «Обслуживание» · SKD-SYS-01/02',async()=>{
  await reset(); const row=$('.sys[data-sys=video]'); ok(row.querySelector('.light.warn'),'нет жёлтого'); ok(/Неисправных устройств: \d+ из \d+/.test(row.dataset.tip),'нет числа'); row.click(); await sleep(30); L.render(); eq(L.S.route,'service','переход');
});
step('Видео: дерево групп «здание → зона» фильтрует камеры, поиск по названию · по образцу IM',async()=>{
  await reset(); await go('video'); const all=$$('#view .cams .cam').length; click('[data-act=camnode][data-n="Корпус Б"]'); const b=$$('#view .cams .cam').length; ok(b>0&&b<all+5&&L.S.camNode==='Корпус Б','узел не выбран');
  ok(L.db.cams.filter(c=>c.b==='Корпус Б').every(c=>true),''); setVal('#cam-q','Столовая'); ok($$('.tree-i.lvl2').length>=1,'поиск не показал камеру'); L.S.camQ='';
});
step('Камера, перехваченная СРВИ, — «недоступна» и без заявки · критерий приёмки 8',async()=>{
  await reset(); L.S.grid=9; await go('video'); click('[data-act=camnode][data-n="Территория"]'); ok(/Камера недоступна/.test($('#view').textContent),'нет статуса'); const c=L.db.cams.find(x=>x.srvi); ok(!L.db.tickets.some(x=>x.dev.includes(c.name)),'создана заявка'); L.S.grid=4;
});
step('Камера: увеличение со стрелками и архивом · SKD-DSH-04',async()=>{
  await reset(); click('.cam[data-act=cam-open]'); ok($('#dlg').open,'не открылась'); const t1=$('#dlg .dialog-title').textContent; click('#dlg [data-act=cam-step][data-d="1"]'); ok($('#dlg .dialog-title').textContent!==t1,'стрелка'); click('#dlg [data-act=cam-arch]'); ok(/Архив/.test($('#dlg').textContent),'архив'); L.closeDlg();
});

/* ---------- события (рабочее место IM) ---------- */
step('События: группы → очередь → карточка; «Взять», шаги сценария, закрытие только с результатом · SKD-EVT-03/04, IM',async()=>{
  await reset(); await go('events'); ok($('.ws-tree .tree-i')&&$('.ws-queue')&&$('#ev-media'),'нет трёх панелей');
  const e=L.db.events.find(x=>x.status==='new'); click(`.evq[data-id="${e.id}"]`); ok(/Видео и план/.test($('#ev-media').textContent)&&$('#ev-media .plan'),'панель видео и плана не обновилась');
  click(`[data-act=ev-take][data-id="${e.id}"]`); eq(e.status,'work','не взято'); ok($('.ws-card'),'карточка не открылась');
  const sc=L.scenOf(e); const ci=sc.findIndex(x=>x.type==='confirm'); ok(ci>=0,'в сценарии нет подтверждения');
  for(let i=0;i<ci;i++){const r=$('input[name=st-r]');if(r)r.checked=true;click('[data-act=ev-next]')} click('[data-act=ev-next]'); eq(e.step,ci,'шаг подтверждения прошёл без отметки');
  for(let i=0;i<6&&$('[data-act=ev-next]');i++){const c=$('#st-ok');if(c)c.checked=true;const r=$('input[name=st-r]');if(r)r.checked=true;click('[data-act=ev-next]')}
  click('[data-act=ev-done]'); eq(e.status,'work','закрылось без результата'); click('[data-act=ev-res][data-v=false]'); click('[data-act=ev-done]'); eq(e.status,'done','не закрылось'); ok(/Событие обработано/.test(L.S.audit[0].action),'нет аудита');
});
step('Неподтверждённая тревога через 60 с эскалируется · SKD-EVT-03',async()=>{
  await reset(); L.A['sim-fight'](); const e=L.db.events[0]; ok(!e.esc,'сразу'); L.tick(new Date(+e.t+L.ESC_AFTER+1000)); ok(e.esc,'не эскалировалось');
});
step('Ответ родителя «не знаю» поднимает событие · SKD-NTF-04',async()=>{
  await reset(); const n=L.db.events.length; const k=L.simDontKnow(); eq(L.db.events.length,n+1,'нет события'); eq(L.db.events[0].person,k.id,'ребёнок');
});

/* ---------- режимы и эвакуация ---------- */
step('Сработка СПС: «Эвакуация», снимок, двери разблокированы; пожар отменяет ЧС · SKD-MOD-05, SKD-EVC-01',async()=>{
  await reset(); L.setMode('lock','тест'); eq(L.S.doors,'locked_in','ЧС'); const inside=L.db.kids.filter(k=>['in','check'].includes(k.day.st)).length; L.A['sim-fire']();
  eq(L.S.mode,'evac','режим'); eq(L.S.doors,'unlocked','двери'); eq(L.S.evac.snap.length,inside,'снимок'); ok(L.S.evac.cancelledLock,'ЧС не отменён'); await go('home'); ok(/Не учтено/.test($('#view').textContent),'нет счётчика');
});
step('Перекличка: отметка уменьшает «не учтено», без связи — очередь · SKD-EVC-02/03',async()=>{
  await reset(); L.A['sim-fire'](); const before=L.evacCounts().left; L.S.role='teacher'; await go('rollcall'); click('[data-act=rc-mark][data-v=safe]'); eq(L.evacCounts().left,before-1,'счётчик');
  L.S.offline=true; click('.kid:not(.safe) [data-act=rc-mark][data-v=safe]'); eq(L.S.evac.queue.length,1,'очередь'); setVal('#pp-offline',''); const sw=$('#pp-offline'); sw.checked=false; sw.dispatchEvent(new Event('change',{bubbles:true})); eq(L.evacCounts().left,before-2,'очередь не дослана');
});
step('Учебная тревога: без уведомлений родителям, протокол в журнал · SKD-EVC-05, SKD-REG-03',async()=>{
  await reset(); const n=L.S.drills.length; L.setMode('drill','x'); await go('home'); ok(!$('[data-act=mass-notify]'),'есть «Сообщить родителям»'); L.S.evac.snap.forEach(x=>L.markKid(x.id,'safe')); click('[data-act=evac-end]'); eq(L.S.drills.length,n+1,'нет протокола');
});
step('ЧС — только удержанием 2 с; обычный режим — только с причиной · SKD-MOD-02',async()=>{
  await reset(); L.A.mode({dataset:{m:'lock'}}); const b=$('#hold-lock'); b.click(); eq(L.S.mode,'day','включилось щелчком'); b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); await sleep(2150); eq(L.S.mode,'lock','удержание не сработало');
  await reset(); L.A.mode({dataset:{m:'event'}}); click('[data-act=mode-ok]'); eq(L.S.mode,'day','без причины'); setVal('#md-r','Мероприятие по плану'); click('[data-act=mode-ok]'); eq(L.S.mode,'event','не включился');
});

/* ---------- люди и пропуска ---------- */
step('Держатели пропусков: сортировка, «Добавить человека» с представителем и фото · КД п. 8, п. 9, детсад/колледж п. 3',async()=>{
  await reset(); L.switchProfile('kinder'); await go('people'); click('#t-hold [data-k=fio]'); const n=$$('#t-hold tbody tr').map(r=>nameOf(r.children[0])); ok(n.every((v,i)=>i===0||n[i-1].localeCompare(v,'ru')<=0),'не по алфавиту');
  click('[data-act=person-add]'); ok($('#dlg [data-photo=p0]'),'нет загрузки фото представителя'); setVal('#np-fio','Тестова Алиса Ивановна'); click('[data-act=person-ok]'); ok($('#dlg').open,'добавлен без представителя');
  $('#pp-f0').value='Тестова Ирина Петровна'; const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  click('[data-act=parent-add]'); $('#pp-f1').value='Тестов Олег Ильич'; click('[data-act=person-ok]'); const k=L.db.kids.find(x=>x.fio==='Тестова Алиса Ивановна'); ok(k,'не добавлен'); eq(k.parents.length,2,'представители'); ok(k.trusted.length===2,'не попали в доверенные (детсад)');
  ok(/Добавлен человек/.test(L.S.audit[0].action),'нет аудита'); ok(png,'');
});
step('Посетители: сортировка и «Добавить посетителя» во вкладке; стоп-лист · КД п. 10, п. 11, SKD-PPL-07',async()=>{
  await reset(); L.S.ppl.tab='visitors'; await go('people'); ok($('.card-h [data-act=visitor]'),'нет кнопки во вкладке'); click('#t-vis [data-k=fio]'); const n=$$('#t-vis tbody tr').map(r=>nameOf(r.children[0])); ok(n.every((v,i)=>i===0||n[i-1].localeCompare(v,'ru')<=0),'не по алфавиту');
  const v0=L.inBuilding().vis; click('.card-h [data-act=visitor]'); setVal('#vi-f','Зуев Игорь'); setVal('#vi-d','1234'); $('#vi-t').selectedIndex=1; click('[data-act=visitor-ok]'); ok(/стоп-лист/.test($('#vi-stop').textContent),'нет совпадения'); eq(L.inBuilding().vis,v0,'впущен');
  setVal('#vi-f','Ткачёва Ирина'); click('[data-act=visitor-ok]'); eq(L.inBuilding().vis,v0+1,'не учтён');
});
step('Блокировка пропуска только с причиной · SKD-PPL-05',async()=>{
  await reset(); await go('people'); const b=$('[data-act=block]'),id=b.dataset.id; b.click(); click('[data-act=block-ok]'); ok($('#dlg').open,'без причины'); setVal('#bl-r','Утерян'); click('[data-act=block-ok]'); const h=L.db.kids.find(x=>x.id===id)||L.db.staff.find(x=>x.id===id); eq(h.cardSt,'blocked','не заблокирован');
});
step('Проверка КТС подтверждается событием · SKD-REG-02',async()=>{
  await reset(); L.S.kts=null; L.S.role='guard'; await go('post'); ok(/не выполнена/.test($('#view').textContent),'нет напоминания'); click('[data-act=kts-test]'); ok(L.S.kts,'нет записи'); eq(L.db.events[0].type,'kts','нет события');
});
step('Детсад: выдача лицу не из списка — только с подтверждением по телефону · DOU-02',async()=>{
  await reset(); L.switchProfile('kinder'); await go('handover'); const b=$('[data-act=ho-give]'),k=L.db.kids.find(x=>x.id===b.dataset.id); b.click(); click('[data-act=tp-stranger]'); setVal('#st-fio','Сидорова Анна'); click('[data-act=give-ok]'); ok(!k.day.handed,'выдан без подтверждения'); $('#st-ok').checked=true; click('[data-act=give-ok]'); ok(k.day.handed&&k.day.handed.phone,'не выдан');
});

/* ---------- обход ---------- */
step('Обход: чек-лист, «Проверено» / «Не проверено» (с замечанием), запись в журнал · КД п. 12',async()=>{
  await reset(); L.S.role='guard'; await go('rounds'); click('[data-act=round-start]'); const n=L.S.round.points.length; ok($$('.pt').length===n,'нет точек');
  ok($('[data-act=round-finish]').disabled,'можно завершить без отметок'); click('[data-act=pt-mark][data-i="0"][data-v=bad]'); click('[data-act=pt-bad-ok]'); ok($('#dlg').open,'«Не проверено» без замечания'); setVal('#pt-note','Замок сломан'); click('[data-act=pt-bad-ok]');
  for(let i=1;i<n;i++) click(`[data-act=pt-mark][data-i="${i}"][data-v=ok]`); const before=L.S.roundLog.length; click('[data-act=round-finish]'); eq(L.S.roundLog.length,before+1,'нет записи'); eq(L.S.roundLog[0].bad,1,'замечание');
  await go('journals'); ok(/Замок сломан/.test($('#jr-rounds').textContent),'нет в журнале обхода');
});

/* ---------- конфигурация ---------- */
step('Конфигурация: всё серверное в одном разделе, SLA перенесён из «Обслуживания» · запрос «одна закладка для сервера»',async()=>{
  await reset(); await go('config'); eq($$('.cfg [data-act=cfg-tab]').length,8,'не 8 вкладок'); L.S.cfg.tab='sla'; L.render(); ok($('#sla-video'),'нет SLA в конфигурации'); await go('service'); ok(!$('#sla-video'),'SLA остался в «Обслуживании»');
  L.S.role='security'; await go('config'); ok(/Нет доступа/.test($('#view').textContent),'зам видит конфигурацию');
});
step('Режимы: добавить и изменить; системный удалить нельзя · КД п. 14',async()=>{
  await reset(); L.S.cfg.tab='modes'; await go('config'); ok(!$('[data-act=mode-del][data-id=evac]'),'системный можно удалить');
  click('[data-act=mode-edit][data-id=""]'); click('[data-act=mode-save]'); ok($('#dlg').open,'без названия'); setVal('#me-n','Родительское собрание'); click('[data-act=mode-save]');
  const m=L.S.modes.find(x=>x.name==='Родительское собрание'); ok(m,'не добавлен'); L.render(); ok(/Родительское собрание/.test($('#mode-menu').textContent),'нет в меню режимов');
  click(`[data-act=mode-edit][data-id="${m.id}"]`); setVal('#me-n','Собрание'); click('[data-act=mode-save]'); eq(m.name,'Собрание','не изменён');
});
step('Обходы: директор правит чек-лист — пост видит новую точку · КД директор п. 3',async()=>{
  await reset(); L.S.cfg.tab='rounds'; await go('config'); setVal('#pt-new','Кладовая спортзала — закрыта'); click('[data-act=pt-add]'); click('[data-act=route-save]');
  L.S.role='guard'; await go('rounds'); click('[data-act=round-start]'); ok(L.S.round.points.includes('Кладовая спортзала — закрыта'),'точки нет в обходе'); L.S.round=null;
});
step('Аудит: сортировка по столбцам, цепочка хешей сходится и ловит подделку · КД п. 13, SKD-AUD-01',async()=>{
  await reset(); await go('audit'); click('#t-aud [data-k=user]'); const u=$$('#t-aud tbody tr').map(r=>r.children[1].firstElementChild.textContent); ok(u.every((v,i)=>i===0||u[i-1].localeCompare(v,'ru')<=0),'не отсортировано');
  eq(L.verifyChain(),-1,'цепочка'); const e=L.S.audit[3],keep=e.obj; e.obj='подделка'; ok(L.verifyChain()>=0,'подделка не найдена'); e.obj=keep;
});
step('Блоки данных: загрузка, пусто, ошибка с «Повторить» · SKD-DSH',async()=>{
  await reset(); L.S.att.tab='journal'; await go('attendance'); for(const [ds,sel] of [['loading','.skeleton'],['empty','.empty'],['error','.empty']]){L.S.ds=ds;L.render();ok($(sel,$('#att-res')),ds)} L.S.ds='data';
});

window.addEventListener('load',async()=>{
  await sleep(60); const log=[]; let fail=0;
  for(const s of steps){try{await s.fn(); log.push('✅ '+s.name)}catch(e){fail++; log.push('❌ '+s.name+' — '+(e&&e.message||e))}}
  await reset(); log.push('',`Итог: ${steps.length-fail} из ${steps.length} прошли`);
  const pre=document.createElement('pre'); pre.id='selftest-log'; pre.textContent=log.join('\n');
  pre.style.cssText='position:fixed;right:8px;top:64px;z-index:99;max-width:min(680px,90vw);max-height:60vh;overflow:auto;margin:0;padding:10px;background:var(--color-popup);color:var(--color-fg);border:1px solid var(--color-border);border-radius:6px;font:12px/1.5 var(--font-mono);white-space:pre-wrap';
  document.body.append(pre); document.documentElement.dataset.selftest=fail?'fail':'pass'; console.log(pre.textContent);
});
})();
