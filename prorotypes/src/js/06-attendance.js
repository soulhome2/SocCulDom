/* ================= Посещаемость (SKD-PRS) ================= */
VIEWS.attendance=function(){
  const p=P(), te=isTeacher(), tab=S.att.tab, r=p.rules;
  const tabs=[['sum',t('Сводка')],['journal',t('Журнал')],['check',t('Требует проверки · {n}',{n:stats(visKids()).check})],['trend',t('Динамика')]];
  return `<div class="page-h"><h1>${te?`${t(p.grpMy)} · ${esc(p.teacher.grp)}`:t('Посещаемость')}</h1>${te?`<span class="badge badge-info">${ic('lock')}${t('Видна только ваша группа (раздел 9)')}</span>`:''}<span class="sp"></span>
    <span class="cap muted">${t('Окно прихода {a}–{b} · опоздание после {c} · пропуск после {d}',{a:r.from.map(pad).join(':'),b:r.to.map(pad).join(':'),c:r.late.map(pad).join(':'),d:r.miss.map(pad).join(':')})}</span></div>
  <div class="tabs" role="tablist">${tabs.map(([v,l])=>`<button class="tab" role="tab" data-act="att-tab" data-v="${v}" aria-selected="${v===tab}">${l}</button>`).join('')}</div>
  ${tab==='sum'?attSum():tab==='journal'?attJournal():tab==='check'?attCheck():attTrend()}`;
};
/* шкала присутствия с процентом (корректировка, п. 4) */
const presence=a=>`<div class="presence"><div class="prog ${a<80?'warn':'ok'}"><i style="width:${a}%"></i></div><b>${a} %</b></div>`;
function attSum(){
  const p=P(), K=visKids(), st=stats(K);
  const rows=db.groups.filter(g=>K.some(k=>k.g===g.id)).map(g=>{const s=stats(K.filter(k=>k.g===g.id));return {g,s,abs:pct(s.absent,s.list),pres:100-pct(s.absent,s.list)}});
  const sorted=sortRows('sum',rows,{g:r=>r.g.id,resp:r=>r.g.resp,list:r=>r.s.list,came:r=>r.s.came,absent:r=>r.s.absent,nor:r=>r.s.noReason,late:r=>r.s.late,early:r=>r.s.early,pres:r=>r.pres});
  return `<div class="grid4">
   <div class="card kpi"><span class="lbl muted">${t('По списку')}</span><span class="kpi-value">${st.list}</span><span class="split"><span>${t('Уникальных за день')}: <b>${st.came}</b></span></span></div>
   <button class="card kpi ok" data-act="att-go" data-st="came"><span class="lbl muted">${t('Пришли')}</span><span class="row" style="align-items:baseline"><span class="kpi-value">${st.came}</span><span class="h-sm muted">${pct(st.came,st.list)} %</span></span><span class="split"><span>${t('Опоздали')}: <b>${st.late}</b></span><span>${t('Ушли раньше')}: <b>${st.early}</b></span></span></button>
   <button class="card kpi attn" data-act="att-go" data-st="absent"><span class="lbl muted">${t('Отсутствуют')}</span><span class="row" style="align-items:baseline"><span class="kpi-value">${st.absent}</span><span class="h-sm muted">${pct(st.absent,st.list)} %</span></span><span class="split"><span>${t('По причине')}: <b>${st.reasonOk}</b></span><span>${t('Без причины')}: <b>${st.noReason}</b></span></span></button>
   <button class="card kpi ${st.check?'attn':''}" data-act="att-tab" data-v="check"><span class="lbl muted">${t('Требует проверки')}</span><span class="kpi-value">${st.check}</span><span class="split"><span>${t('Ошибки СКУД: прошёл за другим, ушёл через пожарный выход')}</span></span></button>
  </div>
  ${card(t('По группам'),dataBlock(()=>`<div class="scroll-x"><table class="table" id="t-sum"><thead><tr>${th('sum','g',t(p.grp))}${th('sum','resp',t(p.resp))}${th('sum','list',t('По списку'),{num:1})}${th('sum','came',t('Пришли'),{num:1})}${th('sum','absent',t('Отсутствуют'),{num:1})}${th('sum','nor',t('Без причины'),{num:1})}${th('sum','late',t('Опоздали'),{num:1})}${th('sum','early',t('Ушли раньше'),{num:1})}${th('sum','pres',t('Присутствие'))}</tr></thead><tbody>
    ${sorted.map(({g,s,abs,pres})=>`<tr data-clickable data-act="att-grp" data-g="${esc(g.id)}"><td><b>${esc(g.id)}</b>${abs>=20?` <span class="badge badge-warning" data-tip="${t('Отсутствуют {p} % — больше порога 20 %. Сигнал медработнику.',{p:abs})}">${ic('alert')}${abs} %</span>`:''}</td><td class="cap">${esc(g.resp)}</td><td class="num">${s.list}</td><td class="num">${s.came}</td><td class="num">${s.absent}</td><td class="num ${s.noReason?'t-danger':''}">${s.noReason}</td><td class="num">${s.late}</td><td class="num">${s.early}</td><td>${presence(pres)}</td></tr>`).join('')}</tbody></table></div>`,{rows:8}),
   {right:`<button class="btn btn-outline" data-act="export" data-f="XLSX" data-what="Табель посещаемости">${ic('download')}XLSX</button><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Табель посещаемости">PDF</button><button class="btn btn-subtle" data-act="export" data-f="CSV" data-what="Табель посещаемости">CSV</button>`})}`;
}
function attRows(){const p=P(),a=S.att,off=DAYS[a.day].off;
  return visKids().map(k=>({k,d:off===0?k.day:genPast(p,k,off)})).filter(({k,d})=>(!a.g||k.g===a.g)&&(!a.q||k.fio.toLowerCase().includes(a.q.toLowerCase()))&&(!a.st||(a.st==='came'?d.st!=='absent':a.st==='absent'?d.st==='absent':a.st==='noreason'?d.st==='absent'&&!d.reason:a.st==='late'?d.late:a.st==='early'?d.early:d.st===a.st)))}
function attJournal(){
  const p=P(), a=S.att, te=isTeacher(), G=db.groups.filter(g=>visKids().some(k=>k.g===g.id));
  return card(t('Журнал посещаемости'),`<div class="toolbar">
    <select class="field" id="att-day" aria-label="${t('Дата')}">${DAYS.slice(0,6).map((d,i)=>`<option value="${i}" ${i===a.day?'selected':''}>${d.off===0?t('Сегодня')+', ':''}${wd(d.d)} ${dmy(d.d)}</option>`).join('')}</select>
    <select class="field" id="att-g" aria-label="${t(p.grp)}" ${te?'disabled':''}><option value="">${t('Все группы')}</option>${G.map(g=>`<option ${g.id===a.g?'selected':''}>${esc(g.id)}</option>`).join('')}</select>
    <div class="search">${ic('search')}<input class="field" id="att-q" placeholder="${t('Фамилия и имя')}" value="${esc(a.q)}" aria-label="${t('Поиск по ФИО')}"></div>
    <select class="field" id="att-st" aria-label="${t('Статус')}"><option value="">${t('Все статусы')}</option>${[['came','Пришли'],['absent','Отсутствуют'],['noreason','Без причины'],['in','В здании'],['left','Ушли'],['late','Опоздали'],['early','Ушли раньше'],['check','Требует проверки']].map(([v,l])=>`<option value="${v}" ${a.st===v?'selected':''}>${t(l)}</option>`).join('')}</select>
    <span class="sp"></span><button class="btn btn-subtle" data-act="att-reset">${ic('x')}${t('Сбросить')}</button></div>
   <div id="att-res">${attResults()}</div>`,{right:`<button class="btn btn-outline" data-act="export" data-f="XLSX" data-what="Журнал посещаемости">${ic('download')}${t('Выгрузить')}</button>`});
}
const ST_ORD={in:0,out_tmp:1,check:2,left:3,absent:4};
function attResults(){
  return dataBlock(()=>{const a=S.att;let rows=attRows();
    rows=sortRows('jr',rows,{fio:r=>r.k.fio,g:r=>r.k.g,st:r=>ST_ORD[r.d.st],in:r=>r.d.inT?+r.d.inT:null,out:r=>r.d.outT?+r.d.outT:null,reason:r=>r.d.reason?t(r.d.reason):null});
    const pg=rows.slice(a.page*50,a.page*50+50), uniq=rows.filter(r=>r.d.st!=='absent').length;
    if(!rows.length) return `<div class="empty">${ic('search')}<div class="h-sm" style="color:var(--color-fg)">${t('Никого не найдено')}</div><button class="btn btn-outline" data-act="att-reset">${t('Сбросить фильтры')}</button></div>`;
    return `<div class="scroll-x"><table class="table" id="t-jr"><thead><tr>${th('jr','fio',t('ФИО'))}${th('jr','g',t(P().grp))}${th('jr','st',t('Статус'))}${th('jr','in',t('Приход'))}${th('jr','out',t('Уход'))}${th('jr','reason',t('Причина отсутствия'))}<th>${t('Отметки')}</th></tr></thead><tbody>
     ${pg.map(({k,d})=>`<tr data-clickable data-act="kid" data-id="${k.id}"><td><span class="row">${av(k.short)}<span>${esc(k.fio)}</span></span></td><td>${esc(k.g)}</td><td>${stBadge(k,d)}</td><td class="mono cap ${d.late?'t-warning':''}">${hm(d.inT)}</td><td class="mono cap">${hm(d.outT)}</td><td class="cap">${d.reason?esc(reasonT(d.reason)):d.st==='absent'?`<span class="muted">${t('не указана')}</span>`:''}</td><td>${flags(d)}</td></tr>`).join('')}</tbody></table></div>
     ${pager(rows.length,a.page,'att-pg')}<div class="card-b cap muted">${t('Уникальных за день по выборке: {n} · строка открывает карточку',{n:uniq})}</div>`},{rows:10});
}
function attCheck(){
  const K=visKids().filter(k=>k.day.st==='check');
  return card(t('Требует проверки · ошибки СКУД (SKD-PRS-06)'),K.length?`<div class="scroll-x"><table class="table"><thead><tr><th>${t('ФИО')}</th><th>${t(P().grp)}</th><th>${t('Что не так')}</th><th>${t('Проход')}</th><th style="text-align:right">${t('Исправить статус')}</th></tr></thead><tbody>${K.map(k=>`<tr><td><button class="link" data-act="kid" data-id="${k.id}">${esc(k.fio)}</button></td><td>${esc(k.g)}</td><td class="cap">${t(CHECK_WHY[k.day.check]||k.day.check)}</td><td class="mono cap">${k.day.passes.map(p=>`${t(p.dir==='in'?'вход':'выход')} ${hm(p.t)}`).join(', ')}</td><td style="text-align:right;white-space:nowrap"><button class="btn btn-outline btn-compact" data-act="fix" data-id="${k.id}" data-v="in">${ic('check')}${t('В здании')}</button> <button class="btn btn-subtle btn-compact" data-act="fix" data-id="${k.id}" data-v="left">${t('Ушёл')}</button> <button class="btn btn-subtle btn-compact" data-act="fix" data-id="${k.id}" data-v="absent">${t('Не приходил')}</button></td></tr>`).join('')}</tbody></table></div><div class="card-b cap muted">${t('Исправление записывается в журнал аудита с автором и временем.')}</div>`
   :`<div class="empty">${ic('check-circle','i-success')}<div class="h-sm" style="color:var(--color-fg)">${t('Всё сходится')}</div><div class="cap">${t('Ошибок СКУД за сегодня нет')}</div></div>`);
}
function attTrend(){
  const p=P(), K=visKids(), D=DAYS.slice().reverse();
  const data=D.map(d=>{const L=K.map(k=>d.off===0?k.day:genPast(p,k,d.off)).filter(x=>x.st==='absent');return {d,sick:L.filter(x=>x.reason==='болезнь').length,fam:L.filter(x=>x.reason==='семейные обстоятельства').length,ev:L.filter(x=>x.reason==='мероприятие вне здания').length,no:L.filter(x=>!x.reason).length}});
  const mx=Math.max(...data.map(x=>x.sick+x.fam+x.ev+x.no),1), W=760,H=240,bw=(W-60)/data.length;
  const bars=data.map((x,i)=>{let y=H-30;const parts=[['s1',x.sick],['s2',x.fam],['s3',x.ev],['s4',x.no]].map(([c,v])=>{const h=v/mx*(H-60);y-=h;return `<rect class="${c}" x="${50+i*bw+6}" y="${y.toFixed(1)}" width="${bw-12}" height="${h.toFixed(1)}"/>`}).join('');
    return `<g data-tip="${wd(x.d.d)} ${dm(x.d.d)}: ${t('болезнь')} ${x.sick}, ${t('семейные обстоятельства')} ${x.fam}, ${t('мероприятие вне здания')} ${x.ev}, ${t('без причины')} ${x.no}">${parts}<rect x="${50+i*bw}" y="20" width="${bw}" height="${H-50}" fill="transparent"/><text class="axis" x="${50+i*bw+bw/2}" y="${H-12}" text-anchor="middle">${x.d.off===0?t('сегодня'):dm(x.d.d)}</text></g>`}).join('');
  const grid=[0,.5,1].map(f=>`<line class="grid" x1="44" x2="${W}" y1="${(H-30-f*(H-60)).toFixed(0)}" y2="${(H-30-f*(H-60)).toFixed(0)}"/><text class="axis" x="38" y="${(H-26-f*(H-60)).toFixed(0)}" text-anchor="end">${Math.round(mx*f)}</text>`).join('');
  return card(t('Отсутствия за 10 учебных дней'),dataBlock(()=>`<div class="card-b"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('Отсутствия по дням и причинам')}">${grid}${bars}</svg>
   <div class="legend"><span><i style="background:var(--color-magenta)"></i>${t('Болезнь')}</span><span><i style="background:var(--color-amber)"></i>${t('Семейные обстоятельства')}</span><span><i style="background:var(--color-teal)"></i>${t('Мероприятие вне здания')}</span><span><i style="background:var(--color-fg-subtle)"></i>${t('Без причины')}</span></div>
   <div class="cap muted" style="margin-top:8px">${t('Группы, где отсутствуют больше 20 %, подсвечиваются в сводке — сигнал медработнику. Праздничные дни в графике пропущены.')}</div></div>`));
}
const MAXT={in:'{who} пришёл в {t}',early:'{who} ушёл раньше расписания в {t}',miss:'{who} не пришёл к {t}. Укажите причину отсутствия.',accept:'{who} принят в группу в {t}',hand:'{who} передан: {rel} · {t}'};
function maxText(k,m){return t(MAXT[m.k],{who:k.short,t:m.k==='miss'?P().rules.miss.map(pad).join(':'):hm(m.t),rel:m.rel?t(m.rel):''})}
function openKid(id){
  const k=KBY(id), d=k.day, p=P(), canEdit=S.role!=='guard'&&(!isTeacher()||k.g===p.teacher.grp);
  if(isTeacher()&&k.g!==p.teacher.grp){toast(t('Нет доступа: карточки других групп не видны'),'alarm');return}
  openSheet(`<div class="sheet-h">${av(k.short,'','lg',k.photo)}<div class="col grow" style="gap:2px"><div class="h-md">${esc(k.fio)}</div><div class="cap muted">${t(p.kid)} · ${esc(k.g)} · ${esc(db.groups.find(g=>g.id===k.g).resp)}</div></div><button class="btn btn-icon" data-act="sheet-close" aria-label="${t('Закрыть')}">${ic('x')}</button></div>
  <div class="sheet-b">
   <div class="row wrap">${stBadge(k)} ${flags(d)}</div>
   <dl class="dl"><dt>${t('Пропуск')}</dt><dd class="mono">${k.card} · ${k.cardSt==='active'?t('активен'):`<span class="t-danger">${t('заблокирован')}</span>`}</dd>
    ${p.parents?k.parents.map(pr=>`<dt>${t('Законный представитель')}</dt><dd><span class="row">${av(pr.fio,'c2','',pr.photo)}<span>${esc(pr.fio)} · ${t(pr.rel||'мама')}<br><span class="cap">${esc(pr.phone)}</span> · <span class="cap ${pr.max?'t-success':'muted'}">${t(pr.max?'MAX подключён':'MAX не подключён')}</span></span></span></dd>`).join(''):''}
    <dt>${t('Расписание')}</dt><dd>${esc(db.groups.find(g=>g.id===k.g).room)} · ${t('до {t}',{t:p.rules.end})}</dd></dl>
   <div><div class="h-sm" style="margin-bottom:8px">${t('Проходы за сегодня')}</div>${d.passes.length?`<div class="tl">${d.passes.map(x=>`<div class="${x.dir==='out'?'out':''} ${d.check?'warn':''}"><b class="mono cap">${hm(x.t)}</b> · ${t(x.dir==='in'?'вход':'выход')} · <span class="cap muted">${esc(x.pt)}</span></div>`).join('')}</div>`:`<div class="cap muted">${t('Проходов нет')}</div>`}${d.check?`<div class="cap t-warning">${t(CHECK_WHY[d.check])}</div>`:''}</div>
   ${d.st==='absent'?`<div class="card card-b col" style="gap:8px"><div class="h-sm">${t('Причина отсутствия (SKD-PRS-05)')}</div>${canEdit?`<select class="field" id="k-reason"><option value="">${t('Не указана')}</option>${Object.keys(RS).map(r=>`<option value="${r}" ${d.reason===r?'selected':''}>${t(r)}</option>`).join('')}</select><button class="btn btn-primary" data-act="reason-save" data-id="${k.id}">${t('Сохранить причину')}</button>`:`<div>${esc(reasonT(d.reason)||t('не указана'))}</div>`}${d.reasonBy?`<div class="cap muted">${t('Указал')}: ${esc(d.reasonBy==='parent'?t('родитель'):d.reasonBy==='resp'?t('ответственный группы'):d.reasonBy)}</div>`:''}</div>`:''}
   ${d.st!=='absent'&&!p.handover&&canEdit?`<label class="choice"><input type="checkbox" class="switch" role="switch" id="k-rel" data-id="${k.id}" ${d.released?'checked':''}> ${t('Отпущен с занятий — уход не считается самовольным (EDU-05)')}</label>`:''}
   ${p.parents?`<div><div class="h-sm" style="margin-bottom:8px">${t('Уведомления родителю в MAX (SKD-NTF-03)')}</div>${d.max.length?d.max.map(m=>`<div class="msg" style="margin-bottom:6px"><div class="row"><span class="cap mono">${hm(m.t)}</span><span class="sp"></span><span class="cap muted">${t(m.k==='miss'?'прочитано':'доставлено')}</span></div><div>${esc(maxText(k,m))}</div>${m.k==='miss'?`<div class="cap" style="margin-top:4px">${t('Кнопки: «болеет» · «по семейным обстоятельствам» · «не знаю»')}</div>`:''}</div>${m.reply?`<div class="msg in" style="margin:0 0 8px 40px"><div class="cap muted">${t('Ответ родителя')}</div><b>${esc(t(m.reply))}</b></div>`:''}`).join(''):`<div class="cap muted">${t('Сообщений нет')}</div>`}<div class="cap muted">${t('Родитель не получает видео и данные о других детях.')}</div></div>`:''}
  </div>`);
}
function inBuildingSheet(){
  const ib=inBuilding(), p=P(), K=db.kids.filter(k=>k.day.st==='in'&&!k.day.handed);
  openSheet(`<div class="sheet-h">${ic('organization','ic-24')}<div class="col grow" style="gap:2px"><div class="h-md">${t('Сейчас в здании')} · ${ib.total}</div><div class="cap muted">${t('Обновлено {t} (SKD-PRS-01)',{t:hms(NOW())})}</div></div><button class="btn btn-icon" data-act="sheet-close" aria-label="${t('Закрыть')}">${ic('x')}</button></div>
  <div class="sheet-b">
   <div class="grid2" style="gap:8px">${[[t(p.kids),ib.kids],[t('Персонал'),ib.staff],[t('Посетители'),ib.vis],[t('Подрядчики'),ib.con]].map(([n,v])=>`<div class="card kpi" style="padding:10px"><span class="lbl muted">${n}</span><span class="h-md">${v}</span></div>`).join('')}</div>
   <div class="h-sm">${t('Посетители и подрядчики')}</div>${[...db.visitors.filter(v=>!v.outT).map(v=>[v.fio,`${v.to} · ${t('вход')} ${hm(v.inT)}`]),...db.contractors.filter(c=>!c.outT).map(c=>[c.fio,`${c.org} · ${c.why} · ${t('вход')} ${hm(c.inT)}`])].map(([f,s])=>`<div class="row">${av(f)}<div class="col" style="gap:0"><b class="lbl">${esc(f)}</b><span class="cap muted">${esc(s)}</span></div></div>`).join('')}
   <div class="h-sm">${t('Персонал в здании')} · ${ib.staff}</div><div class="cap">${db.staff.filter(s=>s.st==='in').slice(0,14).map(s=>`${esc(s.short)} <span class="muted">(${esc(t(s.cat).toLowerCase())})</span>`).join(', ')}${ib.staff>14?` ${t('и ещё {n}',{n:ib.staff-14})}`:''}</div>
   <div class="h-sm">${t(p.kids)} · ${ib.kids}</div>
   <table class="table"><thead><tr><th>${t(p.grp)}</th><th class="num">${t('В здании')}</th><th class="num">${t('По списку')}</th></tr></thead><tbody>${db.groups.map(g=>`<tr data-clickable data-act="att-grp" data-g="${esc(g.id)}"><td>${esc(g.id)}</td><td class="num">${K.filter(k=>k.g===g.id).length}</td><td class="num">${db.kids.filter(k=>k.g===g.id).length}</td></tr>`).join('')}</tbody></table>
  </div>`);
}

/* ================= Перекличка — телефон ответственного (SKD-EVC-02) =================
 * Строка ребёнка: имя и статус в столбик, кнопки справа — длинный статус больше не наезжает на имя (корректировка, п. 7). */
VIEWS.rollcall=function(){
  const p=P(), te=isTeacher(), g=te?p.teacher.grp:(S.rc.g||p.teacher.grp), E=S.evac, resp=db.groups.find(x=>x.id===g).resp;
  const sel=te?'':`<div class="row wrap" style="justify-content:center"><label class="label" for="rc-g" style="margin:0">${t('Показать как видит')}</label><select class="field" id="rc-g" style="width:auto">${db.groups.map(x=>`<option ${x.id===g?'selected':''}>${esc(x.id)}</option>`).join('')}</select><span class="cap muted">${esc(resp)}</span></div>`;
  let body;
  if(!E){const K=db.kids.filter(k=>k.g===g);
    body=`<div class="msg">${ic('info','i-info')} ${t('Перекличка не активна. При эвакуации или учебной тревоге список группы — те, кто был в здании, — появится здесь автоматически.')}</div>
     <div class="row"><b>${esc(g)}</b><span class="sp"></span><span class="cap">${t('в здании {a} из {b}',{a:K.filter(k=>k.day.st==='in').length,b:K.length})}</span></div>
     ${K.map(k=>`<div class="kid">${av(k.short)}<span class="kid-t"><span class="lbl">${esc(k.short)}</span>${stBadge(k)}</span><span></span></div>`).join('')}`}
  else{const L=E.snap.filter(x=>x.g===g), ok=L.filter(x=>['safe','par'].includes(E.marks[x.id])).length, q=E.queue.length;
    body=`<div class="banner ${E.drill?'b-warn':'b-danger'}" style="padding:10px 12px">${ic(E.drill?'stopwatch':'flame','ic-24 '+(E.drill?'i-warning':'i-danger'))}<div class="col grow" style="gap:0"><b>${t(E.drill?'Учебная тревога':'Эвакуация')}</b><span class="cap">${t('с {t}',{t:hm(E.t0)})} · <span class="mono" data-since="${+E.t0}">${fmtDur(NOW()-E.t0)}</span></span></div></div>
     <div class="row"><b class="h-sm">${esc(g)}</b><span class="sp"></span><span class="h-sm ${ok===L.length?'t-success':'t-danger'}" id="rc-count">${ok} / ${L.length}</span></div>
     <div class="prog ${ok===L.length?'ok':'bad'}" style="flex:none"><i style="width:${pct(ok,L.length)}%"></i></div>
     ${q?`<div class="msg">${ic('cloud-offline')} ${t('Нет связи — в очереди {n} {w}, отправятся автоматически',{n:q,w:pl(q,['отметка','отметки','отметок'],['mark','marks'])})}</div>`:''}
     ${L.map(x=>{const k=KBY(x.id),m=E.marks[x.id]||(E.queue.find(y=>y[0]===x.id)||[])[1];return `<div class="kid ${m==='safe'?'safe':m==='miss'?'miss':m==='par'?'par':''}">${av(k.short)}<span class="kid-t"><span class="lbl">${esc(k.short)}</span><span class="cap muted">${t(m==='safe'?'на точке сбора':m==='miss'?'нет на точке сбора':m==='par'?'передан родителям':'нет отметки')}</span></span>
       <span class="kb"><button class="btn btn-icon ${m==='safe'?'btn-green':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="safe" aria-label="${esc(k.short)} — ${t('на месте')}">${ic('check')}</button><button class="btn btn-icon ${m==='miss'?'btn-red':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="miss" aria-label="${esc(k.short)} — ${t('нет')}">${ic('x')}</button>${p.parents?`<button class="btn btn-icon ${m==='par'?'btn-primary':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="par" aria-label="${esc(k.short)} — ${t('передан родителям')}">${ic('people')}</button>`:''}</span></div>`}).join('')}
     ${L.length?'':`<div class="cap muted">${t('Никого из группы не было в здании на момент тревоги.')}</div>`}`}
  return `${sel}<div class="phone" aria-label="${t('Экран телефона ответственного группы')}"><div class="phone-top">${ic('device-mobile')}<span>${t('Безопасное образование')} · ${esc(te?p.teacher.short:resp)}</span><span class="sp"></span><span class="mono">${hm(NOW())}</span></div><div class="phone-b">${body}</div></div>
   <div class="cap muted" style="text-align:center">${t('PWA для телефона: работает при слабой связи, отметки ставятся в очередь и досылаются (SKD-UI-01, SKD-EVC-02).')}</div>`;
};

/* ================= Приём и выдача детей (профиль «Детский сад», DOU-01/02) ================= */
VIEWS.handover=function(){
  const p=P();
  if(!p.handover) return `<div class="card noaccess"><div class="empty">${ic('people')}<div class="h-sm" style="color:var(--color-fg)">${t('Раздел профиля «Детский сад»')}</div><button class="btn btn-primary" data-act="profile" data-v="kinder">${t('Переключить на «Детский сад»')}</button></div></div>`;
  const te=isTeacher(), g=te?p.teacher.grp:(S.ho.g||p.teacher.grp), K=db.kids.filter(k=>k.g===g), s=stats(K);
  return `<div class="page-h"><h1>${t('Приём и выдача')} · ${esc(g)}</h1>${te?'':`<select class="field" id="ho-g" style="width:auto" aria-label="${t('Группа')}">${db.groups.map(x=>`<option ${x.id===g?'selected':''}>${esc(x.id)}</option>`).join('')}</select>`}<span class="sp"></span><span class="cap muted">${t('В группе {a} · выданы {b} · не пришли {c}',{a:K.filter(k=>k.day.st==='in'&&!k.day.handed).length,b:s.handed,c:s.absent})}</span></div>
  ${card(t('Дети группы'),dataBlock(()=>`<div class="scroll-x"><table class="table"><thead><tr><th>${t('Ребёнок')}</th><th>${t('Статус')}</th><th>${t('Привёл')}</th><th>${t('Забрал')}</th><th style="text-align:right">${t('Действие')}</th></tr></thead><tbody>${K.map(k=>{const d=k.day;return `<tr><td><button class="link" data-act="kid" data-id="${k.id}">${esc(k.fio)}</button></td><td>${stBadge(k)}</td><td class="cap">${d.brought?`${esc(t(d.brought.by))} · ${hm(d.brought.t)}`:'—'}</td><td class="cap">${d.handed?`${esc(t(d.handed.rel))} · ${esc(d.handed.fio)} · ${hm(d.handed.t)}${d.handed.phone?' · '+t('подтверждено по телефону'):''}`:'—'}</td>
    <td style="text-align:right">${d.st==='absent'?`<button class="btn btn-outline btn-compact" data-act="ho-accept" data-id="${k.id}">${ic('sign-in')}${t('Принять')}</button>`:d.handed?'':`<button class="btn btn-primary btn-compact" data-act="ho-give" data-id="${k.id}">${ic('sign-out')}${t('Выдать')}</button>`}</td></tr>`}).join('')}</tbody></table></div>`,{rows:8}))}
  <div class="cap muted">${t('Выдача только лицам из списка доверенных. Человек не из списка — выдача блокируется до подтверждения законным представителем по телефону. Биометрия не используется.')}</div>`;
};
function dlgGive(id,pick=-1,stranger=false){
  const k=KBY(id);
  dlg(`<div class="dlg-h"><h2 class="dialog-title">${t('Выдать ребёнка')} · ${esc(k.short)}</h2></div><div class="dlg-b">
   <div class="cap muted">${t('Выберите, кто забирает. Сверьте человека с фото из карточки.')}</div>
   <div class="trust">${k.trusted.map((tp,i)=>`<button class="tp" data-act="tp-pick" data-id="${k.id}" data-i="${i}" aria-pressed="${i===pick}" ${tp.exp?'disabled':''}>${av(tp.fio,tp.c,'xl',tp.photo)}<b class="lbl">${esc(tp.fio.split(' ').slice(0,2).join(' '))}</b><span class="cap muted">${esc(t(tp.rel))} · ${tp.exp?`<span class="t-danger">${t('срок истёк {d}',{d:tp.until})}</span>`:t('до {d}',{d:tp.until==='бессрочно'?t('бессрочно'):tp.until})}</span></button>`).join('')}
     <button class="tp" data-act="tp-stranger" data-id="${k.id}" aria-pressed="${stranger}">${av('? ?','c3','xl')}<b class="lbl">${t('Человек не из списка')}</b><span class="cap muted">${t('выдача блокируется')}</span></button></div>
   ${stranger?`${msgbar('error',t('Выдача заблокирована — человека нет в списке доверенных лиц'),t('Позвоните законному представителю: {f} · {p}',{f:k.parent.fio,p:k.parent.phone}))}
     <div><label class="label" data-required for="st-fio">${t('ФИО забирающего')}</label><input class="field" id="st-fio" placeholder="${t('Как в документе')}"></div>
     <label class="choice"><input type="checkbox" class="check" id="st-ok"> ${t('Законный представитель подтвердил по телефону')}</label><span class="helper" id="st-err"></span>`:''}
  </div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="give-ok" data-id="${k.id}" data-i="${pick}" data-s="${stranger?1:0}" ${pick<0&&!stranger?'disabled':''}>${t(stranger?'Выдать с подтверждением':'Выдать')}</button></div>`);
}
function dlgAccept(id){const k=KBY(id);dlg(`<div class="dlg-h">${ic('sign-in','ic-24')}<h2 class="dialog-title">${t('Принять')} · ${esc(k.short)}</h2></div><div class="dlg-b"><div><label class="label" for="ac-b">${t('Кто привёл')}</label><select class="field" id="ac-b">${k.trusted.filter(x=>!x.exp).map(x=>`<option value="${esc(x.rel)}">${esc(t(x.rel))} · ${esc(x.fio)}</option>`).join('')}</select></div><div class="cap muted">${t('Время приёма — {t}. Родителю уйдёт уведомление в MAX.',{t:hm(NOW())})}</div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="accept-ok" data-id="${id}">${t('Принять в группу')}</button></div>`)}
