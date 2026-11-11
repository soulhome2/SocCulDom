/* ---------- выборки ---------- */
const P=()=>db.P;
const isTeacher=()=>S.role==='teacher';
function user(){if(isTeacher())return {short:P().teacher.short,fio:P().teacher.fio,role:`${t(P().resp)} · ${P().teacher.grp}`,roleKey:P().resp};const r=ROLES[S.role];return {...r,role:t(r.role),roleKey:r.role}}
function allowed(route){const r=ROLES[S.role];if(route==='handover'&&!P().handover)return false;if(r.allow)return r.allow.includes(route);if(r.deny)return !r.deny.includes(route);return true}
function visKids(){return isTeacher()?db.kids.filter(k=>k.g===P().teacher.grp):db.kids}
const KBY=id=>db.kids.find(k=>k.id===id);
function stats(kids){const list=kids.length, abs=kids.filter(k=>k.day.st==='absent'), came=list-abs.length;
  return {list,came,absent:abs.length,reasonOk:abs.filter(k=>k.day.reason).length,noReason:abs.filter(k=>!k.day.reason).length,late:kids.filter(k=>k.day.late).length,early:kids.filter(k=>k.day.early).length,check:kids.filter(k=>k.day.st==='check').length,inNow:kids.filter(k=>k.day.st==='in').length,handed:kids.filter(k=>k.day.handed).length}}
function inBuilding(){const kids=db.kids.filter(k=>k.day.st==='in'&&!k.day.handed).length, staff=db.staff.filter(s=>s.st==='in').length, vis=db.visitors.filter(v=>!v.outT).length, con=db.contractors.filter(c=>!c.outT).length;return {kids,staff,vis,con,total:kids+staff+vis+con}}
function sysState(s){if(S.alarm[s.id])return 'alarm';return s.faults.length?'warn':'ok'}
const pastMiss=()=>NOW()>=at(...P().rules.miss);
const RS={'болезнь':'болезнь','семейные обстоятельства':'семейные обстоятельства','мероприятие вне здания':'мероприятие вне здания'};
const reasonT=r=>r?t(r):'';
function stBadge(k,d=k.day){
  if(d.handed) return `<span class="badge badge-neutral">${ic('check')}${t('Выдан · {rel} {t}',{rel:t(d.handed.rel),t:hm(d.handed.t)})}</span>`;
  if(d.st==='absent'){if(d.reason) return `<span class="badge badge-neutral">${ic('dash')}${t('Отсутствует · {r}',{r:reasonT(d.reason)})}</span>`;return pastMiss()||d!==k.day?`<span class="badge badge-danger">${ic('x')}${t('Пропуск без причины')}</span>`:`<span class="badge badge-warning">${ic('clock')}${t('Ещё не пришёл')}</span>`}
  return {in:`<span class="badge badge-success">${ic('check')}${t(P().handover?'В группе':'В здании')}</span>`,out_tmp:`<span class="badge badge-info">${ic('sign-out')}${t('Вышел временно')}</span>`,left:`<span class="badge badge-neutral">${ic('sign-out')}${t('Ушёл')}</span>`,check:`<span class="badge badge-warning">${ic('question')}${t('Требует проверки')}</span>`}[d.st]||'';
}
function flags(d){const f=[];if(d.late)f.push(`<span class="tag">${t('Опоздал')}</span>`);if(d.early)f.push(`<span class="tag ${d.released?'':'bad'}">${t(d.released?'Ушёл раньше · отпущен':'Ушёл раньше')}</span>`);if(d.forgot)f.push(`<span class="tag">${t('Забыл пропуск')}</span>`);return f.join(' ')}
function lastPlace(k){const p=k.day.passes[k.day.passes.length-1];const g=db.groups.find(x=>x.id===k.g);return p?t('{dir} {t} · {pt}; по расписанию — {room}',{dir:t(p.dir==='in'?'Вход':'Выход'),t:hm(p.t),pt:p.pt,room:g.room}):t('по расписанию — {room}',{room:g.room})}
const CHECK_WHY={first_out:'Первый проход за день — «выход»: вероятно, прошёл за другим или забыл пропуск'};

/* ---------- общие куски ---------- */
function scene(c,o={}){
  const h=[...(c.id+c.name)].reduce((a,ch)=>(a*31+ch.charCodeAt(0))%100003,7), r=mulberry(h), yard=/Двор|Территория|площадка|Периметр|Калитка|Въезд/.test(c.z+c.name+c.b);
  const n=o.crowd?10:o.few?2:2+Math.floor(r()*4);
  const ppl=Array.from({length:n},()=>{const y=128+r()*80,x=30+r()*340,s=.55+(y-128)/80*.7;return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><circle cy="-36" r="7"/><rect x="-9" y="-28" width="18" height="30" rx="7"/></g>`}).join('');
  return `<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
   <rect width="400" height="225" style="fill:var(--color-surface-subtle)"/>
   ${yard?`<rect y="0" width="400" height="95" style="fill:var(--color-surface-muted)"/><rect x="${40+r()*80|0}" y="40" width="120" height="55" style="fill:var(--color-surface)"/><line x1="0" y1="95" x2="400" y2="95" style="stroke:var(--color-border-strong)"/>`
     :`<polygon points="0,225 400,225 285,105 115,105" style="fill:var(--color-surface-muted)"/><rect x="115" y="38" width="170" height="67" style="fill:var(--color-surface)"/>
       <g style="stroke:var(--color-border-strong);stroke-width:1.5;fill:none"><line x1="0" y1="0" x2="115" y2="38"/><line x1="400" y1="0" x2="285" y2="38"/><line x1="0" y1="225" x2="115" y2="105"/><line x1="400" y1="225" x2="285" y2="105"/>
       <rect x="30" y="${50+r()*20|0}" width="34" height="${90+r()*20|0}"/><rect x="336" y="${50+r()*20|0}" width="34" height="${90+r()*20|0}"/></g>`}
   <g style="fill:var(--color-fg-subtle);opacity:.6">${ppl}</g></svg>`;
}
/* рамка камеры: подписи поверх кадра — на .overlay кита (D-063) */
function camTile(c,o={}){
  const na=c.srvi, off=c.fault&&c.fault.startsWith('Нет сигнала');
  return `<div class="cam" role="button" tabindex="0" data-act="cam-open" data-id="${c.id}" aria-label="${esc(t('Камера «{c}»',{c:c.name}))}">${na||off?'':scene(c)}
   <span class="overlay o-tl"><span class="live ${na||off?'off':''}"></span><span>${esc(c.name)}</span></span>
   ${o.fav?`<span class="overlay o-tr"><button class="btn btn-icon ${c.fav?'fav-on':''}" data-act="fav" data-id="${c.id}" aria-pressed="${!!c.fav}" aria-label="${esc(t(c.fav?'Убрать из избранного':'В избранное'))}" data-tip="${esc(t(c.fav?'Убрать из избранного':'В избранное'))}">${ic(c.fav?'star-fill':'star')}</button></span>`:''}
   ${na?`<div class="na">${ic('eye-closed','ic-24')}<span>${t('Камера недоступна')}</span></div>`:off?`<div class="na">${ic('alert','ic-24 i-warning')}<span>${t('Нет сигнала с {t}',{t:'07:12'})}</span><span class="cap">${t('заявка на обслуживание создана')}</span></div>`:`<span class="overlay o-br">${esc(c.b)} · <span data-clock>${hms(NOW())}</span></span>`}</div>`;
}
const KIC={alarm:'bell',analytics:'eye',presence:'person',fault:'tools',pass:'sign-in'}, TIC={fight:'alert',fire:'flame',kts:'shield',panic:'bell',tailgate:'people',capacity:'people',early:'sign-out',miss:'person',late:'clock',dontknow:'question',stop:'blocked',lock:'lock',drill:'stopwatch',crowd:'people',object:'package',arm:'shield-check',fault:'tools',round:'location'};
const KNAME={alarm:'Тревоги',analytics:'Аналитика',presence:'Присутствие',fault:'Неисправности',pass:'Проходы СКУД'};
const RESULTS={confirmed:'подтверждено',false:'ложное',drill:'учебное',dup:'дубликат'};
const ESC_AFTER=60000; // SKD-EVT-03: реакция [60] с
const evTitle=e=>t(e.title,e.tv), evDesc=e=>e.desc?t(e.desc,e.dv):'';
const byName=b=>b==='system'?t('Система'):b;
function dataBlock(render,{rows=5,emptyText='Нет данных за выбранный период',emptyIcon='search'}={}){
  if(S.ds==='loading') return `<div class="col" style="padding:16px">${Array.from({length:rows},()=>`<div class="skeleton" style="height:28px"></div>`).join('')}</div>`;
  if(S.ds==='empty') return `<div class="empty">${ic(emptyIcon)}<div class="h-sm" style="color:var(--color-fg)">${t(emptyText)}</div><button class="btn btn-outline" data-act="ds-reset">${t('Сбросить фильтры')}</button></div>`;
  if(S.ds==='error') return `<div class="empty">${ic('alert')}<div class="h-sm" style="color:var(--color-fg)">${t('Сервер объекта не ответил за 10 с')}</div><div class="cap">${t('Проверьте связь с сервером «Интеллект X» SRV-EDU-01.')}</div><button class="btn btn-outline" data-act="ds-reset">${ic('sync')}${t('Повторить')}</button></div>`;
  return render();
}
const av=(name,c='',cls='',photo=null)=>{const p=String(name).split(' ');return `<span class="av ${cls} ${c||'c'+(1+[...name].reduce((a,ch)=>a+ch.charCodeAt(0),0)%4)}" aria-hidden="true">${photo?`<img src="${photo}" alt="">`:esc((p[0]||'')[0]||'')+esc((p[1]||'')[0]||'')}</span>`};
const card=(title,body,o={})=>`<section class="card ${o.cls||''}" ${o.id?`id="${o.id}"`:''}><div class="card-h"><h2>${title}</h2>${o.right?`<span class="sp"></span>${o.right}`:''}</div>${body}</section>`;
/* уведомления — .msgbar в .toasts кита: видно не больше двух, остальное — «ещё N» (D-064) */
const TOASTS=[];
function toast(msg,kind='success'){TOASTS.push({msg,kind,id:Math.random()});drawToasts();const id=TOASTS[TOASTS.length-1].id;setTimeout(()=>{const i=TOASTS.findIndex(x=>x.id===id);if(i>=0){TOASTS.splice(i,1);drawToasts()}},5200)}
function drawToasts(){const box=$('#toasts');const vis=TOASTS.slice(-2),more=TOASTS.length-vis.length;
  box.innerHTML=(more?`<button class="toast-more" data-act="toasts-clear">${t('ещё {n}',{n:more})}</button>`:'')+vis.map(x=>`<div class="msgbar" data-sev="${x.kind==='alarm'?'error':x.kind}" role="status"><span class="msgbar-tile">${ic(x.kind==='alarm'?'alert':x.kind==='info'?'info':'check')}</span><span class="msgbar-text">${x.msg}</span><span class="msgbar-act"><button class="btn msgbar-x" data-act="toast-x" data-id="${x.id}" aria-label="${t('Закрыть')}">${ic('x')}</button></span></div>`).join('')}
const seg=(id,opts,cur,act)=>`<div class="seg" role="group" id="${id}">${opts.map(([v,l])=>`<button class="btn" data-act="${act}" data-v="${v}" aria-pressed="${v===cur}">${l}</button>`).join('')}</div>`;
function pager(total,page,act){const pages=Math.max(1,Math.ceil(total/50));return `<div class="pager"><span class="cap muted">${t('Показано {a}–{b} из {n} · по 50 строк',{a:total?page*50+1:0,b:Math.min(total,(page+1)*50),n:total})}</span><span class="sp"></span><button class="btn btn-icon" data-act="${act}" data-d="-1" ${page<=0?'disabled':''} aria-label="${t('Предыдущая страница')}">${ic('chevron-left')}</button><span class="cap">${page+1} / ${pages}</span><button class="btn btn-icon" data-act="${act}" data-d="1" ${page>=pages-1?'disabled':''} aria-label="${t('Следующая страница')}">${ic('chevron-right')}</button></div>`}
const msgbar=(sev,title,text='',act='')=>`<div class="msgbar" data-sev="${sev}" ${title?'data-multiline':''}><span class="msgbar-tile">${ic(sev==='error'?'alert':sev==='warning'?'alert':sev==='success'?'check':'info')}</span><span class="msgbar-text">${title?`<span class="msgbar-title">${title}</span>`:''}${text?`<span class="${title?'msgbar-meta':''}">${text}</span>`:''}</span>${act?`<span class="msgbar-act">${act}</span>`:''}</div>`;

/* ---------- навигация, шапка, строка состояния ---------- */
function navHtml(){
  const p=P(), newEv=db.events.filter(e=>e.status!=='done').length, over=db.tickets.filter(x=>x.st==='created'&&(NOW()-x.created)/36e5>slaOf(x)).length;
  const I={home:'home',post:'shield',rounds:'location',video:'device-camera-video',attendance:'checklist',handover:'people',events:'bell',rollcall:'device-mobile',people:'id-badge',journals:'book',reports:'graph',service:'tools',config:'server',audit:'log'};
  const T={...TITLES,attendance:isTeacher()?p.grpMy:'Посещаемость'};
  const rd=S.round&&S.round.points.filter((x,i)=>S.round.marks[i]).length;
  const B={events:newEv?`<span class="badge badge-danger">${newEv}</span>`:'',service:over?`<span class="badge badge-danger">${over}</span>`:'',rollcall:S.evac?`<span class="badge badge-danger">${t('идёт')}</span>`:'',rounds:S.round?`<span class="badge badge-info">${rd}/${S.round.points.length}</span>`:''};
  const sec=[['Объект',['home','post','rounds','video','attendance','handover','events','rollcall']],['Учёт и регламенты',['people','journals','reports','service']],['Администрирование',['config','audit']]];
  return sec.map(([n,rs])=>{const v=rs.filter(allowed);return v.length?`<div class="ov">${t(n)}</div>`+v.map(r=>`<a class="nav-item" href="#${r}" ${S.route===r?'aria-current="page"':''}>${ic(I[r])}<span>${t(T[r])}</span>${B[r]||''}</a>`).join(''):''}).join('');
}
const canMode=()=>S.role!=='teacher';
function header(){
  const m=MBY(S.mode), u=user();
  const chip=$('#mode-chip'); chip.className='mode-chip '+modeCls(m); chip.innerHTML=`${ic(m.ic||'dot-fill')}<span class="mc-t">${esc(modeName(m))}</span>${ic('chevron-down')}`; chip.setAttribute('aria-label',t('Режим объекта: {m}',{m:modeName(m)}));
  $('#org-name').textContent=t(P().org); $('#brand-sub').textContent=t('Безопасное образование'); $('#side-foot').textContent=t('Прототип по ТЗ SafeEducation v0.2 · данные — фикстура');
  $('#user-name').textContent=u.short; $('#user-role').textContent=u.role;
  $('#mode-menu').innerHTML=`<div class="menu-subheader">${t('Режим объекта')}</div>${S.modes.map(x=>`<button class="menu-item menu-item-rich" role="menuitemradio" aria-checked="${x.id===S.mode}" data-act="mode" data-m="${x.id}" ${canMode()?'':'disabled'}><span class="light ${modeLight(x)}" style="margin-top:4px"></span><span class="menu-item-text"><span class="menu-item-title">${esc(modeName(x))}</span><span class="menu-item-desc">${esc(x.sys||['day','night','holiday','event'].includes(x.id)?t(x.d):x.d)}</span></span></button>`).join('')}<div class="cap muted" style="padding:8px 16px;border-top:1px solid var(--color-border)">${t(canMode()?'Переключение требует подтверждения и пишется в аудит. «ЧС» — удержание 2 с.':'Переключать режимы может администрация и пост охраны.')}</div>`;
  $('#user-menu').innerHTML=`<div class="menu-subheader">${esc(u.fio||u.short)}</div><div class="cap muted" style="padding:0 16px 8px">${esc(u.role)}</div><button class="menu-item" role="menuitem" data-act="lang-toggle">${ic('globe')}${S.lang==='en'?'Русский':'English'}</button><button class="menu-item" role="menuitem" data-act="profile-me">${ic('person')}${t('Профиль')}</button><button class="menu-item" role="menuitem" data-act="signout">${ic('sign-out')}${t('Выйти')}</button>`;
  const st=$('#stale'); st.hidden=!S.offline; st.innerHTML=`<span class="msgbar-tile">${ic('cloud-offline')}</span><span class="msgbar-text">${t('Нет связи с сервером объекта — данные устарели, обновлено {t}. Режимы, эвакуация и перекличка работают локально.',{t:hms(S.lastUpd||NOW())})}</span>`;
  $('#lang').value=S.lang; $('#lang').setAttribute('aria-label',t('Язык интерфейса')); document.documentElement.lang=S.lang;
  $('#menu-btn').setAttribute('aria-label',t('Открыть разделы')); $('#proto-btn').setAttribute('aria-label',t('Параметры прототипа')); $('#proto-btn').dataset.tip=t('Параметры прототипа');
  $('#theme-btn').setAttribute('aria-label',t('Сменить тему')); $('#theme-btn').dataset.tip=t('Сменить тему');
  $('#side').setAttribute('aria-label',t('Разделы')); $('#sheet').setAttribute('aria-label',t('Карточка'));
  protoPanel(); statusbar();
}
function statusbar(){
  const ib=inBuilding(), m=MBY(S.mode), ne=db.events.filter(e=>e.status==='new').length, faults=db.sys.reduce((a,s)=>a+s.faults.length,0);
  $('#statusbar').innerHTML=`<span><span class="status-dot" data-tone="${m.color==='danger'?'down':m.color==='warn'?'warn':'ok'}"></span>${t('Режим')}: <b>${esc(modeName(m))}</b></span><span>${t('В здании')}: <b>${ib.total}</b></span><span>${t('Новых событий')}: <b>${ne}</b></span><span>${t('Неисправностей')}: <b>${faults}</b></span><span class="hide-sm"><span class="status-dot" data-tone="${S.offline?'down':'ok'}"></span>${t(S.offline?'Нет связи с сервером':'Связь с сервером есть')}</span><span class="sp"></span><span class="hide-sm">${t('Данные — фикстура, демо-время')} <span class="mono" id="fx-time">${hms(NOW())}</span></span>`;
}
function protoPanel(){
  const sel=(id,label,opts,cur)=>`<label class="label" for="${id}">${label}</label><select class="field" id="${id}">${opts.map(([v,l])=>`<option value="${v}" ${v===cur?'selected':''}>${l}</option>`).join('')}</select>`;
  const sw=(id,label,on)=>`<label class="choice"><input type="checkbox" class="switch" role="switch" id="${id}" ${on?'checked':''}> ${label}</label>`;
  $('#proto-pop').innerHTML=`<div class="col" style="gap:8px;width:300px"><div class="h-sm">${t('Параметры прототипа')}</div>
   ${sel('pp-profile',t('Профиль учреждения'),[['school',t('Школа')],['kinder',t('Детский сад')],['college',t('Колледж')]],S.profile)}
   ${sel('pp-role',t('Роль пользователя'),[['director',t('Директор')],['security',t('Зам. директора по безопасности')],['guard',t('Пост охраны')],['teacher',t(P().resp)]],S.role)}
   ${sel('pp-state',t('Состояние блоков данных'),[['data',t('Данные')],['loading',t('Загрузка')],['empty',t('Пусто')],['error',t('Ошибка')]],S.ds)}
   ${sw('pp-sim',t('Поток проходов СКУД (каждые 6 с)'),PP.sim)}${sw('pp-auto',t('Учителя отмечают детей при эвакуации'),PP.auto)}${sw('pp-offline',t('Связь с сервером потеряна'),S.offline)}
   <div class="ov" style="margin-top:4px">${t('События для демонстрации')}</div>
   <button class="btn btn-red" data-act="sim-fire">${ic('flame')}${t('Сработка СПС — пожар')}</button>
   <button class="btn btn-outline" data-act="sim-dontknow">${ic('comment')}${t('Родитель ответил «не знаю»')}</button>
   <button class="btn btn-outline" data-act="sim-fight">${ic('alert')}${t('Детектор: драка')}</button>
   <button class="btn btn-outline" data-act="sim-fault">${ic('device-camera-video')}${t('Неисправность камеры')}</button>
   <button class="btn btn-subtle" data-kit-close>${t('Закрыть')}</button></div>`;
}
const PP={sim:true,auto:true};

/* ---------- роутер ---------- */
const VIEWS={};
function render(){
  const r=(location.hash||'').slice(1).split('?')[0]; S.route=VIEWS[r]?r:ROLES[S.role].home;
  if(!allowed(S.route)&&allowed(ROLES[S.role].home)&&r==='') S.route=ROLES[S.role].home;
  $('#nav').innerHTML=navHtml(); header();
  const T=S.route==='attendance'&&isTeacher()?P().grpMy:TITLES[S.route];
  $('#page-title').textContent=t(T); document.title=`${t(T)} · ${t('Безопасное образование')} — ${t('прототип')}`;
  $('#view').innerHTML=allowed(S.route)?VIEWS[S.route]():noAccess();
  $('#side').removeAttribute('data-open'); $('#side-scrim').hidden=true;
  if(window.kit&&kit.layoutSegs) kit.layoutSegs();
}
function noAccess(){const why=S.route==='audit'?t('Журнал аудита доступен только администрации учреждения и аудитору (SKD-AUD-02).'):S.route==='handover'?t('Раздел есть только в профиле «Детский сад».'):t('Роль «{r}» не видит этот раздел (раздел 9 ТЗ).',{r:user().role});
  return `<div class="card noaccess"><div class="empty">${ic('lock')}<div class="h-sm" style="color:var(--color-fg)">${t('Нет доступа')}</div><div class="cap">${why}</div><a class="btn btn-outline" href="#${ROLES[S.role].home}">${t('На свой главный экран')}</a></div></div>`}
function rerender(){const y=window.scrollY;render();window.scrollTo(0,y)}
const busy=()=>$('#dlg').open||$('#sheet').hasAttribute('data-open')||!!document.querySelector('.menu:not([hidden]),.popover:not([hidden])');

/* ---------- окна ---------- */
function dlg(html,o={}){const d=$('#dlg');d.className='dialog'+(o.wide?' wide':'');d.innerHTML=html;if(!d.open)d.showModal();const f=$('input:not([type=checkbox]):not([type=file]),select,textarea',d);f&&f.focus()}
function closeDlg(){const d=$('#dlg');if(d.open)d.close()}
function openSheet(html){const s=$('#sheet');s.innerHTML=html;s.setAttribute('data-open','');$('#sheet-scrim').hidden=false;s.focus()}
function closeSheet(){$('#sheet').removeAttribute('data-open');$('#sheet-scrim').hidden=true}
const err=(fld,hel,msg)=>{$(fld)?.setAttribute('aria-invalid','true');const e=$(hel);if(e){e.textContent=msg;e.setAttribute('data-error','')}};
