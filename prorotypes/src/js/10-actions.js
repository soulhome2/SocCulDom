/* ================= режимы, эвакуация, формы ================= */
const MODE_REASONS=['По распоряжению директора','Изменение расписания','Мероприятие по плану','Другое'];
function dlgMode(m){
  const x=MBY(m);
  if(m===S.mode) return;
  if(m==='lock'){
    if(S.mode==='evac'){toast(t('Во время эвакуации режим ЧС не включается — приоритет пожара (SKD-MOD-05)'),'alarm');return}
    dlg(`<div class="dlg-h">${ic('lock','ic-24 i-danger')}<h2 class="dialog-title">${t('Включить режим ЧС')}</h2></div><div class="dlg-b">
      <div>${t('Входы закроются на вход, выходы останутся свободными. По зонам прозвучит условное сообщение, персонал получит инструкцию в MAX.')}</div>
      <button class="btn btn-red hold" id="hold-lock" style="height:56px;font-size:16px" aria-label="${t('Удерживайте 2 секунды, чтобы включить ЧС')}">${ic('lock')}${t('Удерживайте 2 секунды')}<span class="fill"></span></button>
      <div class="cap muted">${t('Одно нажатие и удержание — без лишних диалогов (SKD-MOD-02). Росгвардия вызывается штатной КТС.')}</div></div>
      <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button></div>`);
    bindHold($('#hold-lock'),()=>{closeDlg();setMode('lock',t('удержание кнопки ЧС'))});
    return;
  }
  if(m==='evac'||m==='drill'){
    dlg(`<div class="dlg-h">${ic(x.ic,'ic-24 '+(m==='evac'?'i-danger':'i-warning'))}<h2 class="dialog-title">${t(m==='evac'?'Начать эвакуацию вручную':'Начать учебную тревогу')}</h2></div><div class="dlg-b">
      <div>${t(m==='evac'?'Двери разблокируются, прозвучит СОУЭ, зафиксируется список «кто в здании», у ответственных групп откроется перекличка.':'Тот же механизм, что при эвакуации: перекличка и замер времени до полного учёта. Родителям и учредителю уведомления не уходят.')}</div>
      ${S.mode==='lock'?msgbar('error','',t('Режим ЧС будет отменён: при эвакуации выходы не блокируются.')):''}
      <div><label class="label" for="md-r">${t('Основание')}</label><input class="field" id="md-r" value="${t(m==='evac'?'Визуальное обнаружение задымления':'Плановая тренировка по графику')}"></div></div>
      <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn ${m==='evac'?'btn-red':'btn-primary'}" data-act="mode-ok" data-m="${m}">${t(m==='evac'?'Начать эвакуацию':'Начать учебную тревогу')}</button></div>`);
    return;
  }
  if(S.mode==='evac'||S.mode==='drill'){toast(t('Сначала завершите эвакуацию на главном экране'),'alarm');return}
  if(S.mode==='lock'){dlgLockEnd();return}
  dlg(`<div class="dlg-h">${ic(x.ic||'dot-fill','ic-24')}<h2 class="dialog-title">${t('Режим «{m}»',{m:modeName(x)})}</h2></div><div class="dlg-b"><div class="cap muted">${esc(x.sys||['day','night','holiday','event'].includes(x.id)?t(x.d):x.d)}</div>
    <div><label class="label" data-required for="md-r">${t('Причина')}</label><select class="field" id="md-r"><option value="">${t('Выберите причину')}</option>${MODE_REASONS.map(r=>`<option value="${r}">${t(r)}</option>`).join('')}</select><span class="helper" id="md-err"></span></div></div>
    <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="mode-ok" data-m="${m}" data-req="1">${t('Включить')}</button></div>`);
}
function bindHold(b,done){let tm=null;const start=e=>{e.preventDefault();b.classList.add('holding');tm=setTimeout(()=>{tm=null;b.classList.remove('holding');done()},2000)},stop=()=>{if(tm){clearTimeout(tm);tm=null}b.classList.remove('holding')};
  b.addEventListener('pointerdown',start);['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
  b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat&&!tm)start(e)});b.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' ')stop()})}
function setMode(m,reason=''){
  const prev=S.mode;
  if(m==='evac'||m==='drill'){
    if(prev==='lock'){aud('Режим ЧС отменён автоматически','SKD-MOD-05');toast(t('Пожар отменяет режим ЧС: выходы и пути эвакуации разблокированы'),'alarm')}
    startEvac(m==='drill',reason); S.lock=null;
  } else if(m==='lock'){S.lock={t0:NOW(),by:user().short};S.doors='locked_in';S.alarm.kts=t('режим ЧС');addEvent({kind:'alarm',type:'lock',title:'Включён режим ЧС',desc:'Включил {w}',dv:{w:user().short},sev:'high',status:'done',result:'confirmed',by:user().short})}
  else {S.doors='normal';delete S.alarm.kts}
  S.mode=m; aud('Смена режима',`${modeName(MBY(prev))} → ${modeName(MBY(m))}${reason?' · '+reason:''}`);
  if(m==='evac'||m==='drill'||m==='lock') location.hash='#'+(isTeacher()?'rollcall':S.role==='guard'?'post':'home');
  rerender();
}
function dlgLockEnd(){dlg(`<div class="dlg-h">${ic('unlock','ic-24')}<h2 class="dialog-title">${t('Отменить режим ЧС')}</h2></div><div class="dlg-b"><div><label class="label" data-required for="le-r">${t('Основание отмены')}</label><select class="field" id="le-r"><option value="">${t('Выберите')}</option>${['Угроза устранена, подтверждено Росгвардией','Ложная тревога','Учебная тренировка завершена'].map(r=>`<option value="${r}">${t(r)}</option>`).join('')}</select><span class="helper" id="le-err"></span></div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="lock-end-ok">${t('Отменить ЧС')}</button></div>`)}
function endEvac(force){
  const E=S.evac, c=evacCounts();
  if(c.left&&!force){dlg(`<div class="dlg-h">${ic('alert','ic-24 i-danger')}<h2 class="dialog-title">${t('Не учтено: {n}',{n:c.left})}</h2></div><div class="dlg-b"><div>${t('Есть дети без отметки на точке сбора. Завершить всё равно?')}</div><div><label class="label" data-required for="ee-r">${t('Основание')}</label><input class="field" id="ee-r" placeholder="${t('Например: найдены в медпункте, отметил дежурный')}"></div><span class="helper" id="ee-err"></span></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Вернуться')}</button><button class="btn btn-red" data-act="evac-end-force">${t('Завершить')}</button></div>`);return}
  const dur=fmtDur((E.doneAt||NOW())-E.t0), slow=Object.entries(E.gDone).sort((a,b)=>b[1]-a[1])[0];
  if(E.drill) S.drills.unshift({date:dmy(NOW()),t:hm(E.t0),kids:E.snap.length,dur,slow:slow?`${slow[0]} · ${fmtDur(slow[1]-E.t0)}`:'—',by:user().short,fresh:true,groups:{...E.gDone},t0:E.t0});
  aud(E.drill?'Учебная тревога завершена':'Эвакуация завершена',`${c.ok}/${c.kids} · ${dur}`);
  S.evacLast=E; S.evac=null; S.doors='normal'; delete S.alarm.fire; S.mode='day';
  closeDlg(); if(E.drill){location.hash='#journals';toast(t('Протокол учебной эвакуации сохранён в журнал тренировок · {d}',{d:dur}))} else toast(t('Эвакуация завершена · учтено {a} из {b}',{a:c.ok,b:c.kids})); rerender();
}
function drillProto(d){const G=Object.entries(d.groups||{}).sort((a,b)=>b[1]-a[1]);
  dlg(`<div class="dlg-h">${ic('file','ic-24')}<h2 class="dialog-title">${t('Протокол учебной эвакуации · {d}',{d:d.date})}</h2></div><div class="dlg-b"><dl class="dl"><dt>${t('Начало')}</dt><dd>${d.t}</dd><dt>${t('В здании')}</dt><dd>${d.kids}</dd><dt>${t('До полного учёта')}</dt><dd><b>${d.dur}</b></dd><dt>${t('Провёл')}</dt><dd>${esc(d.by)}</dd></dl>
   ${G.length?`<table class="table"><thead><tr><th>${t(P().grp)}</th><th class="num">${t('Учёт за')}</th></tr></thead><tbody>${G.slice(0,8).map(([g,tt])=>`<tr><td>${esc(g)}</td><td class="num mono">${fmtDur(tt-d.t0)}</td></tr>`).join('')}</tbody></table><div class="cap muted">${t('Показаны 8 самых долгих')}</div>`:`<div class="cap muted">${t('Детализация по группам — в PDF')}</div>`}</div>
   <div class="dlg-f"><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Протокол учебной эвакуации">${ic('download')}PDF</button><button class="btn btn-primary" data-kit-close>${t('Закрыть')}</button></div>`)}
function evacReport(){const E=S.evac||S.evacLast;if(!E)return;const U=E.snap.filter(x=>!['safe','par'].includes(E.marks[x.id]));
  dlg(`<div class="dlg-h">${ic('file','ic-24')}<h2 class="dialog-title">${t('Итог для руководителя тушения')}</h2><span class="sp"></span><span class="cap mono">${hms(NOW())}</span></div><div class="dlg-b">
   <dl class="dl"><dt>${t('Причина')}</dt><dd>${esc(E.cause)}</dd><dt>${t('Начало')}</dt><dd>${hms(E.t0)}</dd><dt>${t('В здании на момент тревоги')}</dt><dd>${E.snap.length} · ${t('Персонал')}: ${E.staffIn} · ${t('Посетители')}: ${E.visIn}</dd><dt>${t('Не учтено')}</dt><dd><b class="${U.length?'t-danger':'t-success'}">${U.length}</b></dd></dl>
   ${U.length?`<table class="table"><thead><tr><th>${t('ФИО')}</th><th>${t(P().grp)}</th><th>${t('Последнее известное место')}</th></tr></thead><tbody>${U.map(x=>{const k=KBY(x.id);return `<tr><td>${esc(k.fio)}</td><td>${esc(k.g)}</td><td class="cap">${esc(x.last)}</td></tr>`}).join('')}</tbody></table>`:''}
   <div class="cap muted">${t('PDF содержит план этажей и список персонала на объекте.')}</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Итог эвакуации для РТП">${ic('download')}PDF</button><button class="btn btn-primary" data-kit-close>${t('Закрыть')}</button></div>`,{wide:1})}
function dlgVisitor(){
  dlg(`<div class="dlg-h">${ic('person-add','ic-24')}<h2 class="dialog-title">${t('Регистрация посетителя')}</h2></div><div class="dlg-b">
   <div class="grid2"><div><label class="label" data-required for="vi-f">${t('ФИО')}</label><input class="field" id="vi-f" placeholder="${t('Как в документе')}"></div><div><label class="label" data-required for="vi-d">${t('Документ')}</label><input class="field" id="vi-d" placeholder="${t('Паспорт, последние 4 цифры')}"></div>
    <div><label class="label" data-required for="vi-t">${t('К кому')}</label><select class="field" id="vi-t"><option value="">${t('Выберите')}</option><option>${esc(P().teacher.short)} (${esc(P().teacher.grp)})</option><option value="Директор">${t('Директор')}</option><option value="Заместитель директора">${t('Заместитель директора')}</option><option value="Завхоз">${t('Завхоз')}</option><option value="Медработник">${t('Медработник')}</option></select></div><div><label class="label" for="vi-w">${t('Цель')}</label><input class="field" id="vi-w" placeholder="${t('Встреча, доставка…')}"></div></div>
   <div class="row"><div style="width:120px;height:68px;border-radius:6px;overflow:hidden;position:relative;background:var(--color-surface-subtle);flex:none">${scene({id:'vis',name:'post',z:'',b:''},{few:1})}</div><div class="cap muted">${t('Фото с камеры поста — снимок сделан при регистрации. Для сверки на посту, без биометрии.')}</div></div>
   <div id="vi-stop" class="cap muted">${t('Проверка по стоп-листу объекта — по ФИО и документу. Для демонстрации совпадения введите «Зуев».')}</div><span class="helper" id="vi-err"></span></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="visitor-ok">${t('Зарегистрировать и впустить')}</button></div>`)}
function dlgTemp(){
  dlg(`<div class="dlg-h">${ic('id-badge','ic-24')}<h2 class="dialog-title">${t('Временный пропуск')}</h2></div><div class="dlg-b">
   <div><label class="label" data-required for="tp-k">${t('Кому')}</label><select class="field" id="tp-k"><option value="">${t('Выберите')}</option>${db.kids.filter(k=>k.day.st!=='absent').slice(0,60).map(k=>`<option value="${k.id}">${esc(k.fio)} · ${esc(k.g)}</option>`).join('')}</select><span class="helper" id="tp-err"></span></div>
   <div><label class="label" for="tp-w">${t('Причина')}</label><select class="field" id="tp-w">${['Забыл пропуск','Пропуск повреждён','Посетитель на время визита'].map(r=>`<option value="${r}">${t(r)}</option>`).join('')}</select></div>
   <div class="cap muted">${t('Пропуск автоматически гаснет в конце дня (18:00). В журнале посещаемости останется отметка «забыл пропуск» (SKD-PPL-06).')}</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="temp-ok">${t('Выдать')}</button></div>`)}
function dlgBlock(id,un){const h=holders().find(x=>x.id===id);
  dlg(`<div class="dlg-h">${ic(un?'unlock':'lock','ic-24')}<h2 class="dialog-title">${t(un?'Разблокировать пропуск':'Заблокировать пропуск')}</h2></div><div class="dlg-b"><div><b>${esc(h.fio)}</b> · <span class="mono">${h.card}</span></div>
   <div><label class="label" data-required for="bl-r">${t('Причина')}</label><select class="field" id="bl-r"><option value="">${t('Выберите причину')}</option>${(un?['Пропуск найден','Возврат в учреждение','Решение администрации']:['Утерян','Выбыл','Решение администрации']).map(r=>`<option value="${r}">${t(r)}</option>`).join('')}</select><span class="helper" id="bl-err"></span></div>
   <div><label class="label" for="bl-c">${t('Комментарий')}</label><input class="field" id="bl-c" placeholder="${t('Необязательно')}"></div><div class="cap muted">${t('Операция выполняется в СКУД «Интеллект X» и записывается в журнал аудита.')}</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn ${un?'btn-primary':'btn-red'}" data-act="block-ok" data-id="${id}" data-un="${un?1:0}">${t(un?'Разблокировать':'Заблокировать')}</button></div>`)}
function dlgImport(){dlg(`<div class="dlg-h">${ic('upload','ic-24')}<h2 class="dialog-title">${t('Импорт списка')}</h2></div><div class="dlg-b">
   ${seg('imp',[['file',t('Файл CSV / XLSX')],['api',t('Электронный журнал (API)')]],'file','noop')}
   <div class="empty" style="border:1px dashed var(--color-editor-border);border-radius:6px;padding:20px">${ic('upload')}<div>kontingent_2026-11-11.xlsx · ${t('{n} строк — загружено',{n:db.kids.length+12})}</div></div>
   <div class="grid4" style="gap:8px">${[['Новые','12'],['Изменённые','7'],['Без изменений',String(db.kids.length-7)],['Ошибки','2']].map(([x,n])=>`<div class="card kpi" style="padding:10px"><span class="lbl muted">${t(x)}</span><span class="h-md">${n}</span></div>`).join('')}</div>
   <div class="cap muted">${t('Ключ — внешний идентификатор из электронного журнала: повторный импорт обновляет записи, дубликаты не создаются (SKD-PPL-04).')}</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="import-ok">${t('Применить 19 изменений')}</button></div>`)}

/* ================= действия ================= */
const A={
  noop:()=>{},
  'ds-reset':()=>{S.ds='data';rerender()},
  'toast-x':el=>{const i=TOASTS.findIndex(x=>String(x.id)===el.dataset.id);if(i>=0)TOASTS.splice(i,1);drawToasts()},
  'toasts-clear':()=>{TOASTS.splice(0,TOASTS.length-2);drawToasts()},
  /* язык — и в меню пользователя: на телефоне селектора в шапке нет */
  'lang-toggle':()=>{const v=S.lang==='en'?'ru':'en',sel=$('#lang');sel.value=v;sel.dispatchEvent(new Event('change',{bubbles:true}))},
  sort:el=>{const tb=el.dataset.t,k=el.dataset.k,s=S.sort[tb];S.sort[tb]=s&&s.k===k?{k,dir:-s.dir}:{k,dir:1};rerender()},
  inbuilding:()=>inBuildingSheet(),
  'att-go':el=>{S.att={...S.att,tab:'journal',st:el.dataset.st,g:'',q:'',page:0,day:0};closeSheet();location.hash='#attendance';rerender()},
  'att-grp':el=>{S.att={...S.att,tab:'journal',g:el.dataset.g,st:'',page:0,day:0};closeSheet();location.hash='#attendance';rerender()},
  'att-tab':el=>{S.att.tab=el.dataset.v;rerender()},
  'att-pg':el=>{S.att.page+=+el.dataset.d;$('#att-res').innerHTML=attResults()},
  'att-reset':()=>{S.att={...S.att,g:'',q:'',st:'',page:0};rerender()},
  kid:el=>openKid(el.dataset.id),
  'reason-save':el=>{const k=KBY(el.dataset.id),v=$('#k-reason').value;k.day.reason=v||null;k.day.reasonBy=v?user().short:null;aud('Причина отсутствия',`${k.short}, ${k.g}: ${v||'—'}`);toast(t('Причина сохранена: {w} — {r}',{w:k.short,r:v?t(v):t('не указана')}));openKid(k.id);if(S.route!=='home')rerender()},
  fix:el=>{const k=KBY(el.dataset.id),v=el.dataset.v;k.day.st=v;k.day.check=null;if(v==='in')k.day.inT=k.day.passes[0]?.t;if(v==='left')k.day.outT=k.day.passes[0]?.t;aud('Исправлен статус посещаемости',`${k.short}, ${k.g}: ${v}`);toast(t('Статус исправлен · {w} · записано в аудит',{w:k.short}));rerender()},
  grid:el=>{S.grid=+el.dataset.v;rerender()},
  fav:(el,e)=>{e.stopPropagation();const c=db.cams.find(x=>x.id===el.dataset.id);c.fav=!c.fav;toast(t(c.fav?'«{c}» добавлена в избранное':'«{c}» убрана из избранного',{c:c.name}));rerender()},
  camnode:el=>{S.camNode=el.dataset.n;rerender()},
  'cam-open':(el,e)=>{e.stopPropagation();S.camArch=false;openCam(el.dataset.id)},
  'cam-step':el=>camStep(+el.dataset.d),
  'cam-arch':el=>{S.camArch=!S.camArch;openCam(el.dataset.id)},
  /* события */
  'ev-go':el=>{const e=db.events.find(x=>x.id===el.dataset.id);S.evw.sel=e.id;S.evw.card=e.id;if(e.status==='done')S.evw.st='all';closeSheet();location.hash='#events';rerender()},
  evnode:el=>{S.evw.node=el.dataset.n;rerender()},
  evst:el=>{S.evw.st=el.dataset.v;rerender()},
  'ev-sel':(el,e)=>{if(e.target.closest('button'))return;S.evw.sel=el.dataset.id;$$('.evq').forEach(x=>x.setAttribute('aria-selected',String(x===el)));$('#ev-media').innerHTML=evMedia()},
  'ev-chip':el=>{const k=el.dataset.k;S.evw.chips[k]=!S.evw.chips[k];rerender()},
  'ev-more':()=>{S.evw.limit+=50;rerender()},
  'ev-reset':()=>{S.evw={...S.evw,node:'',chips:{alarm:true,analytics:true,presence:true,fault:true,pass:false},st:'open',q:''};rerender()},
  'ev-take':el=>{const e=db.events.find(x=>x.id===el.dataset.id);evTake(e);S.evw.sel=S.evw.card=e.id;toast(t('Взято в работу: {e}',{e:evTitle(e)}));rerender()},
  'ev-view':el=>{S.evw.sel=S.evw.card=el.dataset.id;rerender()},
  'ev-back':()=>{S.evw.card=null;rerender()},
  'ev-step':el=>{const e=db.events.find(x=>x.id===el.dataset.id);e.step=+el.dataset.i;rerender()},
  'ev-prev':el=>{const e=db.events.find(x=>x.id===el.dataset.id);e.step=Math.max(0,e.step-1);rerender()},
  'ev-next':el=>{const e=db.events.find(x=>x.id===el.dataset.id),s=scenOf(e)[e.step];
    if(s.type==='confirm'){if(!$('#st-ok').checked){err(null,'#st-err',t('Отметьте «Выполнено», чтобы перейти дальше'));return}e.ans[e.step]=true}
    if(s.type==='radio'){const r=$('input[name=st-r]:checked');if(!r){err(null,'#st-err',t('Выберите вариант'));return}e.ans[e.step]=r.value}
    e.log.push({t:NOW(),k:'step',n:e.step+1,w:user().short});e.step++;rerender()},
  'ev-res':el=>{const e=db.events.find(x=>x.id===S.evw.card);if(e)e._res=el.dataset.v;$$('#ev-res-seg button').forEach(b=>b.setAttribute('aria-pressed',String(b===el)))},
  'ev-done':el=>{const e=db.events.find(x=>x.id===el.dataset.id);if(el.getAttribute('aria-disabled')==='true'){toast(t('Сначала возьмите событие в работу'),'alarm');return}
    if(!e._res){err(null,'#ev-err',t('Выберите результат — без него событие не закрывается'));return}
    e.status='done';e.result=e._res;e.comment=$('#ev-c').value;e.by=user().short;e.doneAt=NOW();e.log.push({t:NOW(),k:'closed',r:e.result,w:user().short});aud('Событие обработано',`${evTitle(e)} · ${t(RESULTS[e.result])}${e.comment?' · '+e.comment:''}`);S.evw.card=null;toast(t('Обработано: {e} · {r}',{e:evTitle(e),r:t(RESULTS[e.result])}));rerender()},
  'ev-pass':el=>dlgEvPass(db.events.find(x=>x.id===el.dataset.id)),
  'ev-pass-ok':el=>{const e=db.events.find(x=>x.id===el.dataset.id),to=$('#ep-to').value;if(!to){err('#ep-to','#ep-err',t('Выберите, кому передать'));return}e.status='work';e.owner=to;e.takenAt=NOW();e.log.push({t:NOW(),k:'passed',to,w:user().short});aud('Событие передано',`${evTitle(e)} → ${to}`);closeDlg();S.evw.card=null;toast(t('Передано: {w}',{w:to}));rerender()},
  'ev-close':el=>dlgEvClose(db.events.find(x=>x.id===el.dataset.id)),
  'ev-close-ok':el=>{const e=db.events.find(x=>x.id===el.dataset.id),r=$('#ec-r').value;if(!r){err('#ec-r','#ec-err',t('Выберите результат'));return}e.status='done';e.result=r;e.comment=$('#ec-c').value;e.by=user().short;e.log.push({t:NOW(),k:'closed',r,w:user().short});aud('Событие закрыто без обработки',`${evTitle(e)} · ${t(RESULTS[r])}`);closeDlg();S.evw.card=null;rerender()},
  'sheet-close':()=>closeSheet(),
  /* режимы */
  mode:el=>{kit.closeMenu();if(!canMode())return;dlgMode(el.dataset.m)},
  'mode-ok':el=>{const m=el.dataset.m,r=$('#md-r');if(el.dataset.req&&!r.value){err('#md-r','#md-err',t('Укажите причину'));return}closeDlg();setMode(m,r?.value?t(r.value):'')},
  'lock-end':()=>dlgLockEnd(),
  'lock-end-ok':()=>{const r=$('#le-r').value;if(!r){err('#le-r','#le-err',t('Укажите основание'));return}closeDlg();S.lock=null;setMode('day',t(r));toast(t('Режим ЧС отменён · входы работают в обычном режиме'))},
  'evac-grp':el=>{if(isTeacher())return;S.rc.g=el.dataset.g;if(allowed('rollcall'))location.hash='#rollcall';else toast(t('Группа {g}: см. список не учтённых справа',{g:el.dataset.g}),'info')},
  'evac-end':()=>endEvac(false),
  'evac-end-force':()=>{const r=$('#ee-r').value.trim();if(!r){err('#ee-r','#ee-err',t('Укажите основание'));return}aud('Завершение с неучтёнными',r);endEvac(true)},
  'evac-report':()=>evacReport(),
  'mass-notify':()=>dlg(`<div class="dlg-h">${ic('megaphone','ic-24')}<h2 class="dialog-title">${t('Массовое оповещение родителям')}</h2></div><div class="dlg-b"><div class="msg">${t('Эвакуация завершена, все дети в безопасности. Забрать ребёнка можно у точки сбора: спортплощадка.')}</div><div class="cap muted">${t('Шаблон SKD-NTF-05 · уйдёт в MAX {n} родителям · требует подтверждения администратора',{n:db.kids.filter(k=>k.parent.max).length})}</div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="mass-ok">${t('Отправить')}</button></div>`),
  'mass-ok':()=>{closeDlg();aud('Массовое оповещение родителям','SKD-NTF-05');toast(t('Оповещение отправлено в MAX'))},
  'rc-mark':el=>{const r=markKid(el.dataset.id,el.dataset.v);if(r==='queued')toast(t('Нет связи — отметка в очереди, отправится автоматически'),'info');rerender()},
  /* приём и выдача */
  'ho-accept':el=>dlgAccept(el.dataset.id),
  'accept-ok':el=>{const k=KBY(el.dataset.id),b=$('#ac-b').value;closeDlg();k.day.st='in';k.day.inT=NOW();k.day.brought={by:b,t:NOW()};if(k.parent.max)k.day.max.push({t:NOW(),k:'accept'});aud('Приём ребёнка',`${k.short} · ${b}`);toast(t('{w} принят в группу',{w:k.short}));rerender()},
  'ho-give':el=>dlgGive(el.dataset.id),
  'tp-pick':el=>dlgGive(el.dataset.id,+el.dataset.i,false),
  'tp-stranger':el=>dlgGive(el.dataset.id,-1,true),
  'give-ok':el=>{const k=KBY(el.dataset.id);let h;
    if(el.dataset.s==='1'){const f=$('#st-fio').value.trim();if(!f||!$('#st-ok').checked){err(null,'#st-err',t('Нужны ФИО и подтверждение законного представителя'));return}
      h={rel:'по звонку',fio:f,t:NOW(),phone:true};addEvent({kind:'presence',type:'stop',title:'Выдача лицу не из списка доверенных',desc:'{w} → {f} · подтверждено по телефону',dv:{w:k.short,f},person:k.id,sev:'mid',b:k.b,z:k.g})}
    else{const x=k.trusted[+el.dataset.i];h={rel:x.rel,fio:x.fio,t:NOW()}}
    k.day.handed=h;k.day.outT=NOW();if(k.parent.max)k.day.max.push({t:NOW(),k:'hand',rel:h.rel});closeDlg();aud('Выдача ребёнка',`${k.short} → ${h.fio}${h.phone?' · tel':''}`);toast(t('{w} выдан: {r}',{w:k.short,r:t(h.rel)}));rerender()},
  /* люди */
  'ppl-tab':el=>{S.ppl.tab=el.dataset.v;rerender()},
  'ppl-pg':el=>{S.ppl.page+=+el.dataset.d;rerender()},
  'ppl-open-vis':()=>{S.ppl.tab='visitors';location.hash='#people'},
  block:el=>dlgBlock(el.dataset.id,false), unblock:el=>dlgBlock(el.dataset.id,true),
  'block-ok':el=>{const r=$('#bl-r').value;if(!r){err('#bl-r','#bl-err',t('Причина обязательна'));return}const h=holders().find(x=>x.id===el.dataset.id),un=el.dataset.un==='1';h.o.cardSt=un?'active':'blocked';h.o.blockWhy=un?null:r;closeDlg();aud(un?'Пропуск разблокирован':'Пропуск заблокирован',`${h.fio} · ${h.card} · ${r}`);toast(t(un?'Разблокирован пропуск {c} · {f}':'Заблокирован пропуск {c} · {f}',{c:h.card,f:h.fio}));rerender()},
  'person-add':()=>{Object.assign(NEWP,{cat:'kid',fio:'',g:null,card:'',photo:null,parents:[{fio:'',rel:'мама',phone:'',photo:null,pick:true}]});dlgPerson()},
  'np-cat':el=>{readNewP();NEWP.cat=el.dataset.v;dlgPerson()},
  'parent-add':()=>{readNewP();NEWP.parents.push({fio:'',rel:'папа',phone:'',photo:null,pick:true});dlgPerson()},
  'parent-del':el=>{readNewP();NEWP.parents.splice(+el.dataset.i,1);dlgPerson()},
  'person-ok':()=>{readNewP();const p=P(),kid=NEWP.cat==='kid';
    if(!NEWP.fio.trim()){err('#np-fio','#np-err',t('Укажите ФИО'));return}
    if(kid&&!NEWP.parents.some(x=>x.fio.trim())){err(null,'#np-err',t('Укажите хотя бы одного законного представителя'));return}
    const parts=NEWP.fio.trim().split(/\s+/), short=parts.slice(0,2).join(' '), card=NEWP.card||`00 99 ${String(1000+db.kids.length).slice(-4)}`;
    if(kid){const g=db.groups.find(x=>x.id===NEWP.g)||db.groups[0];const ps=NEWP.parents.filter(x=>x.fio.trim()).map(x=>({fio:x.fio.trim(),short:x.fio.trim(),rel:x.rel,phone:x.phone||'—',max:false,photo:x.photo,pick:x.pick}));
      const k={id:'K'+(db.kids.length+1000),n:db.kids.length+1000,fio:NEWP.fio.trim(),short,g:g.id,b:g.b,m:true,card,cardSt:'active',photo:NEWP.photo,parent:ps[0],parents:ps,trusted:p.handover?ps.filter(x=>x.pick).map(x=>({fio:x.fio,rel:x.rel,until:'бессрочно',c:'c2',photo:x.photo})):[],hist:{},
        day:{st:'absent',inT:null,outT:null,late:false,early:false,released:false,reason:null,reasonBy:null,check:null,passes:[],max:[],handed:null,brought:null,forgot:false}};
      db.kids.push(k);aud('Добавлен человек',`${k.fio} · ${g.id} · ${t('представителей: {n}',{n:ps.length})}`)}
    else{db.staff.push({id:'S'+(db.staff.length+500),fio:NEWP.fio.trim(),short,cat:NEWP.g,card,cardSt:'active',inT:null,st:'out',photo:NEWP.photo});aud('Добавлен человек',`${NEWP.fio.trim()} · ${NEWP.g}`)}
    closeDlg();toast(t('Добавлен: {f} · пропуск {c} выдан в СКУД',{f:short,c:card}));rerender()},
  visitor:()=>dlgVisitor(),
  'visitor-ok':()=>{const f=$('#vi-f').value.trim(),d=$('#vi-d').value.trim(),to=$('#vi-t').value;
    if(!f||!d||!to){[['#vi-f',f],['#vi-d',d],['#vi-t',to]].forEach(([s,v])=>!v&&$(s).setAttribute('aria-invalid','true'));err(null,'#vi-err',t('Заполните ФИО, документ и к кому'));return}
    const hit=STOP.find(s=>s.fio.toLowerCase().startsWith(f.toLowerCase().split(' ')[0])&&f.length>=3);
    if(hit){$('#vi-stop').innerHTML=msgbar('error',t('Совпадение со стоп-листом: {f}',{f:hit.fio}),`${t(hit.why)} · ${t(hit.basis)} · ${t('до {d}',{d:hit.until})}. ${t('Не впускать. Администрация уведомлена.')}`);
      if(!$('#vi-stop').dataset.ev){$('#vi-stop').dataset.ev=1;addEvent({kind:'alarm',type:'stop',title:'Совпадение со стоп-листом на посту',desc:'{f} · {w}',dv:{f:hit.fio,w:t(hit.why)},sev:'high',cam:db.cams.find(c=>c.entry).id,b:db.cams.find(c=>c.entry).b,z:'Вход / КПП'});aud('Совпадение со стоп-листом',hit.fio);$('#nav').innerHTML=navHtml()}return}
    db.visitors.unshift({id:'V'+(db.visitors.length+1),fio:f,doc:d,to,why:$('#vi-w').value||'—',inT:NOW(),outT:null});closeDlg();aud('Регистрация посетителя',`${f} → ${to}`);toast(t('Посетитель зарегистрирован: {f} · стоп-лист — совпадений нет',{f}));rerender()},
  'vis-out':el=>{const v=db.visitors.find(x=>x.id===el.dataset.id)||db.contractors.find(x=>x.id===el.dataset.id);v.outT=NOW();aud('Выход посетителя',v.fio);toast(t('{f} вышел · убран из счётчика «в здании»',{f:v.fio}));rerender()},
  temp:()=>dlgTemp(),
  'temp-ok':()=>{const id=$('#tp-k').value;if(!id){err('#tp-k','#tp-err',t('Выберите, кому выдать'));return}const k=KBY(id),w=$('#tp-w').value;S.temp.unshift({fio:k.fio,why:w,t:NOW(),by:user().short});if(w==='Забыл пропуск')k.day.forgot=true;closeDlg();aud('Временный пропуск',`${k.short} · ${w}`);toast(t('Временный пропуск выдан: {w} · до 18:00',{w:k.short}));rerender()},
  import:()=>dlgImport(),
  'import-ok':()=>{closeDlg();aud('Импорт списка','+12 / ~7');toast(t('Импорт применён · дубликатов нет'))},
  'kts-test':()=>{const e=addEvent({kind:'alarm',type:'kts',title:'Тест КТС · пост охраны 1',desc:'Ежедневная проверка — подтверждена событием',sev:'low',status:'done',result:'drill',by:user().short,cam:db.cams.find(c=>c.entry).id,b:db.cams.find(c=>c.entry).b,z:'Вход / КПП'});S.kts={t:e.t,by:user().short,ev:e.title};aud('Журнал: проверка КТС',t(e.title));toast(t('Сработка КТС получена · запись в журнале подтверждена событием (SKD-REG-02)'));rerender()},
  /* обход */
  'round-start':el=>{const r=S.rounds.find(x=>x.id===el.dataset.id);S.round={id:r.id,name:r.name,points:r.points.slice(),marks:{},t0:NOW()};aud('Обход начат',r.name);rerender()},
  'pt-mark':el=>{const i=+el.dataset.i,v=el.dataset.v;if(v==='bad'){dlg(`<div class="dlg-h">${ic('x-circle','ic-24 i-danger')}<h2 class="dialog-title">${t('Точка не проверена')}</h2></div><div class="dlg-b"><div>${esc(S.round.points[i])}</div><div><label class="label" data-required for="pt-note">${t('Что не так')}</label><input class="field" id="pt-note" placeholder="${t('Например: дверь не закрывается, сломан замок')}"><span class="helper" id="pt-err"></span></div><label class="choice"><input type="checkbox" class="check" id="pt-ev" checked> ${t('Создать событие для зам. по безопасности')}</label></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-red" data-act="pt-bad-ok" data-i="${i}">${t('Отметить «Не проверено»')}</button></div>`);return}
    S.round.marks[i]={v:'ok',t:NOW()};rerender()},
  'pt-bad-ok':el=>{const i=+el.dataset.i,n=$('#pt-note').value.trim();if(!n){err('#pt-note','#pt-err',t('Опишите замечание'));return}S.round.marks[i]={v:'bad',t:NOW(),note:n};if($('#pt-ev').checked)addEvent({kind:'alarm',type:'round',title:'Обход: замечание',desc:'{p} — {n}',dv:{p:S.round.points[i],n},sev:'mid',b:'Объект',z:S.round.name});closeDlg();rerender()},
  'round-finish':()=>{const R=S.round,bad=Object.values(R.marks).filter(m=>m.v==='bad');S.roundLog.unshift({route:R.id,name:R.name,t0:R.t0,t1:NOW(),by:user().short,bad:bad.length,notes:bad.map(b=>b.note)});aud('Обход завершён',`${R.name} · ${bad.length}`);S.round=null;toast(t('Обход завершён и записан в журнал обхода'));rerender()},
  'round-cancel':()=>{aud('Обход прерван',S.round.name);S.round=null;rerender()},
  'jr-rounds':()=>{$('#jr-rounds')?.scrollIntoView({behavior:'smooth'})},
  'drill-proto':el=>drillProto(S.drills[+el.dataset.i]),
  export:el=>{aud('Выгрузка',`${el.dataset.f} · ${el.dataset.what||''}`);toast(t('Выгрузка {f}: {w} · записано в журнал аудита',{f:el.dataset.f,w:t(el.dataset.what||'')}))},
  'tk-fixed':el=>{const x=db.tickets.find(y=>y.id===el.dataset.id);x.st='fixed';aud('Заявка устранена',x.id);rerender()},
  'tk-confirm':el=>{const x=db.tickets.find(y=>y.id===el.dataset.id);x.st='confirmed';aud('Заявка подтверждена',x.id);toast(t('Заявка {id} подтверждена',{id:x.id}));rerender()},
  'tk-new':el=>{const id='З-'+(119+db.tickets.filter(x=>+x.id.slice(2)>118).length),s=db.sys.find(x=>x.id===el.dataset.sys),f=s.faults.find(x=>x.dev===el.dataset.dev);f.ticket=id;db.tickets.unshift({id,sys:s.id,dev:f.dev,org:s.id==='video'?'ООО «Телеком-Сервис»':'ООО «Пожтехника»',created:NOW(),st:'created'});aud('Заявка создана',`${id} · ${f.dev}`);toast(t('Заявка {id} отправлена на e-mail обслуживающей организации',{id}));rerender()},
  /* конфигурация */
  'cfg-tab':el=>{S.cfg.tab=el.dataset.v;rerender()},
  'cfg-go':el=>{S.cfg.tab=el.dataset.v},
  'cfg-save':el=>{if(el.dataset.what==='SLA')['video','fire','kts','other'].forEach(k=>S.sla[k]=+$('#sla-'+k).value||S.sla[k]);if(el.dataset.what==='Вместимость зон')db.zones.forEach((z,i)=>z[2]=+$('#cap-'+i).value||z[2]);aud('Конфигурация сохранена',el.dataset.what);toast(t('Сохранено на сервере: {w}',{w:t(el.dataset.what)}));rerender()},
  'mode-edit':el=>dlgModeEdit(el.dataset.id),
  'mode-del':el=>{const m=S.modes.find(x=>x.id===el.dataset.id);if(S.mode===m.id){toast(t('Нельзя удалить включённый режим'),'alarm');return}S.modes=S.modes.filter(x=>x!==m);aud('Режим удалён',m.name);rerender()},
  'mode-save':el=>{const id=el.dataset.id,n=$('#me-n').value.trim();if(!n){err('#me-n','#me-err',t('Укажите название'));return}
    let m=S.modes.find(x=>x.id===id);const sch=$('#me-s').checked;const days=$$('[data-day]').filter(x=>x.checked).map(x=>+x.dataset.day);
    const acts=$$('[data-act-m]').filter(x=>x.checked).map(x=>x.dataset.actM);
    if(!m){m={id:'m'+Date.now().toString(36),ic:'dot-fill'};S.modes.splice(S.modes.findIndex(x=>x.sys),0,m)}
    if(!m.sys){if(!['day','night','holiday','event'].includes(m.id)||n!==modeName(m))m.name=n;m.color=$('#me-c').value;m.sched=sch?{days,from:$('#me-f').value,to:$('#me-t').value}:null}
    if(!(m.sys||['day','night','holiday','event'].includes(m.id))||$('#me-d').value!==t(m.d))m.d=$('#me-d').value;
    m.acts=acts;closeDlg();aud(id?'Режим изменён':'Режим добавлен',modeName(m));toast(t('Режим «{m}» сохранён на сервере',{m:modeName(m)}));rerender()},
  'cfg-route':el=>{S.cfg.route=el.dataset.id;rerender()},
  'route-add':()=>{const r={id:'R'+(S.rounds.length+1)+Date.now().toString(36).slice(-3),name:t('Новый маршрут'),times:['12:00'],points:[t('Первая точка')]};S.rounds.push(r);S.cfg.route=r.id;rerender()},
  'route-del':el=>{S.rounds=S.rounds.filter(r=>r.id!==el.dataset.id);S.cfg.route=null;rerender()},
  'pt-add':()=>{const r=curRoute();readRoute(r);const v=$('#pt-new').value.trim();if(!v)return;r.points.push(v);rerender()},
  'pt-del':el=>{const r=curRoute();readRoute(r);r.points.splice(+el.dataset.i,1);rerender()},
  'pt-up':el=>{const r=curRoute();readRoute(r);const i=+el.dataset.i;[r.points[i-1],r.points[i]]=[r.points[i],r.points[i-1]];rerender()},
  'pt-down':el=>{const r=curRoute();readRoute(r);const i=+el.dataset.i;[r.points[i+1],r.points[i]]=[r.points[i],r.points[i+1]];rerender()},
  'route-save':()=>{const r=curRoute();readRoute(r);if(!r.name.trim()){err('#rt-n',null,'');return}aud('Маршрут обхода сохранён',`${r.name} · ${r.points.length}`);toast(t('Маршрут «{n}» сохранён на сервере',{n:r.name}));rerender()},
  profile:el=>switchProfile(el.dataset.v),
  'profile-me':()=>toast(t('Профиль пользователя — в «Интеллект X»'),'info'),
  signout:()=>toast(t('Выход — в прототипе не выполняется'),'info'),
  /* демонстрация */
  'sim-fire':()=>{kit.closeMenu();if(S.mode==='evac'){toast(t('Эвакуация уже идёт'),'info');return}setMode('evac',t('ДИП-21 · 2 эт., помещение 214'))},
  'sim-dontknow':()=>{kit.closeMenu();simDontKnow()},
  'sim-fight':()=>{kit.closeMenu();const c=db.cams.find(c=>/Двор|площадка/.test(c.name));addEvent({kind:'analytics',type:'fight',title:'Драка',desc:'Детектор агрессивного поведения · уверенность {p} %',dv:{p:91},sev:'high',cam:c.id,b:c.b,z:c.z});toast(t('Детектор: драка · {c}',{c:c.name}),'alarm');rerender()},
  'sim-fault':()=>{kit.closeMenu();const s=db.sys[0],c=db.cams.find(c=>/Актовый|Музыкальный/.test(c.name));if(c.fault)return;c.fault='Нет сигнала';s.faults.push({dev:`Камера «${c.name}»`,zone:c.b,since:hm(NOW()),what:'Нет сигнала',ticket:null});addEvent({kind:'fault',type:'fault',title:'Нет сигнала: камера «{c}»',tv:{c:c.name},desc:'Создайте заявку в «Обслуживании»',sev:'low',cam:null,b:c.b,z:c.z});toast(t('Неисправность: камера «{c}»',{c:c.name}),'alarm');rerender()},
};
function curRoute(){return S.rounds.find(r=>r.id===S.cfg.route)||S.rounds[0]}
function readRoute(r){const n=$('#rt-n'),tt=$('#rt-t');if(n)r.name=n.value;if(tt)r.times=tt.value.split(',').map(x=>x.trim()).filter(Boolean);$$('[data-pt]').forEach(el=>{r.points[+el.dataset.pt]=el.value})}
function simDontKnow(){const p=P();if(!p.parents){toast(t('Уведомления родителям выключены'),'info');return}
  const k=db.kids.find(k=>k.day.st==='absent'&&!k.day.reason&&k.parent.max&&!k.day.max.some(m=>m.reply==='не знаю'))||db.kids.find(k=>k.day.st==='absent');
  let m=k.day.max.find(x=>x.k==='miss');if(!m){m={t:at(...p.rules.miss),k:'miss'};k.day.max.push(m)}m.reply='не знаю';
  addEvent({kind:'presence',type:'dontknow',title:'Родитель не знает, где ребёнок',desc:'{w}, {g} · ответ в MAX «не знаю» · уведомлены ответственный и администрация',dv:{w:k.short,g:k.g},person:k.id,sev:'high',b:k.b,z:k.g});
  toast(t('Ответ «не знаю»: {w}, {g} — событие ответственному и администрации',{w:k.short,g:k.g}),'alarm');rerender();return k}
function camStep(d){const L=camListFor();const list=L.length?L:db.cams;const i=list.findIndex(c=>c.id===S.camSel);openCam(list[(i+d+list.length)%list.length].id)}
function switchProfile(pid){
  if(S.evac){toast(t('Во время эвакуации профиль не меняется'),'alarm');return}
  S.profile=pid;db=buildDB(pid);seedAudit();S.kts={t:at(8,14),by:ROLES.guard.short,ev:'Тест КТС · пост охраны 1'};S.mode='day';S.lock=null;S.doors='normal';S.alarm={};S.temp=[];S.round=null;
  S.att={tab:'sum',day:0,g:'',q:'',st:'',page:0};S.ho.g='';S.rc.g='';S.evw={...S.evw,node:'',sel:null,card:null,st:'open'};S.camNode='';S.sort={};
  S.modes=defaultModes();S.rounds=defaultRounds(pid);S.cfg={tab:S.cfg.tab,route:null};
  S.roundLog=[{route:'R1',name:S.rounds[0].name,t0:at(8,30),t1:at(8,52),by:ROLES.guard.short,bad:0,notes:[]},{route:'R1',name:S.rounds[0].name,t0:at(10,0),t1:at(10,24),by:ROLES.guard.short,bad:1,notes:[pid==='kinder'?'Калитка хозяйственного двора не закрывается':'Хозяйственный двор — ворота не закрываются, сломан замок']}];
  S.drills=[{date:'15.09.2026',t:'10:05',kids:Math.round(db.kids.length*.93),dur:'04:12',slow:db.groups[3].id+' · 04:12',by:ROLES.director.short},{date:'20.10.2026',t:'11:20',kids:Math.round(db.kids.length*.91),dur:'03:48',slow:db.groups[7].id+' · 03:48',by:ROLES.security.short}];
  if(!allowed(S.route)) location.hash='#'+ROLES[S.role].home; rerender();
}

/* ================= события страницы ================= */
document.addEventListener('click',e=>{
  const act=e.target.closest('[data-act]');
  if(act&&A[act.dataset.act]&&!act.disabled){A[act.dataset.act](act,e);return}
  const go=e.target.closest('[data-go]'); if(go){location.hash='#'+go.dataset.go;return}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if($('#sheet').hasAttribute('data-open'))closeSheet();else if($('#side').hasAttribute('data-open')){$('#side').removeAttribute('data-open');$('#side-scrim').hidden=true}}
  if($('#dlg').open&&S.camSel&&$('#dlg .player')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();camStep(e.key==='ArrowRight'?1:-1)}
  const c=e.target.closest&&e.target.closest('.cam[data-act]'); if(c&&(e.key==='Enter'||e.key===' ')&&e.target===c){e.preventDefault();openCam(c.dataset.id)}
  const r=e.target.closest&&e.target.closest('.evq'); if(r&&e.target===r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();A['ev-sel'](r,e)}
});
$('#sheet-scrim').addEventListener('click',closeSheet);
$('#side-scrim').addEventListener('click',()=>{$('#side').removeAttribute('data-open');$('#side-scrim').hidden=true});
$('#menu-btn').addEventListener('click',()=>{const o=!$('#side').hasAttribute('data-open');$('#side').toggleAttribute('data-open',o);$('#side-scrim').hidden=!o});
$('#dlg').addEventListener('close',()=>{S.camSel=null});
window.addEventListener('hashchange',()=>{closeSheet();if(location.hash!=='#events')S.evw.card=S.evw.card;render();window.scrollTo(0,0)});
function keepFocus(id,fn){const el=$(id),y=el?el.selectionStart:0;fn();const n=$(id);if(n){n.focus();try{n.setSelectionRange(y,y)}catch(x){}}}
document.addEventListener('input',e=>{const tg=e.target;
  if(tg.id==='att-q'){S.att.q=tg.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(tg.id==='ev-q'){S.evw.q=tg.value;keepFocus('#ev-q',rerender)}
  if(tg.id==='ppl-q'){S.ppl.q=tg.value;S.ppl.page=0;keepFocus('#ppl-q',rerender)}
  if(tg.id==='aud-q'){S.aud.q=tg.value;S.aud.page=0;keepFocus('#aud-q',rerender)}
  if(tg.id==='cam-q'){S.camQ=tg.value;keepFocus('#cam-q',rerender)}
});
document.addEventListener('change',e=>{const tg=e.target;
  if(tg.dataset.photo){const f=tg.files&&tg.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{readNewP();if(tg.dataset.photo==='self')NEWP.photo=rd.result;else NEWP.parents[+tg.dataset.photo.slice(1)].photo=rd.result;dlgPerson()};rd.readAsDataURL(f);return}
  if(tg.id==='lang'){S.lang=tg.value;saveLang(S.lang);rerender();return}
  if(tg.id==='att-day'){S.att.day=+tg.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(tg.id==='att-g'){S.att.g=tg.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(tg.id==='att-st'){S.att.st=tg.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(tg.id==='ppl-cat'){S.ppl.cat=tg.value;S.ppl.page=0;rerender()}
  if(tg.id==='ppl-st'){S.ppl.st=tg.value;S.ppl.page=0;rerender()}
  if(tg.id==='aud-user'){S.aud.user=tg.value;S.aud.page=0;rerender()}
  if(tg.id==='ho-g'){S.ho.g=tg.value;rerender()}
  if(tg.id==='rc-g'){S.rc.g=tg.value;rerender()}
  if(tg.id==='k-rel'){const k=KBY(tg.dataset.id);k.day.released=tg.checked;aud('Отметка «отпущен»',`${k.short}: ${tg.checked?'+':'−'}`);toast(t(tg.checked?'{w} отпущен — уход не считается самовольным':'Отметка снята',{w:k.short}))}
  if(tg.dataset.notif){S.notif[tg.dataset.notif]=tg.checked}
  if(tg.id==='pp-profile') switchProfile(tg.value);
  if(tg.id==='pp-role'){S.role=tg.value;location.hash='#'+ROLES[S.role].home;rerender()}
  if(tg.id==='pp-state'){S.ds=tg.value;rerender()}
  if(tg.id==='pp-sim') PP.sim=tg.checked;
  if(tg.id==='pp-auto') PP.auto=tg.checked;
  if(tg.id==='pp-offline'){S.offline=tg.checked;if(!tg.checked){S.lastUpd=NOW();const q=S.evac?.queue||[];if(q.length){const n=q.length;q.splice(0).forEach(([id,v])=>markKid(id,v,{flush:1}));toast(t('Связь восстановлена · отправлено отметок из очереди: {n}',{n}))}else toast(t('Связь восстановлена · данные обновлены'))}rerender()}
});

/* ================= живое: часы, отсчёты, эскалация, поток проходов (SKD-DSH-02, SKD-EVT-03) ================= */
function tick(now=NOW()){
  $$('[data-t0]').forEach(x=>{x.textContent=fmtDur(now-(+x.dataset.t0))});
  $$('[data-late]').forEach(x=>x.classList.toggle('late',now-(+x.dataset.late)>ESC_AFTER));
  $$('[data-since]').forEach(x=>{x.textContent=fmtDur(now-(+x.dataset.since))});
  $$('[data-clock]').forEach(x=>x.textContent=hms(now));
  const fx=$('#fx-time'); if(fx) fx.textContent=hms(now); $('#clock').textContent=hms(now);
  let changed=false;
  db.events.forEach(e=>{if(e.status==='new'&&e.sev==='high'&&!e.esc&&now-e.t>ESC_AFTER){e.esc=S.role==='director'?ROLES.director.short+' → '+t('дежурный учредителя'):ROLES.director.short;changed=true;e.log.push({t:now,k:'esc',w:e.esc});aud('Эскалация события',`${evTitle(e)} → ${e.esc}`,{user:{short:'Система',role:'Эскалация'}})}});
  if(changed&&['home','events','post'].includes(S.route)&&!busy()) rerender(); else if(changed) $('#nav').innerHTML=navHtml();
}
function refresh(){if(S.offline)return;S.lastUpd=NOW();statusbar()}
function simPass(){
  const p=P(), now=NOW();
  const back=db.kids.find(k=>k.day.st==='out_tmp'), late=db.kids.filter(k=>k.day.st==='absent'&&!k.day.reason);
  let k=null;
  if(back&&Math.random()<.35){k=back;k.day.st='in'}
  else if(late.length&&!p.handover){k=late[Math.floor(Math.random()*late.length)];k.day.st='in';k.day.inT=now;k.day.late=now>at(...p.rules.late);if(p.parents&&k.parent.max&&S.notif.in){k.day.max=k.day.max.filter(m=>m.k!=='miss'||m.reply);k.day.max.push({t:now,k:'in'})}}
  if(!k) return null;
  const pt=ENTRY[p.id][k.b]; k.day.passes.push({t:now,dir:'in',pt}); db.passes.unshift({t:now,dir:'in',pt,who:k.id,fresh:true}); db.passes.length=Math.min(db.passes.length,60);
  if(!S.offline&&['home','post','attendance'].includes(S.route)&&!busy()&&!S.evac) rerender();
  return k;
}
const SELFTEST=/[?&]selftest\b/.test(location.search);
if(SELFTEST){PP.sim=false;PP.auto=false}
setInterval(()=>tick(),1000);
setInterval(()=>refresh(),10000);
setInterval(()=>{if(PP.sim&&S.mode!=='evac'&&S.mode!=='drill')simPass()},6000);
setInterval(()=>autoMark(),1500);

/* хуки для prorotypes/src/selftest.js — не часть продукта */
window.SE={S,scenOf,A,get db(){return db},render,rerender,tick,simPass,setMode,startEvac,markKid,evacCounts,stats,inBuilding,sysState,switchProfile,closeSheet,closeDlg,openKid,verifyChain,simDontKnow,ESC_AFTER,NOW,skew:ms=>{SKEW+=ms},allowed,t,MISSING,PP};
