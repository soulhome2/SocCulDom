/* ================= Люди и пропуска (SKD-PPL) =================
 * Сортировка по столбцам (п. 9, 11), «Добавить человека» с привязкой родителей и фото (п. 8 и п. 3 по детсаду/колледжу),
 * «Добавить посетителя» прямо во вкладке «Посетители» (п. 10). */
VIEWS.people=function(){
  const tb=S.ppl.tab;
  return `<div class="tabs" role="tablist">${[['holders',t('Держатели пропусков')],['visitors',t('Посетители')],['temp',t('Временные пропуска')]].map(([v,l])=>`<button class="tab" role="tab" data-act="ppl-tab" data-v="${v}" aria-selected="${v===tb}">${l}</button>`).join('')}</div>
  ${tb==='holders'?pplHolders():tb==='visitors'?pplVisitors():pplTemp()}`;
};
function holders(){const p=P();return [...db.kids.map(k=>({id:k.id,fio:k.fio,cat:p.kid,grp:k.g,card:k.card,st:k.cardSt,why:k.blockWhy,o:k,kid:true})),...db.staff.map(s=>({id:s.id,fio:s.fio,cat:'Персонал',grp:s.cat,card:s.card,st:s.cardSt,why:s.blockWhy,o:s}))]}
const canAdmin=()=>S.role==='director'||S.role==='security';
function pplHolders(){
  const f=S.ppl, all=holders(); let L=all.filter(h=>(!f.q||h.fio.toLowerCase().includes(f.q.toLowerCase())||h.card.replace(/\s/g,'').includes(f.q.replace(/\s/g,'')))&&(!f.cat||h.cat===f.cat)&&(!f.st||h.st===f.st));
  L=sortRows('hold',L,{fio:h=>h.fio,cat:h=>t(h.cat),grp:h=>h.kid?h.grp:t(h.grp),card:h=>h.card,st:h=>h.st});
  return card(`${t('Держатели пропусков')} <span class="menu-count" id="holders-count">${all.length}</span>`,`<div class="toolbar"><div class="search">${ic('search')}<input class="field" id="ppl-q" placeholder="${t('ФИО или номер карты')}" value="${esc(f.q)}" aria-label="${t('Поиск')}"></div>
   <select class="field" id="ppl-cat" aria-label="${t('Категория')}"><option value="">${t('Все категории')}</option><option value="${P().kid}" ${f.cat===P().kid?'selected':''}>${t(P().kid)}</option><option value="Персонал" ${f.cat==='Персонал'?'selected':''}>${t('Персонал')}</option></select>
   <select class="field" id="ppl-st" aria-label="${t('Состояние пропуска')}"><option value="">${t('Все пропуска')}</option><option value="active" ${f.st==='active'?'selected':''}>${t('Активные')}</option><option value="blocked" ${f.st==='blocked'?'selected':''}>${t('Заблокированные')}</option></select>
   <span class="sp"></span><span class="cap muted">${t('Активных: {a} · заблокировано: {b}',{a:all.filter(h=>h.st==='active').length,b:all.filter(h=>h.st==='blocked').length})}</span></div>
   <div id="ppl-res">${dataBlock(()=>{const pg=L.slice(f.page*50,f.page*50+50);return `<div class="scroll-x"><table class="table" id="t-hold"><thead><tr>${th('hold','fio',t('ФИО'))}${th('hold','cat',t('Категория'))}${th('hold','grp',t('Группа / должность'))}${th('hold','card',t('Пропуск'))}${th('hold','st',t('Состояние'))}<th style="text-align:right">${t('Действие')}</th></tr></thead><tbody>${pg.map(h=>`<tr><td><span class="row">${av(h.fio,'','',h.o.photo)}${h.kid?`<button class="link" data-act="kid" data-id="${h.id}">${esc(h.fio)}</button>`:esc(h.fio)}</span></td><td class="cap">${esc(t(h.cat))}</td><td class="cap">${esc(h.kid?h.grp:t(h.grp))}</td><td class="mono cap">${h.card}</td><td>${h.st==='active'?`<span class="badge badge-success">${t('Активен')}</span>`:`<span class="badge badge-danger" data-tip="${esc(t(h.why||''))}">${t('Заблокирован')}</span>`}</td>
     <td style="text-align:right">${canAdmin()?(h.st==='active'?`<button class="btn btn-outline btn-compact" data-act="block" data-id="${h.id}">${ic('lock')}${t('Заблокировать')}</button>`:`<button class="btn btn-outline btn-compact" data-act="unblock" data-id="${h.id}">${ic('unlock')}${t('Разблокировать')}</button>`):`<span class="cap muted">${t('нет права')}</span>`}</td></tr>`).join('')}</tbody></table></div>${pager(L.length,f.page,'ppl-pg')}`},{rows:10})}</div>
   <div class="card-b cap muted">${t('Пропуск выдаётся и блокируется в СКУД «Интеллект X», действие записывается в журнал аудита. Причина блокировки обязательна (SKD-PPL-05).')}</div>`,
   {right:`${canAdmin()?`<button class="btn btn-outline" data-act="import">${ic('upload')}${t('Импорт списка')}</button><button class="btn btn-primary" data-act="person-add">${ic('person-add')}${t('Добавить человека')}</button>`:''}`});
}
function pplVisitors(){
  let V=[...db.visitors.map(v=>({...v,kind:'Посетитель'})),...db.contractors.map(c=>({...c,kind:'Подрядчик',to:c.org,doc:'Договор'}))];
  V=sortRows('vis',V,{fio:v=>v.fio,kind:v=>t(v.kind),to:v=>v.to,why:v=>v.why,in:v=>+v.inT,out:v=>v.outT?+v.outT:Infinity});
  if(!S.sort.vis) V.sort((a,b)=>b.inT-a.inT);
  return card(t('Посетители и подрядчики за сегодня'),dataBlock(()=>`<div class="scroll-x"><table class="table" id="t-vis"><thead><tr>${th('vis','fio',t('ФИО'))}${th('vis','kind',t('Тип'))}<th>${t('Документ')}</th>${th('vis','to',t('К кому / организация'))}${th('vis','why',t('Цель'))}${th('vis','in',t('Вход'))}${th('vis','out',t('Выход'))}<th></th></tr></thead><tbody>${V.map(v=>`<tr><td><span class="row">${av(v.fio)}${esc(v.fio)}</span></td><td class="cap">${t(v.kind)}</td><td class="cap mono">${esc(v.doc)}</td><td class="cap">${esc(v.to)}</td><td class="cap">${esc(t(v.why))}</td><td class="mono cap">${hm(v.inT)}</td><td class="mono cap">${v.outT?hm(v.outT):`<span class="badge badge-info">${t('в здании')}</span>`}</td><td style="text-align:right">${v.outT?'':`<button class="btn btn-outline btn-compact" data-act="vis-out" data-id="${v.id}">${ic('sign-out')}${t('Отметить выход')}</button>`}</td></tr>`).join('')}</tbody></table></div>`),
   {right:`<span class="cap muted">${t('Вышедшие уходят из счётчика «в здании» (SKD-PPL-07)')}</span><button class="btn btn-primary" data-act="visitor">${ic('person-add')}${t('Добавить посетителя')}</button>`});
}
function pplTemp(){return card(t('Временные пропуска · гаснут в конце дня (SKD-PPL-06)'),S.temp.length?`<table class="table"><thead><tr><th>${t('Кому')}</th><th>${t('Причина')}</th><th>${t('Выдан')}</th><th>${t('Действует до')}</th></tr></thead><tbody>${S.temp.map(x=>`<tr><td>${esc(x.fio)}</td><td class="cap">${esc(t(x.why))}</td><td class="mono cap">${hm(x.t)} · ${esc(x.by)}</td><td class="mono cap">${t('сегодня {t}',{t:'18:00'})}</td></tr>`).join('')}</tbody></table>`:`<div class="empty">${ic('id-badge')}<div class="h-sm" style="color:var(--color-fg)">${t('Сегодня временных пропусков нет')}</div><button class="btn btn-outline" data-act="temp">${t('Выдать временный пропуск')}</button></div>`,{right:`<button class="btn btn-primary" data-act="temp">${ic('id-badge')}${t('Временный пропуск')}</button>`})}
const STOP=[{fio:'Зуев Игорь Валерьевич',why:'Ограничение общения с ребёнком по решению суда',basis:'Решение районного суда, копия у директора',until:'31.08.2027'}];
/* «Добавить человека»: для ребёнка — законные представители с фото (детсад: могут забирать) */
const NEWP={cat:'kid',parents:[{fio:'',rel:'мама',phone:'',photo:null,pick:true}],photo:null};
function dlgPerson(){
  const p=P(), kid=NEWP.cat==='kid';
  const prow=(x,i)=>`<div class="parent-row"><label class="photo" aria-label="${t('Фото')}">${x.photo?`<img src="${x.photo}" alt="">`:`${ic('device-camera','ic-24')}`}<input type="file" accept="image/*" data-photo="p${i}" aria-label="${t('Загрузить фото')}"></label>
    <div class="col" style="gap:8px"><div class="grid2" style="gap:8px"><div><label class="label" data-required for="pp-f${i}">${t('ФИО законного представителя')}</label><input class="field" id="pp-f${i}" data-pf="${i}" data-k="fio" value="${esc(x.fio)}"></div>
     <div><label class="label" for="pp-r${i}">${t('Кем приходится')}</label><select class="field" id="pp-r${i}" data-pf="${i}" data-k="rel">${['мама','папа','бабушка','дедушка','опекун','няня'].map(r=>`<option value="${r}" ${x.rel===r?'selected':''}>${t(r)}</option>`).join('')}</select></div>
     <div><label class="label" for="pp-ph${i}">${t('Телефон')}</label><input class="field" id="pp-ph${i}" data-pf="${i}" data-k="phone" value="${esc(x.phone)}" placeholder="+7 9…"></div>
     <div class="row" style="align-items:flex-end;gap:8px">${p.handover?`<label class="choice"><input type="checkbox" class="check" data-pf="${i}" data-k="pick" ${x.pick?'checked':''}> ${t('Может забирать ребёнка')}</label>`:''}${NEWP.parents.length>1?`<button class="btn btn-subtle btn-compact" data-act="parent-del" data-i="${i}">${ic('trash')}${t('Убрать')}</button>`:''}</div></div></div></div>`;
  dlg(`<div class="dlg-h">${ic('person-add','ic-24')}<h2 class="dialog-title">${t('Добавить человека')}</h2></div><div class="dlg-b">
   ${seg('np-cat',[['kid',t(p.kid)],['staff',t('Сотрудник')]],NEWP.cat,'np-cat')}
   <div class="parent-row"><label class="photo" aria-label="${t('Фото')}">${NEWP.photo?`<img src="${NEWP.photo}" alt="">`:ic('device-camera','ic-24')}<input type="file" accept="image/*" data-photo="self" aria-label="${t('Загрузить фото')}"></label>
    <div class="grid2" style="gap:8px"><div style="grid-column:1/-1"><label class="label" data-required for="np-fio">${t('ФИО')}</label><input class="field" id="np-fio" value="${esc(NEWP.fio||'')}" placeholder="${t('Фамилия Имя Отчество')}"></div>
     <div><label class="label" data-required for="np-g">${kid?t(p.grp):t('Должность')}</label>${kid?`<select class="field" id="np-g">${db.groups.map(g=>`<option ${NEWP.g===g.id?'selected':''}>${esc(g.id)}</option>`).join('')}</select>`:`<select class="field" id="np-g">${p.staff.map(([c])=>`<option value="${c}">${t(c)}</option>`).join('')}</select>`}</div>
     <div><label class="label" for="np-card">${t('Номер карты СКУД')}</label><input class="field" id="np-card" value="${esc(NEWP.card||'')}" placeholder="00 00 0000"></div></div></div>
   ${kid?`<div class="row"><div class="h-sm">${t('Законные представители')}</div><span class="sp"></span><button class="btn btn-outline btn-compact" data-act="parent-add">${ic('plus')}${t('Добавить представителя')}</button></div>${NEWP.parents.map(prow).join('')}
     <div class="cap muted">${t(p.handover?'Фото представителя видит воспитатель при выдаче ребёнка. Биометрия не используется — фото только для сверки глазами.':'Фото представителя — для сверки на посту охраны. Биометрия не используется.')}</div>`:''}
   <span class="helper" id="np-err"></span></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="person-ok">${t('Добавить и выдать пропуск')}</button></div>`,{wide:1});
}
function readNewP(){NEWP.fio=$('#np-fio')?.value||'';NEWP.g=$('#np-g')?.value;NEWP.card=$('#np-card')?.value||'';$$('[data-pf]').forEach(el=>{const x=NEWP.parents[+el.dataset.pf];if(x)x[el.dataset.k]=el.type==='checkbox'?el.checked:el.value})}

/* ================= Пост охраны (SKD-DSH-06) — только роль «Пост охраны» ================= */
VIEWS.post=function(){
  const cams=db.cams.filter(c=>c.entry).slice(0,4), active=db.events.filter(e=>e.status!=='done'&&['alarm','analytics'].includes(e.kind));
  return `<div class="page-h"><h1>${t('Пост охраны 1')}</h1><span class="badge badge-neutral">${esc(ROLES.guard.short)}</span><span class="sp"></span>
    <button class="btn btn-primary" data-act="visitor">${ic('person-add')}${t('Зарегистрировать посетителя')}</button><button class="btn btn-outline" data-act="temp">${ic('id-badge')}${t('Временный пропуск')}</button><button class="btn btn-outline" data-act="kts-test">${ic('shield')}${t('Тест КТС')}</button></div>
  ${S.kts?'':msgbar('warning',t('Ежедневная проверка КТС ещё не выполнена'),t('Напоминание в 09:00, событие администрации в 10:00 (SKD-REG-02)'),`<button class="btn" data-act="kts-test">${t('Тест КТС')}</button>`)}
  ${S.round?msgbar('info',t('Идёт обход: {n}',{n:S.round.name}),t('Отмечено {a} из {b} точек',{a:Object.keys(S.round.marks).length,b:S.round.points.length}),`<a class="btn" href="#rounds">${t('Открыть')}</a>`):''}
  <div class="cols"><div class="stack">${card(t('Камеры входов'),`<div class="card-b"><div class="cams">${cams.map(c=>camTile(c)).join('')}</div></div>`)}</div>
   <div class="stack">${card(`${t('Тревоги')} ${active.length?`<span class="badge badge-danger">${active.length}</span>`:''}`,active.length?active.map(evRow).join(''):`<div class="empty">${ic('shield-check')}${t('Активных тревог нет')}</div>`)}
   ${card(t('Проходы в реальном времени'),`<div id="pass-feed">${dataBlock(()=>db.passes.slice(0,12).map(passRow).join(''),{emptyText:'Проходов пока нет',emptyIcon:'sign-in'})}</div><div class="card-b cap muted">${t('Фото — из карточки человека в СКУД. Биометрия не используется (раздел 12.2).')}</div>`)}</div></div>`;
};
function passRow(p,i){const k=KBY(p.who)||db.staff.find(s=>s.id===p.who);if(!k)return '';
  return `<div class="act-row" style="align-items:center">${av(k.short,'','',k.photo)}<span class="grow col" style="gap:0"><b class="lbl">${esc(k.short)}</b><span class="cap muted">${k.g?esc(k.g):esc(t(k.cat))} · ${esc(p.pt)}</span></span>${p.dir==='in'?`<span class="badge badge-success">${ic('sign-in')}${t('Вход')}</span>`:`<span class="badge badge-neutral">${ic('sign-out')}${t('Выход')}</span>`}<span class="cap mono">${hm(p.t)}</span></div>`}

/* ================= Обход (корректировка, п. 12) — только роль «Пост охраны» =================
 * Чек-лист точек маршрута из «Конфигурации → Обходы»; у каждой — «Проверено» / «Не проверено» (с замечанием). */
VIEWS.rounds=function(){
  const R=S.round;
  if(!R) return `${card(t('Маршруты обхода'),`<div class="scroll-x"><table class="table"><thead><tr><th>${t('Маршрут')}</th><th class="num">${t('Точек')}</th><th>${t('По графику')}</th><th>${t('Сегодня')}</th><th></th></tr></thead><tbody>${S.rounds.map(r=>{const done=S.roundLog.filter(l=>l.route===r.id);return `<tr><td><b>${esc(r.name)}</b></td><td class="num">${r.points.length}</td><td class="cap mono">${r.times.join(' · ')}</td><td class="cap">${done.length?done.map(l=>`${hm(l.t0)}${l.bad?` <span class="tag bad">${t('замечаний: {n}',{n:l.bad})}</span>`:''}`).join(', '):`<span class="muted">${t('ещё не было')}</span>`}</td><td style="text-align:right"><button class="btn btn-primary btn-compact" data-act="round-start" data-id="${r.id}">${ic('play')}${t('Начать обход')}</button></td></tr>`}).join('')}</tbody></table></div>`,{right:`<span class="cap muted">${t('Маршруты и точки задаёт администрация в «Конфигурации»')}</span>`})}
   ${card(t('Обходы за сегодня'),roundLogTable())}`;
  const done=Object.keys(R.marks).length, bad=Object.values(R.marks).filter(m=>m.v==='bad').length;
  return `<div class="page-h"><h1>${esc(R.name)}</h1><span class="badge badge-info">${t('начат в {t}',{t:hm(R.t0)})}</span><span class="sp"></span><span class="cap">${t('Отмечено {a} из {b}',{a:done,b:R.points.length})}${bad?` · <b class="t-danger">${t('не проверено: {n}',{n:bad})}</b>`:''}</span></div>
  <div class="prog ${bad?'warn':'ok'}" style="flex:none;height:8px"><i style="width:${pct(done,R.points.length)}%"></i></div>
  ${card(t('Чек-лист обхода'),R.points.map((pt,i)=>{const m=R.marks[i];return `<div class="pt ${m?m.v==='ok'?'ok':'bad':''}"><span class="n">${m?ic(m.v==='ok'?'check':'x'):i+1}</span><span class="col" style="gap:2px;min-width:0"><span>${esc(pt)}</span>${m?`<span class="cap muted">${hm(m.t)}${m.note?' · '+esc(m.note):''}</span>`:''}</span>
     <span class="acts"><button class="btn btn-compact ${m&&m.v==='ok'?'btn-green':'btn-outline'}" data-act="pt-mark" data-i="${i}" data-v="ok" aria-pressed="${!!(m&&m.v==='ok')}">${ic('check')}${t('Проверено')}</button><button class="btn btn-compact ${m&&m.v==='bad'?'btn-red':'btn-outline'}" data-act="pt-mark" data-i="${i}" data-v="bad" aria-pressed="${!!(m&&m.v==='bad')}">${ic('x')}${t('Не проверено')}</button></span></div>`}).join('')+
   `<div class="card-f"><button class="btn btn-subtle" data-act="round-cancel">${t('Прервать обход')}</button><span class="sp"></span><span class="cap muted">${done<R.points.length?t('Отметьте все точки, чтобы завершить'):''}</span><button class="btn btn-primary" data-act="round-finish" ${done<R.points.length?'disabled':''}>${ic('check')}${t('Завершить обход')}</button></div>`)}`;
};
function roundLogTable(){return S.roundLog.length?`<div class="scroll-x"><table class="table"><thead><tr><th>${t('Маршрут')}</th><th>${t('Начало')}</th><th>${t('Конец')}</th><th>${t('Кто')}</th><th>${t('Замечания')}</th></tr></thead><tbody>${S.roundLog.map(l=>`<tr><td>${esc(l.name)}</td><td class="mono cap">${hm(l.t0)}</td><td class="mono cap">${hm(l.t1)}</td><td class="cap">${esc(l.by)}</td><td class="cap">${l.bad?l.notes.map(esc).join('; '):`<span class="t-success">${t('без замечаний')}</span>`}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">${ic('location')}${t('Сегодня обходов ещё не было')}</div>`}

/* ================= Видеонаблюдение (SKD-DSH-04) — дерево групп как в Incident Manager ================= */
function camTree(){const T={};db.cams.forEach(c=>{(T[c.b]=T[c.b]||{})[c.z]=(T[c.b][c.z]||[]).concat(c)});return T}
function camsOfNode(){const n=S.camNode, guard=S.role==='guard';return db.cams.filter(c=>(!n||(n.includes('|')?c.b+'|'+c.z===n:c.b===n))&&(!guard||c.entry)&&(!S.camQ||c.name.toLowerCase().includes(S.camQ.toLowerCase())))}
VIEWS.video=function(){
  const guard=S.role==='guard', T=camTree(), list=camsOfNode(), shown=S.grid===1?list.slice(0,1):S.grid===4?list.slice(0,4):list.slice(0,9), q=S.camQ.toLowerCase();
  const hit=c=>!q||c.name.toLowerCase().includes(q);
  const tree=`<div class="filterrow"><div class="search" style="max-width:none">${ic('search')}<input class="field" id="cam-q" placeholder="${t('Поиск камеры')}" value="${esc(S.camQ)}" aria-label="${t('Поиск камеры')}"></div></div>
   <div class="tree" role="tree"><button class="tree-i" role="treeitem" data-act="camnode" data-n="" aria-selected="${S.camNode===''}">${ic('apps')}<span class="grow">${t('Все камеры')}</span><span class="menu-count">${db.cams.filter(hit).length}</span></button>
   ${Object.keys(T).map(b=>`<button class="tree-i" role="treeitem" data-act="camnode" data-n="${esc(b)}" aria-selected="${S.camNode===b}">${ic('organization')}<span class="grow">${esc(b)}</span><span class="menu-count">${Object.values(T[b]).flat().filter(hit).length}</span></button>`+Object.keys(T[b]).map(z=>{const L=T[b][z].filter(hit);return L.length?`<button class="tree-i lvl1" role="treeitem" data-act="camnode" data-n="${esc(b+'|'+z)}" aria-selected="${S.camNode===b+'|'+z}">${ic('file-directory')}<span class="grow">${esc(z)}</span><span class="menu-count">${L.length}</span></button>`+(q?L.map(c=>`<button class="tree-i lvl2" data-act="cam-open" data-id="${c.id}">${ic('device-camera-video')}<span class="grow">${esc(c.name)}</span></button>`).join(''):''):''}).join('')).join('')}</div>
   <div class="card-b cap muted" style="border-top:1px solid var(--color-border)">${t(guard?'Пост охраны: камеры входов, архив — не старше 24 ч (раздел 9).':'Группы — здания и зоны из модели объекта (SKD-OBJ-01/02). Звезда на камере — избранное для главной.')}</div>`;
  return `<div class="ws ws-video">
   <section class="card"><div class="panel-h"><h2>${t('Группы камер')}</h2></div>${tree}</section>
   ${card(esc(S.camNode?S.camNode.replace('|',' · '):t('Все камеры'))+` <span class="menu-count">${list.length}</span>`,`<div class="card-b">${list.length?`<div class="cams ${S.grid===1?'one':S.grid===9?'nine':''}">${shown.map(c=>camTile(c,{fav:!guard})).join('')}</div>${list.length>shown.length?`<div class="cap muted" style="margin-top:8px">${t('Показаны {a} из {b} — выберите раскладку 9 или группу',{a:shown.length,b:list.length})}</div>`:''}`:`<div class="empty">${ic('search')}${t('Камер не найдено')}</div>`}</div>`,{right:seg('v-grid',[['1','1'],['4','4'],['9','9']],String(S.grid),'grid')})}
  </div>`;
};
function camListFor(){return S.route==='home'?db.cams.filter(c=>c.fav):S.route==='video'?camsOfNode():db.cams}
function openCam(id){
  const L=camListFor(), list=L.length?L:db.cams; let i=list.findIndex(c=>c.id===id); if(i<0){i=0;list.unshift(db.cams.find(c=>c.id===id)||db.cams[0])} const c=list[i]; S.camSel=c.id;
  const na=c.srvi, off=c.fault&&c.fault.startsWith('Нет');
  dlg(`<div class="dlg-h"><h2 class="dialog-title">${esc(c.name)}</h2><span class="cap muted">${esc(c.b)} · ${esc(c.z)}</span><span class="sp"></span><button class="btn btn-icon" data-kit-close aria-label="${t('Закрыть')}">${ic('x')}</button></div>
   <div class="dlg-b"><div class="player">${na||off?`<div class="cam" style="position:absolute;inset:0;border:0;aspect-ratio:auto;cursor:default"><div class="na">${ic(na?'eye-closed':'alert','ic-32')}<span>${na?t('Камера недоступна'):t('Нет сигнала с {t}',{t:'07:12'})}</span></div></div>`:scene(c)}
     <span class="overlay o-tl"><span class="live ${na||off?'off':''}"></span>${S.camArch?t('Архив')+' · '+hm(new Date(NOW()-600000)):t('Live')}</span>
     <span class="overlay o-arr l"><button class="btn btn-icon" data-act="cam-step" data-d="-1" aria-label="${t('Предыдущая камера')}">${ic('chevron-left')}</button></span><span class="overlay o-arr r"><button class="btn btn-icon" data-act="cam-step" data-d="1" aria-label="${t('Следующая камера')}">${ic('chevron-right')}</button></span>
     ${S.camArch?`<span class="overlay o-bar">${ic('play')}<span class="mono">${hms(new Date(NOW()-600000))}</span><span class="track"><i style="left:66%"></i></span><span>${t('−30 мин')}</span></span>`:''}</div>
     <div class="row wrap"><span class="cap muted">${t('Камера {a} из {b} · стрелки или ← → на клавиатуре',{a:i+1,b:list.length})}</span><span class="sp"></span>
       ${na||off?'':`<button class="btn btn-outline" data-act="cam-arch" data-id="${c.id}">${ic(S.camArch?'device-camera-video':'history')}${t(S.camArch?'Вернуться в Live':'Архив камеры')}</button>`}${S.role!=='guard'&&!na&&!off?`<button class="btn btn-outline" data-act="export" data-f="MP4" data-what="Фрагмент видео">${ic('download')}${t('Экспорт')}</button>`:''}</div>
     ${na?`<div class="cap muted">${t('Изображение временно недоступно. Это не неисправность: заявка на обслуживание не создаётся.')}</div>`:''}</div>`,{wide:1});
  if(!na&&!off) aud(S.camArch?'Просмотр архива':'Просмотр видео',c.name);
}
