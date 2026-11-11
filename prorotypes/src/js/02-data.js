/* ---------- справочники имён (фикстура) ---------- */
const SUR=['Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов','Новиков','Фёдоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Егоров','Павлов','Козлов','Степанов','Николаев','Орлов','Андреев','Макаров','Никитин','Захаров','Зайцев','Соловьёв','Борисов','Яковлев','Григорьев','Романов','Воробьёв','Сергеев','Кузьмин','Фролов','Александров','Дмитриев','Королёв','Гусев','Киселёв','Медведев','Тарасов','Белов','Комаров','Ершов','Широков'];
const MN=['Артём','Максим','Иван','Михаил','Дмитрий','Егор','Тимофей','Матвей','Кирилл','Никита','Лев','Марк','Даниил','Фёдор','Илья','Алексей','Роман','Глеб','Сергей','Платон'];
const FN=['Анна','Мария','София','Алиса','Виктория','Полина','Ева','Варвара','Ксения','Дарья','Вера','Василиса','Елизавета','Арина','Милана','Ульяна','Таисия','Екатерина','Ольга','Наталья'];
const PM=['Александрович','Сергеевич','Андреевич','Дмитриевич','Алексеевич','Игоревич','Михайлович','Владимирович','Олегович','Евгеньевич'];
const pf=p=>p.replace(/вич$/,'вна');
const ini=(f,p)=>`${f[0]}. ${p[0]}.`;

/* ---------- профили (SKD-UI-04) — подписи переводятся через t() при выводе ---------- */
const PROFILES={
  school:{id:'school',name:'Школа',org:'МБОУ «Средняя общеобразовательная школа № 17»',kids:'Ученики',kidsGen:'учеников',kid:'Ученик',grp:'Класс',grpPl:'Классы',grpMy:'Мой класс',resp:'Классный руководитель',respShort:'кл. рук.',parents:true,handover:false,
    rules:{from:[7,30],to:[8,30],late:[8,30],miss:[9,0],end:'14:40'},teacher:{fio:'Смирнова Елена Андреевна',short:'Смирнова Е. А.',grp:'5Б'},sick:'3А',
    staff:[['Педагог',46],['Администрация',6],['Охрана',3],['Медработник',1],['Пищеблок',7],['Техперсонал',9]],seed:17},
  kinder:{id:'kinder',name:'Детский сад',org:'МБДОУ «Детский сад № 42 „Солнышко“»',kids:'Воспитанники',kidsGen:'воспитанников',kid:'Воспитанник',grp:'Группа',grpPl:'Группы',grpMy:'Моя группа',resp:'Воспитатель',respShort:'восп.',parents:true,handover:true,
    rules:{from:[7,0],to:[8,30],late:[8,30],miss:[9,0],end:'19:00'},teacher:{fio:'Павлова Ольга Николаевна',short:'Павлова О. Н.',grp:'Средняя «Пчёлки»'},sick:'Младшая «Ромашки»',
    staff:[['Воспитатель',18],['Помощник воспитателя',9],['Администрация',3],['Медработник',2],['Пищеблок',5],['Техперсонал',4],['Охрана',2]],seed:42},
  college:{id:'college',name:'Колледж',org:'ГБПОУ «Колледж связи № 3»',kids:'Студенты',kidsGen:'студентов',kid:'Студент',grp:'Группа',grpPl:'Группы',grpMy:'Моя группа',resp:'Куратор',respShort:'куратор',parents:true,handover:false,
    rules:{from:[8,0],to:[9,0],late:[9,0],miss:[9,30],end:'17:10'},teacher:{fio:'Орлов Виктор Сергеевич',short:'Орлов В. С.',grp:'ИС-21'},sick:'СС-21',
    staff:[['Преподаватель',58],['Мастер п/о',8],['Администрация',9],['Охрана',4],['Техперсонал',10]],seed:3},
};
function groupsFor(pid){
  if(pid==='school'){const g=[];for(let n=1;n<=11;n++)for(const l of (n<=7?['А','Б','В']:['А','Б']))g.push({id:n+l,b:n<=4?'Корпус Б':'Корпус А'});return g}
  if(pid==='kinder') return ['Ясли «Капельки»','Младшая «Ромашки»','Младшая «Колокольчики»','Средняя «Пчёлки»','Средняя «Солнышко»','Старшая «Звёздочки»','Старшая «Радуга»','Подготовительная «Почемучки»'].map((id,i)=>({id,b:i<4?'Этаж 1':'Этаж 2'}));
  return ['ИС-11','ИС-12','ИС-21','ИС-22','ИС-31','СС-11','СС-21','СС-31','ПК-11','ПК-21','ЭМ-11','ЭМ-21'].map(id=>({id,b:/^ПК|^ЭМ/.test(id)?'Корпус мастерских':'Учебный корпус'}));
}
const ENTRY={school:{'Корпус А':'Турникеты · главный вход','Корпус Б':'Турникет · вход корпуса Б'},kinder:{'Этаж 1':'Калитка · главный вход','Этаж 2':'Калитка · главный вход'},college:{'Учебный корпус':'Турникеты · главный вход','Корпус мастерских':'Турникет · мастерские'}};

/* ---------- роли (раздел 9 + корректировка) ----------
 * «Пост охраны» — только у роли «Пост охраны» (замечание 1, директор и зам — убрать);
 * «Перекличка» — у директора убрана; «Обход» — только «Пост охраны» (замечание 12);
 * «Конфигурация» — всё, что хранится на сервере, — только директор (администрация). */
const ROLES={
  director:{role:'Директор',fio:'Морозова Татьяна Викторовна',short:'Морозова Т. В.',home:'home',deny:['post','rounds','rollcall']},
  security:{role:'Зам. директора по безопасности',fio:'Кузнецов Андрей Павлович',short:'Кузнецов А. П.',home:'home',deny:['post','rounds','audit','config']},
  guard:{role:'Пост охраны',fio:'Петров Сергей Иванович',short:'Петров С. И.',home:'post',allow:['post','rounds','video','events','people','journals']},
  teacher:{role:'',fio:'',short:'',home:'attendance',allow:['attendance','rollcall','handover']},
};
const ROUTES=['home','post','rounds','video','attendance','handover','events','rollcall','people','journals','reports','service','config','audit'];
const TITLES={home:'Главная',post:'Пост охраны',rounds:'Обход',video:'Видеонаблюдение',attendance:'Посещаемость',handover:'Приём и выдача детей',events:'События',rollcall:'Перекличка',people:'Люди и пропуска',journals:'Журналы',reports:'Отчёты',service:'Обслуживание',config:'Конфигурация',audit:'Аудит'};

/* ---------- режимы объекта (SKD-MOD-01) — теперь редактируются в «Конфигурации» (замечание 14) ---------- */
const MODE_ACTIONS=[['arm','Постановка на охрану'],['disarm','Снятие с охраны'],['acs_norm','СКУД: обычный режим'],['acs_staff','СКУД: только пропуска персонала'],['acs_lockin','СКУД: внешние входы закрыты на вход'],['acs_open','СКУД: все двери разблокированы'],['rec','Запись и детекторы — усиленно'],['crowd','Аналитика скоплений — усиленно'],['soue','Речевое сообщение по зонам'],['notify','Уведомление администрации в MAX'],['post','Камеры выведены на пост охраны'],['rollcall','Перекличка у ответственных групп'],['att_off','Посещаемость не считается']];
const MODE_COLORS=[['ok','Зелёный'],['neutral','Серый'],['info','Синий'],['warn','Жёлтый'],['danger','Красный']];
const DAYN_RU=['пн','вт','ср','чт','пт','сб','вс'], DAYN_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function defaultModes(){return [
  {id:'day',name:'Учебный день',color:'ok',ic:'mortar-board',d:'По расписанию · будни 07:00–18:00',sched:{days:[0,1,2,3,4],from:'07:00',to:'18:00'},acts:['disarm','acs_norm','notify']},
  {id:'night',name:'Нерабочее время',color:'neutral',ic:'moon',d:'Охрана включена, вход только по пропускам персонала',sched:{days:[0,1,2,3,4,5,6],from:'18:00',to:'07:00'},acts:['arm','acs_staff']},
  {id:'holiday',name:'Каникулы',color:'neutral',ic:'calendar',d:'Посещаемость не считается, кружки по расписанию',sched:null,acts:['acs_staff','att_off']},
  {id:'event',name:'Мероприятие',color:'info',ic:'people',d:'Аналитика скоплений усилена, пост у выходов',sched:null,acts:['crowd','post','notify']},
  {id:'drill',name:'Учебная тревога',color:'warn',ic:'stopwatch',d:'Учебная эвакуация с перекличкой и протоколом',sched:null,acts:['acs_open','soue','rollcall'],sys:true},
  {id:'evac',name:'Эвакуация',color:'danger',ic:'flame',d:'Двери разблокированы, перекличка по группам',sched:null,acts:['acs_open','soue','rollcall','notify','post'],sys:true},
  {id:'lock',name:'ЧС (блокировка)',color:'danger',ic:'lock',d:'Внешние входы закрыты на вход, выходы свободны',sched:null,acts:['acs_lockin','soue','notify','post'],sys:true},
]}
const MBY=id=>S.modes.find(m=>m.id===id)||S.modes[0];
const modeCls=m=>({ok:'m-ok',neutral:'m-neutral',info:'m-info',warn:'m-warn',danger:'m-danger',purple:'m-info'})[m.color]||'m-neutral';
const modeLight=m=>({ok:'',neutral:'off',info:'',warn:'warn',danger:'alarm'})[m.color]||'';
const modeName=m=>m.sys||['day','night','holiday','event'].includes(m.id)?t(m.name):m.name;

/* ---------- маршруты обхода (замечания 12 и «чек-лист для обходов» в настройках) ---------- */
function defaultRounds(pid){
  const k=pid==='kinder';
  return [
    {id:'R1',name:k?'Обход территории и прогулочных площадок':'Обход территории',times:['08:30','12:00','16:00'],points:k?['Калитка главного входа — закрыта, домофон работает','Ограждение по периметру — без повреждений','Прогулочная площадка 1 — посторонних предметов нет','Прогулочная площадка 2 — посторонних предметов нет','Хозяйственный двор — ворота закрыты','Запасный выход — свободен снаружи']
      :['Главный вход и турникеты — работают','Ворота въезда — закрыты','Ограждение по периметру — без повреждений','Спортплощадка — посторонних нет','Хозяйственный двор — ворота закрыты','Пожарный выход корпуса Б — свободен снаружи','Стоянка — посторонних машин нет']},
    {id:'R2',name:'Обход здания перед закрытием',times:['18:30'],points:['Окна первого этажа — закрыты','Запасные выходы — закрыты изнутри, не заблокированы','Санузлы — нет людей, вода закрыта','Актовый и спортивный залы — нет людей','Кабинеты — свет выключен','Щитовая — заперта, опломбирована']},
  ];
}

/* ---------- фикстура ---------- */
function buildDB(pid){
  const P=PROFILES[pid], groups=groupsFor(pid), kids=[], staff=[];
  let n=0;
  groups.forEach((g,gi)=>{
    const rr=mulberry(P.seed*1000+gi*37);
    const tf=FN[Math.floor(rr()*FN.length)], tp=PM[Math.floor(rr()*PM.length)];
    g.resp=g.id===P.teacher.grp?P.teacher.short:`${SUR[(gi*7+3)%SUR.length]}а ${ini(tf,tp)}`;
    g.room=pid==='kinder'?`Групповая ${gi+1}`:`каб. ${g.b.includes('Б')||g.b.includes('мастер')?'Б':'А'}-${1+Math.floor(gi/8)}${pad(gi%8+2)}`;
    const size=pid==='kinder'?18+Math.floor(rr()*6):pid==='college'?20+Math.floor(rr()*6):22+Math.floor(rr()*7);
    for(let i=0;i<size;i++) kids.push(mkKid(P,g,gi,i,++n));
  });
  let sn=0;
  P.staff.forEach(([cat,cnt])=>{for(let i=0;i<cnt;i++){const r=mulberry(P.seed*77+sn*13);const fem=r()<(cat==='Охрана'?.1:.78);const s=SUR[Math.floor(r()*SUR.length)],f=(fem?FN:MN)[Math.floor(r()*20)],p=PM[Math.floor(r()*PM.length)];
    const st={id:'S'+(++sn),fio:`${s}${fem?'а':''} ${f} ${fem?pf(p):p}`,short:`${s}${fem?'а':''} ${ini(f,p)}`,cat,card:`01 ${pad(40+sn)} ${300+sn*7}`,cardSt:'active',inT:new Date(+at(7,0)+r()*95*6e4),st:r()<.9?'in':'out'};
    if(cat==='Охрана'&&i===0){st.fio=ROLES.guard.fio;st.short=ROLES.guard.short;st.st='in'}
    staff.push(st)}});
  const T=(h,m)=>at(h,m);
  const visitors=[
    {id:'V1',fio:'Белова Наталья Игоревна',doc:'Паспорт •••• 4417',to:`${P.teacher.short} (${P.teacher.grp})`,why:'Встреча с ответственным группы',inT:T(10,12),outT:null},
    {id:'V2',fio:'Тихонов Роман Олегович',doc:'Паспорт •••• 0938',to:'Завхоз',why:'Доставка учебников',inT:T(10,31),outT:null},
    {id:'V3',fio:'Гаврилов Олег Петрович',doc:'Паспорт •••• 7710',to:'Заместитель директора',why:'Поставка мебели',inT:T(9,50),outT:T(10,28)},
  ];
  const contractors=[{id:'C1',fio:'Лаптев Дмитрий Сергеевич',org:'ООО «Телеком-Сервис»',why:'Заявка З-118 · ремонт камеры',inT:T(10,20),outT:null}];
  const cams=camsFor(pid), fcam=cams.find(c=>c.fault);
  const sys=[
    {id:'video',name:'Видеонаблюдение',total:cams.length*3,faults:[{dev:`Камера «${fcam.name}»`,zone:fcam.b,since:'07:12',what:'Нет сигнала',ticket:'З-118'}]},
    {id:'acs',name:'СКУД',total:14,faults:[]},
    {id:'sec',name:'Охранная сигнализация',total:96,faults:[]},
    {id:'fire',name:'Пожарная сигнализация (СПС)',total:212,faults:[{dev:'Извещатель ДИП-34 · шлейф 2.07',zone:'2 эт., помещение 207',since:'вчера 14:02',what:'Загрязнение дымовой камеры',ticket:'З-117'}]},
    {id:'kts',name:'Тревожная кнопка и КТС',total:9,faults:[]},
    {id:'soue',name:'Речевое оповещение (СОУЭ)',total:24,faults:[]},
    {id:'sens',name:'Датчики дыма и аэрозолей (санузлы)',total:12,ext:true,faults:[{dev:'Датчик С-2.3',zone:'2 эт., санузел',since:'08:05',what:'Нет связи',ticket:null}]},
  ];
  const tickets=[
    {id:'З-118',sys:'video',dev:sys[0].faults[0].dev,org:'ООО «Телеком-Сервис»',created:T(7,15),st:'created'},
    {id:'З-117',sys:'fire',dev:'Извещатель ДИП-34 · шлейф 2.07',org:'ООО «Пожтехника»',created:at(14,10,0,1),st:'created'},
    {id:'З-114',sys:'video',dev:'Камера «Холл 1 эт.»',org:'ООО «Телеком-Сервис»',created:at(16,40,0,1),st:'auto',fixedAt:T(9,12)},
    {id:'З-109',sys:'kts',dev:'КТС · пост охраны 2',org:'ЧОО «Щит»',created:at(9,0,0,6),st:'confirmed',fixedAt:at(15,0,0,6)},
  ];
  const zones=pid==='kinder'?[['Пищеблок · раздача',0,12],['Музыкальный зал',18,60],['Раздевалка ясельной группы',9,12],['Лестница · 2 эт.',2,20]]
    :[['Столовая',182,240],['Гардероб 1 эт.',414,450],['Актовый зал',0,320],['Лестница корпуса Б',12,40]];
  return {P,groups,kids,staff,visitors,contractors,cams,sys,tickets,zones,events:mkEvents(P,kids,cams),passes:mkPasses(kids)};
}
function mkKid(P,g,gi,i,n){
  const r=mulberry(P.seed*100000+gi*997+i*31), m=r()<.5;
  const s=SUR[Math.floor(r()*SUR.length)], f=(m?MN:FN)[Math.floor(r()*20)], p=PM[Math.floor(r()*PM.length)];
  const pmF=FN[Math.floor(r()*20)], pmP=PM[Math.floor(r()*PM.length)], dadF=MN[Math.floor(r()*20)];
  const parent={fio:`${s}а ${pmF} ${pf(pmP)}`,short:`${s}а ${ini(pmF,pmP)}`,rel:'мама',phone:`+7 9${Math.floor(r()*90+10)} •••-••-${pad(Math.floor(r()*100))}`,max:r()<.88,photo:null};
  const k={id:'K'+n,n,fio:`${s}${m?'':'а'} ${f} ${m?p:pf(p)}`,short:`${s}${m?'':'а'} ${f}`,g:g.id,b:g.b,m,card:`00 ${pad(10+gi)} ${String(1000+n*13).slice(-4)}`,cardSt:'active',parent,parents:[parent],trusted:[],day:null,hist:{}};
  if(P.handover){
    k.trusted=[{fio:parent.fio,rel:'мама',until:'бессрочно',c:'c2'},{fio:`${s} ${dadF} ${PM[Math.floor(r()*10)]}`,rel:'папа',until:'бессрочно',c:'c4'}];
    if(r()<.7) k.trusted.push({fio:`${SUR[Math.floor(r()*SUR.length)]}а ${FN[Math.floor(r()*20)]} ${pf(PM[Math.floor(r()*10)])}`,rel:'бабушка',until:'31.05.2027',c:'c1'});
    if(r()<.25) k.trusted.push({fio:`${SUR[Math.floor(r()*SUR.length)]}а ${FN[Math.floor(r()*20)]} ${pf(PM[Math.floor(r()*10)])}`,rel:'няня',until:'31.10.2026',exp:true,c:'c3'});
  }
  k.day=genToday(P,k,r,g.id===P.sick);
  return k;
}
function genToday(P,k,r,sickGrp){
  const ru=P.rules, ent=ENTRY[P.id][k.b], d={st:'in',inT:null,outT:null,late:false,early:false,released:false,reason:null,reasonBy:null,check:null,passes:[],max:[],handed:null,brought:null,forgot:false};
  if(r()<(sickGrp?.34:.1)){
    d.st='absent'; const x=r();
    d.reason=sickGrp&&x<.8?'болезнь':x<.42?'болезнь':x<.56?'семейные обстоятельства':x<.64?'мероприятие вне здания':null;
    d.reasonBy=d.reason?(r()<.6&&P.parents?'parent':'resp'):null;
    if(P.parents&&k.parent.max) d.max.push({t:at(...ru.miss),k:'miss',reply:d.reasonBy==='parent'?(d.reason==='болезнь'?'болеет':'по семейным обстоятельствам'):null});
    return d;
  }
  const late=r()<.07;
  d.inT=late?new Date(+at(...ru.late)+(1+r()*50)*6e4):new Date(+at(...ru.from)+r()*((ru.to[0]-ru.from[0])*60+ru.to[1]-ru.from[1]-1)*6e4);
  d.late=late; d.passes.push({t:d.inT,dir:'in',pt:ent});
  if(P.parents&&k.parent.max) d.max.push({t:d.inT,k:'in'});
  if(P.handover) d.brought={by:k.trusted[r()<.6?0:1]?.rel||'мама',t:d.inT};
  const x=r();
  if(x<.03&&!P.handover){d.st='left';d.early=true;d.outT=new Date(+at(9,50)+r()*38*6e4);d.released=r()<.5;d.passes.push({t:d.outT,dir:'out',pt:ent});if(P.parents&&k.parent.max) d.max.push({t:d.outT,k:'early'})}
  else if(x<.05&&!P.handover){d.st='out_tmp';d.outT=new Date(+at(10,18)+r()*15*6e4);d.passes.push({t:d.outT,dir:'out',pt:ent})}
  else if(x<.068&&!P.handover){d.st='check';d.check='first_out';d.passes=[{t:d.inT,dir:'out',pt:ent}];d.inT=null;d.max=[]}
  return d;
}
function genPast(P,k,off){
  const h=k.hist[off]; if(h) return h;
  const r=mulberry(k.n*97+off*1013+P.seed), sick=k.g===P.sick&&off<=2;
  const d={st:'left',inT:null,outT:null,late:false,early:false,reason:null,check:null,passes:[]};
  if(r()<(sick?.22:.08)){d.st='absent';const x=r();d.reason=x<.5?'болезнь':x<.65?'семейные обстоятельства':x<.75?'мероприятие вне здания':null}
  else{const day=at(0,0,0,off);d.inT=new Date(+day+((P.rules.from[0]*60+P.rules.from[1])+r()*62)*6e4);d.late=r()<.06;if(d.late)d.inT=new Date(+day+((P.rules.late[0]*60+P.rules.late[1])+5+r()*40)*6e4);d.outT=new Date(+day+(13*60+30+r()*200)*6e4)}
  return k.hist[off]=d;
}
/* группы камер = здание → зона из модели объекта (SKD-OBJ-01/02) */
function camsFor(pid){
  const L=pid==='kinder'?[
    ['Калитка · главный вход','Территория','Вход / КПП',{fav:1,entry:1}],['Входная группа · холл','Этаж 1','Вход / КПП',{fav:1,entry:1}],['Коридор 1 эт.','Этаж 1','Коридоры',{}],['Коридор 2 эт.','Этаж 2','Коридоры',{fault:'Нет сигнала с 07:12'}],
    ['Музыкальный зал','Этаж 2','Залы',{}],['Пищеблок · раздача','Этаж 1','Пищеблок',{}],['Прогулочная площадка 1','Территория','Площадки',{fav:1}],['Прогулочная площадка 2','Территория','Площадки',{fav:1}],
    ['Периметр · забор север','Территория','Периметр',{}],['Запасный выход','Этаж 1','Выходы',{}],['Въезд · ворота','Территория','Периметр',{entry:1,srvi:1}]]
   :[['Главный вход · турникеты','A','Вход / КПП',{fav:1,entry:1}],['Главный вход · улица','A','Вход / КПП',{entry:1}],['Холл 1 эт.','A','Коридоры',{fav:1}],['Коридор 2 эт.','A','Коридоры',{}],['Коридор 3 эт.','A','Коридоры',{}],
    ['Столовая','A','Столовая',{fav:1}],['Гардероб 1 эт.','A','Гардероб',{}],['Актовый зал','A','Залы',{}],['Спортзал','A','Залы',{}],['Вход корпуса Б','B','Вход / КПП',{entry:1}],['Коридор 1 эт.','B','Коридоры',{}],
    ['Коридор 2 эт.','B','Коридоры',{fault:'Нет сигнала с 07:12'}],['Пожарный выход 1','B','Выходы',{}],['Двор · спортплощадка','Территория','Двор',{fav:1}],['Двор · игровая зона','Территория','Двор',{}],['Въезд · ворота','Территория','Периметр',{entry:1,srvi:1}]];
  const bn=pid==='college'?{A:'Учебный корпус',B:'Корпус мастерских'}:{A:'Корпус А',B:'Корпус Б'};
  return L.map(([name,b,z,o],i)=>({id:'c'+(i+1),name,b:bn[b]||b,z,...o}));
}
/* события: заголовок и описание — ключи каталога строк с параметрами (переводятся при выводе) */
function mkEvents(P,kids,cams){
  const C=n=>cams.find(c=>c.name.startsWith(n))||cams[0], T=(h,m,s=0)=>at(h,m,s), kinder=P.id==='kinder';
  const early=kids.find(k=>k.day.early&&!k.day.released), lateK=kids.filter(k=>k.day.late).length, noR=kids.filter(k=>k.day.st==='absent'&&!k.day.reason).length;
  const ev=(o,c)=>({cam:c?c.id:null,b:c?c.b:(o.b||'Объект'),z:c?c.z:(o.z||'—'),...o});
  const R=ROLES;
  const E=[
    ev({t:T(10,39,20),kind:'analytics',type:'fight',title:'Драка',desc:'Детектор агрессивного поведения · уверенность {p} %',dv:{p:87},sev:'high',status:'new'},C('Коридор 2')),
    ev({t:T(10,31,5),kind:'analytics',type:'tailgate',title:'Проход «за спиной» без пропуска',desc:'Два человека прошли по одному проходу',sev:'mid',status:'new'},C(kinder?'Калитка':'Главный вход · тур')),
    early&&ev({t:early.day.outT,kind:'presence',type:'early',title:'Ушёл раньше расписания без отметки «отпущен»',desc:'{who}, {g} · уведомлены ответственный и родитель',dv:{who:early.short,g:early.g},person:early.id,sev:'mid',status:'new'},C(kinder?'Калитка':'Главный вход · тур')),
    ev({t:T(10,12),kind:'presence',type:'capacity',title:'Заполненность зоны {z} — {p} %',tv:{z:kinder?'Раздевалка ясельной группы':'Гардероб 1 эт.',p:kinder?75:92},desc:'Порог 80 % — жёлтый, 100 % — тревога',sev:'low',status:'new'},C(kinder?'Коридор 1':'Гардероб')),
    ev({t:T(9,58),kind:'fault',type:'fault',title:'Нет сигнала: камера «{c}»',tv:{c:cams.find(c=>c.fault).name},desc:'Создана заявка {id}',dv:{id:'З-118'},sev:'low',status:'done',result:'confirmed',by:R.security.short},cams.find(c=>c.fault)),
    ev({t:T(9,40),kind:'analytics',type:'crowd',title:'Скопление людей',desc:'Более 60 человек в зоне',sev:'low',status:'done',result:'confirmed',comment:kinder?'Утренник, штатно':'Большая перемена, штатно',by:R.guard.short},C(kinder?'Музыкальный':'Столовая')),
    P.parents&&ev({t:at(...P.rules.miss),kind:'presence',type:'miss',title:'Не пришли без причины: {n}',tv:{n:noR},desc:'Родителям отправлены запросы в MAX',sev:'low',status:'done',result:'confirmed',by:'system'}),
    ev({t:T(8,47),kind:'alarm',type:'panic',title:'Кнопка о помощи',desc:'Нажата стационарная кнопка',sev:'high',status:'done',result:'false',comment:'Случайное нажатие, проверено дежурным',by:R.guard.short},C('Коридор 2')),
    ev({t:at(...P.rules.late),kind:'presence',type:'late',title:'Опоздания: {n}',tv:{n:lateK},desc:'Сводка по порогу опоздания',sev:'low',status:'done',result:'confirmed',by:'system'}),
    ev({t:T(8,14),kind:'alarm',type:'kts',title:'Тест КТС · пост охраны 1',desc:'Ежедневная проверка — подтверждена событием',sev:'low',status:'done',result:'drill',by:R.guard.short},C(kinder?'Входная':'Главный вход · тур')),
    ev({t:T(7,58),kind:'analytics',type:'object',title:'Оставленный предмет',desc:'Предмет без владельца дольше 120 с',sev:'mid',status:'done',result:'false',comment:'Рюкзак ученика, возвращён',by:R.guard.short},C(kinder?'Входная':'Холл')),
    ev({t:T(7,12),kind:'fault',type:'fault',title:'Неисправность: извещатель ДИП-34 · 2.07',desc:'Загрязнение дымовой камеры · заявка {id}',dv:{id:'З-117'},sev:'low',status:'done',result:'confirmed',by:R.security.short,b:kinder?'Этаж 2':'Корпус А',z:'Коридоры'}),
    ev({t:T(6,55),kind:'alarm',type:'arm',title:'Снятие с охраны',desc:'По расписанию режима «Учебный день»',sev:'low',status:'done',result:'confirmed',by:'system'}),
  ].filter(Boolean);
  return E.map((e,i)=>({id:'E'+(100-i),log:[{t:e.t,k:'created'}],step:0,ans:{},...e}));
}
function mkPasses(kids){const L=[];kids.forEach(k=>k.day.passes.forEach(p=>L.push({...p,who:k.id})));return L.sort((a,b)=>b.t-a.t).slice(0,40)}
function seedAudit(){S.audit=[];const P=db.P,G=ROLES.guard,D=ROLES.director,Q=ROLES.security,T=(h,m)=>at(h,m),sys={short:'Система',role:'Расписание'};
  [[T(6,55),sys,'Смена режима','Нерабочее время → Учебный день'],[T(7,52),G,'Вход в систему','Пост охраны 1'],[T(8,2),Q,'Вход в систему','ноутбук · каб. 105'],
   [T(8,14),G,'Журнал: проверка КТС','Тест КТС · пост охраны 1'],[T(8,40),Q,'Просмотр архива','Холл 1 эт. · 07:50–08:05'],[T(9,5),{short:P.teacher.short,role:P.resp},'Причина отсутствия','2'],
   [T(9,20),D,'Вход в систему','ноутбук · приёмная'],[T(9,31),Q,'Пропуск заблокирован',db.kids[3].short],[T(9,46),D,'Выгрузка','XLSX · '+db.groups[0].id],[T(10,12),G,'Регистрация посетителя','Белова Н. И.'],[T(10,20),G,'Регистрация подрядчика','Лаптев Д. С.'],[T(10,25),G,'Обход завершён','Обход территории · 10:00']]
  .forEach(([tt,u,a,o])=>aud(a,o,{t:tt,user:u}));
}
