/* ================= Главная (SKD-DSH) =================
 * Две независимые колонки: слева видео и события, справа — сводка посещаемости (поднята наверх), системы, зоны.
 * Блоки справа не ждут высоты левых — пустого места под ними нет (корректировка, п. 2). */
VIEWS.home=function(){
  if(S.mode==='evac'||S.mode==='drill') return vEvac();
  if(S.mode==='lock') return vLock();
  const p=P(), ib=inBuilding(), st=stats(db.kids), favs=db.cams.filter(c=>c.fav).slice(0,S.grid===1?1:4);
  const worst=db.groups.map(g=>{const s=stats(db.kids.filter(k=>k.g===g.id));return {g,s,abs:pct(s.absent,s.list)}}).sort((a,b)=>b.abs-a.abs).slice(0,4);
  const week=DAYS.slice(0,6).reverse().map(d=>({d,v:d.off===0?st.absent:db.kids.filter(k=>genPast(p,k,d.off).st==='absent').length}));
  const mx=Math.max(...week.map(w=>w.v),1);
  const evs=db.events.slice().sort((a,b)=>b.t-a.t).slice(0,8);
  return `
  <div class="grid4">
    <button class="card kpi" data-act="inbuilding"><span class="lbl muted">${ic('organization')} ${t('Сейчас в здании')}</span><span class="kpi-value" id="k-in">${ib.total}</span>
      <span class="split"><span>${t(p.kids)}: <b>${ib.kids}</b></span><span>${t('Персонал')}: <b>${ib.staff}</b></span><span>${t('Посетители')}: <b>${ib.vis}</b></span><span>${t('Подрядчики')}: <b>${ib.con}</b></span></span></button>
    <button class="card kpi" data-go="attendance"><span class="lbl muted">${ic('people')} ${t('{k} по списку',{k:t(p.kids)})}</span><span class="kpi-value" id="k-list">${st.list}</span><span class="split"><span>${t(p.grpPl)}: <b>${db.groups.length}</b></span>${st.check?`<span>${t('Требует проверки')}: <b>${st.check}</b></span>`:''}</span></button>
    <button class="card kpi ok" data-act="att-go" data-st="came"><span class="lbl muted">${ic('check-circle')} ${t('Пришли')}</span><span class="row" style="align-items:baseline"><span class="kpi-value" id="k-came">${st.came}</span><span class="h-sm muted">${pct(st.came,st.list)} %</span></span><div class="prog ok"><i style="width:${pct(st.came,st.list)}%"></i></div></button>
    <button class="card kpi attn" data-act="att-go" data-st="absent"><span class="lbl muted">${ic('person')} ${t('Отсутствуют')}</span><span class="row" style="align-items:baseline"><span class="kpi-value" id="k-abs">${st.absent}</span><span class="h-sm muted">${pct(st.absent,st.list)} %</span></span>
      <span class="split"><span>${t('по причине')}: <b>${st.reasonOk}</b></span><span>${t(pastMiss()?'без причины':'ещё не пришли')}: <b>${st.noReason}</b></span></span></button>
  </div>
  <div class="cols">
    <div class="stack">
      ${card(t('Видеонаблюдение · избранные камеры'),`<div class="card-b"><div class="cams ${S.grid===1?'one':''}">${favs.map(c=>camTile(c,{fav:1})).join('')}</div></div>`,{right:`${seg('home-grid',[['1','1'],['4','4']],String(S.grid),'grid')}<a class="btn btn-outline" href="#video">${ic('device-camera-video')}${t('Все камеры')}</a>`})}
      ${card(t('Последние события'),`${dataBlock(()=>`<div id="home-ev">${evs.map(evRow).join('')}</div>`,{emptyText:'Событий за сегодня нет',emptyIcon:'bell'})}<div class="card-f"><span class="cap muted">${t('Показаны {n} последних · обновляются автоматически',{n:evs.length})}</span><span class="sp"></span><a class="link-action" href="#events">${t('Все события')} ${ic('arrow-right')}</a></div>`)}
    </div>
    <div class="stack">
      ${card(t('Сводка посещаемости'),`<div class="card-b col" style="gap:10px">
        <div class="row"><span class="h-md">${pct(st.came,st.list)} %</span><span class="cap muted">${t('присутствуют · {a} из {b}',{a:st.came,b:st.list})}</span></div>
        <div class="cap muted">${t('Отсутствия за неделю')}</div>
        <div class="mini" role="img" aria-label="${t('График отсутствий за неделю')}">${week.map(w=>`<i class="${w.d.off===0?'today':''}" style="height:${Math.max(4,w.v/mx*100)}%" data-tip="${wd(w.d.d)} ${dm(w.d.d)} — ${t('отсутствовали {n}',{n:w.v})}"></i>`).join('')}</div>
        <div class="mini-l">${week.map(w=>`<span>${w.d.off===0?t('сегодня'):wd(w.d.d)+' '+dm(w.d.d)}</span>`).join('')}</div>
        <div class="ov" style="margin-top:4px">${t('Больше всего отсутствующих')}</div>
        ${worst.map(w=>`<button class="sys" style="padding:6px 0;box-shadow:none" data-act="att-grp" data-g="${esc(w.g.id)}"><span class="grow">${esc(w.g.id)} <span class="cap muted">· ${esc(w.g.resp)}</span></span>${w.abs>=20?`<span class="badge badge-warning" data-tip="${t('Отсутствуют {p} % — больше порога 20 %',{p:w.abs})}">${ic('alert')}${w.abs} %</span>`:`<span class="cap">${w.abs} %</span>`}<span class="cap muted">${t('{a} из {b}',{a:w.s.absent,b:w.s.list})}</span></button>`).join('')}
      </div><div class="card-f"><button class="btn btn-subtle" data-act="export" data-f="PDF" data-what="Сводка посещаемости">${ic('download')}${t('Выгрузить')}</button><span class="sp"></span><a class="link-action" href="#attendance">${t('Журнал посещаемости')} ${ic('arrow-right')}</a></div>`)}
      ${card(t('Состояние систем'),`<div>${db.sys.map(sysRow).join('')}</div><div class="card-f"><span class="cap muted">${t('Наведите на строку — число неисправных устройств')}</span><span class="sp"></span><a class="link-action" href="#service">${t('Обслуживание и заявки')} ${ic('arrow-right')}</a></div>`)}
      ${card(t('Заполненность зон'),db.zones.map(zoneRow).join('')+`<div class="card-b cap muted">${t('Подсчёт видеоаналитикой · жёлтый от 80 %, красный от 100 % (SKD-PRS-09)')}</div>`)}
    </div>
  </div>`;
};
function sysRow(s){const st=sysState(s), n=s.faults.length;
  const tip=st==='alarm'?t('Тревога: {w}',{w:S.alarm[s.id]}):n?t('Неисправных устройств: {n} из {m}',{n,m:s.total}):t('Все {m} устройств в норме',{m:s.total});
  const txt=st==='alarm'?`<b class="t-danger">${t('Тревога')}</b>`:n?`<span class="t-warning" style="font-weight:600">${t('Неисправно: {n}',{n})}</span>`:`<span class="muted">${t('Норма')}</span>`;
  return `<button class="sys" data-go="service" data-sys="${s.id}" data-tip="${esc(tip)}" aria-label="${esc(t(s.name)+' — '+tip)}"><span class="light ${st==='ok'?'':st}"></span>${ic(st==='ok'?'check-circle':st==='warn'?'alert':'flame',st==='ok'?'i-success':st==='warn'?'i-warning':'i-danger')}<span class="grow">${esc(t(s.name))}${s.ext?` <span class="tag">${t('расш.')}</span>`:''}</span><span class="lbl">${txt}</span></button>`}
function zoneRow([n,v,cap]){const p=pct(v,cap),c=p>=100?'bad':p>=80?'warn':'ok';return `<div class="zone"><span class="grow">${esc(n)}</span><div class="prog ${c}"><i style="width:${Math.min(100,p)}%"></i></div><span class="cap nowrap" style="text-align:right">${v} / ${cap} · <b class="${c==='bad'?'t-danger':c==='warn'?'t-warning':''}">${p} %</b></span></div>`}
/* компактная строка события для главной и поста; открытие — в рабочее место «События» */
function evRow(e){
  const cam=e.cam&&db.cams.find(c=>c.id===e.cam);
  return `<button class="ev ${e.status==='done'?'done':''}" data-act="ev-go" data-id="${e.id}">
   <span class="ev-i k-${e.kind}">${ic(TIC[e.type]||KIC[e.kind])}</span>
   <span class="grow col" style="gap:2px"><span class="lbl" style="font-weight:600;color:var(--color-fg)">${esc(evTitle(e))}</span><span class="cap muted">${esc(e.b)} · ${esc(e.z)}${cam?' · '+esc(cam.name):''}</span>${e.desc?`<span class="cap">${esc(evDesc(e))}</span>`:''}</span>
   <span class="col" style="gap:4px;align-items:flex-end"><span class="cap mono">${hm(e.t)}</span>${evBadge(e)}</span></button>`;
}

/* ================= Эвакуация и учебная тревога (SKD-EVC, SKD-UI-05) ================= */
function evacCounts(E=S.evac){const kids=E.snap.length, ok=E.snap.filter(x=>['safe','par'].includes(E.marks[x.id])).length, miss=E.snap.filter(x=>E.marks[x.id]==='miss').length;return {kids,ok,left:kids-ok,miss}}
function vEvac(){
  const E=S.evac, c=evacCounts(), p=P(), drill=E.drill;
  const groups=db.groups.map(g=>{const L=E.snap.filter(x=>x.g===g.id);return {g,n:L.length,ok:L.filter(x=>['safe','par'].includes(E.marks[x.id])).length}}).filter(x=>x.n);
  const unacc=E.snap.filter(x=>!['safe','par'].includes(E.marks[x.id])).sort((a,b)=>(E.marks[b.id]==='miss')-(E.marks[a.id]==='miss'));
  return `
  <div class="banner ${drill?'b-warn':'b-danger'}" role="alert">${ic(drill?'stopwatch':'flame','big-ic '+(drill?'i-warning':'i-danger'))}
    <div class="col grow" style="gap:4px"><h1 class="b-t">${t(drill?'Учебная тревога · эвакуация':'Эвакуация')}</h1><div class="lbl">${esc(E.cause)} · ${t('начало')} ${hms(E.t0)} · ${t('прошло')} <span class="mono" data-since="${+E.t0}">${fmtDur(NOW()-E.t0)}</span>${E.doneAt?` · ${t('все учтены за')} <b>${fmtDur(E.doneAt-E.t0)}</b>`:''}</div></div>
    <button class="btn btn-outline" data-act="evac-report">${ic('file')}${t('Итог для РТП')}</button>
    ${!drill&&p.parents?`<button class="btn btn-outline" data-act="mass-notify">${ic('megaphone')}${t('Сообщить родителям')}</button>`:''}
    <button class="btn ${drill?'btn-primary':'btn-red'}" data-act="evac-end">${ic('check')}${t(drill?'Завершить тревогу':'Завершить эвакуацию')}</button>
  </div>
  <div class="grid4">
    <div class="card kpi"><span class="lbl muted">${t('В здании на момент тревоги')}</span><span class="kpi-value">${c.kids+E.staffIn+E.visIn}</span><span class="split"><span>${t(p.kids)}: <b>${c.kids}</b></span><span>${t('Персонал')}: <b>${E.staffIn}</b></span><span>${t('Посетители и подрядчики')}: <b>${E.visIn}</b></span></span></div>
    <div class="card kpi ok"><span class="lbl muted">${t('Учтено на точке сбора')}</span><span class="kpi-value" id="ev-ok">${c.ok}</span><div class="prog ok"><i style="width:${pct(c.ok,c.kids)}%"></i></div></div>
    <div class="card kpi ${c.left?'alarm':'ok'}" style="grid-column:span 2"><span class="lbl muted">${t('Не учтено')}</span><div class="row" style="align-items:flex-end;gap:16px"><span class="count-big ${c.left?'t-danger':'t-success'}" id="ev-left">${c.left}</span><span class="cap muted" style="padding-bottom:6px">${c.miss?`${t('из них отмечены «нет на точке сбора»')}: <b class="t-danger">${c.miss}</b> · `:''}${t('отметки ставят ответственные групп с телефонов')}${S.offline?` · <b>${t('связь с сервером потеряна, отметки копятся в очереди')}</b>`:''}</span></div></div>
  </div>
  <div class="cols">
    <div class="stack">${card(t('Перекличка по группам'),`<div class="grp-grid">${groups.map(x=>`<button class="grp ${x.ok===x.n?'done':'left'}" data-act="evac-grp" data-g="${esc(x.g.id)}"><span class="row"><b>${esc(x.g.id)}</b><span class="sp"></span>${x.ok===x.n?ic('check-circle','i-success'):`<b class="t-danger">${x.n-x.ok}</b>`}</span><span class="cap muted">${esc(x.g.resp)}</span><div class="prog ${x.ok===x.n?'ok':'bad'}"><i style="width:${pct(x.ok,x.n)}%"></i></div><span class="cap">${t('{a} из {b}',{a:x.ok,b:x.n})}${E.gDone[x.g.id]?' · '+fmtDur(E.gDone[x.g.id]-E.t0):''}</span></button>`).join('')}</div>`)}</div>
    <div class="stack">
      ${card(t('Не учтённые · последнее известное место'),unacc.length?unacc.slice(0,10).map(x=>{const k=KBY(x.id);return `<button class="ev" data-act="kid" data-id="${k.id}">${av(k.short)}<span class="grow col" style="gap:2px"><b class="lbl" style="color:var(--color-fg)">${esc(k.short)} · ${esc(k.g)}</b><span class="cap muted">${esc(x.last)}</span></span>${E.marks[x.id]==='miss'?`<span class="badge badge-danger">${t('нет на точке сбора')}</span>`:`<span class="badge badge-warning">${t('нет отметки')}</span>`}</button>`}).join('')+(unacc.length>10?`<div class="card-b cap muted">${t('и ещё {n}',{n:unacc.length-10})}</div>`:''):`<div class="empty">${ic('check-circle','i-success')}<div class="h-sm" style="color:var(--color-fg)">${t('Все учтены')}</div></div>`)}
      ${card(t('Действия режима'),evacActions().map(a=>`<div class="act-row">${ic(a[0]?'check-circle':'info',a[0]?'i-success':'i-info')}<span class="grow">${a[1]}</span><span class="cap mono muted">${a[2]||''}</span></div>`).join(''))}
      ${card(t('Выходы и точка сбора'),`<div class="card-b"><div class="cams">${db.cams.filter(c=>/выход|Двор|площадка|Калитка/i.test(c.name)&&!c.srvi).slice(0,2).map(c=>camTile(c)).join('')}</div></div>`)}
    </div>
  </div>`;
}
function evacActions(){const E=S.evac,tt=hms(E.t0),p=P();return [
  [1,t('Двери СКУД разблокированы, турникеты открыты — пути эвакуации свободны (SKD-MOD-05)'),tt],
  [1,t('СОУЭ: речевое сообщение об эвакуации во всех зонах'),tt],
  [1,t('Список «кто в здании» зафиксирован: {k} {kg}, {s} сотрудников, {v} посетителей (SKD-EVC-01)',{k:E.snap.length,kg:t(p.kidsGen),s:E.staffIn,v:E.visIn}),tt],
  [1,t('Перекличка открыта у ответственных групп на телефонах'),tt],
  E.cancelledLock?[1,t('Режим ЧС отменён автоматически: при пожаре выходы не блокируются'),tt]:null,
  E.drill?[0,t('Учебная тревога: родителям и учредителю уведомления не отправляются (SKD-EVC-05)')]:[1,t('Уведомлены в MAX: директор, зам. по безопасности, дежурный администратор (SKD-NTF-02)'),tt],
  [1,t('Камеры выходов и точки сбора выведены на пост охраны'),tt],
  E.drill?null:[0,t('Передача тревоги в ЕДДС / 112 — по интеграции (раздел 10.2, уточнить)')],
].filter(Boolean)}
function startEvac(drill,cause){
  const p=P(), snap=db.kids.filter(k=>['in','check'].includes(k.day.st)&&!k.day.handed).map(k=>({id:k.id,g:k.g,last:lastPlace(k)}));
  const hold=drill?[]:[snap.find(x=>x.g===p.teacher.grp)?.id,snap[Math.floor(snap.length*.62)]?.id].filter(Boolean);
  S.evac={t0:NOW(),drill,cause,snap,staffIn:db.staff.filter(s=>s.st==='in').length,visIn:db.visitors.filter(v=>!v.outT).length+db.contractors.filter(c=>!c.outT).length,marks:{},queue:[],hold:new Set(hold),gDone:{},doneAt:null,cancelledLock:S.mode==='lock'};
  S.doors='unlocked'; if(!drill) S.alarm.fire=cause;
  addEvent({kind:'alarm',type:drill?'drill':'fire',title:drill?'Учебная тревога: эвакуация':'Пожар: сработка СПС',desc:drill?'Режим «Учебная тревога» · перекличка запущена':'Режим «Эвакуация» включён автоматически · перекличка запущена',sev:'high',b:'Объект',z:cause});
}
function markKid(id,v,o={}){
  const E=S.evac; if(!E) return;
  if(S.offline&&!o.flush&&!o.auto){E.queue.push([id,v]);return 'queued'}
  E.marks[id]=v;
  db.groups.forEach(g=>{if(E.gDone[g.id])return;const L=E.snap.filter(x=>x.g===g.id);if(L.length&&L.every(x=>['safe','par'].includes(E.marks[x.id])))E.gDone[g.id]=NOW()});
  if(!E.doneAt&&evacCounts().left===0){E.doneAt=NOW();toast(t('Все учтены за {d}',{d:fmtDur(E.doneAt-E.t0)}))}
}
function autoMark(){
  const E=S.evac; if(!E||!PP.auto) return;
  const free=E.snap.filter(x=>!E.marks[x.id]&&!E.hold.has(x.id)); const n=Math.min(free.length,8+Math.floor(Math.random()*10));
  for(let i=0;i<n;i++){const x=free.splice(Math.floor(Math.random()*free.length),1)[0];markKid(x.id,Math.random()<.04&&!E.drill&&P().parents?'par':'safe',{auto:1})}
  if(n&&(S.route==='home'||S.route==='rollcall')&&!busy()) rerender();
}

/* ================= ЧС (SKD-MOD-04) ================= */
function vLock(){const L=S.lock,tt=hms(L.t0);
  const acts=[[1,t('Внешние входы закрыты на вход (СКУД)'),tt],[1,t('Выходы остаются свободными — требования пожарной безопасности'),tt],[1,t('Условное речевое сообщение по зонам: «Внимание! Учебный кабинет 13 закрыт на проветривание»'),tt],[1,t('Уведомлены администрация и учредитель'),tt],[1,t('Камеры входов и коридоров выведены на пост охраны'),tt],[1,t('Инструкция персоналу отправлена в MAX: закрыть двери кабинетов, отойти от окон и дверей, не выходить до отмены'),tt],[0,t('Вызов Росгвардии выполняется штатной КТС — решение его не заменяет. Нажмите КТС, если ещё не нажата.')]];
  return `<div class="banner b-danger" role="alert">${ic('lock','big-ic i-danger')}<div class="col grow" style="gap:4px"><h1 class="b-t">${t('ЧС · блокировка входов')}</h1><div class="lbl">${t('Включил {w}',{w:L.by})} · ${tt} · ${t('прошло')} <span class="mono" data-since="${+L.t0}">${fmtDur(NOW()-L.t0)}</span></div></div>
    <button class="btn btn-outline" data-act="lock-end">${ic('unlock')}${t('Отменить ЧС')}</button></div>
  <div class="cols"><div class="stack">${card(t('Входы и коридоры'),`<div class="card-b"><div class="cams">${db.cams.filter(c=>c.entry&&!c.srvi||/Коридор|Холл/.test(c.name)).slice(0,4).map(c=>camTile(c)).join('')}</div></div>`)}</div>
  <div class="stack">${card(t('Действия режима'),acts.map(a=>`<div class="act-row">${ic(a[0]?'check-circle':'alert',a[0]?'i-success':'i-warning')}<span class="grow">${a[1]}</span><span class="cap mono muted">${a[2]||''}</span></div>`).join(''))}
  ${card(t('Сейчас в здании'),`<div class="card-b"><span class="kpi-value">${inBuilding().total}</span><div class="cap muted">${t('Если начнётся пожар — режим ЧС отменится автоматически, двери разблокируются (SKD-MOD-05).')}</div></div>`)}</div></div>`}
