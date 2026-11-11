/* ================= События (SKD-EVT) — рабочее место по образцу Incident Manager =================
 * Группы (здание → зона) · очередь или карточка · видео и план. Плашка: полоса приоритета, бейдж, отсчёт реакции,
 * кнопки справа. Карточка: лента шагов сценария → шаг → «Итог», нижний ряд кнопок, журнал. Формы — одно окно. */
const PRI={high:'red',mid:'amber',low:'blue'};
function evBadge(e){
  if(e.status==='done') return `<span class="badge badge-neutral">${t('Закрыто · {r}',{r:t(RESULTS[e.result]||e.result||'обработано')})}</span>`;
  if(e.status==='work') return e.owner===user().short?`<span class="badge badge-info">${t('В работе')}</span>`:`<span class="badge badge-purple">${t('В работе · {w}',{w:e.owner})}</span>`;
  if(e.esc) return `<span class="badge badge-danger">${t('Эскалировано')}</span>`;
  return `<span class="badge badge-warning">${t('Новое')}</span>`;
}
function slaHtml(e){
  if(e.status==='done') return '';
  if(e.status==='work') return `<span class="sla">${ic('clock')}${t('В работе')} <span class="mono" data-t0="${+(e.takenAt||e.t)}">${fmtDur(NOW()-(e.takenAt||e.t))}</span></span>`;
  const d=NOW()-e.t, late=d>ESC_AFTER&&e.sev!=='low';
  return `<span class="sla ${late?'late':''}" ${e.sev!=='low'?`data-late="${+e.t}"`:''}>${ic('stopwatch')}${t('Реакция')} <span class="mono" data-t0="${+e.t}">${fmtDur(d)}</span></span>`;
}
function evTree(){const T={};db.events.forEach(e=>{(T[e.b]=T[e.b]||{})[e.z]=(T[e.b][e.z]||0)+(e.status!=='done'?1:0)});return T}
function evList(){
  const f=S.evw, me=user().short; let L=db.events.slice();
  if(f.chips.pass) L=L.concat(db.passes.slice(0,30).map((p,i)=>{const k=KBY(p.who)||db.staff.find(s=>s.id===p.who);return {id:'P'+i,t:p.t,kind:'pass',type:'pass',title:p.dir==='in'?'Вход: {w}':'Выход: {w}',tv:{w:k?.short||''},b:k?.b||'Объект',z:'Вход / КПП',desc:'{g}',dv:{g:k?.g||t(k?.cat||'')},status:'done',result:'проход',sev:'low',log:[],person:k?.g?k.id:null}}));
  return L.filter(e=>f.chips[e.kind]&&(!f.node||(f.node.includes('|')?e.b+'|'+e.z===f.node:e.b===f.node))
    &&(f.st==='all'||(f.st==='open'&&e.status!=='done')||(f.st==='mine'&&e.status==='work'&&e.owner===me)||(f.st==='done'&&e.status==='done'))
    &&(!f.q||(evTitle(e)+e.b+e.z+evDesc(e)).toLowerCase().includes(f.q.toLowerCase())))
   .sort((a,b)=>(a.status==='done')-(b.status==='done')||({high:0,mid:1,low:2}[a.sev]-{high:0,mid:1,low:2}[b.sev])||b.t-a.t);
}
VIEWS.events=function(){
  const f=S.evw, T=evTree(), open=db.events.filter(e=>e.status!=='done').length;
  const tree=`<div class="tree" role="tree"><button class="tree-i" role="treeitem" data-act="evnode" data-n="" aria-selected="${f.node===''}">${ic('apps')}<span class="grow">${t('Все события')}</span><span class="menu-count">${open}</span></button>
    ${Object.keys(T).map(b=>{const n=Object.values(T[b]).reduce((a,x)=>a+x,0);return `<button class="tree-i ${n?'':'dim'}" role="treeitem" data-act="evnode" data-n="${esc(b)}" aria-selected="${f.node===b}">${ic('organization')}<span class="grow">${esc(b==='Объект'?t('Объект целиком'):b)}</span>${n?`<span class="${db.events.some(e=>e.b===b&&e.status!=='done'&&e.sev==='high')?'cnt-crit':'menu-count'}">${n}</span>`:''}</button>`+Object.keys(T[b]).filter(z=>z!=='—').map(z=>`<button class="tree-i lvl1 ${T[b][z]?'':'dim'}" role="treeitem" data-act="evnode" data-n="${esc(b+'|'+z)}" aria-selected="${f.node===b+'|'+z}">${ic('location')}<span class="grow">${esc(z)}</span>${T[b][z]?`<span class="menu-count">${T[b][z]}</span>`:''}</button>`).join('')}).join('')}</div>`;
  const center=f.card?evCard(db.events.find(e=>e.id===f.card)):evQueue();
  return `<div class="ws">
    <section class="card ws-tree"><div class="panel-h"><h2>${t('Группы')}</h2></div>${tree}</section>
    ${center}
    <section class="card ws-media" id="ev-media">${evMedia()}</section>
  </div>`;
};
function evQueue(){
  const f=S.evw, L=evList(), sh=L.slice(0,f.limit);
  return `<section class="card ws-queue"><div class="panel-h"><h2>${t('Очередь событий')} <span class="menu-count">${L.length}</span></h2><span class="sp"></span>${seg('evst',[['open',t('Открытые')],['mine',t('Мои')],['done',t('Закрытые')],['all',t('Все')]],f.st,'evst')}</div>
    <div class="filterrow"><div class="search">${ic('search')}<input class="field" id="ev-q" placeholder="${t('Зона, камера, описание')}" value="${esc(f.q)}" aria-label="${t('Поиск по событиям')}"></div>
     ${Object.keys(KNAME).map(k=>`<button class="chip" data-act="ev-chip" data-k="${k}" aria-pressed="${!!f.chips[k]}">${t(KNAME[k])}</button>`).join('')}</div>
    <div id="ev-res">${dataBlock(()=>L.length?sh.map(evPlate).join('')+(L.length>sh.length?`<div class="pager"><span class="cap muted">${t('Показаны {a} из {b}',{a:sh.length,b:L.length})}</span><span class="sp"></span><button class="btn btn-outline" data-act="ev-more">${t('Показать ещё')}</button></div>`:''):`<div class="empty">${ic('bell')}<div class="h-sm" style="color:var(--color-fg)">${t('Событий по фильтру нет')}</div><button class="btn btn-outline" data-act="ev-reset">${t('Сбросить фильтры')}</button></div>`,{emptyText:'Событий нет',emptyIcon:'bell'})}</div>
    <div class="card-f cap muted">${t('Неподтверждённая тревога через 60 с уходит следующему ответственному (SKD-EVT-03). Строка выбирает событие — видео и план справа; карточку открывают кнопки.')}</div></section>`;
}
function evPlate(e){
  const cam=e.cam&&db.cams.find(c=>c.id===e.cam), me=user().short, mine=e.status==='work'&&e.owner===me, pass=e.kind==='pass';
  const acts=pass?'':e.status==='new'?`<button class="btn btn-primary btn-compact" data-act="ev-take" data-id="${e.id}">${t('Взять')}</button><button class="btn btn-outline btn-compact" data-act="ev-view" data-id="${e.id}">${t('Посмотреть')}</button>`
    :mine?`<button class="btn btn-primary btn-compact" data-act="ev-view" data-id="${e.id}">${t('Продолжить')}</button>`
    :`<button class="btn btn-outline btn-compact" data-act="ev-view" data-id="${e.id}">${t('Посмотреть')}</button>`;
  return `<div class="evq ${e.status==='done'?'done':''} ${e.fresh?'fresh':''}" data-act="ev-sel" data-id="${e.id}" aria-selected="${S.evw.sel===e.id}" role="option">
    <span class="pri" data-c="${PRI[e.sev]||'grey'}" aria-label="${t('Приоритет')}: ${t({high:'высокий',mid:'средний',low:'обычный'}[e.sev]||'обычный')}"></span>
    <span class="ev-i k-${e.kind}">${ic(TIC[e.type]||KIC[e.kind])}</span>
    <span class="col" style="gap:3px;min-width:0"><span class="row wrap" style="gap:6px"><b>${esc(evTitle(e))}</b>${evBadge(e)}</span>
      <span class="cap muted">${hms(e.t)} · ${esc(e.b)} · ${esc(e.z)}${cam?' · '+esc(cam.name):''}</span>${e.desc?`<span class="cap">${esc(evDesc(e))}</span>`:''}
      <span class="row wrap" style="gap:10px">${slaHtml(e)}${e.esc&&e.status==='new'?`<span class="cap t-danger">${t('Не обработано 60 с → передано: {w}',{w:e.esc})}</span>`:''}</span></span>
    <span class="acts">${acts}</span></div>`;
}
/* план этажа с отметкой источника (заглушка картоподсистемы, как в IM) */
function floorPlan(e){
  const rooms=[['Вход / КПП',10,120,90,70],['Коридоры',105,120,190,70],['Столовая',310,120,80,70],['Залы',10,10,130,100],['Гардероб',150,10,80,100],['Выходы',240,10,60,100],['Двор',310,10,80,100],['Периметр',310,10,80,100],['Площадки',310,10,80,100],['Пищеблок',150,10,80,100],['Объект',105,120,190,70]];
  const hit=e?rooms.find(r=>r[0]===e.z)||rooms[1]:null;
  return `<div class="plan"><svg viewBox="0 0 400 200" role="img" aria-label="${t('План: {b}',{b:e?e.b:''})}">${rooms.filter((r,i,a)=>a.findIndex(x=>x[1]===r[1]&&x[2]===r[2])===i).map(r=>`<rect class="room ${hit&&hit[1]===r[1]&&hit[2]===r[2]?'hit':''}" x="${r[1]}" y="${r[2]}" width="${r[3]}" height="${r[4]}" rx="3"/><text x="${r[1]+6}" y="${r[2]+14}">${esc(r[0])}</text>`).join('')}
   ${hit?`<circle class="pin-ring" cx="${hit[1]+hit[3]/2}" cy="${hit[2]+hit[4]/2+6}" r="13"/><circle class="pin" cx="${hit[1]+hit[3]/2}" cy="${hit[2]+hit[4]/2+6}" r="6"/>`:''}</svg></div>`;
}
function evMedia(){
  const e=db.events.find(x=>x.id===S.evw.sel)||db.events.find(x=>x.id===S.evw.card);
  if(!e) return `<div class="panel-h"><h2>${t('Видео и план')}</h2></div><div class="empty">${ic('device-camera-video')}<div>${t('Событие не выбрано')}</div><div class="cap">${t('Нажмите на строку очереди — здесь появятся архив камеры и место на плане.')}</div></div>`;
  const cam=e.cam&&db.cams.find(c=>c.id===e.cam);
  return `<div class="panel-h"><h2>${t('Видео и план')}</h2><span class="sp"></span>${cam?`<button class="btn btn-subtle btn-compact" data-act="cam-open" data-id="${cam.id}">${ic('device-camera-video')}${t('Live')}</button>`:''}</div>
   <div class="card-b col" style="gap:12px">
    ${cam?`<div class="player">${scene(cam,{crowd:e.type==='crowd'||e.type==='capacity',few:e.type==='fight'})}${['fight','tailgate','object'].includes(e.type)?`<div class="bbox" style="left:38%;top:44%;width:24%;height:42%"><span>${esc(evTitle(e))}</span></div>`:''}<span class="overlay o-tl">${t('Архив')} · ${esc(cam.name)}</span><span class="overlay o-bar">${ic('play')}<span class="mono">${hms(e.t)}</span><span class="track"><b style="left:20%;width:5%"></b><i style="left:25%"></i></span><span>${t('−10 / +30 с')}</span></span></div>`
      :`<div class="msg cap">${t('У события нет камеры — показан только план.')}</div>`}
    <div class="lbl muted">${esc(e.b)} · ${esc(e.z)}</div>${floorPlan(e)}
   </div>`;
}
/* сценарии реагирования — переиспользуются из Incident Manager (SKD-EVT-04); шаги: msg — сообщение, confirm — отметка, radio — выбор */
const SCEN={
  fight:[{q:'Камера выведена на пост охраны',type:'msg'},{q:'Направьте дежурного администратора к месту',type:'confirm'},{q:'Что обнаружено на месте?',type:'radio',opts:['Драка подтверждена — разняли','Игра, не драка','На месте никого нет']},{q:'Сообщите социальному педагогу',type:'confirm'}],
  tailgate:[{q:'Сверьте кадр с проходами СКУД за минуту',type:'confirm'},{q:'Кто прошёл без пропуска?',type:'radio',opts:['Ученик без карты — выдан временный пропуск','Посторонний — зарегистрирован как посетитель','Посторонний — выведен, вызвана полиция']}],
  panic:[{q:'Свяжитесь с помещением по интеркому',type:'confirm'},{q:'Направьте дежурного',type:'confirm'},{q:'При угрозе — нажмите КТС',type:'msg'}],
  fire:[{q:'Проверьте место сработки по камере',type:'confirm'},{q:'Эвакуация уже идёт — следите за перекличкой',type:'msg'},{q:'Встретьте пожарную охрану',type:'confirm'}],
  early:[{q:'Свяжитесь с родителем',type:'confirm'},{q:'Отпущен ли ребёнок?',type:'radio',opts:['Отпущен — отметка поставлена','Не отпущен — родитель предупреждён','Не удалось связаться']}],
  dontknow:[{q:'Позвоните родителю',type:'confirm'},{q:'Проверьте камеры входов за утро',type:'confirm'},{q:'Результат',type:'radio',opts:['Ребёнок найден','Передано администрации и полиции']}],
  stop:[{q:'Не впускайте, вызовите администрацию',type:'confirm'},{q:'При угрозе — нажмите КТС',type:'msg'}],
  _:[{q:'Проверьте событие по камере',type:'confirm'},{q:'Примите меры по регламенту',type:'confirm'}],
};
const scenOf=e=>SCEN[e.type]||SCEN._;
function evCard(e){
  if(!e){S.evw.card=null;return evQueue()}
  const steps=scenOf(e), me=user().short, work=e.status==='work'&&e.owner===me, cur=Math.min(e.step,steps.length), last=cur>=steps.length;
  const crumbs=steps.map((s,i)=>`<button class="crumb ${i<cur?'done':''} ${i===cur?'current':''}" data-act="ev-step" data-id="${e.id}" data-i="${i}" ${i>cur||!work?'disabled':''}><i>${i<cur?ic('check'):i+1}</i>${t('Шаг {n}',{n:i+1})}</button>`).join('')+`<button class="crumb ${last?'current':''}" disabled><i>${ic('goal')}</i>${t('Итог')}</button>`;
  let body;
  if(e.status==='done') body=`<div class="step">${msgbar('success',t('Событие закрыто · {r}',{r:t(RESULTS[e.result]||e.result)}),`${esc(byName(e.by)||'')}${e.comment?' · '+esc(t(e.comment)):''}`)}</div>`;
  else if(!last){const s=steps[cur];body=`<div class="step"><div class="ov">${t('Шаг {a} из {b}',{a:cur+1,b:steps.length})}</div><div class="step-ask">${t(s.q)}</div>
    ${s.type==='confirm'?`<label class="opt"><input type="checkbox" class="check" id="st-ok" ${e.ans[cur]?'checked':''} ${work?'':'disabled'}> ${t('Выполнено')}</label>`:s.type==='radio'?`<div class="opts">${s.opts.map((o,i)=>`<label class="opt"><input type="radio" name="st-r" value="${i}" ${e.ans[cur]===String(i)?'checked':''} ${work?'':'disabled'}> ${t(o)}</label>`).join('')}</div>`:`<div class="msg">${t('Шаг-сообщение — нажмите «Далее».')}</div>`}
    <span class="helper" id="st-err"></span></div>`}
  else body=`<div class="step"><div class="step-ask">${t('Сценарий пройден до конца. Укажите итог и завершите событие.')}</div>
    <div><label class="label" data-required>${t('Результат')}</label>${seg('ev-res-seg',[['confirmed',t('Подтверждено')],['false',t('Ложное')],['drill',t('Учебное')]],e._res||'','ev-res')}<span class="helper" id="ev-err"></span></div>
    <div><label class="label" for="ev-c">${t('Комментарий')}</label><textarea class="field" id="ev-c" rows="2" placeholder="${t('Что сделано')}" ${work?'':'disabled'}></textarea></div>
    <div><button class="btn btn-primary" data-act="ev-done" data-id="${e.id}" ${work?'':'aria-disabled="true"'}>${ic('check')}${t('Завершить событие')}</button></div></div>`;
  const note=!work&&e.status!=='done'?msgbar('info','',e.status==='new'?t('Карточка открыта на просмотр. Чтобы обработать событие, нажмите «Взять».'):t('Событие в работе у {w} — только просмотр.',{w:e.owner})):'';
  return `<section class="card ws-card"><div class="panel-h" style="flex-wrap:wrap"><span class="ev-i k-${e.kind}">${ic(TIC[e.type]||KIC[e.kind])}</span><h2>${esc(evTitle(e))}</h2>${evBadge(e)}${slaHtml(e)}<span class="sp"></span><span class="cap muted">${hms(e.t)} · ${esc(e.b)} · ${esc(e.z)}</span></div>
    ${note?`<div class="card-b">${note}</div>`:''}
    ${e.desc?`<div class="card-b cap" style="padding-bottom:0">${esc(evDesc(e))}${e.person?` · <button class="link" data-act="kid" data-id="${e.person}">${t('Карточка ученика')}</button>`:''}</div>`:''}
    <div class="crumbs">${crumbs}</div>${body}
    <div class="card-f"><button class="btn btn-subtle" data-act="ev-back">${ic('arrow-left')}${t('К очереди')}</button>
      ${e.status==='new'?`<button class="btn btn-primary" data-act="ev-take" data-id="${e.id}">${t('Взять')}</button>`:''}
      ${e.status!=='done'?`<button class="btn btn-orange" data-act="ev-pass" data-id="${e.id}">${t('Передать')}</button><button class="btn btn-outline" data-act="ev-close" data-id="${e.id}">${t('Закрыть без обработки')}</button>`:''}
      <span class="sp"></span>${work&&!last?`<button class="btn btn-outline" data-act="ev-prev" data-id="${e.id}" ${cur===0?'disabled':''}>${t('Назад')}</button><button class="btn btn-primary" data-act="ev-next" data-id="${e.id}">${t('Далее')}</button>`:''}</div>
    <details class="journal"><summary>${ic('history')}${t('Журнал')} · ${t('записей: {n}',{n:e.log.length})} · <span class="muted">${esc(logText(e.log[e.log.length-1]))}</span></summary><ol>${e.log.slice().reverse().map(l=>`<li><span class="mono">${hms(l.t)}</span> · ${esc(logText(l))}</li>`).join('')}</ol></details></section>`;
}
function logText(l){if(!l)return '';const M={created:'Событие создано',taken:'Взято в работу: {w}',step:'Шаг {n} выполнен: {w}',passed:'Передано: {to} · {w}',closed:'Закрыто: {r} · {w}',esc:'Эскалация: не обработано 60 с → {w}'};return t(M[l.k]||l.k,{w:l.w||'',n:l.n||'',to:l.to||'',r:l.r?t(RESULTS[l.r]||l.r):''})}
function addEvent(o){const e={id:'E'+(1000+db.events.length),t:NOW(),status:'new',fresh:true,b:'Объект',z:'—',log:[{t:NOW(),k:'created'}],step:0,ans:{},...o};db.events.unshift(e);return e}
function evTake(e){e.status='work';e.owner=user().short;e.takenAt=NOW();e.log.push({t:NOW(),k:'taken',w:user().short});aud('Событие взято в работу',evTitle(e))}
function dlgEvPass(e){
  dlg(`<div class="dlg-h">${ic('people','ic-24')}<h2 class="dialog-title">${t('Передать событие')}</h2></div><div class="dlg-b"><div class="cap muted">${esc(evTitle(e))}</div>
   <div><label class="label" data-required for="ep-to">${t('Кому передать')}</label><select class="field" id="ep-to"><option value="">${t('Выберите')}</option>${[ROLES.director,ROLES.security,ROLES.guard].filter(r=>r.short!==user().short).map(r=>`<option value="${esc(r.short)}">${esc(r.short)} · ${t(r.role)}</option>`).join('')}<option value="${esc(P().teacher.short)}">${esc(P().teacher.short)} · ${t(P().resp)}</option></select><span class="helper" id="ep-err"></span></div>
   <div><label class="label" for="ep-r">${t('Причина')}</label><input class="field" id="ep-r" placeholder="${t('Например: нужен ответственный группы')}"></div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-orange" data-act="ev-pass-ok" data-id="${e.id}">${t('Передать')}</button></div>`)}
function dlgEvClose(e){
  dlg(`<div class="dlg-h">${ic('x-circle','ic-24')}<h2 class="dialog-title">${t('Закрытие без обработки')}</h2></div><div class="dlg-b"><div class="cap muted">${esc(evTitle(e))}</div>
   <div><label class="label" data-required for="ec-r">${t('Результат')}</label><select class="field" id="ec-r"><option value="">${t('Выберите')}</option><option value="false">${t('Ложное')}</option><option value="drill">${t('Учебное')}</option><option value="dup">${t('Дубликат')}</option></select><span class="helper" id="ec-err"></span></div>
   <div><label class="label" for="ec-c">${t('Комментарий')}</label><input class="field" id="ec-c"></div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="ev-close-ok" data-id="${e.id}">${t('Закрыть событие')}</button></div>`)}
