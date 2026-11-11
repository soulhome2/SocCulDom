/* ================= Конфигурация — всё, что хранится на сервере объекта =================
 * По образцу «Настроек администратора» Incident Manager: вкладки слева, содержимое справа.
 * В продукте раздел переедет в отдельный конфигуратор; здесь — чтобы показать состав и формы. */
const CFG_TABS=[['profile','Профиль учреждения','organization'],['rules','Правила дня','clock'],['modes','Режимы объекта','zap'],['rounds','Обходы','location'],['notify','Уведомления в MAX','comment'],['zones','Зоны и вместимость','people'],['sla','SLA обслуживания','tools'],['roles','Роли и доступ','shield-lock']];
VIEWS.config=function(){
  const tab=S.cfg.tab;
  const body={profile:cfgProfile,rules:cfgRules,modes:cfgModes,rounds:cfgRounds,notify:cfgNotify,zones:cfgZones,sla:cfgSla,roles:cfgRoles}[tab]();
  return `${msgbar('info',t('Настройки сервера объекта'),t('Всё, что здесь, хранится на сервере «Интеллект X» и применяется ко всем рабочим местам. Позже раздел переедет в отдельный конфигуратор.'))}
  <div class="cfg"><section class="card"><div class="tree" role="tablist" aria-orientation="vertical" style="padding-top:8px">${CFG_TABS.map(([v,l,i])=>`<button class="tree-i" role="tab" data-act="cfg-tab" data-v="${v}" aria-selected="${v===tab}">${ic(i)}<span class="grow">${t(l)}</span></button>`).join('')}</div></section>
  <div class="col" style="gap:16px;min-width:0">${body}</div></div>`;
};
const cfgSave=(what)=>`<div class="card-f"><span class="sp"></span><button class="btn btn-primary" data-act="cfg-save" data-what="${what}">${ic('check')}${t('Сохранить на сервере')}</button></div>`;
function cfgProfile(){const p=P();
  return card(t('Профиль учреждения (SKD-UI-04)'),`<div class="card-b col"><div class="cap muted">${t('Профиль задаёт словарь, правила присутствия, сценарии и разделы. Ядро общее.')}</div>${seg('set-prof',[['school',t('Школа')],['kinder',t('Детский сад')],['college',t('Колледж')]],p.id,'profile')}
   <dl class="dl"><dt>${t('Учреждение')}</dt><dd>${esc(t(p.org))}</dd><dt>${t('Словарь')}</dt><dd>${t(p.kids)} · ${t(p.grp)} · ${t(p.resp)}</dd><dt>${t('Уведомления родителям')}</dt><dd>${t(p.parents?'да, мессенджер MAX':'нет')}</dd><dt>${t('Приём и выдача')}</dt><dd>${t(p.handover?'да, доверенные лица':'нет')}</dd></dl></div>`);
}
function cfgRules(){const r=P().rules;
  return card(t('Правила дня (SKD-PRS-03)'),`<div class="card-b grid2" style="gap:12px">${[['Окно прихода с',r.from],['Окно прихода до',r.to],['Опоздание после',r.late],['Пропуск после',r.miss]].map(([l,v],i)=>`<div><label class="label" for="rule-${i}">${t(l)}</label><input class="field" type="time" id="rule-${i}" value="${v.map(pad).join(':')}"></div>`).join('')}<div class="cap muted" style="grid-column:1/-1">${t('Учитывается расписание группы: вторая смена, разные начала занятий.')}</div></div>${cfgSave('Правила дня')}`);
}
/* режимы: список + форма добавления и правки (корректировка, п. 14) */
function cfgModes(){
  const days=m=>m.sched?m.sched.days.map(d=>(S.lang==='en'?DAYN_EN:DAYN_RU)[d]).join(', ')+` · ${m.sched.from}–${m.sched.to}`:t('вручную или по событию');
  return card(t('Режимы объекта (SKD-MOD-01)'),`<div class="scroll-x"><table class="table" id="t-modes"><thead><tr><th>${t('Режим')}</th><th>${t('Расписание')}</th><th>${t('Действия при включении')}</th><th></th></tr></thead><tbody>${S.modes.map(m=>`<tr><td><span class="row"><span class="swatch ${m.color}"></span><b>${esc(modeName(m))}</b>${m.sys?` <span class="tag">${t('системный')}</span>`:''}</span></td><td class="cap">${esc(days(m))}</td><td class="cap">${m.acts.map(a=>t((MODE_ACTIONS.find(x=>x[0]===a)||[0,a])[1])).join(' · ')}</td>
    <td style="text-align:right;white-space:nowrap"><button class="btn btn-outline btn-compact" data-act="mode-edit" data-id="${m.id}">${ic('pencil')}${t('Изменить')}</button>${m.sys||m.id==='day'?'':` <button class="btn btn-subtle btn-compact" data-act="mode-del" data-id="${m.id}" aria-label="${t('Удалить режим')}" data-tip="${t('Удалить режим')}">${ic('trash')}</button>`}</td></tr>`).join('')}</tbody></table></div>
   <div class="card-b cap muted">${t('Системные режимы — «Учебная тревога», «Эвакуация», «ЧС» — удалить нельзя. Сработка СПС включает «Эвакуацию» автоматически; пожар отменяет ЧС — это не настраивается (SKD-MOD-05).')}</div>`,{right:`<button class="btn btn-primary" data-act="mode-edit" data-id="">${ic('plus')}${t('Добавить режим')}</button>`});
}
function dlgModeEdit(id){
  const m=S.modes.find(x=>x.id===id)||{id:'',name:'',color:'info',ic:'dot-fill',d:'',sched:{days:[0,1,2,3,4],from:'09:00',to:'15:00'},acts:['notify']};
  const sch=!!m.sched, dn=S.lang==='en'?DAYN_EN:DAYN_RU;
  dlg(`<div class="dlg-h">${ic('zap','ic-24')}<h2 class="dialog-title">${t(id?'Изменить режим':'Новый режим')}</h2></div><div class="dlg-b">
   <div class="grid2"><div><label class="label" data-required for="me-n">${t('Название')}</label><input class="field" id="me-n" value="${esc(id?modeName(m):'')}" ${m.sys?'readonly':''} placeholder="${t('Например: Родительское собрание')}"><span class="helper" id="me-err"></span></div>
    <div><label class="label" for="me-c">${t('Цвет в шапке')}</label><select class="field" id="me-c" ${m.sys?'disabled':''}>${MODE_COLORS.map(([v,l])=>`<option value="${v}" ${m.color===v?'selected':''}>${t(l)}</option>`).join('')}</select></div>
    <div style="grid-column:1/-1"><label class="label" for="me-d">${t('Описание')}</label><input class="field" id="me-d" value="${esc(id&&(m.sys||['day','night','holiday','event'].includes(m.id))?t(m.d):m.d)}"></div></div>
   <div class="h-sm">${t('Расписание')}</div>
   <label class="choice"><input type="checkbox" class="switch" role="switch" id="me-s" ${sch?'checked':''} ${m.sys?'disabled':''}> ${t('Включать по расписанию')}</label>
   <div class="row wrap"><div class="days">${dn.map((d,i)=>`<label class="chip"><input type="checkbox" class="check" data-day="${i}" ${sch&&m.sched.days.includes(i)?'checked':''} ${m.sys?'disabled':''}> ${d}</label>`).join('')}</div>
    <input class="field field-compact" type="time" id="me-f" value="${sch?m.sched.from:'09:00'}" style="width:auto" aria-label="${t('С')}" ${m.sys?'disabled':''}> — <input class="field field-compact" type="time" id="me-t" value="${sch?m.sched.to:'15:00'}" style="width:auto" aria-label="${t('До')}" ${m.sys?'disabled':''}></div>
   <div class="h-sm">${t('Действия при включении (макросы «Интеллект X»)')}</div>
   <div class="opts">${MODE_ACTIONS.map(([v,l])=>`<label class="opt"><input type="checkbox" class="check" data-act-m="${v}" ${m.acts.includes(v)?'checked':''}> ${t(l)}</label>`).join('')}</div>
   ${m.sys?`<div class="cap muted">${t('У системного режима можно менять только действия и описание.')}</div>`:''}</div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>${t('Отмена')}</button><button class="btn btn-primary" data-act="mode-save" data-id="${m.id}">${t('Сохранить')}</button></div>`,{wide:1});
}
/* обходы: конструктор чек-листа (корректировка, директор п. 3) */
function cfgRounds(){
  const sel=S.rounds.find(r=>r.id===S.cfg.route)||S.rounds[0];
  return `<div class="cols" style="grid-template-columns:minmax(0,1fr) minmax(0,1.6fr)">${card(t('Маршруты обхода'),`<div class="tree">${S.rounds.map(r=>`<button class="tree-i" data-act="cfg-route" data-id="${r.id}" aria-selected="${sel&&r.id===sel.id}">${ic('location')}<span class="grow">${esc(r.name)}</span><span class="menu-count">${r.points.length}</span></button>`).join('')}</div>`,{right:`<button class="btn btn-outline btn-compact" data-act="route-add">${ic('plus')}${t('Маршрут')}</button>`})}
   ${sel?card(t('Чек-лист маршрута'),`<div class="card-b col">
     <div><label class="label" data-required for="rt-n">${t('Название маршрута')}</label><input class="field" id="rt-n" value="${esc(sel.name)}"></div>
     <div><label class="label" for="rt-t">${t('Время по графику (через запятую)')}</label><input class="field" id="rt-t" value="${esc(sel.times.join(', '))}"></div>
     <div class="label">${t('Точки обхода — что проверить')}</div>
     ${sel.points.map((p,i)=>`<div class="row"><span class="cap mono" style="width:20px">${i+1}</span><input class="field" data-pt="${i}" value="${esc(p)}" aria-label="${t('Точка {n}',{n:i+1})}"><button class="btn btn-icon" data-act="pt-up" data-i="${i}" ${i===0?'disabled':''} aria-label="${t('Выше')}">${ic('arrow-up')}</button><button class="btn btn-icon" data-act="pt-down" data-i="${i}" ${i===sel.points.length-1?'disabled':''} aria-label="${t('Ниже')}">${ic('arrow-down')}</button><button class="btn btn-icon" data-act="pt-del" data-i="${i}" aria-label="${t('Удалить точку')}">${ic('trash')}</button></div>`).join('')}
     <div class="row"><input class="field" id="pt-new" placeholder="${t('Новая точка, например: Запасный выход — свободен')}"><button class="btn btn-outline" data-act="pt-add">${ic('plus')}${t('Добавить')}</button></div>
     <div class="cap muted">${t('Чек-лист видит роль «Пост охраны» в разделе «Обход»: у каждой точки — «Проверено» или «Не проверено» с замечанием.')}</div></div>
     <div class="card-f">${S.rounds.length>1?`<button class="btn btn-subtle" data-act="route-del" data-id="${sel.id}">${ic('trash')}${t('Удалить маршрут')}</button>`:''}<span class="sp"></span><button class="btn btn-primary" data-act="route-save" data-id="${sel.id}">${ic('check')}${t('Сохранить на сервере')}</button></div>`):''}</div>`;
}
function cfgNotify(){const p=P(),n=S.notif;
  return card(t('Уведомления законным представителям в MAX (SKD-NTF)'),`<div class="card-b col" style="gap:4px">${p.parents?[['in','«Пришёл в 08:12»'],['out','«Ушёл в 14:35»'],['miss','«Не пришёл к 09:00» с кнопками причины'],['early','«Ушёл раньше расписания»'],['quiet','Тихие часы 21:00–07:00']].map(([k,l])=>`<label class="choice"><input type="checkbox" class="switch" role="switch" data-notif="${k}" ${n[k]?'checked':''}> ${t(l)}</label>`).join('')+`<div class="cap muted">${t('Только с согласия родителя. Видео и данные других детей не отправляются.')}</div>`:`<div class="cap muted">${t('Уведомления родителям выключены.')}</div>`}</div>${cfgSave('Уведомления')}`);
}
function cfgZones(){return card(t('Вместимость зон (SKD-OBJ-04)'),`<table class="table"><thead><tr><th>${t('Зона')}</th><th class="num">${t('Вместимость')}</th></tr></thead><tbody>${db.zones.map((z,i)=>`<tr><td>${esc(z[0])}</td><td class="num"><input class="field field-compact" style="width:90px;text-align:right" type="number" id="cap-${i}" value="${z[2]}" aria-label="${t('Вместимость')}: ${esc(z[0])}"></td></tr>`).join('')}</tbody></table>${cfgSave('Вместимость зон')}`)}
function cfgSla(){const isDir=S.role==='director';
  return card(t('SLA обслуживающих организаций (SKD-SYS-03)'),`<div class="card-b col">${[['video','Видеонаблюдение'],['fire','СПС'],['kts','КТС и тревожные кнопки'],['other','Остальные подсистемы']].map(([k,n])=>`<div class="row"><span class="grow">${t(n)}</span><input class="field field-compact" style="width:80px" type="number" min="1" id="sla-${k}" value="${S.sla[k]}" ${isDir?'':'disabled'} aria-label="SLA ${t(n)}"><span class="cap muted">${t('ч')}</span></div>`).join('')}<div class="cap muted">${t('Просроченная заявка подсвечивается в «Обслуживании» и в меню.')}</div></div>${cfgSave('SLA')}`)}
function cfgRoles(){
  const R=['director','security','guard','teacher'], names={director:'Директор',security:'Зам. директора по безопасности',guard:'Пост охраны',teacher:P().resp};
  const save=S.role; const can=(r,rt)=>{const x=ROLES[r];if(rt==='handover'&&!P().handover)return false;if(x.allow)return x.allow.includes(rt);if(x.deny)return !x.deny.includes(rt);return true};
  return card(t('Роли и доступ к разделам (раздел 9)'),`<div class="scroll-x"><table class="table"><thead><tr><th>${t('Раздел')}</th>${R.map(r=>`<th class="num">${t(names[r])}</th>`).join('')}</tr></thead><tbody>${ROUTES.filter(r=>r!=='handover'||P().handover).map(rt=>`<tr><td>${t(TITLES[rt])}</td>${R.map(r=>`<td class="num">${can(r,rt)?ic('check','i-success'):'<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="card-b cap muted">${t('Только просмотр. Права назначаются в «Интеллект X»; ответственный группы видит только свою группу.')}</div>`);
}
