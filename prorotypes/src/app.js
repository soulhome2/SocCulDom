/* SafeEducation prototype — fixture data + screens. Plain JS. ICONS injected by tools/build_prototype.py.
 * Источник истины — Specification/SafeEducation_Specification.md. Ссылки на требования — SKD-<модуль>-NN, EDU-NN, DOU. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[n]||''}</svg>`;
const pad=n=>String(n).padStart(2,'0');
const hm=d=>d?`${pad(d.getHours())}:${pad(d.getMinutes())}`:'—';
const hms=d=>`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const dm=d=>`${pad(d.getDate())}.${pad(d.getMonth()+1)}`;
const dmy=d=>`${dm(d)}.${d.getFullYear()}`;
const WD=['вс','пн','вт','ср','чт','пт','сб'];
const pct=(a,b)=>b?Math.round(a*100/b):0;
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<10||h>=20)?b:c};
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmtDur=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${pad(Math.floor(s/60))}:${pad(s%60)}`};

/* иконки, которые подставляются через переменные — перечислены, чтобы сборка их включила: ic('apps') ic('blocked') ic('book') ic('calendar') ic('checklist') ic('eye') ic('flame') ic('gear') ic('graph') ic('history') ic('home') ic('location') ic('log') ic('moon') ic('mortar-board') ic('package') ic('star') ic('star-fill') ic('stop') ic('video') */
/* ---------------- демо-время: сегодня, начало 10:40 ---------------- */
const BASE=new Date(); BASE.setHours(10,40,0,0); const START=Date.now();
let SKEW=0; const NOW=()=>new Date(+BASE+(Date.now()-START)+SKEW);
const at=(h,m,s=0,d=0)=>{const x=new Date(BASE);x.setDate(x.getDate()-d);x.setHours(h,m,s,0);return x};
const HOLIDAYS=['04.11','31.12','01.01','02.01','07.01','23.02','08.03','01.05','09.05','12.06'];
function schoolDays(n){const out=[];let x=new Date(BASE);for(let i=0;out.length<n&&i<40;i++){if(i>0)x.setDate(x.getDate()-1);const wd=x.getDay();if(i===0||(wd!==0&&wd!==6&&!HOLIDAYS.includes(dm(x))))out.push({off:Math.round((BASE-new Date(x.getFullYear(),x.getMonth(),x.getDate(),10,40))/864e5),d:new Date(x)})}return out}
const DAYS=schoolDays(10); // [0] — сегодня

/* ---------------- справочники имён ---------------- */
const SUR=['Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов','Новиков','Фёдоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Егоров','Павлов','Козлов','Степанов','Николаев','Орлов','Андреев','Макаров','Никитин','Захаров','Зайцев','Соловьёв','Борисов','Яковлев','Григорьев','Романов','Воробьёв','Сергеев','Кузьмин','Фролов','Александров','Дмитриев','Королёв','Гусев','Киселёв','Медведев','Тарасов','Белов','Комаров','Ершов','Широков'];
const MN=['Артём','Максим','Иван','Михаил','Дмитрий','Егор','Тимофей','Матвей','Кирилл','Никита','Лев','Марк','Даниил','Фёдор','Илья','Алексей','Роман','Глеб','Сергей','Платон'];
const FN=['Анна','Мария','София','Алиса','Виктория','Полина','Ева','Варвара','Ксения','Дарья','Вера','Василиса','Елизавета','Арина','Милана','Ульяна','Таисия','Екатерина','Ольга','Наталья'];
const PM=['Александрович','Сергеевич','Андреевич','Дмитриевич','Алексеевич','Игоревич','Михайлович','Владимирович','Олегович','Евгеньевич'];
const pf=p=>p.replace(/вич$/,'вна');
const ini=(f,p)=>`${f[0]}. ${p[0]}.`;

/* ---------------- профили (SKD-UI-04, раздел 7) ---------------- */
const PROFILES={
  school:{id:'school',name:'Школа',org:'МБОУ «Средняя общеобразовательная школа № 17»',kids:'Ученики',kidsGen:'учеников',kid:'Ученик',grp:'Класс',grpPl:'Классы',resp:'Классный руководитель',respShort:'кл. рук.',parents:true,handover:false,
    rules:{from:[7,30],to:[8,30],late:[8,30],miss:[9,0],end:'14:40'},teacher:{fio:'Смирнова Елена Андреевна',short:'Смирнова Е. А.',grp:'5Б'},sick:'3А',
    staff:[['Педагог',46],['Администрация',6],['Охрана',3],['Медработник',1],['Пищеблок',7],['Техперсонал',9]],seed:17},
  kinder:{id:'kinder',name:'Детский сад',org:'МБДОУ «Детский сад № 42 „Солнышко“»',kids:'Воспитанники',kidsGen:'воспитанников',kid:'Воспитанник',grp:'Группа',grpPl:'Группы',resp:'Воспитатель',respShort:'восп.',parents:true,handover:true,
    rules:{from:[7,0],to:[8,30],late:[8,30],miss:[9,0],end:'19:00'},teacher:{fio:'Павлова Ольга Николаевна',short:'Павлова О. Н.',grp:'Средняя «Пчёлки»'},sick:'Младшая «Ромашки»',
    staff:[['Воспитатель',18],['Помощник воспитателя',9],['Администрация',3],['Медработник',2],['Пищеблок',5],['Техперсонал',4],['Охрана',2]],seed:42},
  college:{id:'college',name:'Колледж',org:'ГБПОУ «Колледж связи № 3»',kids:'Студенты',kidsGen:'студентов',kid:'Студент',grp:'Группа',grpPl:'Группы',resp:'Куратор',respShort:'куратор',parents:false,handover:false,
    rules:{from:[8,0],to:[9,0],late:[9,0],miss:[9,30],end:'17:10'},teacher:{fio:'Орлов Виктор Сергеевич',short:'Орлов В. С.',grp:'ИС-21'},sick:'СС-21',
    staff:[['Преподаватель',58],['Мастер п/о',8],['Администрация',9],['Охрана',4],['Техперсонал',10]],seed:3},
};
function groupsFor(pid){
  if(pid==='school'){const g=[];for(let n=1;n<=11;n++)for(const l of (n<=7?['А','Б','В']:['А','Б']))g.push({id:n+l,b:n<=4?'Корпус Б':'Корпус А'});return g}
  if(pid==='kinder') return ['Ясли «Капельки»','Младшая «Ромашки»','Младшая «Колокольчики»','Средняя «Пчёлки»','Средняя «Солнышко»','Старшая «Звёздочки»','Старшая «Радуга»','Подготовительная «Почемучки»'].map((id,i)=>({id,b:i<4?'Этаж 1':'Этаж 2'}));
  return ['ИС-11','ИС-12','ИС-21','ИС-22','ИС-31','СС-11','СС-21','СС-31','ПК-11','ПК-21','ЭМ-11','ЭМ-21'].map(id=>({id,b:/^ПК|^ЭМ/.test(id)?'Корпус мастерских':'Учебный корпус'}));
}
const ENTRY={school:{'Корпус А':'Турникеты · главный вход','Корпус Б':'Турникет · вход корпуса Б'},kinder:{'Этаж 1':'Калитка · главный вход','Этаж 2':'Калитка · главный вход'},college:{'Учебный корпус':'Турникеты · главный вход','Корпус мастерских':'Турникет · мастерские'}};

/* ---------------- роли (раздел 9) ---------------- */
const ROLES={
  director:{role:'Директор',fio:'Морозова Татьяна Викторовна',short:'Морозова Т. В.',home:'home'},
  security:{role:'Зам. директора по безопасности',fio:'Кузнецов Андрей Павлович',short:'Кузнецов А. П.',home:'home',deny:['audit','settings']},
  guard:{role:'Пост охраны · смена 08:00–20:00',fio:'Петров Сергей Иванович',short:'Петров С. И.',home:'post',allow:['post','video','events','people','journals']},
  teacher:{role:'',fio:'',short:'',home:'attendance',allow:['attendance','rollcall','handover']},
};
const ROUTES=['home','post','video','attendance','handover','events','rollcall','people','journals','reports','service','settings','audit'];
const TITLES={home:'Главная',post:'Пост охраны',video:'Видеонаблюдение',attendance:'Посещаемость',handover:'Приём и выдача детей',events:'События',rollcall:'Перекличка',people:'Люди и пропуска',journals:'Журналы',reports:'Отчёты',service:'Обслуживание',settings:'Настройки',audit:'Аудит'};

/* ---------------- режимы объекта (SKD-MOD-01) ---------------- */
const MODES=[
  {id:'day',name:'Учебный день',cls:'m-ok',light:'ok',ic:'mortar-board',d:'По расписанию · будни 07:00–18:00'},
  {id:'night',name:'Нерабочее время',cls:'m-neutral',light:'off',ic:'moon',d:'Охрана включена, вход только по пропускам персонала'},
  {id:'holiday',name:'Каникулы',cls:'m-neutral',light:'off',ic:'calendar',d:'Посещаемость не считается, кружки по расписанию'},
  {id:'event',name:'Мероприятие',cls:'m-info',light:'ok',ic:'people',d:'Аналитика скоплений усилена, пост у выходов'},
  {id:'drill',name:'Учебная тревога',cls:'m-warn',light:'warn',ic:'stopwatch',d:'Учебная эвакуация с перекличкой и протоколом'},
  {id:'evac',name:'Эвакуация',cls:'m-danger',light:'alarm',ic:'flame',d:'Двери разблокированы, перекличка по группам'},
  {id:'lock',name:'ЧС (блокировка)',cls:'m-danger',light:'alarm',ic:'lock',d:'Внешние входы закрыты на вход, выходы свободны'},
];
const MBY=Object.fromEntries(MODES.map(m=>[m.id,m]));

/* ---------------- состояние ---------------- */
const S={profile:'school',role:'director',route:'home',ds:'data',offline:false,lastUpd:null,mode:'day',doors:'normal',alarm:{},
  evac:null,evacLast:null,lock:null,grid:4,camSel:null,camB:'',
  att:{tab:'sum',day:0,g:'',q:'',st:'',page:0},
  ev:{chips:{alarm:true,analytics:true,presence:true,fault:true,pass:false},st:'',q:'',limit:50},
  ppl:{tab:'holders',q:'',cat:'',st:'',page:0},aud:{q:'',user:'',page:0},
  ho:{g:''},rc:{g:''},
  sla:{video:24,fire:8,kts:4,other:24},
  notif:{in:true,out:true,miss:true,early:true,quiet:true},
  rules:null, drills:[], kts:null, temp:[], audit:[],
};
let db=null;

/* ---------------- фикстура ---------------- */
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
    {id:'V1',fio:'Белова Наталья Игоревна',doc:'Паспорт •••• 4417',to:`${P.teacher.short} (${P.respShort} ${P.teacher.grp})`,why:'Встреча с ответственным группы',inT:T(10,12),outT:null,photo:true},
    {id:'V2',fio:'Тихонов Роман Олегович',doc:'Паспорт •••• 0938',to:'Завхоз',why:'Доставка учебников',inT:T(10,31),outT:null,photo:true},
    {id:'V3',fio:'Гаврилов Олег Петрович',doc:'Паспорт •••• 7710',to:'Заместитель директора',why:'Поставка мебели',inT:T(9,50),outT:T(10,28),photo:true},
  ];
  const contractors=[{id:'C1',fio:'Лаптев Дмитрий Сергеевич',org:'ООО «Телеком-Сервис»',why:'Заявка З-118 · ремонт камеры',inT:T(10,20),outT:null}];
  const cams=camsFor(pid);
  const sys=[
    {id:'video',name:'Видеонаблюдение',total:cams.length*3,faults:[{dev:`Камера «${cams.find(c=>c.fault)?.name}»`,zone:cams.find(c=>c.fault)?.b+', 2 эт.',since:'07:12',what:'Нет сигнала',ticket:'З-118'}]},
    {id:'acs',name:'СКУД',total:14,faults:[]},
    {id:'sec',name:'Охранная сигнализация',total:96,faults:[]},
    {id:'fire',name:'Пожарная сигнализация (СПС)',total:212,faults:[{dev:'Извещатель ДИП-34 · шлейф 2.07',zone:'2 эт., помещение 207',since:'вчера 14:02',what:'Загрязнение дымовой камеры',ticket:'З-117'}]},
    {id:'kts',name:'Тревожная кнопка и КТС',total:9,faults:[]},
    {id:'soue',name:'Речевое оповещение (СОУЭ)',total:24,faults:[]},
    {id:'sens',name:'Датчики дыма и аэрозолей (санузлы)',total:12,ext:true,faults:[{dev:'Датчик С-2.3',zone:'2 эт., санузел',since:'08:05',what:'Нет связи',ticket:null}]},
  ];
  const tickets=[
    {id:'З-118',sys:'video',dev:sys[0].faults[0].dev,org:'ООО «Телеком-Сервис»',created:T(7,15),st:'created',hist:[['Создана',T(7,15),ROLES.security.short],['Инженер на объекте',T(10,20),'ООО «Телеком-Сервис»']]},
    {id:'З-117',sys:'fire',dev:'Извещатель ДИП-34 · шлейф 2.07',org:'ООО «Пожтехника»',created:new Date(+at(14,10,0,1)),st:'created',hist:[['Создана',new Date(+at(14,10,0,1)),ROLES.security.short]]},
    {id:'З-114',sys:'video',dev:'Камера «Холл 1 эт.»',org:'ООО «Телеком-Сервис»',created:new Date(+at(16,40,0,1)),st:'auto',fixedAt:T(9,12),hist:[['Создана',new Date(+at(16,40,0,1)),ROLES.security.short],['Устранена автоматически — устройство в норме',T(9,12),'Интеллект X']]},
    {id:'З-109',sys:'kts',dev:'КТС · пост охраны 2',org:'ЧОО «Щит»',created:new Date(+at(9,0,0,6)),st:'confirmed',fixedAt:new Date(+at(15,0,0,6)),hist:[['Создана',new Date(+at(9,0,0,6)),ROLES.security.short],['Устранена',new Date(+at(15,0,0,6)),'ЧОО «Щит»'],['Подтверждена',new Date(+at(15,30,0,6)),ROLES.director.short]]},
  ];
  const zones=pid==='kinder'?[['Пищеблок · раздача',0,12],['Музыкальный зал',18,60],['Раздевалка ясельной группы',9,12],['Лестница · 2 эт.',2,20]]
    :[['Столовая',182,240],['Гардероб 1 эт.',414,450],['Актовый зал',0,320],['Лестница корпуса Б',12,40]];
  return {P,groups,kids,staff,visitors,contractors,cams,sys,tickets,zones,events:mkEvents(P,kids,cams),passes:mkPasses(kids)};
}
function mkKid(P,g,gi,i,n){
  const r=mulberry(P.seed*100000+gi*997+i*31), m=r()<.5;
  const s=SUR[Math.floor(r()*SUR.length)], f=(m?MN:FN)[Math.floor(r()*20)], p=PM[Math.floor(r()*PM.length)];
  const fio=`${s}${m?'':'а'} ${f} ${m?p:pf(p)}`;
  const pmF=FN[Math.floor(r()*20)], pmP=PM[Math.floor(r()*PM.length)], dadF=MN[Math.floor(r()*20)];
  const parent={fio:`${s}а ${pmF} ${pf(pmP)}`,short:`${s}а ${ini(pmF,pmP)}`,phone:`+7 9${Math.floor(r()*90+10)} •••-••-${pad(Math.floor(r()*100))}`,max:r()<.88};
  const k={id:'K'+n,n,fio,short:`${s}${m?'':'а'} ${f}`,g:g.id,b:g.b,m,card:`00 ${pad(10+gi)} ${String(1000+n*13).slice(-4)}`,cardSt:'active',parent,trusted:[],day:null,hist:{}};
  if(P.handover){
    k.trusted=[{fio:parent.fio,rel:'мама',until:'бессрочно',c:'c2'},{fio:`${s} ${dadF} ${PM[Math.floor(r()*10)]}`,rel:'папа',until:'бессрочно',c:'c4'}];
    if(r()<.7) k.trusted.push({fio:`${SUR[Math.floor(r()*SUR.length)]}а ${FN[Math.floor(r()*20)]} ${pf(PM[Math.floor(r()*10)])}`,rel:'бабушка',until:'31.05.2027',c:'c1'});
    if(r()<.25) k.trusted.push({fio:`${SUR[Math.floor(r()*SUR.length)]}а ${FN[Math.floor(r()*20)]} ${pf(PM[Math.floor(r()*10)])}`,rel:'няня',until:'31.10.2026',exp:true,c:'c3'});
  }
  k.day=genToday(P,k,r,g.id===P.sick);
  return k;
}
const R=P=>PROFILES[P.id||P].rules;
function genToday(P,k,r,sickGrp){
  const ru=P.rules, ent=ENTRY[P.id][k.b], d={st:'in',inT:null,outT:null,late:false,early:false,released:false,reason:null,reasonBy:null,check:null,passes:[],max:[],handed:null,brought:null,forgot:false};
  const pAbs=sickGrp?.34:.1;
  if(r()<pAbs){
    d.st='absent'; const x=r();
    d.reason=sickGrp&&x<.8?'болезнь':x<.42?'болезнь':x<.56?'семейные обстоятельства':x<.64?'мероприятие вне здания':null;
    d.reasonBy=d.reason?(r()<.6&&P.parents?'родитель':'ответственный группы'):null;
    if(P.parents&&k.parent.max){d.max.push({t:at(...ru.miss),text:`${k.short} не пришёл${k.m?'':'а'} к ${ru.miss[0]}:${pad(ru.miss[1])}. Укажите причину отсутствия.`,st:'прочитано',reply:d.reasonBy==='родитель'?(d.reason==='болезнь'?'болеет':'по семейным обстоятельствам'):null})}
    return d;
  }
  const late=r()<.07;
  d.inT=late?new Date(+at(...ru.late)+(1+r()*50)*6e4):new Date(+at(...ru.from)+r()*((ru.to[0]-ru.from[0])*60+ru.to[1]-ru.from[1]-1)*6e4);
  d.late=late; d.passes.push({t:d.inT,dir:'in',pt:ent});
  if(P.parents&&k.parent.max) d.max.push({t:d.inT,text:`${k.short} пришёл${k.m?'':'а'} в ${hm(d.inT)}`,st:'доставлено'});
  if(P.handover) d.brought={by:k.trusted[r()<.6?0:1]?.rel||'мама',t:d.inT};
  const x=r();
  if(x<.03&&!P.handover){d.st='left';d.early=true;d.outT=new Date(+at(9,50)+r()*38*6e4);d.released=r()<.5;d.passes.push({t:d.outT,dir:'out',pt:ent});
    if(P.parents&&k.parent.max) d.max.push({t:d.outT,text:`${k.short} ушёл${k.m?'':'а'} раньше расписания в ${hm(d.outT)}`,st:'доставлено'})}
  else if(x<.05&&!P.handover){d.st='out_tmp';d.outT=new Date(+at(10,18)+r()*15*6e4);d.passes.push({t:d.outT,dir:'out',pt:ent})}
  else if(x<.068&&!P.handover){d.st='check';d.check='Первый проход за день — «выход»: вероятно, прошёл за другим или забыл пропуск';d.passes=[{t:d.inT,dir:'out',pt:ent}];d.inT=null;d.max=[]}
  return d;
}
function genPast(P,k,off){
  const h=k.hist[off]; if(h) return h;
  const r=mulberry(k.n*97+off*1013+P.seed), sick=k.g===P.sick&&off<=2;
  const d={st:'left',inT:null,outT:null,late:false,early:false,reason:null,check:null,passes:[]};
  if(r()<(sick?.22:.08)){d.st='absent';const x=r();d.reason=x<.5?'болезнь':x<.65?'семейные обстоятельства':x<.75?'мероприятие вне здания':null}
  else{const day=new Date(+at(0,0,0,off));d.inT=new Date(+day+((P.rules.from[0]*60+P.rules.from[1])+r()*62)*6e4);d.late=r()<.06;if(d.late)d.inT=new Date(+day+((P.rules.late[0]*60+P.rules.late[1])+5+r()*40)*6e4);d.outT=new Date(+day+(13*60+30+r()*200)*6e4)}
  return k.hist[off]=d;
}
function camsFor(pid){
  const L=pid==='kinder'?[
    ['Калитка · главный вход','Территория','Вход / КПП',{fav:1,entry:1}],['Входная группа · холл','Этаж 1','Вход / КПП',{fav:1,entry:1}],['Коридор 1 эт.','Этаж 1','Коридор',{}],['Коридор 2 эт.','Этаж 2','Коридор',{fault:'Нет сигнала с 07:12'}],
    ['Музыкальный зал','Этаж 2','Зал',{}],['Пищеблок · раздача','Этаж 1','Пищеблок',{}],['Прогулочная площадка 1','Территория','Двор и периметр',{fav:1}],['Прогулочная площадка 2','Территория','Двор и периметр',{fav:1}],
    ['Периметр · забор север','Территория','Двор и периметр',{}],['Запасный выход','Этаж 1','Выход',{}],['Въезд · ворота','Территория','Двор и периметр',{entry:1,srvi:1}]]
   :[['Главный вход · турникеты','A','Вход / КПП',{fav:1,entry:1}],['Главный вход · улица','A','Вход / КПП',{entry:1}],['Холл 1 эт.','A','Коридор',{fav:1}],['Коридор 2 эт.','A','Коридор',{}],['Коридор 3 эт.','A','Коридор',{}],
    ['Столовая','A','Столовая',{fav:1}],['Гардероб 1 эт.','A','Гардероб',{}],['Актовый зал','A','Зал',{}],['Спортзал','A','Зал',{}],['Вход корпуса Б','B','Вход / КПП',{entry:1}],['Коридор 1 эт.','B','Коридор',{}],
    ['Коридор 2 эт.','B','Коридор',{fault:'Нет сигнала с 07:12'}],['Пожарный выход 1','B','Выход',{}],['Двор · спортплощадка','Территория','Двор и периметр',{fav:1}],['Двор · игровая зона','Территория','Двор и периметр',{}],['Въезд · ворота','Территория','Двор и периметр',{entry:1,srvi:1}]];
  const bn=pid==='college'?{A:'Учебный корпус',B:'Корпус мастерских'}:{A:'Корпус А',B:'Корпус Б'};
  return L.map(([name,b,z,o],i)=>({id:'c'+(i+1),name,b:bn[b]||b,z,...o}));
}
function mkEvents(P,kids,cams){
  const C=n=>cams.find(c=>c.name.startsWith(n))?.id||cams[0].id, T=(h,m,s=0)=>at(h,m,s);
  const early=kids.find(k=>k.day.early&&!k.day.released), lateK=kids.filter(k=>k.day.late).length, noR=kids.filter(k=>k.day.st==='absent'&&!k.day.reason).length;
  const kinder=P.id==='kinder';
  const E=[
    {t:T(10,39,20),kind:'analytics',type:'fight',title:'Драка',zone:kinder?'Этаж 2 · коридор':'Корпус А · коридор 2 эт.',cam:C('Коридор 2'),desc:'Детектор агрессивного поведения · уверенность 87 %',sev:'high',status:'new'},
    {t:T(10,31,5),kind:'analytics',type:'tailgate',title:'Проход «за спиной» без пропуска',zone:kinder?'Калитка · главный вход':'Главный вход · турникеты',cam:C(kinder?'Калитка':'Главный вход · тур'),desc:'Два человека прошли по одному проходу (EDU-03)',sev:'mid',status:'new'},
    early&&{t:early.day.outT,kind:'presence',type:'early',title:`Ушёл раньше расписания без отметки «отпущен»`,zone:ENTRY[P.id][early.b],cam:C('Главный вход · тур'),desc:`${early.short}, ${early.g} · уведомлены ${P.respShort} и родитель (EDU-05)`,person:early.id,sev:'mid',status:'new'},
    {t:T(10,12),kind:'presence',type:'capacity',title:kinder?'Заполненность: раздевалка ясельной группы — 75 %':'Заполненность: гардероб 1 эт. — 92 %',zone:kinder?'Этаж 1':'Корпус А · гардероб',cam:C(kinder?'Коридор 1':'Гардероб'),desc:'Порог 80 % — жёлтый, 100 % — тревога (SKD-PRS-09)',sev:'low',status:'new'},
    {t:T(9,58),kind:'fault',type:'fault',title:`Нет сигнала: камера «${cams.find(c=>c.fault).name}»`,zone:cams.find(c=>c.fault).b,cam:null,desc:'Создана заявка З-118 · ООО «Телеком-Сервис»',sev:'low',status:'done',result:'подтверждено',by:ROLES.security.short},
    {t:T(9,40),kind:'analytics',type:'crowd',title:'Скопление людей',zone:kinder?'Музыкальный зал':'Столовая',cam:C(kinder?'Музыкальный':'Столовая'),desc:'Более 60 человек в зоне',sev:'low',status:'done',result:'подтверждено',comment:kinder?'Утренник, штатно':'Большая перемена, штатно',by:ROLES.guard.short},
    P.parents&&{t:at(...P.rules.miss),kind:'presence',type:'miss',title:`Не пришли без причины: ${noR}`,zone:'Объект',cam:null,desc:`Родителям отправлены запросы в MAX · ${P.respShort} — список`,sev:'low',status:'done',result:'подтверждено',by:'Система'},
    {t:T(8,47),kind:'alarm',type:'panic',title:'Кнопка о помощи',zone:kinder?'Групповая 3':'Корпус А · кабинет 214',cam:C('Коридор 2'),desc:'Нажата стационарная кнопка',sev:'high',status:'done',result:'ложное',comment:'Случайное нажатие, проверено дежурным',by:ROLES.guard.short},
    {t:at(...P.rules.late),kind:'presence',type:'late',title:`Опоздания: ${lateK}`,zone:'Объект',cam:null,desc:'Сводка по порогу опоздания',sev:'low',status:'done',result:'подтверждено',by:'Система'},
    {t:T(8,14),kind:'alarm',type:'kts',title:'Тест КТС · пост охраны 1',zone:'Пост охраны',cam:C(kinder?'Входная':'Главный вход · тур'),desc:'Ежедневная проверка — подтверждена событием (SKD-REG-02)',sev:'low',status:'done',result:'учебное',by:ROLES.guard.short},
    {t:T(7,58),kind:'analytics',type:'object',title:'Оставленный предмет',zone:kinder?'Входная группа · холл':'Холл 1 эт.',cam:C(kinder?'Входная':'Холл'),desc:'Предмет без владельца дольше 120 с',sev:'mid',status:'done',result:'ложное',comment:'Рюкзак ученика, возвращён',by:ROLES.guard.short},
    {t:T(7,12),kind:'fault',type:'fault',title:'Неисправность: извещатель ДИП-34 · 2.07',zone:'2 эт., помещение 207',cam:null,desc:'Загрязнение дымовой камеры · заявка З-117',sev:'low',status:'done',result:'подтверждено',by:ROLES.security.short},
    {t:T(6,55),kind:'alarm',type:'arm',title:'Снятие с охраны',zone:'Объект',cam:null,desc:'По расписанию режима «Учебный день»',sev:'low',status:'done',result:'подтверждено',by:'Система'},
  ].filter(Boolean);
  return E.map((e,i)=>({id:'E'+(100-i),...e}));
}
function mkPasses(kids){const L=[];kids.forEach(k=>k.day.passes.forEach(p=>L.push({...p,who:k.id})));return L.sort((a,b)=>b.t-a.t).slice(0,40)}

/* ---------------- аудит (SKD-AUD-01): только добавление, цепочка хешей ---------------- */
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
function aud(action,obj='',o={}){const prev=S.audit[0]?.h||'00000000';const u=o.user||user();const e={t:o.t||NOW(),user:u.short,role:u.role,action,obj,prev};e.h=fnv(prev+e.t.toISOString()+e.user+action+obj);S.audit.unshift(e);return e}
function verifyChain(){for(let i=S.audit.length-1;i>=0;i--){const e=S.audit[i],prev=S.audit[i+1]?.h||'00000000';if(e.prev!==prev||e.h!==fnv(prev+e.t.toISOString()+e.user+e.action+e.obj))return i}return -1}
function seedAudit(){S.audit=[];const P=db.P,G=ROLES.guard,D=ROLES.director,Q=ROLES.security,T=(h,m)=>at(h,m);
  [[T(6,55),{short:'Система',role:'Расписание'},'Режим: Нерабочее время → Учебный день','по расписанию'],[T(7,52),G,'Вход в систему','Пост охраны 1'],[T(8,2),Q,'Вход в систему','ноутбук · каб. 105'],
   [T(8,14),G,'Журнал: проверка КТС','подтверждено событием «Тест КТС · пост охраны 1»'],[T(8,40),Q,'Просмотр архива','камера «Холл 1 эт.» 07:50–08:05'],[T(9,5),{short:P.teacher.short,role:P.resp},'Причина отсутствия','указана для 2 '+P.kidsGen],
   [T(9,20),D,'Вход в систему','ноутбук · приёмная'],[T(9,31),Q,'Пропуск заблокирован','утерян · '+db.kids[3].short],[T(9,46),D,'Выгрузка XLSX','Табель посещаемости · '+db.groups[0].id],[T(10,12),G,'Регистрация посетителя','Белова Н. И.'],[T(10,20),G,'Регистрация подрядчика','Лаптев Д. С. · ООО «Телеком-Сервис»']]
  .forEach(([t,u,a,o])=>aud(a,o,{t,user:u}));
}

/* ---------------- выборки ---------------- */
const P=()=>db.P;
function user(){const r=ROLES[S.role];if(S.role==='teacher')return {short:P().teacher.short,fio:P().teacher.fio,role:`${P().resp} · ${P().teacher.grp}`};return r}
function allowed(route){const r=ROLES[S.role];if(route==='handover'&&!P().handover)return false;if(r.allow)return r.allow.includes(route);if(r.deny)return !r.deny.includes(route);return true}
const isTeacher=()=>S.role==='teacher';
function visKids(){return isTeacher()?db.kids.filter(k=>k.g===P().teacher.grp):db.kids}
const KBY=id=>db.kids.find(k=>k.id===id);
function stats(kids){const list=kids.length, abs=kids.filter(k=>k.day.st==='absent'), came=list-abs.length;
  return {list,came,absent:abs.length,reasonOk:abs.filter(k=>k.day.reason).length,noReason:abs.filter(k=>!k.day.reason).length,late:kids.filter(k=>k.day.late).length,early:kids.filter(k=>k.day.early).length,check:kids.filter(k=>k.day.st==='check').length,inNow:kids.filter(k=>k.day.st==='in').length,handed:kids.filter(k=>k.day.handed).length}}
function inBuilding(){const kids=db.kids.filter(k=>k.day.st==='in'&&!k.day.handed).length, staff=db.staff.filter(s=>s.st==='in').length, vis=db.visitors.filter(v=>!v.outT).length, con=db.contractors.filter(c=>!c.outT).length;return {kids,staff,vis,con,total:kids+staff+vis+con}}
function sysState(s){if(S.alarm[s.id])return 'alarm';return s.faults.length?'warn':'ok'}
const pastMiss=()=>NOW()>=at(...P().rules.miss);
function stBadge(k,d=k.day){
  if(d.handed) return `<span class="badge badge-neutral">${ic('check')}Выдан · ${esc(d.handed.rel)} ${hm(d.handed.t)}</span>`;
  if(d.st==='absent'){if(d.reason) return `<span class="badge badge-neutral">${ic('dash')}Отсутствует · ${esc(d.reason)}</span>`;return pastMiss()||d!==k.day?`<span class="badge badge-danger">${ic('x')}Пропуск без причины</span>`:`<span class="badge badge-warning">${ic('clock')}Ещё не пришёл</span>`}
  return {in:`<span class="badge badge-success">${ic('check')}${P().handover?'В группе':'В здании'}</span>`,out_tmp:`<span class="badge badge-info">${ic('sign-out')}Вышел временно</span>`,left:`<span class="badge badge-neutral">${ic('sign-out')}Ушёл</span>`,check:`<span class="badge badge-warning">${ic('question')}Требует проверки</span>`}[d.st]||'';
}
function flags(d){const f=[];if(d.late)f.push('<span class="tag">Опоздал</span>');if(d.early)f.push(`<span class="tag" style="${d.released?'':'color:var(--one-danger-text);background:var(--one-danger-bg)'}">Ушёл раньше${d.released?' · отпущен':''}</span>`);if(d.forgot)f.push('<span class="tag">Забыл пропуск</span>');return f.join(' ')}
function lastPlace(k){const p=k.day.passes[k.day.passes.length-1];const g=db.groups.find(x=>x.id===k.g);return p?`${p.dir==='in'?'Вход':'Выход'} ${hm(p.t)} · ${p.pt}; по расписанию — ${g.room}`:`по расписанию — ${g.room}`}

/* ---------------- отрисовка: общие куски ---------------- */
function scene(c,o={}){
  const h=[...(c.id+c.name)].reduce((a,ch)=>(a*31+ch.charCodeAt(0))%100003,7), r=mulberry(h), yard=/Двор|Территория|площадка|Периметр|Калитка|Въезд/.test(c.z+c.name+c.b);
  const n=o.crowd?10:o.few?2:2+Math.floor(r()*4);
  const ppl=Array.from({length:n},()=>{const y=128+r()*80,x=30+r()*340,s=.55+(y-128)/80*.7;return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><circle cy="-36" r="7"/><rect x="-9" y="-28" width="18" height="30" rx="7"/></g>`}).join('');
  return `<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
   <rect width="400" height="225" style="fill:var(--one-surface-subtle)"/>
   ${yard?`<rect y="0" width="400" height="95" style="fill:var(--one-surface-muted)"/><rect x="${40+r()*80|0}" y="40" width="120" height="55" style="fill:var(--one-surface)"/><line x1="0" y1="95" x2="400" y2="95" style="stroke:var(--one-border)"/>`
     :`<polygon points="0,225 400,225 285,105 115,105" style="fill:var(--one-surface-muted)"/><rect x="115" y="38" width="170" height="67" style="fill:var(--one-surface)"/>
       <g style="stroke:var(--one-border);stroke-width:1.5;fill:none"><line x1="0" y1="0" x2="115" y2="38"/><line x1="400" y1="0" x2="285" y2="38"/><line x1="0" y1="225" x2="115" y2="105"/><line x1="400" y1="225" x2="285" y2="105"/>
       <rect x="30" y="${50+r()*20|0}" width="34" height="${90+r()*20|0}"/><rect x="336" y="${50+r()*20|0}" width="34" height="${90+r()*20|0}"/></g>`}
   <g style="fill:var(--one-fg-subtle);opacity:.6">${ppl}</g></svg>`;
}
function camTile(c,o={}){
  const na=c.srvi, off=c.fault&&c.fault.startsWith('Нет сигнала');
  return `<div class="cam" role="button" tabindex="0" data-act="cam-open" data-id="${c.id}" aria-label="Камера ${esc(c.name)}">${na||off?'':scene(c)}
   <span class="cam-l"><span class="live ${na||off?'off':''}"></span>${esc(c.name)}</span>
   ${o.fav?`<button class="cam-fav" data-act="fav" data-id="${c.id}" aria-pressed="${!!c.fav}" aria-label="${c.fav?'Убрать из избранного':'В избранное'}">${ic(c.fav?'star-fill':'star')}</button>`:''}
   ${na?`<div class="na">${ic('eye-closed','ic-24')}<span>Камера недоступна</span></div>`:off?`<div class="na">${ic('alert','ic-24 t-warning')}<span>${esc(c.fault)}</span><span class="cap">заявка на обслуживание создана</span></div>`:`<span class="cam-meta">${esc(c.b)} · <span data-clock>${hms(NOW())}</span></span>`}</div>`;
}
const KIC={alarm:'bell',analytics:'eye',presence:'person',fault:'tools',pass:'sign-in'}, TIC={fight:'alert',fire:'flame',kts:'shield',panic:'bell',tailgate:'people',capacity:'people',early:'sign-out',miss:'person',late:'clock',dontknow:'question',stop:'no-entry',lock:'lock',drill:'stopwatch',crowd:'people',object:'package',arm:'shield-check',fault:'tools'};
const KNAME={alarm:'Тревоги',analytics:'Аналитика',presence:'Присутствие',fault:'Неисправности',pass:'Проходы СКУД'};
const ESC_AFTER=60000; // SKD-EVT-03: [60] с
function evStatus(e){
  if(e.status==='done') return `<span class="badge badge-neutral">${esc(e.result||'обработано')}</span>`;
  const late=e.sev==='high'&&!e.esc?`<span class="timer" data-t0="${+e.t}">${fmtDur(NOW()-e.t)}</span>`:'';
  return `<span class="row" style="gap:6px">${late}<span class="badge ${e.sev==='high'?'badge-danger':e.sev==='mid'?'badge-warning':'badge-info'}">${e.esc?'Эскалировано':'Новое'}</span></span>`;
}
function evRow(e){
  const cam=e.cam&&db.cams.find(c=>c.id===e.cam);
  return `<button class="ev ${e.status==='done'?'done':''} ${e.fresh?'new-row':''}" data-act="ev-open" data-id="${e.id}">
   <span class="ev-i k-${e.kind}">${ic(TIC[e.type]||KIC[e.kind])}</span>
   <span class="grow col" style="gap:2px"><span class="lbl" style="font-weight:600;color:var(--one-fg)">${esc(e.title)}</span><span class="cap muted">${esc(e.zone)}${cam?' · камера «'+esc(cam.name)+'»':''}</span>${e.desc?`<span class="cap">${esc(e.desc)}</span>`:''}${e.esc&&e.status!=='done'?`<span class="cap t-danger">Не обработано 60 с → передано: ${esc(e.esc)}</span>`:''}</span>
   <span class="col" style="gap:4px;align-items:flex-end"><span class="cap mono">${hm(e.t)}</span>${evStatus(e)}</span></button>`;
}
function dataBlock(render,{rows=5,emptyText='Нет данных за выбранный период',emptyAct='Сбросить фильтры',emptyIcon='search'}={}){
  if(S.ds==='loading') return `<div class="col" style="padding:16px">${Array.from({length:rows},()=>`<div class="skeleton" style="height:28px"></div>`).join('')}</div>`;
  if(S.ds==='empty') return `<div class="empty">${ic(emptyIcon,'ic-32')}<div class="h-sm" style="color:var(--one-fg)">${emptyText}</div><button class="btn btn-outline" data-act="ds-reset">${emptyAct}</button></div>`;
  if(S.ds==='error') return `<div class="empty">${ic('alert','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Сервер объекта не ответил за 10 с</div><div class="cap">Проверьте связь с сервером «Интеллект X» SRV-EDU-01.</div><button class="btn btn-outline" data-act="ds-reset">${ic('sync')}Повторить</button></div>`;
  return render();
}
const av=(name,c='',cls='')=>{const p=name.split(' ');return `<span class="av ${cls} ${c||'c'+(1+[...name].reduce((a,ch)=>a+ch.charCodeAt(0),0)%4)}" aria-hidden="true">${esc((p[0]||'')[0]||'')}${esc((p[1]||'')[0]||'')}</span>`};
const card=(title,body,o={})=>`<section class="card ${o.cls||''}" ${o.id?`id="${o.id}"`:''}><div class="card-h"><h2>${title}</h2>${o.right?`<span class="sp"></span>${o.right}`:''}</div>${body}</section>`;
function toast(msg,kind=''){const t=document.createElement('div');t.className='toast '+kind;t.innerHTML=`${kind==='alarm'?ic('alert','t-danger'):ic('check','t-success')}<div>${msg}</div>`;$('#toasts').append(t);setTimeout(()=>t.remove(),5200)}
const seg=(id,opts,cur,act)=>`<div class="seg" role="group" id="${id}">${opts.map(([v,l])=>`<button class="btn" data-act="${act}" data-v="${v}" aria-pressed="${v===cur}">${l}</button>`).join('')}</div>`;
function pager(total,page,act){const pages=Math.max(1,Math.ceil(total/50));return `<div class="pager"><span class="cap muted">Показано ${total?page*50+1:0}–${Math.min(total,(page+1)*50)} из ${total} · по 50 строк</span><span class="sp"></span><button class="btn btn-outline" data-act="${act}" data-d="-1" ${page<=0?'disabled':''} aria-label="Предыдущая страница">${ic('chevron-left')}</button><span class="cap">${page+1} / ${pages}</span><button class="btn btn-outline" data-act="${act}" data-d="1" ${page>=pages-1?'disabled':''} aria-label="Следующая страница">${ic('chevron-right')}</button></div>`}

/* ================= Главная (SKD-DSH) ================= */
function vHome(){
  if(S.mode==='evac'||S.mode==='drill') return vEvac();
  if(S.mode==='lock') return vLock();
  const p=P(), ib=inBuilding(), st=stats(db.kids), favs=db.cams.filter(c=>c.fav).slice(0,S.grid===1?1:4);
  const worst=db.groups.map(g=>{const s=stats(db.kids.filter(k=>k.g===g.id));return {g,s,abs:pct(s.absent,s.list)}}).sort((a,b)=>b.abs-a.abs).slice(0,4);
  const week=DAYS.slice(0,6).reverse().map(d=>({d,v:d.off===0?st.absent:db.kids.filter(k=>genPast(p,k,d.off).st==='absent').length}));
  const mx=Math.max(...week.map(w=>w.v),1);
  const evs=db.events.slice().sort((a,b)=>b.t-a.t).slice(0,12);
  return `
  <div class="grid4">
    <button class="card kpi" data-act="inbuilding"><span class="lbl muted">${ic('organization')} Сейчас в здании</span><span class="kpi-value" id="k-in">${ib.total}</span>
      <span class="split"><span>${p.kids}: <b>${ib.kids}</b></span><span>Персонал: <b>${ib.staff}</b></span><span>Посетители: <b>${ib.vis}</b></span><span>Подрядчики: <b>${ib.con}</b></span></span></button>
    <button class="card kpi" data-go="attendance"><span class="lbl muted">${ic('people')} ${p.kids} по списку</span><span class="kpi-value" id="k-list">${st.list}</span><span class="split"><span>${p.grpPl}: <b>${db.groups.length}</b></span>${st.check?`<span>Требует проверки: <b>${st.check}</b></span>`:''}</span></button>
    <button class="card kpi ok" data-act="att-go" data-st="came"><span class="lbl muted">${ic('check-circle')} Пришли</span><span class="row" style="align-items:baseline"><span class="kpi-value" id="k-came">${st.came}</span><span class="h-sm muted">${pct(st.came,st.list)} %</span></span><div class="prog ok"><i style="width:${pct(st.came,st.list)}%"></i></div></button>
    <button class="card kpi attn" data-act="att-go" data-st="absent"><span class="lbl muted">${ic('person')} Отсутствуют</span><span class="row" style="align-items:baseline"><span class="kpi-value" id="k-abs">${st.absent}</span><span class="h-sm muted">${pct(st.absent,st.list)} %</span></span>
      <span class="split"><span>по причине: <b>${st.reasonOk}</b></span><span>${pastMiss()?'без причины':'ещё не пришли'}: <b>${st.noReason}</b></span></span></button>
  </div>
  <div class="g-main">
    ${card('Видеонаблюдение · избранные камеры',`<div class="card-b"><div class="cams ${S.grid===1?'one':''}">${favs.map(c=>camTile(c,{fav:1})).join('')}</div></div>`,{right:`${seg('home-grid',[['1','1'],['4','4']],String(S.grid),'grid')}<button class="btn btn-outline" data-go="video">${ic('device-camera-video')}Все камеры</button>`})}
    ${card('Состояние систем',`<div>${db.sys.map(sysRow).join('')}</div><div class="card-b row"><span class="cap muted">Наведите на строку — число неисправных устройств</span><span class="sp"></span><a class="link-action" href="#service">Обслуживание и заявки ${ic('arrow-right')}</a></div>`)}
  </div>
  <div class="g-main">
    ${card('Последние события',`${dataBlock(()=>`<div id="home-ev">${evs.map(evRow).join('')}</div>`,{emptyText:'Событий за сегодня нет',emptyIcon:'bell'})}<div class="card-b row"><span class="cap muted">Показаны ${evs.length} последних · обновляются автоматически</span><span class="sp"></span><a class="link-action" href="#events">Все события ${ic('arrow-right')}</a></div>`)}
    <div class="col" style="gap:16px">
      ${card('Сводка посещаемости',`<div class="card-b col" style="gap:10px">
        <div class="row"><span class="h-md">${pct(st.came,st.list)} %</span><span class="cap muted">присутствуют · ${st.came} из ${st.list}</span></div>
        <div class="cap muted">Отсутствия за неделю</div>
        <div class="mini" aria-label="График отсутствий за неделю">${week.map(w=>`<i class="${w.d.off===0?'today':''}" style="height:${Math.max(4,w.v/mx*100)}%" data-tip="${WD[w.d.d.getDay()]} ${dm(w.d.d)} — отсутствовали ${w.v}"></i>`).join('')}</div>
        <div class="mini-l">${week.map(w=>`<span>${w.d.off===0?'сегодня':WD[w.d.d.getDay()]+' '+dm(w.d.d)}</span>`).join('')}</div>
        <div class="ov" style="margin-top:4px">Больше всего отсутствующих</div>
        ${worst.map(w=>`<button class="sys" style="padding:6px 0;box-shadow:none" data-act="att-grp" data-g="${esc(w.g.id)}"><span class="grow">${esc(w.g.id)} <span class="cap muted">· ${esc(w.g.resp)}</span></span>${w.abs>=20?`<span class="badge badge-warning" data-tip="Отсутствуют ${w.abs} % — больше порога 20 %">${ic('alert')}${w.abs} %</span>`:`<span class="cap">${w.abs} %</span>`}<span class="cap muted">${w.s.absent} из ${w.s.list}</span></button>`).join('')}
      </div><div class="card-b row" style="border-top:1px solid var(--one-border)"><button class="btn btn-subtle" data-act="export" data-f="PDF" data-what="Сводка посещаемости">${ic('download')}Выгрузить</button><span class="sp"></span><a class="link-action" href="#attendance">Журнал посещаемости ${ic('arrow-right')}</a></div>`)}
      ${card('Заполненность зон',db.zones.map(zoneRow).join('')+`<div class="card-b cap muted">Подсчёт видеоаналитикой · жёлтый от 80 %, красный от 100 % (SKD-PRS-09)</div>`)}
    </div>
  </div>`;
}
function sysRow(s){const st=sysState(s), n=s.faults.length;
  const tip=st==='alarm'?`Тревога: ${S.alarm[s.id]}`:n?`Неисправных устройств: ${n} из ${s.total}`:`Все ${s.total} устройств в норме`;
  const txt=st==='alarm'?'<b class="t-danger">Тревога</b>':n?`<span class="t-warning" style="font-weight:600">Неисправно: ${n}</span>`:'<span class="muted">Норма</span>';
  return `<button class="sys" data-go="service" data-sys="${s.id}" data-tip="${esc(tip)}" aria-label="${esc(s.name)} — ${esc(tip)}"><span class="light ${st}"></span>${ic(st==='ok'?'check-circle':st==='warn'?'alert':'flame',st==='ok'?'t-success':st==='warn'?'t-warning':'t-danger')}<span class="grow">${esc(s.name)}${s.ext?' <span class="tag">расш.</span>':''}</span><span class="lbl">${txt}</span></button>`}
function zoneRow([n,v,cap]){const p=pct(v,cap),c=p>=100?'bad':p>=80?'warn':'ok';return `<div class="zone"><span class="grow">${esc(n)}</span><div class="prog ${c}"><i style="width:${Math.min(100,p)}%"></i></div><span class="cap nowrap" style="text-align:right">${v} / ${cap} · <b class="${c==='bad'?'t-danger':c==='warn'?'t-warning':''}">${p} %</b></span></div>`}

/* ================= Эвакуация и учебная тревога (SKD-EVC, SKD-UI-05) ================= */
function evacCounts(E=S.evac){const kids=E.snap.length, ok=E.snap.filter(x=>['safe','par'].includes(E.marks[x.id])).length, miss=E.snap.filter(x=>E.marks[x.id]==='miss').length;return {kids,ok,left:kids-ok,miss}}
function vEvac(){
  const E=S.evac, c=evacCounts(), p=P(), drill=E.drill;
  const groups=db.groups.map(g=>{const L=E.snap.filter(x=>x.g===g.id);const ok=L.filter(x=>['safe','par'].includes(E.marks[x.id])).length;return {g,n:L.length,ok}}).filter(x=>x.n);
  const unacc=E.snap.filter(x=>!['safe','par'].includes(E.marks[x.id])).sort((a,b)=>(E.marks[b.id]==='miss')-(E.marks[a.id]==='miss'));
  const acts=evacActions();
  return `
  <div class="banner ${drill?'b-warn':'b-danger'}" role="alert">${ic(drill?'stopwatch':'flame','big-ic')}
    <div class="col grow" style="gap:4px"><h1 class="b-t">${drill?'Учебная тревога · эвакуация':'Эвакуация'}</h1><div class="lbl">${esc(E.cause)} · начало ${hms(E.t0)} · прошло <span class="timer" data-since="${+E.t0}" style="font-size:14px">${fmtDur(NOW()-E.t0)}</span>${E.doneAt?` · все учтены за <b>${fmtDur(E.doneAt-E.t0)}</b>`:''}</div></div>
    <button class="btn btn-outline" data-act="evac-report">${ic('file')}Итог для РТП</button>
    ${!drill&&p.parents?`<button class="btn btn-outline" data-act="mass-notify">${ic('megaphone')}Сообщить родителям</button>`:''}
    <button class="btn ${drill?'btn-primary':'btn-red'}" data-act="evac-end">${ic('check')}Завершить ${drill?'тревогу':'эвакуацию'}</button>
  </div>
  <div class="grid4">
    <div class="card kpi"><span class="lbl muted">В здании на момент тревоги</span><span class="kpi-value">${c.kids+E.staffIn+E.visIn}</span><span class="split"><span>${p.kids}: <b>${c.kids}</b></span><span>Персонал: <b>${E.staffIn}</b></span><span>Посетители и подрядчики: <b>${E.visIn}</b></span></span></div>
    <div class="card kpi ok"><span class="lbl muted">Учтено на точке сбора</span><span class="kpi-value" id="ev-ok">${c.ok}</span><div class="prog ok"><i style="width:${pct(c.ok,c.kids)}%"></i></div></div>
    <div class="card kpi ${c.left?'alarm':'ok'}" style="grid-column:span 2"><span class="lbl muted">Не учтено</span><div class="row" style="align-items:flex-end;gap:16px"><span class="count-big ${c.left?'t-danger':'t-success'}" id="ev-left">${c.left}</span><span class="cap muted" style="padding-bottom:6px">${c.miss?`из них отмечены «нет на точке сбора»: <b class="t-danger">${c.miss}</b> · `:''}отметки ставят ${p.respShort} с телефонов${S.offline?' · <b>связь с сервером потеряна, отметки копятся в очереди</b>':''}</span></div></div>
  </div>
  <div class="g-main">
    ${card(`Перекличка по ${p.grp==='Класс'?'классам':'группам'}`,`<div class="grp-grid">${groups.map(x=>`<button class="grp ${x.ok===x.n?'done':'left'}" data-act="evac-grp" data-g="${esc(x.g.id)}"><span class="row"><b>${esc(x.g.id)}</b><span class="sp"></span>${x.ok===x.n?ic('check-circle','t-success'):`<b class="t-danger">${x.n-x.ok}</b>`}</span><span class="cap muted">${esc(x.g.resp)}</span><div class="prog ${x.ok===x.n?'ok':'bad'}"><i style="width:${pct(x.ok,x.n)}%"></i></div><span class="cap">${x.ok} из ${x.n}${E.gDone[x.g.id]?' · '+fmtDur(E.gDone[x.g.id]-E.t0):''}</span></button>`).join('')}</div>`,{right:`<a class="link-action" href="#rollcall">${ic('device-mobile')}Как видит ${p.respShort}</a>`})}
    <div class="col" style="gap:16px">
      ${card('Не учтённые · последнее известное место',unacc.length?unacc.slice(0,10).map(x=>{const k=KBY(x.id);return `<button class="ev" data-act="kid" data-id="${k.id}">${av(k.short)}<span class="grow col" style="gap:2px"><b class="lbl" style="color:var(--one-fg)">${esc(k.short)} · ${esc(k.g)}</b><span class="cap muted">${esc(x.last)}</span></span>${E.marks[x.id]==='miss'?'<span class="badge badge-danger">нет на точке сбора</span>':'<span class="badge badge-warning">нет отметки</span>'}</button>`}).join('')+(unacc.length>10?`<div class="card-b cap muted">и ещё ${unacc.length-10}</div>`:''):`<div class="empty">${ic('check-circle','ic-32 t-success')}<div class="h-sm" style="color:var(--one-fg)">Все учтены</div></div>`)}
      ${card('Действия режима',acts.map(a=>`<div class="act-row">${ic(a[0]?'check-circle':'info',a[0]?'t-success':'t-info')}<span class="grow">${a[1]}</span><span class="cap mono muted">${a[2]||''}</span></div>`).join(''))}
      ${card('Выходы и точка сбора',`<div class="card-b"><div class="cams">${db.cams.filter(c=>/выход|Двор|площадка|Калитка/i.test(c.name)&&!c.srvi).slice(0,2).map(c=>camTile(c)).join('')}</div></div>`)}
    </div>
  </div>`;
}
function evacActions(){const E=S.evac,t=hms(E.t0),p=P();return [
  [1,'Двери СКУД разблокированы, турникеты открыты — пути эвакуации свободны (SKD-MOD-05)',t],
  [1,'СОУЭ: речевое сообщение об эвакуации во всех зонах',t],
  [1,`Список «кто в здании» зафиксирован: ${E.snap.length} ${p.kidsGen}, ${E.staffIn} сотрудников, ${E.visIn} посетителей (SKD-EVC-01)`,t],
  [1,`Перекличка открыта у ${p.respShort} на телефонах`,t],
  E.cancelledLock?[1,'Режим ЧС отменён автоматически: при пожаре выходы не блокируются',t]:null,
  E.drill?[0,'Учебная тревога: родителям и учредителю уведомления не отправляются (SKD-EVC-05)']:[1,'Уведомлены в MAX: директор, зам. по безопасности, дежурный администратор (SKD-NTF-02)',t],
  [1,'Камеры выходов и точки сбора выведены на пост охраны',t],
  E.drill?null:[0,'Передача тревоги в ЕДДС / 112 — по интеграции (раздел 10.2, уточнить)'],
].filter(Boolean)}
function startEvac(drill,cause){
  const p=P(), snap=db.kids.filter(k=>['in','check'].includes(k.day.st)&&!k.day.handed).map(k=>({id:k.id,g:k.g,last:lastPlace(k)}));
  const hold=drill?[]:[snap.find(x=>x.g===p.teacher.grp)?.id,snap[Math.floor(snap.length*.62)]?.id].filter(Boolean);
  S.evac={t0:NOW(),drill,cause,snap,staffIn:db.staff.filter(s=>s.st==='in').length,visIn:db.visitors.filter(v=>!v.outT).length+db.contractors.filter(c=>!c.outT).length,marks:{},queue:[],hold:new Set(hold),gDone:{},doneAt:null,cancelledLock:S.mode==='lock'};
  S.doors='unlocked'; if(!drill) S.alarm.fire='сработка СПС · '+cause;
  addEvent({kind:'alarm',type:drill?'drill':'fire',title:drill?'Учебная тревога: эвакуация':'Пожар: сработка СПС',zone:cause,cam:null,desc:drill?'Режим «Учебная тревога» · перекличка запущена':'Режим «Эвакуация» включён автоматически · перекличка запущена',sev:'high'});
}
function markKid(id,v,o={}){
  const E=S.evac; if(!E) return;
  if(S.offline&&!o.flush&&!o.auto){E.queue.push([id,v]);return 'queued'}
  E.marks[id]=v;
  db.groups.forEach(g=>{if(E.gDone[g.id])return;const L=E.snap.filter(x=>x.g===g.id);if(L.length&&L.every(x=>['safe','par'].includes(E.marks[x.id])))E.gDone[g.id]=NOW()});
  if(!E.doneAt&&evacCounts().left===0){E.doneAt=NOW();toast(`Все ${P().kidsGen} учтены за ${fmtDur(E.doneAt-E.t0)}`)}
}
function autoMark(){
  const E=S.evac; if(!E||!$('#pp-auto').checked) return;
  const free=E.snap.filter(x=>!E.marks[x.id]&&!E.hold.has(x.id)); const n=Math.min(free.length,8+Math.floor(Math.random()*10));
  for(let i=0;i<n;i++){const x=free.splice(Math.floor(Math.random()*free.length),1)[0];markKid(x.id,Math.random()<.04&&!E.drill&&P().parents?'par':'safe',{auto:1})}
  if(n&&(S.route==='home'||S.route==='rollcall')&&!$('#dlg').open&&!$('#sheet').hasAttribute('data-open')) rerender();
}

/* ================= ЧС (SKD-MOD-04) ================= */
function vLock(){const L=S.lock,t=hms(L.t0);
  const acts=[[1,'Внешние входы закрыты на вход (СКУД)',t],[1,'Выходы остаются свободными — требования пожарной безопасности',t],[1,'Условное речевое сообщение по зонам: «Внимание! Учебный кабинет 13 закрыт на проветривание»',t],[1,'Уведомлены администрация и учредитель',t],[1,'Камеры входов и коридоров выведены на пост охраны',t],[1,'Инструкция персоналу отправлена в MAX: закрыть двери кабинетов, отойти от окон и дверей, не выходить до отмены',t],[0,'Вызов Росгвардии выполняется штатной КТС — решение его не заменяет. Нажмите КТС, если ещё не нажата.']];
  return `<div class="banner b-danger" role="alert">${ic('lock','big-ic')}<div class="col grow" style="gap:4px"><h1 class="b-t">ЧС · блокировка входов</h1><div class="lbl">Включил ${esc(L.by)} · ${t} · прошло <span class="timer" data-since="${+L.t0}" style="font-size:14px">${fmtDur(NOW()-L.t0)}</span></div></div>
    <button class="btn btn-outline" data-act="lock-end">${ic('unlock')}Отменить ЧС</button></div>
  <div class="g-main">${card('Входы и коридоры',`<div class="card-b"><div class="cams">${db.cams.filter(c=>c.entry&&!c.srvi||/Коридор|Холл/.test(c.name)).slice(0,4).map(c=>camTile(c)).join('')}</div></div>`)}
  <div class="col" style="gap:16px">${card('Действия режима',acts.map(a=>`<div class="act-row">${ic(a[0]?'check-circle':'alert',a[0]?'t-success':'t-warning')}<span class="grow">${a[1]}</span><span class="cap mono muted">${a[2]||''}</span></div>`).join(''))}
  ${card('Сейчас в здании',`<div class="card-b"><span class="kpi-value">${inBuilding().total}</span><div class="cap muted">Если начнётся пожар — режим ЧС отменится автоматически, двери разблокируются (SKD-MOD-05).</div></div>`)}</div></div>`}

/* ================= Пост охраны (SKD-DSH-06) ================= */
function vPost(){
  const cams=db.cams.filter(c=>c.entry).slice(0,4), active=db.events.filter(e=>e.status==='new'&&['alarm','analytics'].includes(e.kind));
  const kts=S.kts;
  return `<div class="page-h"><h1>Пост охраны 1</h1><span class="badge badge-neutral">${esc(ROLES.guard.short)}</span><span class="sp"></span>
    <button class="btn btn-primary" data-act="visitor">${ic('person-add')}Зарегистрировать посетителя</button><button class="btn btn-outline" data-act="temp">${ic('id-badge')}Временный пропуск</button><button class="btn btn-outline" data-act="kts-test">${ic('shield')}Тест КТС</button></div>
  ${kts?'':`<div class="banner b-warn">${ic('alert','ic-24')}<span class="grow">Ежедневная проверка КТС ещё не выполнена${NOW()>at(9,0)?' — напоминание отправлено, в 10:00 уйдёт событие администрации':''} (SKD-REG-02)</span><button class="btn btn-primary" data-act="kts-test">Тест КТС</button></div>`}
  <div class="g-main">${card('Камеры входов',`<div class="card-b"><div class="cams">${cams.map(c=>camTile(c)).join('')}</div></div>`)}
   <div class="col" style="gap:16px">${card(`Тревоги ${active.length?`<span class="badge badge-danger">${active.length}</span>`:''}`,active.length?active.map(evRow).join(''):`<div class="empty">${ic('shield-check','ic-32')}Активных тревог нет</div>`)}
   ${card('Проходы в реальном времени',`<div id="pass-feed">${dataBlock(()=>db.passes.slice(0,12).map(passRow).join(''),{emptyText:'Проходов пока нет',emptyIcon:'sign-in'})}</div><div class="card-b cap muted">Фото — из карточки человека в СКУД. Биометрия не используется (раздел 12.2).</div>`)}</div></div>`;
}
function passRow(p,i){const k=KBY(p.who)||db.staff.find(s=>s.id===p.who);if(!k)return '';
  return `<div class="pass ${i===0&&p.fresh?'new-row':''}">${av(k.short)}<span class="grow col" style="gap:0"><b class="lbl" style="color:var(--one-fg)">${esc(k.short)}</b><span class="cap muted">${k.g?esc(k.g):esc(k.cat)} · ${esc(p.pt)}</span></span>${p.dir==='in'?`<span class="badge badge-success">${ic('sign-in')}Вход</span>`:`<span class="badge badge-neutral">${ic('sign-out')}Выход</span>`}<span class="cap mono">${hm(p.t)}</span></div>`}

/* ================= Видеонаблюдение (SKD-DSH-04) ================= */
function vVideo(){
  const guard=S.role==='guard', B=[...new Set(db.cams.map(c=>c.b))], list=db.cams.filter(c=>(!S.camB||c.b===S.camB)&&(!guard||c.entry));
  const shown=S.grid===1?list.slice(0,1):list;
  return `<div class="video-l">
   ${card('Камеры',`<div class="cam-tree" style="padding:8px">${['',...B].map(b=>`<button class="tree-i" data-act="camb" data-b="${esc(b)}" aria-selected="${S.camB===b}">${ic(b?'organization':'apps')}<span class="grow">${b||'Все камеры'}</span><span class="cap muted">${db.cams.filter(c=>!b||c.b===b).length}</span></button>`).join('')}</div>
     <div class="card-b cap muted" style="border-top:1px solid var(--one-border)">${guard?'Пост охраны: камеры входов, архив — не старше 24 ч (раздел 9).':'Звезда на камере — избранное для главной.'}</div>`)}
   ${card(S.camB||'Все камеры',`<div class="card-b"><div class="cams ${S.grid===1?'one':''}">${shown.map(c=>camTile(c,{fav:!guard})).join('')}</div></div>`,{right:seg('v-grid',[['1','1'],['4','4']],String(S.grid),'grid')})}
  </div>`;
}
function openCam(id){
  const L=(S.route==='home'?db.cams.filter(c=>c.fav):S.route==='video'?db.cams.filter(c=>(!S.camB||c.b===S.camB)&&(S.role!=='guard'||c.entry)):db.cams);
  const list=L.length?L:db.cams; let i=list.findIndex(c=>c.id===id); if(i<0)i=0; const c=list[i]; S.camSel=c.id;
  const na=c.srvi, off=c.fault&&c.fault.startsWith('Нет');
  dlg(`<div class="dlg-h"><h2 class="dialog-title">${esc(c.name)}</h2><span class="cap muted">${esc(c.b)} · ${esc(c.z)}</span><span class="sp"></span><button class="btn btn-icon" data-kit-close aria-label="Закрыть">${ic('x')}</button></div>
   <div class="dlg-b"><div class="player">${na||off?`<div class="cam" style="position:absolute;inset:0;border:0;aspect-ratio:auto"><div class="na">${ic(na?'eye-closed':'alert','ic-32')}<span>${na?'Камера недоступна':esc(c.fault)}</span></div></div>`:scene(c)}
     <span class="pl-l"><span class="live ${na||off?'off':''}" style="width:8px;height:8px;border-radius:50%;background:var(--one-danger-icon);display:inline-block"></span>${S.camArch?'Архив · '+hm(new Date(NOW()-600000)):'Live'}</span>
     <button class="nav-arr l" data-act="cam-step" data-d="-1" data-id="${c.id}" aria-label="Предыдущая камера">${ic('chevron-left')}</button><button class="nav-arr r" data-act="cam-step" data-d="1" data-id="${c.id}" aria-label="Следующая камера">${ic('chevron-right')}</button>
     ${S.camArch?`<div class="bar">${ic('play')}<span class="mono">${hms(new Date(NOW()-600000))}</span><div class="track"><i style="left:66%"></i></div><span>−30 мин</span></div>`:''}</div>
     <div class="row wrap"><span class="cap muted">Камера ${i+1} из ${list.length} · стрелки или ← → на клавиатуре</span><span class="sp"></span>
       ${na||off?'':`<button class="btn btn-outline" data-act="cam-arch" data-id="${c.id}">${ic(S.camArch?'device-camera-video':'history')}${S.camArch?'Вернуться в Live':'Архив камеры'}</button>`}${S.role!=='guard'&&!na&&!off?`<button class="btn btn-outline" data-act="export" data-f="MP4" data-what="Фрагмент «${esc(c.name)}»">${ic('download')}Экспорт</button>`:''}</div>
     ${na?'<div class="cap muted">Изображение временно недоступно. Это не неисправность: заявка на обслуживание не создаётся (п. 8 критериев приёмки).</div>':''}</div>`,{wide:1});
  if(!na&&!off) aud(S.camArch?'Просмотр архива':'Просмотр видео',`камера «${c.name}»`);
}

/* ================= Посещаемость (SKD-PRS) ================= */
function vAttendance(){
  const p=P(), t=isTeacher(), tab=S.att.tab;
  const tabs=[['sum','Сводка'],['journal','Журнал'],['check',`Требует проверки · ${stats(visKids()).check}`],['trend','Динамика']];
  return `<div class="page-h"><h1>${t?`Мой ${p.grp==='Класс'?'класс':'группа'} · ${esc(p.teacher.grp)}`:'Посещаемость'}</h1>${t?`<span class="badge badge-info">${ic('lock')}Видна только ваша ${p.grp==='Класс'?'класс':'группа'} (раздел 9)</span>`:''}<span class="sp"></span>
    <span class="cap muted">Окно прихода ${p.rules.from.map(pad).join(':')}–${p.rules.to.map(pad).join(':')} · опоздание после ${p.rules.late.map(pad).join(':')} · пропуск после ${p.rules.miss.map(pad).join(':')}</span></div>
  ${seg('att-tabs',tabs,tab,'att-tab')}
  ${tab==='sum'?attSum():tab==='journal'?attJournal():tab==='check'?attCheck():attTrend()}`;
}
function attSum(){
  const p=P(), K=visKids(), st=stats(K), G=db.groups.filter(g=>K.some(k=>k.g===g.id));
  return `<div class="grid4">
   <div class="card kpi"><span class="lbl muted">По списку</span><span class="kpi-value">${st.list}</span><span class="split"><span>Уникальных за день: <b>${st.came}</b></span></span></div>
   <button class="card kpi ok" data-act="att-go" data-st="came"><span class="lbl muted">Пришли</span><span class="row" style="align-items:baseline"><span class="kpi-value">${st.came}</span><span class="h-sm muted">${pct(st.came,st.list)} %</span></span><span class="split"><span>Опоздали: <b>${st.late}</b></span><span>Ушли раньше: <b>${st.early}</b></span></span></button>
   <button class="card kpi attn" data-act="att-go" data-st="absent"><span class="lbl muted">Отсутствуют</span><span class="row" style="align-items:baseline"><span class="kpi-value">${st.absent}</span><span class="h-sm muted">${pct(st.absent,st.list)} %</span></span><span class="split"><span>По причине: <b>${st.reasonOk}</b></span><span>Без причины: <b>${st.noReason}</b></span></span></button>
   <button class="card kpi ${st.check?'attn':''}" data-act="att-tab" data-v="check"><span class="lbl muted">Требует проверки</span><span class="kpi-value">${st.check}</span><span class="split"><span>Ошибки СКУД: прошёл за другим, ушёл через пожарный выход</span></span></button>
  </div>
  ${card(`По ${p.grp==='Класс'?'классам':'группам'}`,dataBlock(()=>`<div class="scroll-x"><table class="table"><thead><tr><th>${p.grp}</th><th>${p.resp}</th><th class="num">По списку</th><th class="num">Пришли</th><th class="num">Отсутствуют</th><th class="num">Без причины</th><th class="num">Опоздали</th><th class="num">Ушли раньше</th><th style="min-width:140px">Присутствие</th></tr></thead><tbody>
    ${G.map(g=>{const s=stats(K.filter(k=>k.g===g.id)),a=pct(s.absent,s.list);return `<tr data-clickable data-act="att-grp" data-g="${esc(g.id)}"><td><b>${esc(g.id)}</b>${a>=20?` <span class="badge badge-warning" data-tip="Отсутствуют ${a} % — больше порога 20 %. Сигнал медработнику.">${ic('alert')}${a} %</span>`:''}</td><td class="cap">${esc(g.resp)}</td><td class="num">${s.list}</td><td class="num">${s.came}</td><td class="num">${s.absent}</td><td class="num ${s.noReason?'t-danger':''}">${s.noReason}</td><td class="num">${s.late}</td><td class="num">${s.early}</td><td><div class="prog ${100-a<80?'warn':'ok'}"><i style="width:${100-a}%"></i></div></td></tr>`}).join('')}</tbody></table></div>`,{rows:8}),
   {right:`<button class="btn btn-outline" data-act="export" data-f="XLSX" data-what="Табель посещаемости">${ic('download')}XLSX</button><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Табель посещаемости">PDF</button><button class="btn btn-subtle" data-act="export" data-f="CSV" data-what="Табель посещаемости">CSV</button>`})}`;
}
function attRows(){const p=P(),a=S.att,off=DAYS[a.day].off;
  return visKids().map(k=>({k,d:off===0?k.day:genPast(p,k,off)})).filter(({k,d})=>(!a.g||k.g===a.g)&&(!a.q||k.fio.toLowerCase().includes(a.q.toLowerCase()))&&(!a.st||(a.st==='came'?d.st!=='absent':a.st==='absent'?d.st==='absent':a.st==='noreason'?d.st==='absent'&&!d.reason:a.st==='late'?d.late:a.st==='early'?d.early:d.st===a.st)))}
function attJournal(){
  const p=P(), a=S.att, t=isTeacher(), G=db.groups.filter(g=>visKids().some(k=>k.g===g.id));
  return card('Журнал посещаемости',`<div class="toolbar">
    <select class="field" id="att-day" aria-label="Дата">${DAYS.slice(0,6).map((d,i)=>`<option value="${i}" ${i===a.day?'selected':''}>${d.off===0?'Сегодня, ':''}${WD[d.d.getDay()]} ${dmy(d.d)}</option>`).join('')}</select>
    <select class="field" id="att-g" aria-label="${p.grp}" ${t?'disabled':''}><option value="">Все ${p.grpPl.toLowerCase()}</option>${G.map(g=>`<option ${g.id===a.g?'selected':''}>${esc(g.id)}</option>`).join('')}</select>
    <div class="search">${ic('search')}<input class="field" id="att-q" placeholder="Фамилия и имя" value="${esc(a.q)}" aria-label="Поиск по ФИО"></div>
    <select class="field" id="att-st" aria-label="Статус"><option value="">Все статусы</option>${[['came','Пришли'],['absent','Отсутствуют'],['noreason','Без причины'],['in','В здании'],['left','Ушли'],['late','Опоздали'],['early','Ушли раньше'],['check','Требует проверки']].map(([v,l])=>`<option value="${v}" ${a.st===v?'selected':''}>${l}</option>`).join('')}</select>
    <span class="sp"></span><button class="btn btn-subtle" data-act="att-reset">${ic('filter-remove')}Сбросить</button></div>
   <div id="att-res">${attResults()}</div>`,{right:`<button class="btn btn-outline" data-act="export" data-f="XLSX" data-what="Журнал посещаемости">${ic('download')}Выгрузить</button>`});
}
function attResults(){
  return dataBlock(()=>{const rows=attRows(), a=S.att, pg=rows.slice(a.page*50,a.page*50+50), uniq=rows.filter(r=>r.d.st!=='absent').length;
    if(!rows.length) return `<div class="empty">${ic('search','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Никого не найдено</div><button class="btn btn-outline" data-act="att-reset">Сбросить фильтры</button></div>`;
    return `<div class="scroll-x"><table class="table"><thead><tr><th>ФИО</th><th>${P().grp}</th><th>Статус</th><th>Приход</th><th>Уход</th><th>Причина отсутствия</th><th>Отметки</th></tr></thead><tbody>
     ${pg.map(({k,d})=>`<tr data-clickable data-act="kid" data-id="${k.id}"><td><span class="row">${av(k.short)}<span>${esc(k.fio)}</span></span></td><td>${esc(k.g)}</td><td>${stBadge(k,d)}</td><td class="mono cap ${d.late?'t-warning':''}">${hm(d.inT)}</td><td class="mono cap">${hm(d.outT)}</td><td class="cap">${d.reason?esc(d.reason):d.st==='absent'?'<span class="muted">не указана</span>':''}</td><td>${flags(d)}</td></tr>`).join('')}</tbody></table></div>
     ${pager(rows.length,a.page,'att-pg')}<div class="card-b cap muted">Уникальных ${P().kidsGen} за день по выборке: <b>${uniq}</b> · строка открывает карточку</div>`},{rows:10});
}
function attCheck(){
  const K=visKids().filter(k=>k.day.st==='check');
  return card('Требует проверки · ошибки СКУД (SKD-PRS-06)',K.length?`<div class="scroll-x"><table class="table"><thead><tr><th>ФИО</th><th>${P().grp}</th><th>Что не так</th><th>Проход</th><th style="text-align:right">Исправить статус</th></tr></thead><tbody>${K.map(k=>`<tr><td><button class="link-action" data-act="kid" data-id="${k.id}">${esc(k.fio)}</button></td><td>${esc(k.g)}</td><td class="cap">${esc(k.day.check)}</td><td class="mono cap">${k.day.passes.map(p=>`${p.dir==='in'?'вход':'выход'} ${hm(p.t)}`).join(', ')}</td><td style="text-align:right;white-space:nowrap"><button class="btn btn-outline" data-act="fix" data-id="${k.id}" data-v="in">${ic('check')}В здании</button> <button class="btn btn-subtle" data-act="fix" data-id="${k.id}" data-v="left">Ушёл</button> <button class="btn btn-subtle" data-act="fix" data-id="${k.id}" data-v="absent">Не приходил</button></td></tr>`).join('')}</tbody></table></div><div class="card-b cap muted">Исправление записывается в журнал аудита с автором и временем.</div>`
   :`<div class="empty">${ic('check-circle','ic-32 t-success')}<div class="h-sm" style="color:var(--one-fg)">Всё сходится</div><div class="cap">Ошибок СКУД за сегодня нет</div></div>`);
}
function attTrend(){
  const p=P(), K=visKids(), D=DAYS.slice().reverse();
  const data=D.map(d=>{const L=K.map(k=>d.off===0?k.day:genPast(p,k,d.off)).filter(x=>x.st==='absent');return {d,sick:L.filter(x=>x.reason==='болезнь').length,fam:L.filter(x=>x.reason==='семейные обстоятельства').length,ev:L.filter(x=>x.reason==='мероприятие вне здания').length,no:L.filter(x=>!x.reason).length}});
  const mx=Math.max(...data.map(x=>x.sick+x.fam+x.ev+x.no),1), W=760,H=240,bw=(W-60)/data.length;
  const bars=data.map((x,i)=>{let y=H-30;const parts=[['s1',x.sick],['s2',x.fam],['s3',x.ev],['s4',x.no]].map(([c,v])=>{const h=v/mx*(H-60);y-=h;return `<rect class="${c}" x="${50+i*bw+6}" y="${y.toFixed(1)}" width="${bw-12}" height="${h.toFixed(1)}"/>`}).join('');
    return `<g data-tip="${WD[x.d.d.getDay()]} ${dm(x.d.d)}: болезнь ${x.sick}, семейные ${x.fam}, мероприятие ${x.ev}, без причины ${x.no}">${parts}<rect x="${50+i*bw}" y="20" width="${bw}" height="${H-50}" fill="transparent"/><text class="axis" x="${50+i*bw+bw/2}" y="${H-12}" text-anchor="middle">${x.d.off===0?'сегодня':dm(x.d.d)}</text></g>`}).join('');
  const grid=[0,.5,1].map(f=>`<line class="grid" x1="44" x2="${W}" y1="${(H-30-f*(H-60)).toFixed(0)}" y2="${(H-30-f*(H-60)).toFixed(0)}"/><text class="axis" x="38" y="${(H-26-f*(H-60)).toFixed(0)}" text-anchor="end">${Math.round(mx*f)}</text>`).join('');
  return card('Отсутствия за 10 учебных дней',dataBlock(()=>`<div class="card-b"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Отсутствия по дням и причинам">${grid}${bars}</svg>
   <div class="legend"><span><i style="background:var(--one-palette-magenta)"></i>Болезнь</span><span><i style="background:var(--one-palette-amber)"></i>Семейные обстоятельства</span><span><i style="background:var(--one-palette-teal)"></i>Мероприятие вне здания</span><span><i style="background:var(--one-fg-subtle)"></i>Без причины</span></div>
   <div class="cap muted" style="margin-top:8px">Рост отсутствий по болезни в одной ${p.grp==='Класс'?'классе':'группе'} больше 20 % подсвечивается в сводке — сигнал медработнику. 04.11 — праздничный день, в графике пропущен.</div></div>`));
}
function openKid(id){
  const k=KBY(id), d=k.day, p=P(), canEdit=S.role!=='guard'&&(!isTeacher()||k.g===p.teacher.grp);
  if(isTeacher()&&k.g!==p.teacher.grp){toast('Нет доступа: карточки других групп не видны','alarm');return}
  openSheet(`<div class="sheet-h">${av(k.short,'','lg')}<div class="col grow" style="gap:2px"><div class="h-md">${esc(k.fio)}</div><div class="cap muted">${esc(p.kid)} · ${esc(k.g)} · ${esc(db.groups.find(g=>g.id===k.g).resp)}</div></div><button class="btn btn-icon" data-act="sheet-close" aria-label="Закрыть">${ic('x')}</button></div>
  <div class="sheet-b">
   <div class="row wrap">${stBadge(k)} ${flags(d)}</div>
   <dl class="dl"><dt>Пропуск</dt><dd class="mono">${k.card} · ${k.cardSt==='active'?'активен':'<span class="t-danger">заблокирован</span>'}</dd>${p.parents?`<dt>Законный представитель</dt><dd>${esc(k.parent.fio)} · ${k.parent.phone}<br><span class="cap ${k.parent.max?'t-success':'muted'}">${k.parent.max?'Уведомления в MAX подключены':'MAX не подключён — уведомления не отправляются'}</span></dd>`:''}
    <dt>Расписание</dt><dd>${esc(db.groups.find(g=>g.id===k.g).room)} · до ${p.rules.end}</dd></dl>
   <div><div class="h-sm" style="margin-bottom:8px">Проходы за сегодня</div>${d.passes.length?`<div class="tl">${d.passes.map(x=>`<div class="${x.dir==='out'?'out':''} ${d.check?'warn':''}"><b class="mono cap">${hm(x.t)}</b> · ${x.dir==='in'?'вход':'выход'} · <span class="cap muted">${esc(x.pt)}</span></div>`).join('')}</div>`:'<div class="cap muted">Проходов нет</div>'}${d.check?`<div class="cap t-warning">${esc(d.check)}</div>`:''}</div>
   ${d.st==='absent'?`<div class="card card-b col" style="gap:8px"><div class="h-sm">Причина отсутствия (SKD-PRS-05)</div>${canEdit?`<select class="field" id="k-reason"><option value="">Не указана</option>${['болезнь','семейные обстоятельства','мероприятие вне здания'].map(r=>`<option ${d.reason===r?'selected':''}>${r}</option>`).join('')}</select><button class="btn btn-primary" data-act="reason-save" data-id="${k.id}">Сохранить причину</button>`:`<div>${esc(d.reason||'не указана')}</div>`}${d.reasonBy?`<div class="cap muted">Указал: ${esc(d.reasonBy)}</div>`:''}</div>`:''}
   ${d.st!=='absent'&&!p.handover&&canEdit?`<label class="choice"><input type="checkbox" class="switch" role="switch" id="k-rel" data-id="${k.id}" ${d.released?'checked':''}> Отпущен с занятий — уход не считается самовольным (EDU-05)</label>`:''}
   ${p.parents?`<div><div class="h-sm" style="margin-bottom:8px">Уведомления родителю в MAX (SKD-NTF-03)</div>${d.max.length?d.max.map(m=>`<div class="msg" style="margin-bottom:6px"><div class="row"><span class="cap mono">${hm(m.t)}</span><span class="sp"></span><span class="cap muted">${esc(m.st)}</span></div><div>${esc(m.text)}</div>${m.reply!==undefined&&m.text.includes('Укажите')?`<div class="cap" style="margin-top:4px">Кнопки: «болеет» · «по семейным обстоятельствам» · «не знаю»</div>`:''}</div>${m.reply?`<div class="msg in" style="margin:0 0 8px 40px"><div class="cap muted">Ответ родителя</div><b>${esc(m.reply)}</b></div>`:''}`).join(''):'<div class="cap muted">Сообщений нет</div>'}<div class="cap muted">Родитель не получает видео и данные о других детях.</div></div>`:''}
   ${S.role!=='teacher'?`<div class="row"><a class="link-action" href="#people" data-act="sheet-close">${ic('id-badge')}Пропуск в «Людях и пропусках»</a></div>`:''}
  </div>`);
}
function inBuildingSheet(){
  const ib=inBuilding(), p=P(), K=db.kids.filter(k=>k.day.st==='in'&&!k.day.handed);
  openSheet(`<div class="sheet-h">${ic('organization','ic-24')}<div class="col grow" style="gap:2px"><div class="h-md">Сейчас в здании · ${ib.total}</div><div class="cap muted">Обновлено ${hms(NOW())} (SKD-PRS-01)</div></div><button class="btn btn-icon" data-act="sheet-close" aria-label="Закрыть">${ic('x')}</button></div>
  <div class="sheet-b">
   <div class="grid2" style="gap:8px">${[[p.kids,ib.kids],['Персонал',ib.staff],['Посетители',ib.vis],['Подрядчики',ib.con]].map(([n,v])=>`<div class="card kpi" style="cursor:default;padding:10px"><span class="lbl muted">${n}</span><span class="h-md">${v}</span></div>`).join('')}</div>
   <div class="h-sm">Посетители и подрядчики</div>${[...db.visitors.filter(v=>!v.outT).map(v=>[v.fio,`к ${v.to} · вход ${hm(v.inT)}`]),...db.contractors.filter(c=>!c.outT).map(c=>[c.fio,`${c.org} · ${c.why} · вход ${hm(c.inT)}`])].map(([f,s])=>`<div class="row">${av(f)}<div class="col" style="gap:0"><b class="lbl">${esc(f)}</b><span class="cap muted">${esc(s)}</span></div></div>`).join('')}
   <div class="h-sm">Персонал в здании · ${ib.staff}</div><div class="cap">${db.staff.filter(s=>s.st==='in').slice(0,14).map(s=>`${esc(s.short)} <span class="muted">(${esc(s.cat.toLowerCase())})</span>`).join(', ')}${ib.staff>14?` и ещё ${ib.staff-14}`:''}</div>
   <div class="h-sm">${p.kids} в здании · ${ib.kids}</div>
   <table class="table"><thead><tr><th>${p.grp}</th><th class="num">В здании</th><th class="num">По списку</th></tr></thead><tbody>${db.groups.map(g=>`<tr data-clickable data-act="att-grp" data-g="${esc(g.id)}"><td>${esc(g.id)}</td><td class="num">${K.filter(k=>k.g===g.id).length}</td><td class="num">${db.kids.filter(k=>k.g===g.id).length}</td></tr>`).join('')}</tbody></table>
  </div>`);
}

/* ================= Перекличка — телефон ответственного (SKD-EVC-02) ================= */
function vRollcall(){
  const p=P(), t=isTeacher(), g=t?p.teacher.grp:(S.rc.g||p.teacher.grp), E=S.evac;
  const sel=t?'':`<div class="row wrap" style="justify-content:center"><label class="label" for="rc-g" style="margin:0">Показать как видит</label><select class="field" id="rc-g" style="width:auto">${db.groups.map(x=>`<option ${x.id===g?'selected':''}>${esc(x.id)}</option>`).join('')}</select><span class="cap muted">${esc(db.groups.find(x=>x.id===g).resp)}</span></div>`;
  let body;
  if(!E){const K=db.kids.filter(k=>k.g===g);
    body=`<div class="msg">${ic('info','t-info')} Перекличка не активна. При эвакуации или учебной тревоге список ${p.grp==='Класс'?'класса':'группы'} — те, кто был в здании, — появится здесь автоматически.</div>
     <div class="row"><b>${esc(g)}</b><span class="sp"></span><span class="cap">в здании ${K.filter(k=>k.day.st==='in').length} из ${K.length}</span></div>
     ${K.map(k=>`<div class="kid">${av(k.short)}<span class="grow lbl">${esc(k.short)}</span>${stBadge(k)}</div>`).join('')}`}
  else{const L=E.snap.filter(x=>x.g===g), ok=L.filter(x=>['safe','par'].includes(E.marks[x.id])).length, q=E.queue.length;
    body=`<div class="banner ${E.drill?'b-warn':'b-danger'}" style="padding:10px 12px">${ic(E.drill?'stopwatch':'flame','ic-24')}<div class="col grow" style="gap:0"><b>${E.drill?'Учебная тревога':'Эвакуация'}</b><span class="cap">с ${hm(E.t0)} · <span class="timer" data-since="${+E.t0}">${fmtDur(NOW()-E.t0)}</span></span></div></div>
     <div class="row"><b class="h-sm">${esc(g)}</b><span class="sp"></span><span class="h-sm ${ok===L.length?'t-success':'t-danger'}" id="rc-count">${ok} / ${L.length}</span></div>
     <div class="prog ${ok===L.length?'ok':'bad'}"><i style="width:${pct(ok,L.length)}%"></i></div>
     ${q?`<div class="msg">${ic('cloud-offline')} Нет связи — в очереди ${q} ${plural(q,'отметка','отметки','отметок')}, отправятся автоматически</div>`:''}
     ${L.map(x=>{const k=KBY(x.id),m=E.marks[x.id]||(E.queue.find(y=>y[0]===x.id)||[])[1];return `<div class="kid ${m==='safe'?'safe':m==='miss'?'miss':m==='par'?'par':''}">${av(k.short)}<span class="grow col" style="gap:0"><span class="lbl">${esc(k.short)}</span><span class="cap muted">${m==='safe'?'на точке сбора':m==='miss'?'нет на точке сбора':m==='par'?'передан родителям':'нет отметки'}</span></span>
       <span class="kb"><button class="btn ${m==='safe'?'btn-green':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="safe" aria-label="${esc(k.short)} — на месте">${ic('check')}</button><button class="btn ${m==='miss'?'btn-red':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="miss" aria-label="${esc(k.short)} — нет">${ic('x')}</button>${p.parents?`<button class="btn ${m==='par'?'btn-primary':'btn-outline'}" data-act="rc-mark" data-id="${k.id}" data-v="par" aria-label="${esc(k.short)} — передан родителям">${ic('people')}</button>`:''}</span></div>`}).join('')}
     ${L.length?'':`<div class="cap muted">Никого из ${p.grp==='Класс'?'класса':'группы'} не было в здании на момент тревоги.</div>`}`}
  return `${sel}<div class="phone" aria-label="Экран телефона ответственного группы"><div class="phone-top">${ic('device-mobile')}<span>Безопасное образование · ${esc(t?p.teacher.short:db.groups.find(x=>x.id===g).resp)}</span><span class="sp"></span><span class="mono">${hm(NOW())}</span></div><div class="phone-b">${body}</div></div>
   <div class="cap muted" style="text-align:center">PWA для телефона: работает при слабой связи, отметки ставятся в очередь и досылаются (SKD-UI-01, SKD-EVC-02). Кнопки: ✓ на точке сбора · ✕ нет${p.parents?' · передан родителям':''}.</div>`;
}

/* ================= Приём и выдача детей (профиль «Детский сад», DOU-01/02) ================= */
function vHandover(){
  const p=P();
  if(!p.handover) return `<div class="card noaccess"><div class="empty">${ic('people','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Раздел профиля «Детский сад»</div><div class="cap">Приём и выдача детей доверенным лицам — в профиле дошкольного учреждения.</div><button class="btn btn-primary" data-act="profile" data-v="kinder">Переключить на «Детский сад»</button></div></div>`;
  const t=isTeacher(), g=t?p.teacher.grp:(S.ho.g||p.teacher.grp), K=db.kids.filter(k=>k.g===g), s=stats(K);
  return `<div class="page-h"><h1>Приём и выдача · ${esc(g)}</h1>${t?'':`<select class="field" id="ho-g" style="width:auto" aria-label="Группа">${db.groups.map(x=>`<option ${x.id===g?'selected':''}>${esc(x.id)}</option>`).join('')}</select>`}<span class="sp"></span><span class="cap muted">В группе ${K.filter(k=>k.day.st==='in'&&!k.day.handed).length} · выданы ${s.handed} · не пришли ${s.absent}</span></div>
  ${card('Дети группы',dataBlock(()=>`<div class="scroll-x"><table class="table"><thead><tr><th>Ребёнок</th><th>Статус</th><th>Привёл</th><th>Забрал</th><th style="text-align:right">Действие</th></tr></thead><tbody>${K.map(k=>{const d=k.day;return `<tr><td><button class="link-action" data-act="kid" data-id="${k.id}">${esc(k.fio)}</button></td><td>${stBadge(k)}</td><td class="cap">${d.brought?`${esc(d.brought.by)} · ${hm(d.brought.t)}`:'—'}</td><td class="cap">${d.handed?`${esc(d.handed.rel)} · ${esc(d.handed.fio)} · ${hm(d.handed.t)}${d.handed.phone?' · подтверждено по телефону':''}`:'—'}</td>
    <td style="text-align:right">${d.st==='absent'?`<button class="btn btn-outline" data-act="ho-accept" data-id="${k.id}">${ic('sign-in')}Принять</button>`:d.handed?'':`<button class="btn btn-primary" data-act="ho-give" data-id="${k.id}">${ic('sign-out')}Выдать</button>`}</td></tr>`}).join('')}</tbody></table></div>`,{rows:8}))}
  <div class="cap muted">Выдача только лицам из списка доверенных, который ведут законные представители и администрация. Человек не из списка — выдача блокируется до подтверждения законным представителем по телефону. Биометрия не используется.</div>`;
}
function dlgGive(id,pick=-1,stranger=false){
  const k=KBY(id);
  dlg(`<div class="dlg-h"><h2 class="dialog-title">Выдать ребёнка · ${esc(k.short)}</h2></div><div class="dlg-b">
   <div class="cap muted">Выберите, кто забирает. Сверьте человека с фото из карточки.</div>
   <div class="trust">${k.trusted.map((t,i)=>`<button class="tp ${t.exp?'exp':''}" data-act="tp-pick" data-id="${k.id}" data-i="${i}" aria-pressed="${i===pick}" ${t.exp?'disabled':''}>${av(t.fio,t.c,'xl')}<b class="lbl">${esc(t.fio.split(' ').slice(0,2).join(' '))}</b><span class="cap muted">${esc(t.rel)} · ${t.exp?'<span class="t-danger">срок истёк '+t.until+'</span>':'до '+esc(t.until)}</span></button>`).join('')}
     <button class="tp" data-act="tp-stranger" data-id="${k.id}" aria-pressed="${stranger}">${av('? ?','c3','xl')}<b class="lbl">Человек не из списка</b><span class="cap muted">выдача блокируется</span></button></div>
   ${stranger?`<div class="banner b-danger" style="padding:12px">${ic('no-entry','ic-24')}<div class="col grow" style="gap:4px"><b>Выдача заблокирована — человека нет в списке доверенных лиц</b><span class="cap">Позвоните законному представителю: ${esc(k.parent.fio)} · ${k.parent.phone}</span></div></div>
     <div><label class="label" data-required for="st-fio">ФИО забирающего</label><input class="field" id="st-fio" placeholder="Как в документе"></div>
     <label class="choice"><input type="checkbox" class="check" id="st-ok"> Законный представитель подтвердил по телефону</label><span class="helper" id="st-err"></span>`:''}
  </div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="give-ok" data-id="${k.id}" data-i="${pick}" data-s="${stranger?1:0}" ${pick<0&&!stranger?'disabled':''}>${stranger?'Выдать с подтверждением':'Выдать'}</button></div>`);
}

/* ================= События (SKD-EVT) ================= */
function vEvents(){
  const f=S.ev;
  return card('Журнал событий',`<div class="chips">${Object.keys(KNAME).map(k=>`<button class="chip" data-act="ev-chip" data-k="${k}" aria-pressed="${!!f.chips[k]}">${ic(KIC[k])}${KNAME[k]}${k==='pass'?' · по умолчанию выключены':''}</button>`).join('')}</div>
   <div class="toolbar"><div class="search">${ic('search')}<input class="field" id="ev-q" placeholder="Зона, камера, описание" value="${esc(f.q)}" aria-label="Поиск по событиям"></div>
    <select class="field" id="ev-st" aria-label="Статус"><option value="">Все статусы</option><option value="new" ${f.st==='new'?'selected':''}>Не обработаны</option><option value="done" ${f.st==='done'?'selected':''}>Обработаны</option></select>
    <span class="sp"></span><span class="row cap muted">Быстрые фильтры СКУД:</span>${['вход','выход'].map(x=>`<button class="chip" data-act="ev-acs" data-v="${x}">${x}</button>`).join('')}</div>
   <div id="ev-res">${evResults()}</div>`,{right:`<span class="cap muted">Неподтверждённая тревога через 60 с уходит следующему ответственному</span>`});
}
function evList(){
  const f=S.ev; let L=db.events.slice();
  if(f.chips.pass) L=L.concat(db.passes.slice(0,30).map((p,i)=>{const k=KBY(p.who)||db.staff.find(s=>s.id===p.who);return {id:'P'+i,t:p.t,kind:'pass',type:'pass',title:`${p.dir==='in'?'Вход':'Выход'}: ${k?.short||''}`,zone:p.pt,desc:k?.g||k?.cat,status:'done',result:'проход',person:k?.g?k.id:null}}));
  return L.filter(e=>f.chips[e.kind]&&(!f.st||e.status===f.st)&&(!f.q||(e.title+e.zone+(e.desc||'')).toLowerCase().includes(f.q.toLowerCase()))).sort((a,b)=>b.t-a.t);
}
function evResults(){return dataBlock(()=>{const L=evList(),sh=L.slice(0,S.ev.limit);return L.length?sh.map(evRow).join('')+`<div class="pager"><span class="cap muted">Показаны ${sh.length} из ${L.length} · последние 50</span><span class="sp"></span>${L.length>sh.length?`<button class="btn btn-outline" data-act="ev-more">Показать ещё</button>`:''}</div>`:`<div class="empty">${ic('bell','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Событий по фильтру нет</div><button class="btn btn-outline" data-act="ev-reset">Сбросить фильтры</button></div>`},{emptyText:'Событий нет',emptyIcon:'bell'})}
const SCEN={fight:['Камера выведена на пост охраны (автоматически)','Направить дежурного администратора к месту','Сообщить социальному педагогу','Записать участников и свидетелей'],tailgate:['Сверить кадр с проходами СКУД','Проверить человека на посту','При необходимости — зарегистрировать как посетителя'],panic:['Связаться с помещением по интеркому','Направить дежурного','При угрозе — нажать КТС'],fire:['Проверить место сработки по камере','При подтверждении — эвакуация уже идёт','Встретить пожарную охрану'],early:['Связаться с родителем','Уточнить у классного руководителя, отпущен ли'],dontknow:['Позвонить родителю','Проверить камеры входов за утро','При неясности — сообщить администрации'],stop:['Не впускать, вызвать администрацию','При угрозе — нажать КТС']};
function openEvent(id){
  const e=db.events.find(x=>x.id===id); if(!e){return}
  const cam=e.cam&&db.cams.find(c=>c.id===e.cam), k=e.person&&KBY(e.person), steps=SCEN[e.type];
  openSheet(`<div class="sheet-h"><span class="ev-i k-${e.kind}" style="width:32px;height:32px;border-radius:6px;display:grid;place-items:center">${ic(TIC[e.type]||KIC[e.kind])}</span><div class="col grow" style="gap:2px"><div class="h-md">${esc(e.title)}</div><div class="cap muted">${hms(e.t)} · ${esc(e.zone)}</div></div><button class="btn btn-icon" data-act="sheet-close" aria-label="Закрыть">${ic('x')}</button></div>
  <div class="sheet-b">
   ${cam?`<div class="player">${scene(cam,{crowd:e.type==='crowd'||e.type==='capacity',few:e.type==='fight'})}${['fight','tailgate','object'].includes(e.type)?`<div class="cam" style="position:absolute;inset:0;border:0;background:none;aspect-ratio:auto;cursor:default"><div class="bbox" style="left:38%;top:44%;width:24%;height:42%"><span>${esc(e.title)}</span></div></div>`:''}<span class="pl-l">Архив · камера «${esc(cam.name)}»</span><div class="bar">${ic('play')}<span class="mono">${hms(e.t)}</span><div class="track"><b style="left:20%;width:5%"></b><i style="left:25%"></i></div><span>−10 / +30 с</span></div></div>
     <div class="row"><button class="btn btn-outline" data-act="cam-open" data-id="${cam.id}">${ic('device-camera-video')}Live камеры</button><button class="btn btn-subtle" data-act="export" data-f="JPG" data-what="Стоп-кадр события">${ic('image')}Стоп-кадр</button></div>`:''}
   <dl class="dl"><dt>Тип</dt><dd>${KNAME[e.kind]}</dd><dt>Зона</dt><dd>${esc(e.zone)}</dd>${cam?`<dt>Камера</dt><dd>${esc(cam.name)}</dd>`:''}<dt>Описание</dt><dd>${esc(e.desc||'—')}</dd>${k?`<dt>${P().kid}</dt><dd><button class="link-action" data-act="kid" data-id="${k.id}">${esc(k.fio)} · ${esc(k.g)}</button></dd>`:''}${e.esc?`<dt>Эскалация</dt><dd class="t-danger">${esc(e.esc)}</dd>`:''}</dl>
   ${e.status==='done'?`<div class="card card-b"><div class="row"><span class="badge badge-neutral">${esc(e.result)}</span><span class="cap muted">${esc(e.by||'')} ${e.doneAt?hm(e.doneAt):''}</span></div>${e.comment?`<div style="margin-top:6px">${esc(e.comment)}</div>`:''}</div>`:`
   ${steps?`<div><div class="h-sm" style="margin-bottom:6px">Сценарий реагирования <span class="tag">из Incident Manager</span></div><div class="col" style="gap:0">${steps.map((s,i)=>`<label class="choice choice-dense"><input type="checkbox" class="check" ${i===0&&e.type==='fight'?'checked disabled':''}> ${esc(s)}</label>`).join('')}</div></div>`:''}
   <div><label class="label" data-required>Результат</label>${seg('ev-res-seg',[['подтверждено','Подтверждено'],['ложное','Ложное'],['учебное','Учебное']],e._res||'','ev-res')}<span class="helper" id="ev-err"></span></div>
   <div><label class="label" for="ev-c">Комментарий</label><input class="field" id="ev-c" placeholder="Что сделано"></div>
   <div class="row"><button class="btn btn-primary" data-act="ev-done" data-id="${e.id}">${ic('check')}Отметить «обработано»</button>${e.type==='fault'?`<a class="link-action" href="#service">Заявки ${ic('arrow-right')}</a>`:''}</div>
   <div class="cap muted">Отметка записывается в журнал аудита (SKD-EVT-03).</div>`}
  </div>`);
}
function addEvent(o){const e={id:'E'+(1000+db.events.length),t:NOW(),status:'new',fresh:true,...o};db.events.unshift(e);return e}

/* ================= Люди и пропуска (SKD-PPL) ================= */
function vPeople(){
  const t=S.ppl.tab;
  return `<div class="page-h"><h1>Люди и пропуска</h1><span class="sp"></span><button class="btn btn-outline" data-act="temp">${ic('id-badge')}Временный пропуск</button><button class="btn btn-primary" data-act="visitor">${ic('person-add')}Посетитель</button>${S.role==='guard'?'':`<button class="btn btn-outline" data-act="import">${ic('upload')}Импорт списка</button>`}</div>
  ${seg('ppl-tabs',[['holders','Держатели пропусков'],['visitors','Посетители'],['temp','Временные пропуска']],t,'ppl-tab')}
  ${t==='holders'?pplHolders():t==='visitors'?pplVisitors():pplTemp()}`;
}
function holders(){const p=P();return [...db.kids.map(k=>({id:k.id,fio:k.fio,cat:p.kid,grp:k.g,card:k.card,st:k.cardSt,why:k.blockWhy,o:k})),...db.staff.map(s=>({id:s.id,fio:s.fio,cat:'Персонал',grp:s.cat,card:s.card,st:s.cardSt,why:s.blockWhy,o:s}))]}
function pplHolders(){
  const f=S.ppl, all=holders(), L=all.filter(h=>(!f.q||h.fio.toLowerCase().includes(f.q.toLowerCase())||h.card.replace(/\s/g,'').includes(f.q.replace(/\s/g,'')))&&(!f.cat||h.cat===f.cat)&&(!f.st||h.st===f.st));
  const canBlock=S.role==='director'||S.role==='security';
  return card(`Держатели пропусков <span class="badge badge-neutral" id="holders-count">${all.length}</span>`,`<div class="toolbar"><div class="search">${ic('search')}<input class="field" id="ppl-q" placeholder="ФИО или номер карты" value="${esc(f.q)}" aria-label="Поиск"></div>
   <select class="field" id="ppl-cat" aria-label="Категория"><option value="">Все категории</option><option ${f.cat===P().kid?'selected':''}>${P().kid}</option><option ${f.cat==='Персонал'?'selected':''}>Персонал</option></select>
   <select class="field" id="ppl-st" aria-label="Статус пропуска"><option value="">Все пропуска</option><option value="active" ${f.st==='active'?'selected':''}>Активные</option><option value="blocked" ${f.st==='blocked'?'selected':''}>Заблокированные</option></select>
   <span class="sp"></span><span class="cap muted">Активных: ${all.filter(h=>h.st==='active').length} · заблокировано: ${all.filter(h=>h.st==='blocked').length}</span></div>
   <div id="ppl-res">${dataBlock(()=>{const pg=L.slice(f.page*50,f.page*50+50);return `<div class="scroll-x"><table class="table"><thead><tr><th>ФИО</th><th>Категория</th><th>${P().grp} / должность</th><th>Пропуск</th><th>Состояние</th><th style="text-align:right">Действие</th></tr></thead><tbody>${pg.map(h=>`<tr><td>${esc(h.fio)}</td><td class="cap">${esc(h.cat)}</td><td class="cap">${esc(h.grp)}</td><td class="mono cap">${h.card}</td><td>${h.st==='active'?'<span class="badge badge-success">Активен</span>':`<span class="badge badge-danger" data-tip="${esc(h.why||'')}">Заблокирован</span>`}</td>
     <td style="text-align:right">${canBlock?(h.st==='active'?`<button class="btn btn-outline" data-act="block" data-id="${h.id}">${ic('lock')}Заблокировать</button>`:`<button class="btn btn-outline" data-act="unblock" data-id="${h.id}">${ic('unlock')}Разблокировать</button>`):'<span class="cap muted">нет права</span>'}</td></tr>`).join('')}</tbody></table></div>${pager(L.length,f.page,'ppl-pg')}`},{rows:10})}</div>
   <div class="card-b cap muted">Блокировка выполняется в СКУД «Интеллект X» и записывается в журнал аудита. Причина обязательна (SKD-PPL-05).</div>`);
}
function pplVisitors(){
  const V=[...db.visitors.map(v=>({...v,kind:'Посетитель'})),...db.contractors.map(c=>({...c,kind:'Подрядчик',to:c.org,doc:'Договор'}))].sort((a,b)=>b.inT-a.inT);
  return card('Посетители и подрядчики за сегодня',dataBlock(()=>`<div class="scroll-x"><table class="table"><thead><tr><th>ФИО</th><th>Тип</th><th>Документ</th><th>К кому / организация</th><th>Цель</th><th>Вход</th><th>Выход</th><th></th></tr></thead><tbody>${V.map(v=>`<tr><td><span class="row">${av(v.fio)}${esc(v.fio)}</span></td><td class="cap">${v.kind}</td><td class="cap mono">${esc(v.doc)}</td><td class="cap">${esc(v.to)}</td><td class="cap">${esc(v.why)}</td><td class="mono cap">${hm(v.inT)}</td><td class="mono cap">${v.outT?hm(v.outT):'<span class="badge badge-info">в здании</span>'}</td><td style="text-align:right">${v.outT?'':`<button class="btn btn-outline" data-act="vis-out" data-id="${v.id}">${ic('sign-out')}Отметить выход</button>`}</td></tr>`).join('')}</tbody></table></div>`),{right:'<span class="cap muted">Вышедшие уходят из счётчика «в здании» (SKD-PPL-07)</span>'});
}
function pplTemp(){return card('Временные пропуска · гаснут в конце дня (SKD-PPL-06)',S.temp.length?`<table class="table"><thead><tr><th>Кому</th><th>Причина</th><th>Выдан</th><th>Действует до</th></tr></thead><tbody>${S.temp.map(t=>`<tr><td>${esc(t.fio)}</td><td class="cap">${esc(t.why)}</td><td class="mono cap">${hm(t.t)} · ${esc(t.by)}</td><td class="mono cap">${t.until}</td></tr>`).join('')}</tbody></table>`:`<div class="empty">${ic('id-badge','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Сегодня временных пропусков нет</div><button class="btn btn-outline" data-act="temp">Выдать временный пропуск</button></div>`)}
const STOP=[{fio:'Зуев Игорь Валерьевич',why:'Ограничение общения с ребёнком по решению суда',basis:'Решение районного суда, копия у директора',until:'до 31.08.2027'}];

/* ================= Журналы (SKD-REG) ================= */
function vJournals(){
  const k=S.kts, p=P();
  const J=[
    ['shield','Ежедневная проверка КТС и тревожной кнопки',k?`<span class="badge badge-success">${ic('check')}Сегодня ${hm(k.t)}</span><div class="cap muted">Подтверждено событием «${esc(k.ev)}» · ${esc(k.by)}</div>`:`<span class="badge badge-warning">${ic('clock')}Не выполнена</span><div class="cap muted">Напоминание в 09:00, событие администрации в 10:00</div>`,`<button class="btn btn-primary" data-act="kts-test">${ic('shield')}Тест КТС</button>`],
    ['location','Журнал обхода территории <span class="tag">расш.</span>',`<span class="badge badge-info">2 из 3 обходов</span><div class="cap muted">08:30 ✓ · 10:00 ✓ · следующий 12:00</div>`,`<button class="btn btn-outline" data-act="jr" data-j="Обход территории">Открыть</button>`],
    ['people','Журнал посетителей',`<span class="badge badge-neutral">${db.visitors.length+db.contractors.length} за сегодня</span><div class="cap muted">В здании: ${inBuilding().vis+inBuilding().con}</div>`,`<button class="btn btn-outline" data-act="ppl-open-vis">Открыть</button>`],
    ['sync','Приём и сдача дежурства',`<span class="badge badge-success">Принято 08:00</span><div class="cap muted">Козлов В. Д. → ${esc(ROLES.guard.short)} · замечаний нет</div>`,`<button class="btn btn-outline" data-act="jr" data-j="Приём и сдача дежурства">Открыть</button>`],
    ['flame','Проверка СПС и СОУЭ',`<span class="badge badge-success">01.11 · ежемесячно</span><div class="cap muted">ООО «Пожтехника» · следующая 01.12</div>`,`<button class="btn btn-outline" data-act="jr" data-j="Проверка СПС и СОУЭ">Открыть</button>`],
    ['book','Журнал инструктажей',`<span class="badge badge-neutral">3 за месяц</span><div class="cap muted">Последний 02.11 · антитеррористический</div>`,`<button class="btn btn-outline" data-act="jr" data-j="Журнал инструктажей">Открыть</button>`],
  ];
  const canDrill=S.role==='director'||S.role==='security';
  return `<div class="grid3">${J.map(([i,t,s,b])=>`<section class="card"><div class="card-h">${ic(i,'ic-18')}<h2>${t}</h2></div><div class="card-b col" style="gap:6px">${s}<div class="row" style="margin-top:6px">${b}</div></div></section>`).join('')}</div>
  ${card('Учебные эвакуации и тренировки (SKD-REG-03)',`<div class="scroll-x"><table class="table"><thead><tr><th>Дата</th><th>Начало</th><th class="num">${p.kids}</th><th>До полного учёта</th><th>Самая долгая ${p.grp==='Класс'?'класс':'группа'}</th><th>Провёл</th><th></th></tr></thead><tbody>${S.drills.map((d,i)=>`<tr ${d.fresh?'style="background:var(--one-accent-soft)"':''}><td>${d.date}</td><td class="mono cap">${d.t}</td><td class="num">${d.kids}</td><td class="mono"><b>${d.dur}</b></td><td class="cap">${esc(d.slow)}</td><td class="cap">${esc(d.by)}</td><td style="text-align:right"><button class="btn btn-subtle" data-act="drill-proto" data-i="${i}">${ic('file')}Протокол</button></td></tr>`).join('')}</tbody></table></div>`,{right:canDrill?`<button class="btn btn-outline" data-act="mode" data-m="drill">${ic('stopwatch')}Начать учебную тревогу</button>`:''})}
  ${card('Паспорт безопасности · данные систем (SKD-REG-04)',`<div class="scroll-x"><table class="table"><thead><tr><th>Мера АТЗ</th><th class="num">Всего</th><th class="num">Исправно</th><th>Покрытие</th></tr></thead><tbody>${db.sys.map(s=>`<tr><td>${esc(s.name)}</td><td class="num">${s.total}</td><td class="num">${s.total-s.faults.length}</td><td>${sysState(s)==='ok'?'<span class="badge badge-success">полностью</span>':`<span class="badge badge-warning">${s.faults.length} неисправно</span>`}</td></tr>`).join('')}</tbody></table></div><div class="card-b cap muted">Категория АТЗ объекта — 2 (ПП РФ № 1006). Решение не формирует паспорт, а даёт фактические данные для его актуализации.</div>`)}`;
}

/* ================= Отчёты (SKD-RPT) ================= */
function vReports(){
  const R=[['Посещаемость: табель по группам за период','XLSX, PDF, CSV','пн 08:00 → директор'],['Сводка посещаемости по объекту','PDF','ежедневно 09:30 → директор, зам.'],['События и тревоги по типам и зонам','XLSX, PDF','—'],['Время реакции на тревоги','PDF','еженедельно → директор'],['Доступность подсистем','PDF','ежемесячно → директор'],['Неисправности и SLA обслуживающих организаций','XLSX, PDF','пт 16:00 → зам. по безопасности'],['Журналы проверок (REG)','PDF','—'],['Эвакуации и тренировки','PDF','—'],['Посетители','XLSX','—']];
  return card('Отчёты',`<div class="scroll-x"><table class="table"><thead><tr><th>Отчёт</th><th>Форматы</th><th>Рассылка по расписанию</th><th></th></tr></thead><tbody>${R.map(r=>`<tr><td style="font-weight:500">${r[0]}</td><td class="cap">${r[1]}</td><td class="cap muted">${r[2]}</td><td style="text-align:right;white-space:nowrap"><button class="btn btn-outline" data-act="export" data-f="${r[1].split(',')[0]}" data-what="${esc(r[0])}">${ic('download')}Сформировать</button> <button class="btn btn-subtle" data-act="sched">${ic('clock')}Расписание</button></td></tr>`).join('')}</tbody></table></div>
   <div class="card-b cap muted">Фильтры: период, здание, ${P().grp.toLowerCase()}. Право на экспорт выдаётся отдельно от права на просмотр (SKD-RPT-02). Время реакции — в AxxonData, если развёрнута (уточнить).</div>`);
}

/* ================= Обслуживание (SKD-SYS-03/04) ================= */
function slaOf(t){return S.sla[t.sys]||S.sla.other}
function vService(){
  const isDir=S.role==='director', faultsNoTicket=db.sys.flatMap(s=>s.faults.filter(f=>!f.ticket).map(f=>({...f,sys:s.id,sn:s.name})));
  return `<div class="grid4">${db.sys.slice(0,4).map(s=>`<div class="card kpi" style="cursor:default"><span class="row"><span class="light ${sysState(s)}"></span><span class="lbl">${esc(s.name)}</span></span><span class="h-md">${s.total-s.faults.length} / ${s.total}</span><span class="cap muted">${s.faults.length?`неисправно: ${s.faults.length}`:'все в норме'}</span></div>`).join('')}</div>
  <div class="g-main">
   ${card('Заявки обслуживающим организациям',dataBlock(()=>`<div class="scroll-x"><table class="table"><thead><tr><th>№</th><th>Устройство</th><th>Организация</th><th>Создана</th><th>SLA</th><th>Статус</th><th style="text-align:right"></th></tr></thead><tbody>${db.tickets.map(t=>{const age=(NOW()-t.created)/36e5,over=['created','fixed'].includes(t.st)&&t.st==='created'&&age>slaOf(t);
     return `<tr ${over?'style="box-shadow:inset 3px 0 0 var(--one-danger-icon)"':''}><td class="mono">${t.id}</td><td>${esc(t.dev)}</td><td class="cap">${esc(t.org)}</td><td class="mono cap">${dm(t.created)} ${hm(t.created)}</td><td class="cap">${slaOf(t)} ч${over?`<br><span class="badge badge-danger">просрочено на ${Math.round(age-slaOf(t))} ч</span>`:t.st==='created'?`<br><span class="cap muted">осталось ${Math.max(0,Math.round(slaOf(t)-age))} ч</span>`:''}</td>
     <td>${{created:'<span class="badge badge-warning">Создана</span>',fixed:'<span class="badge badge-info">Устранена</span>',auto:'<span class="badge badge-info">Устранена (автоматически)</span>',confirmed:'<span class="badge badge-success">Подтверждена</span>'}[t.st]}</td>
     <td style="text-align:right;white-space:nowrap">${t.st==='created'?`<button class="btn btn-outline" data-act="tk-fixed" data-id="${t.id}">Устранена</button>`:['fixed','auto'].includes(t.st)&&(isDir||S.role==='security')?`<button class="btn btn-primary" data-act="tk-confirm" data-id="${t.id}">${ic('check')}Подтвердить</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`,{rows:5}),{right:'<span class="cap muted">создана → устранена → подтверждена</span>'})}
   <div class="col" style="gap:16px">
    ${card('Неисправности без заявки',faultsNoTicket.length?faultsNoTicket.map(f=>`<div class="act-row">${ic('alert','t-warning')}<span class="grow col" style="gap:0"><b class="lbl">${esc(f.dev)}</b><span class="cap muted">${esc(f.sn)} · ${esc(f.zone)} · с ${esc(f.since)} · ${esc(f.what)}</span></span><button class="btn btn-outline" data-act="tk-new" data-sys="${f.sys}" data-dev="${esc(f.dev)}">Создать заявку</button></div>`).join(''):`<div class="empty">${ic('check-circle','ic-32 t-success')}Все неисправности в работе</div>`)}
    ${card('SLA — устанавливает директор',`<div class="card-b col">${[['video','Видеонаблюдение'],['fire','СПС'],['kts','КТС и тревожные кнопки'],['other','Остальные подсистемы']].map(([k,n])=>`<div class="row"><span class="grow">${n}</span><input class="field" style="width:80px" type="number" min="1" id="sla-${k}" value="${S.sla[k]}" ${isDir?'':'disabled'} aria-label="SLA ${n}, часов"><span class="cap muted">ч</span></div>`).join('')}${isDir?`<button class="btn btn-primary" data-act="sla-save">Сохранить</button>`:'<span class="cap muted">Изменить может только директор</span>'}</div>`)}
    ${card('Все неисправности',db.sys.flatMap(s=>s.faults.map(f=>`<div class="act-row">${ic('tools','t-muted')}<span class="grow col" style="gap:0"><b class="lbl">${esc(f.dev)}</b><span class="cap muted">${esc(s.name)} · ${esc(f.zone)} · с ${esc(f.since)} · ${esc(f.what)}</span></span>${f.ticket?`<span class="tag">${f.ticket}</span>`:''}</div>`)).join('')||`<div class="empty">Неисправностей нет</div>`)}
   </div></div>`;
}

/* ================= Настройки ================= */
function vSettings(){
  const p=P(), r=p.rules, n=S.notif;
  return `<div class="grid2">
   ${card('Профиль учреждения (SKD-UI-04)',`<div class="card-b col"><div class="cap muted">Профиль задаёт словарь, правила присутствия, сценарии и разделы. Ядро общее.</div>${seg('set-prof',[['school','Школа'],['kinder','Детский сад'],['college','Колледж']],p.id,'profile')}<dl class="dl"><dt>Учреждение</dt><dd>${esc(p.org)}</dd><dt>Словарь</dt><dd>${p.kids} · ${p.grp} · ${p.resp}</dd><dt>Уведомления родителям</dt><dd>${p.parents?'да, мессенджер MAX':'нет — студенты сами'}</dd><dt>Приём и выдача</dt><dd>${p.handover?'да, доверенные лица':'нет'}</dd></dl></div>`)}
   ${card('Правила дня (SKD-PRS-03)',`<div class="card-b grid2" style="gap:12px">${[['Окно прихода с',r.from],['Окно прихода до',r.to],['Опоздание после',r.late],['Пропуск после',r.miss]].map(([l,v],i)=>`<div><label class="label" for="rule-${i}">${l}</label><input class="field" id="rule-${i}" value="${v.map(pad).join(':')}"></div>`).join('')}<div class="cap muted" style="grid-column:1/-1">Учитывается расписание ${p.grp==='Класс'?'класса':'группы'}: вторая смена, разные начала занятий.</div></div>`)}
   ${card('Уведомления законным представителям в MAX (SKD-NTF)',`<div class="card-b col" style="gap:4px">${p.parents?[['in','«Пришёл в 08:12»'],['out','«Ушёл в 14:35»'],['miss','«Не пришёл к 09:00» с кнопками причины'],['early','«Ушёл раньше расписания»'],['quiet','Тихие часы 21:00–07:00']].map(([k,l])=>`<label class="choice"><input type="checkbox" class="switch" role="switch" data-notif="${k}" ${n[k]?'checked':''}> ${l}</label>`).join('')+'<div class="cap muted">Только с согласия родителя. Видео и данные других детей не отправляются.</div>':'<div class="cap muted">В профиле «Колледж» уведомления родителям выключены.</div>'}</div>`)}
   ${card('Вместимость зон (SKD-OBJ-04)',`<table class="table"><thead><tr><th>Зона</th><th class="num">Вместимость</th></tr></thead><tbody>${db.zones.map((z,i)=>`<tr><td>${esc(z[0])}</td><td class="num"><input class="field" style="width:90px;text-align:right" id="cap-${i}" value="${z[2]}" aria-label="Вместимость: ${esc(z[0])}"></td></tr>`).join('')}</tbody></table>`)}
   ${card('Режимы по расписанию (SKD-MOD-02)',`<table class="table"><thead><tr><th>Режим</th><th>Когда</th></tr></thead><tbody><tr><td>Учебный день</td><td class="cap">пн–пт ${r.from.map(pad).join(':')}–18:00</td></tr><tr><td>Нерабочее время</td><td class="cap">пн–пт 18:00–${r.from.map(pad).join(':')}, сб–вс</td></tr><tr><td>Каникулы</td><td class="cap">28.12–11.01 · 23.03–31.03 · 01.06–31.08</td></tr></tbody></table><div class="card-b cap muted">Сработка СПС → «Эвакуация» автоматически. Пожар отменяет ЧС — не настраивается (SKD-MOD-05).</div>`)}
  </div><div class="row"><span class="sp"></span><button class="btn btn-primary" data-act="settings-save">${ic('check')}Сохранить настройки</button></div>`;
}

/* ================= Аудит (SKD-AUD) ================= */
function vAudit(){
  const f=S.aud, bad=verifyChain(), users=[...new Set(S.audit.map(a=>a.user))];
  const L=S.audit.filter(a=>(!f.user||a.user===f.user)&&(!f.q||(a.action+a.obj).toLowerCase().includes(f.q.toLowerCase())));
  return card('Журнал действий пользователей',`<div class="toolbar"><div class="search">${ic('search')}<input class="field" id="aud-q" placeholder="Действие или объект" value="${esc(f.q)}" aria-label="Поиск по журналу"></div><select class="field" id="aud-user" aria-label="Пользователь"><option value="">Все пользователи</option>${users.map(u=>`<option ${u===f.user?'selected':''}>${esc(u)}</option>`).join('')}</select><span class="sp"></span>${bad<0?`<span class="badge badge-success" style="white-space:normal">${ic('verified')}Цепочка хешей проверена · ${S.audit.length} записей, расхождений нет</span>`:`<span class="badge badge-danger">Нарушена цепочка в записи ${bad}</span>`}</div>
   <div id="aud-res">${dataBlock(()=>{const pg=L.slice(f.page*50,f.page*50+50);return `<div class="scroll-x"><table class="table"><thead><tr><th>Время</th><th>Пользователь</th><th>Действие</th><th>Объект</th><th>Хеш</th></tr></thead><tbody>${pg.map(a=>`<tr><td class="mono cap">${hms(a.t)}</td><td><div>${esc(a.user)}</div><div class="cap muted">${esc(a.role)}</div></td><td>${esc(a.action)}</td><td class="cap">${esc(a.obj)}</td><td class="hash" data-tip="предыдущий ${a.prev}">${a.h}</td></tr>`).join('')}</tbody></table></div>${pager(L.length,f.page,'aud-pg')}`},{rows:10})}</div>
   <div class="card-b cap muted">Записи только добавляются, изменить или удалить их нельзя. Каждая запись содержит хеш предыдущей. Просмотр — только администрация учреждения и аудитор (SKD-AUD-02).</div>`,{right:`<button class="btn btn-outline" data-act="export" data-f="CSV" data-what="Журнал аудита">${ic('download')}Выгрузить</button>`});
}

/* ================= router ================= */
const VIEWS={home:vHome,post:vPost,video:vVideo,attendance:vAttendance,handover:vHandover,events:vEvents,rollcall:vRollcall,people:vPeople,journals:vJournals,reports:vReports,service:vService,settings:vSettings,audit:vAudit};
function navHtml(){
  const p=P(), newEv=db.events.filter(e=>e.status==='new').length, over=db.tickets.filter(t=>t.st==='created'&&(NOW()-t.created)/36e5>slaOf(t)).length;
  const I={home:'home',post:'shield',video:'device-camera-video',attendance:'checklist',handover:'people',events:'bell',rollcall:'device-mobile',people:'id-badge',journals:'book',reports:'graph',service:'tools',settings:'gear',audit:'log'};
  const T={...TITLES,attendance:isTeacher()?`Мой ${p.grp==='Класс'?'класс':'группа'}`:'Посещаемость'};
  const B={events:newEv?`<span class="badge badge-danger">${newEv}</span>`:'',service:over?`<span class="badge badge-danger">${over}</span>`:'',rollcall:S.evac?'<span class="badge badge-danger">идёт</span>':''};
  const sec=[['Объект',['home','post','video','attendance','handover','events','rollcall']],['Учёт и регламенты',['people','journals','reports','service']],['Администрирование',['settings','audit']]];
  return sec.map(([n,rs])=>{const v=rs.filter(allowed);return v.length?`<div class="ov">${n}</div>`+v.map(r=>`<a class="nav-item" href="#${r}" ${S.route===r?'aria-current="page"':''}>${ic(I[r])}${T[r]}${B[r]||''}</a>`).join(''):''}).join('');
}
function header(){
  const m=MBY[S.mode], u=user();
  const chip=$('#mode-chip'); chip.className='mode-chip '+m.cls; chip.innerHTML=`${ic(m.ic)}<span class="mc-t">${m.name}</span>${ic('chevron-down')}`; chip.setAttribute('aria-label','Режим объекта: '+m.name);
  $('#org-name').textContent=P().org; $('#user-name').textContent=u.short; $('#um-name').textContent=u.fio||u.short; $('#um-role').textContent=u.role;
  $('#mode-menu').innerHTML=`<div style="padding:8px 12px 4px" class="ov">Режим объекта</div>${MODES.map(x=>`<button class="mm-item" role="menuitemradio" aria-checked="${x.id===S.mode}" data-act="mode" data-m="${x.id}" ${canMode()?'':'disabled'}><span class="light ${x.light}"></span><span class="col grow" style="gap:2px"><b class="lbl" style="color:var(--one-fg)">${x.name}</b><span class="cap muted">${x.d}</span></span>${x.id===S.mode?ic('check','t-success'):''}</button>`).join('')}<div class="cap muted" style="padding:8px 12px;border-top:1px solid var(--one-border)">${canMode()?'Переключение требует подтверждения и пишется в аудит. «ЧС» — удержание 2 с.':'Переключать режимы может администрация и пост охраны.'}</div>`;
  $('#stale').hidden=!S.offline; $('#upd').classList.toggle('off',S.offline); $('#stale-t').textContent=hms(S.lastUpd||NOW()); $('#upd-t').textContent=(S.offline?'Нет связи · ':'Обновлено ')+hms(S.lastUpd||NOW());
}
const canMode=()=>S.role!=='teacher';
function render(){
  const r=(location.hash||'').slice(1).split('?')[0]; S.route=VIEWS[r]?r:ROLES[S.role].home;
  $('#nav').innerHTML=navHtml(); header();
  $('#page-title').textContent=S.route==='attendance'&&isTeacher()?'Мой '+(P().grp==='Класс'?'класс':'группа'):TITLES[S.route]; document.title=`${TITLES[S.route]} · Безопасное образование — прототип`;
  $('#view').innerHTML=allowed(S.route)?VIEWS[S.route]():noAccess(); OnePsimKit.init($('#view'));
  $('#side').removeAttribute('data-open');
}
function noAccess(){const why=S.route==='audit'?'Журнал аудита доступен только администрации учреждения и аудитору (SKD-AUD-02).':S.route==='handover'?'Раздел есть только в профиле «Детский сад».':`Роль «${user().role}» не видит этот раздел (раздел 9 ТЗ).`;
  return `<div class="card noaccess"><div class="empty">${ic('lock','ic-32')}<div class="h-sm" style="color:var(--one-fg)">Нет доступа</div><div class="cap">${why}</div><a class="btn btn-outline" href="#${ROLES[S.role].home}">На свой главный экран</a></div></div>`}
function rerender(){const y=window.scrollY;render();window.scrollTo(0,y)}
window.addEventListener('hashchange',()=>{closeSheet();render();window.scrollTo(0,0)});

/* ================= dialogs / sheet ================= */
function dlg(html,o={}){const d=$('#dlg');d.className='dialog'+(o.wide?' wide':'');d.innerHTML=html;OnePsimKit.init(d);if(!d.open)d.showModal();const f=$('input:not([type=checkbox]),select,textarea',d);f&&f.focus()}
function closeDlg(){const d=$('#dlg');if(d.open)d.close()}
function openSheet(html){const s=$('#sheet');s.innerHTML=html;s.setAttribute('data-open','');$('#sheet-scrim').hidden=false;OnePsimKit.init(s);s.focus()}
function closeSheet(){$('#sheet').removeAttribute('data-open');$('#sheet-scrim').hidden=true}
const MODE_REASONS=['По распоряжению директора','Изменение расписания','Мероприятие по плану','Другое'];
function dlgMode(m){
  const x=MBY[m];
  if(m===S.mode) return;
  if(m==='lock'){
    if(S.mode==='evac'){toast('Во время эвакуации режим ЧС не включается — приоритет пожара (SKD-MOD-05)','alarm');return}
    dlg(`<div class="dlg-h">${ic('lock','ic-24 t-danger')}<h2 class="dialog-title">Включить режим ЧС</h2></div><div class="dlg-b">
      <div>Входы закроются на вход, выходы останутся свободными. По зонам прозвучит условное сообщение, персонал получит инструкцию в MAX.</div>
      <button class="btn btn-red hold" id="hold-lock" style="height:56px;font-size:16px" aria-label="Удерживайте 2 секунды, чтобы включить ЧС">${ic('lock')}Удерживайте 2 секунды<span class="fill"></span></button>
      <div class="cap muted">Одно нажатие и удержание — без лишних диалогов (SKD-MOD-02). Росгвардия вызывается штатной КТС.</div></div>
      <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button></div>`);
    bindHold($('#hold-lock'),()=>{closeDlg();setMode('lock','удержание кнопки ЧС')});
    return;
  }
  if(m==='evac'||m==='drill'){
    dlg(`<div class="dlg-h">${ic(x.ic,'ic-24 '+(m==='evac'?'t-danger':'t-warning'))}<h2 class="dialog-title">${m==='evac'?'Начать эвакуацию вручную':'Начать учебную тревогу'}</h2></div><div class="dlg-b">
      <div>${m==='evac'?'Двери разблокируются, прозвучит СОУЭ, зафиксируется список «кто в здании», у ответственных групп откроется перекличка.':'Тот же механизм, что при эвакуации: перекличка и замер времени до полного учёта. Родителям и учредителю уведомления не уходят.'}</div>
      ${S.mode==='lock'?`<div class="banner b-danger" style="padding:10px">${ic('alert')}<span>Режим ЧС будет отменён: при эвакуации выходы не блокируются.</span></div>`:''}
      <div><label class="label" for="md-r">Основание</label><input class="field" id="md-r" value="${m==='evac'?'Визуальное обнаружение задымления':'Плановая тренировка по графику'}"></div></div>
      <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn ${m==='evac'?'btn-red':'btn-primary'}" data-act="mode-ok" data-m="${m}">${m==='evac'?'Начать эвакуацию':'Начать учебную тревогу'}</button></div>`);
    return;
  }
  if(S.mode==='evac'||S.mode==='drill'){toast('Сначала завершите эвакуацию на главном экране','alarm');return}
  if(S.mode==='lock'){dlgLockEnd();return}
  dlg(`<div class="dlg-h">${ic(x.ic,'ic-24')}<h2 class="dialog-title">Режим «${x.name}»</h2></div><div class="dlg-b"><div class="cap muted">${x.d}</div>
    <div><label class="label" data-required for="md-r">Причина</label><select class="field" id="md-r"><option value="">Выберите причину</option>${MODE_REASONS.map(r=>`<option>${r}</option>`).join('')}</select><span class="helper" id="md-err"></span></div></div>
    <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="mode-ok" data-m="${m}" data-req="1">Включить</button></div>`);
}
function bindHold(b,done){let t=null;const start=e=>{e.preventDefault();b.classList.add('holding');t=setTimeout(()=>{t=null;b.classList.remove('holding');done()},2000)},stop=()=>{if(t){clearTimeout(t);t=null}b.classList.remove('holding')};
  b.addEventListener('pointerdown',start);['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
  b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat&&!t)start(e)});b.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' ')stop()});b.__hold=done}
function setMode(m,reason=''){
  const prev=S.mode;
  if(m==='evac'||m==='drill'){
    if(prev==='lock'){aud('Режим ЧС отменён автоматически','приоритет пожара (SKD-MOD-05)');toast('Пожар отменяет режим ЧС: выходы и пути эвакуации разблокированы','alarm')}
    startEvac(m==='drill',reason); S.lock=null;
  } else if(m==='lock'){S.lock={t0:NOW(),by:user().short};S.doors='locked_in';S.alarm.kts='режим ЧС';addEvent({kind:'alarm',type:'lock',title:'Включён режим ЧС',zone:'Объект',cam:null,desc:`Включил ${user().short}`,sev:'high',status:'done',result:'подтверждено',by:user().short})}
  else {S.doors='normal';delete S.alarm.kts}
  S.mode=m; aud(`Режим: ${MBY[prev].name} → ${MBY[m].name}`,reason);
  if(m==='evac'||m==='drill'||m==='lock') location.hash='#'+(isTeacher()?'rollcall':S.role==='guard'?'post':'home');
  rerender();
}
function dlgLockEnd(){dlg(`<div class="dlg-h">${ic('unlock','ic-24')}<h2 class="dialog-title">Отменить режим ЧС</h2></div><div class="dlg-b"><div><label class="label" data-required for="le-r">Основание отмены</label><select class="field" id="le-r"><option value="">Выберите</option><option>Угроза устранена, подтверждено Росгвардией</option><option>Ложная тревога</option><option>Учебная тренировка завершена</option></select><span class="helper" id="le-err"></span></div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="lock-end-ok">Отменить ЧС</button></div>`)}
function endEvac(force){
  const E=S.evac, c=evacCounts();
  if(c.left&&!force){dlg(`<div class="dlg-h">${ic('alert','ic-24 t-danger')}<h2 class="dialog-title">Не учтено: ${c.left}</h2></div><div class="dlg-b"><div>Есть ${P().kidsGen} без отметки на точке сбора. Завершить ${E.drill?'тревогу':'эвакуацию'} всё равно?</div><div><label class="label" data-required for="ee-r">Основание</label><input class="field" id="ee-r" placeholder="Например: найдены в медпункте, отметил дежурный"></div><span class="helper" id="ee-err"></span></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>Вернуться</button><button class="btn btn-red" data-act="evac-end-force">Завершить</button></div>`);return}
  const dur=fmtDur((E.doneAt||NOW())-E.t0), slow=Object.entries(E.gDone).sort((a,b)=>b[1]-a[1])[0];
  if(E.drill){S.drills.unshift({date:dmy(NOW()),t:hm(E.t0),kids:E.snap.length,dur,slow:slow?`${slow[0]} · ${fmtDur(slow[1]-E.t0)}`:'—',by:user().short,fresh:true,groups:{...E.gDone},t0:E.t0})}
  aud(E.drill?'Учебная тревога завершена':'Эвакуация завершена',`учтено ${c.ok} из ${c.kids}, время ${dur}`);
  S.evacLast=E; S.evac=null; S.doors='normal'; delete S.alarm.fire; S.mode='day'; aud('Режим: '+(E.drill?'Учебная тревога':'Эвакуация')+' → Учебный день','');
  closeDlg(); if(E.drill){location.hash='#journals';toast(`Протокол учебной эвакуации сохранён в журнал тренировок · ${dur}`)} else {toast(`Эвакуация завершена · учтено ${c.ok} из ${c.kids}`)} rerender();
}
function drillProto(d){const G=Object.entries(d.groups||{}).sort((a,b)=>b[1]-a[1]);
  dlg(`<div class="dlg-h">${ic('file','ic-24')}<h2 class="dialog-title">Протокол учебной эвакуации · ${d.date}</h2></div><div class="dlg-b"><dl class="dl"><dt>Начало</dt><dd>${d.t}</dd><dt>${P().kids} в здании</dt><dd>${d.kids}</dd><dt>До полного учёта</dt><dd><b>${d.dur}</b></dd><dt>Провёл</dt><dd>${esc(d.by)}</dd></dl>
   ${G.length?`<table class="table"><thead><tr><th>${P().grp}</th><th class="num">Учёт за</th></tr></thead><tbody>${G.slice(0,8).map(([g,t])=>`<tr><td>${esc(g)}</td><td class="num mono">${fmtDur(t-d.t0)}</td></tr>`).join('')}</tbody></table><div class="cap muted">Показаны 8 самых долгих</div>`:'<div class="cap muted">Детализация по группам — в PDF</div>'}</div>
   <div class="dlg-f"><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Протокол учебной эвакуации">${ic('download')}PDF</button><button class="btn btn-primary" data-kit-close>Закрыть</button></div>`)}
function evacReport(){const E=S.evac||S.evacLast;if(!E)return;const U=E.snap.filter(x=>!['safe','par'].includes(E.marks[x.id]));
  dlg(`<div class="dlg-h">${ic('file','ic-24')}<h2 class="dialog-title">Итог для руководителя тушения</h2><span class="sp"></span><span class="cap mono">${hms(NOW())}</span></div><div class="dlg-b">
   <dl class="dl"><dt>Причина</dt><dd>${esc(E.cause)}</dd><dt>Начало</dt><dd>${hms(E.t0)}</dd><dt>В здании на момент тревоги</dt><dd>${E.snap.length} ${P().kidsGen}, ${E.staffIn} сотрудников, ${E.visIn} посетителей</dd><dt>Не учтены</dt><dd><b class="${U.length?'t-danger':'t-success'}">${U.length}</b></dd></dl>
   ${U.length?`<table class="table"><thead><tr><th>ФИО</th><th>${P().grp}</th><th>Последнее известное место</th></tr></thead><tbody>${U.map(x=>{const k=KBY(x.id);return `<tr><td>${esc(k.fio)}</td><td>${esc(k.g)}</td><td class="cap">${esc(x.last)}</td></tr>`}).join('')}</tbody></table>`:''}
   <div class="cap muted">PDF содержит план этажей и список персонала на объекте (SKD-EVC-04).</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-act="export" data-f="PDF" data-what="Итог эвакуации для РТП">${ic('download')}PDF</button><button class="btn btn-primary" data-kit-close>Закрыть</button></div>`,{wide:1})}
function dlgVisitor(){
  dlg(`<div class="dlg-h">${ic('person-add','ic-24')}<h2 class="dialog-title">Регистрация посетителя</h2></div><div class="dlg-b">
   <div class="grid2"><div><label class="label" data-required for="vi-f">ФИО</label><input class="field" id="vi-f" placeholder="Как в документе"></div><div><label class="label" data-required for="vi-d">Документ</label><input class="field" id="vi-d" placeholder="Паспорт, последние 4 цифры"></div>
    <div><label class="label" data-required for="vi-t">К кому</label><select class="field" id="vi-t"><option value="">Выберите</option><option>${esc(P().teacher.short)} (${P().respShort} ${esc(P().teacher.grp)})</option><option>Директор</option><option>Заместитель директора</option><option>Завхоз</option><option>Медработник</option></select></div><div><label class="label" for="vi-w">Цель</label><input class="field" id="vi-w" placeholder="Встреча, доставка…"></div></div>
   <div class="row"><div class="thumb" style="width:120px;height:68px;border-radius:6px;overflow:hidden;position:relative;background:var(--one-surface-subtle)">${scene({id:'vis',name:'post',z:'',b:''},{few:1})}</div><div class="cap muted">Фото с камеры поста — снимок сделан при регистрации. Для сверки на посту, без биометрии.</div></div>
   <div id="vi-stop" class="cap muted">Проверка по стоп-листу объекта — по ФИО и документу. Для демонстрации совпадения введите «Зуев».</div><span class="helper" id="vi-err"></span></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="visitor-ok">Зарегистрировать и впустить</button></div>`)}
function dlgTemp(){const K=db.kids.slice(0,400);
  dlg(`<div class="dlg-h">${ic('id-badge','ic-24')}<h2 class="dialog-title">Временный пропуск</h2></div><div class="dlg-b">
   <div><label class="label" data-required for="tp-k">Кому</label><select class="field" id="tp-k"><option value="">Выберите ${P().kid.toLowerCase()}а или посетителя</option>${K.filter(k=>k.day.st!=='absent').slice(0,60).map(k=>`<option value="${k.id}">${esc(k.fio)} · ${esc(k.g)}</option>`).join('')}</select><span class="helper" id="tp-err"></span></div>
   <div><label class="label" for="tp-w">Причина</label><select class="field" id="tp-w"><option>Забыл пропуск</option><option>Пропуск повреждён</option><option>Посетитель на время визита</option></select></div>
   <div class="cap muted">Пропуск автоматически гаснет в конце дня (18:00). В журнале посещаемости останется отметка «забыл пропуск» (SKD-PPL-06).</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="temp-ok">Выдать</button></div>`)}
function dlgBlock(id,un){const h=holders().find(x=>x.id===id);
  dlg(`<div class="dlg-h">${ic(un?'unlock':'lock','ic-24')}<h2 class="dialog-title">${un?'Разблокировать':'Заблокировать'} пропуск</h2></div><div class="dlg-b"><div><b>${esc(h.fio)}</b> · <span class="mono">${h.card}</span></div>
   <div><label class="label" data-required for="bl-r">Причина</label><select class="field" id="bl-r"><option value="">Выберите причину</option>${(un?['Пропуск найден','Возврат в учреждение','Решение администрации']:['Утерян','Выбыл','Решение администрации']).map(r=>`<option>${r}</option>`).join('')}</select><span class="helper" id="bl-err"></span></div>
   <div><label class="label" for="bl-c">Комментарий</label><input class="field" id="bl-c" placeholder="Необязательно"></div><div class="cap muted">Операция выполняется в СКУД «Интеллект X» и записывается в журнал аудита.</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn ${un?'btn-primary':'btn-red'}" data-act="block-ok" data-id="${id}" data-un="${un?1:0}">${un?'Разблокировать':'Заблокировать'}</button></div>`)}
function dlgImport(){dlg(`<div class="dlg-h">${ic('upload','ic-24')}<h2 class="dialog-title">Импорт списка ${P().kidsGen}</h2></div><div class="dlg-b">
   <div class="seg" role="group"><button class="btn" aria-pressed="true">Файл CSV / XLSX</button><button class="btn" aria-pressed="false">Электронный журнал (API)</button></div>
   <div class="empty" style="border:1px dashed var(--one-border);border-radius:6px;padding:20px">${ic('upload','ic-32')}<div>kontingent_2026-11-09.xlsx · ${db.kids.length+12} строк — загружено</div></div>
   <div class="grid4" style="gap:8px">${[['Новые','12'],['Изменённые','7'],['Без изменений',String(db.kids.length-7)],['Ошибки','2']].map(([t,n])=>`<div class="card kpi" style="padding:10px;cursor:default"><span class="lbl muted">${t}</span><span class="h-md">${n}</span></div>`).join('')}</div>
   <div class="cap muted">Ключ — внешний идентификатор из электронного журнала: повторный импорт обновляет записи, дубликаты не создаются (SKD-PPL-04).</div></div>
   <div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="import-ok">Применить 19 изменений</button></div>`)}
function dlgAccept(id){const k=KBY(id);dlg(`<div class="dlg-h">${ic('sign-in','ic-24')}<h2 class="dialog-title">Принять · ${esc(k.short)}</h2></div><div class="dlg-b"><div><label class="label" for="ac-b">Кто привёл</label><select class="field" id="ac-b">${k.trusted.filter(t=>!t.exp).map(t=>`<option>${esc(t.rel)} · ${esc(t.fio)}</option>`).join('')}</select></div><div class="cap muted">Время приёма — ${hm(NOW())}. Родителю уйдёт уведомление в MAX.</div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="accept-ok" data-id="${id}">Принять в группу</button></div>`)}

/* ================= actions ================= */
const err=(fld,hel,msg)=>{$(fld).setAttribute('aria-invalid','true');const e=$(hel);if(e){e.textContent=msg;e.setAttribute('data-error','')}};
const A={
  'ds-reset':()=>{S.ds='data';$('#pp-state').value='data';rerender()},
  inbuilding:()=>inBuildingSheet(),
  'att-go':el=>{S.att={...S.att,tab:'journal',st:el.dataset.st,g:'',q:'',page:0,day:0};closeSheet();location.hash='#attendance';rerender()},
  'att-grp':el=>{S.att={...S.att,tab:'journal',g:el.dataset.g,st:'',page:0,day:0};closeSheet();location.hash='#attendance';rerender()},
  'att-tab':el=>{S.att.tab=el.dataset.v;rerender()},
  'att-pg':el=>{S.att.page+=+el.dataset.d;$('#att-res').innerHTML=attResults()},
  'att-reset':()=>{S.att={...S.att,g:'',q:'',st:'',page:0};rerender()},
  kid:el=>openKid(el.dataset.id),
  'reason-save':el=>{const k=KBY(el.dataset.id),v=$('#k-reason').value;k.day.reason=v||null;k.day.reasonBy=v?user().short:null;aud('Причина отсутствия',`${k.short}, ${k.g}: ${v||'снята'}`);toast(`Причина сохранена: ${k.short} — ${v||'не указана'}`);openKid(k.id);if(S.route!=='home')rerender()},
  fix:el=>{const k=KBY(el.dataset.id),v=el.dataset.v;k.day.st=v;k.day.check=null;if(v==='in')k.day.inT=k.day.passes[0]?.t;if(v==='left')k.day.outT=k.day.passes[0]?.t;aud('Исправлен статус посещаемости',`${k.short}, ${k.g}: требует проверки → ${{in:'в здании',left:'ушёл',absent:'не приходил'}[v]}`);toast(`Статус исправлен · ${k.short} · записано в аудит`);rerender()},
  grid:el=>{S.grid=+el.dataset.v;rerender()},
  fav:(el,e)=>{e.stopPropagation();const c=db.cams.find(x=>x.id===el.dataset.id);c.fav=!c.fav;toast(c.fav?`«${c.name}» добавлена в избранное`:`«${c.name}» убрана из избранного`);rerender()},
  camb:el=>{S.camB=el.dataset.b;rerender()},
  'cam-open':el=>{S.camArch=false;openCam(el.dataset.id)},
  'cam-step':el=>camStep(+el.dataset.d),
  'cam-arch':el=>{S.camArch=!S.camArch;openCam(el.dataset.id)},
  'ev-open':el=>openEvent(el.dataset.id),
  'ev-chip':el=>{const k=el.dataset.k;S.ev.chips[k]=!S.ev.chips[k];el.setAttribute('aria-pressed',S.ev.chips[k]);$('#ev-res').innerHTML=evResults()},
  'ev-acs':el=>{S.ev.chips.pass=true;S.ev.q=el.dataset.v==='вход'?'вход':'выход';rerender()},
  'ev-more':()=>{S.ev.limit+=50;$('#ev-res').innerHTML=evResults()},
  'ev-reset':()=>{S.ev={...S.ev,chips:{alarm:true,analytics:true,presence:true,fault:true,pass:false},st:'',q:''};rerender()},
  'ev-res':el=>{const id=$('[data-act=ev-done]')?.dataset.id;const e=db.events.find(x=>x.id===id);if(e)e._res=el.dataset.v;$$('#ev-res-seg button').forEach(b=>b.setAttribute('aria-pressed',String(b===el)))},
  'ev-done':el=>{const e=db.events.find(x=>x.id===el.dataset.id);if(!e._res){$('#ev-err').textContent='Выберите результат — без него событие не закрывается';$('#ev-err').setAttribute('data-error','');return}
    e.status='done';e.result=e._res;e.comment=$('#ev-c').value;e.by=user().short;e.doneAt=NOW();aud('Событие обработано',`${e.title} · ${e.result}${e.comment?' · '+e.comment:''}`);closeSheet();toast(`Обработано: ${e.title} · ${e.result}`);rerender()},
  'sheet-close':()=>closeSheet(),
  mode:el=>{OnePsimKit.closeMenu();if(!canMode())return;dlgMode(el.dataset.m)},
  'mode-ok':el=>{const m=el.dataset.m,r=$('#md-r');if(el.dataset.req&&!r.value){err('#md-r','#md-err','Укажите причину');return}closeDlg();setMode(m,r?.value||'')},
  'lock-end':()=>dlgLockEnd(),
  'lock-end-ok':()=>{const r=$('#le-r').value;if(!r){err('#le-r','#le-err','Укажите основание');return}closeDlg();S.lock=null;setMode('day',r);toast('Режим ЧС отменён · входы работают в обычном режиме')},
  'evac-grp':el=>{const g=el.dataset.g;if(isTeacher())return;S.rc.g=g;location.hash='#rollcall'},
  'evac-end':()=>endEvac(false),
  'evac-end-force':()=>{const r=$('#ee-r').value.trim();if(!r){err('#ee-r','#ee-err','Укажите основание');return}aud('Завершение с неучтёнными',r);endEvac(true)},
  'evac-report':()=>evacReport(),
  'mass-notify':()=>dlg(`<div class="dlg-h">${ic('megaphone','ic-24')}<h2 class="dialog-title">Массовое оповещение родителям</h2></div><div class="dlg-b"><div class="msg">Эвакуация завершена, все дети в безопасности. Забрать ребёнка можно у точки сбора: спортплощадка.</div><div class="cap muted">Шаблон SKD-NTF-05 · уйдёт в MAX ${db.kids.filter(k=>k.parent.max).length} родителям · требует подтверждения администратора</div></div><div class="dlg-f"><button class="btn btn-outline" data-kit-close>Отмена</button><button class="btn btn-primary" data-act="mass-ok">Отправить</button></div>`),
  'mass-ok':()=>{closeDlg();aud('Массовое оповещение родителям','шаблон «эвакуация завершена»');toast('Оповещение отправлено в MAX')},
  'rc-mark':el=>{const r=markKid(el.dataset.id,el.dataset.v);if(r==='queued')toast('Нет связи — отметка в очереди, отправится автоматически');rerender()},
  'ho-accept':el=>dlgAccept(el.dataset.id),
  'accept-ok':el=>{const k=KBY(el.dataset.id),b=$('#ac-b').value.split(' · ')[0];closeDlg();k.day.st='in';k.day.inT=NOW();k.day.brought={by:b,t:NOW()};if(k.parent.max)k.day.max.push({t:NOW(),text:`${k.short} принят${k.m?'':'а'} в группу в ${hm(NOW())}`,st:'доставлено'});aud('Приём ребёнка',`${k.short} · привёл: ${b}`);toast(`${k.short} принят${k.m?'':'а'} в группу`);rerender()},
  'ho-give':el=>dlgGive(el.dataset.id),
  'tp-pick':el=>dlgGive(el.dataset.id,+el.dataset.i,false),
  'tp-stranger':el=>dlgGive(el.dataset.id,-1,true),
  'give-ok':el=>{const k=KBY(el.dataset.id);let h;
    if(el.dataset.s==='1'){const f=$('#st-fio').value.trim();if(!f||!$('#st-ok').checked){$('#st-err').textContent='Нужны ФИО и подтверждение законного представителя';$('#st-err').setAttribute('data-error','');return}
      h={rel:'по звонку',fio:f,t:NOW(),phone:true};addEvent({kind:'presence',type:'stop',title:'Выдача лицу не из списка доверенных',zone:k.g,cam:null,desc:`${k.short} → ${f} · подтверждено ${k.parent.short} по телефону`,person:k.id,sev:'mid'})}
    else{const t=k.trusted[+el.dataset.i];h={rel:t.rel,fio:t.fio,t:NOW()}}
    k.day.handed=h;k.day.outT=NOW();if(k.parent.max)k.day.max.push({t:NOW(),text:`${k.short} передан${k.m?'':'а'}: ${h.rel} · ${hm(NOW())}`,st:'доставлено'});closeDlg();aud('Выдача ребёнка',`${k.short} → ${h.rel} ${h.fio}${h.phone?' · подтверждено по телефону':''}`);toast(`${k.short} выдан${k.m?'':'а'}: ${h.rel}`);rerender()},
  'ppl-tab':el=>{S.ppl.tab=el.dataset.v;rerender()},
  'ppl-pg':el=>{S.ppl.page+=+el.dataset.d;rerender()},
  'ppl-open-vis':()=>{S.ppl.tab='visitors';location.hash='#people'},
  block:el=>dlgBlock(el.dataset.id,false), unblock:el=>dlgBlock(el.dataset.id,true),
  'block-ok':el=>{const r=$('#bl-r').value;if(!r){err('#bl-r','#bl-err','Причина обязательна');return}const h=holders().find(x=>x.id===el.dataset.id),un=el.dataset.un==='1';h.o.cardSt=un?'active':'blocked';h.o.blockWhy=un?null:r;closeDlg();aud(un?'Пропуск разблокирован':'Пропуск заблокирован',`${h.fio} · ${h.card} · ${r}`);toast(`${un?'Разблокирован':'Заблокирован'} пропуск ${h.card} · ${h.fio}`);rerender()},
  visitor:()=>dlgVisitor(),
  'visitor-ok':()=>{const f=$('#vi-f').value.trim(),d=$('#vi-d').value.trim(),t=$('#vi-t').value;
    if(!f||!d||!t){[['#vi-f',f],['#vi-d',d],['#vi-t',t]].forEach(([s,v])=>!v&&$(s).setAttribute('aria-invalid','true'));$('#vi-err').textContent='Заполните ФИО, документ и к кому';$('#vi-err').setAttribute('data-error','');return}
    const hit=STOP.find(s=>s.fio.toLowerCase().startsWith(f.toLowerCase().split(' ')[0])&&f.length>=3);
    if(hit){$('#vi-stop').innerHTML=`<div class="banner b-danger" style="padding:10px">${ic('no-entry','ic-24')}<div class="col" style="gap:2px"><b>Совпадение со стоп-листом: ${esc(hit.fio)}</b><span class="cap">${esc(hit.why)} · ${esc(hit.basis)} · ${esc(hit.until)}</span><span class="cap">Не впускать. Администрация уведомлена.</span></div></div>`;
      if(!$('#vi-stop').dataset.ev){$('#vi-stop').dataset.ev=1;addEvent({kind:'alarm',type:'stop',title:'Совпадение со стоп-листом на посту',zone:'Пост охраны 1',cam:db.cams.find(c=>c.entry).id,desc:`${hit.fio} · ${hit.why}`,sev:'high'});aud('Совпадение со стоп-листом',hit.fio);$('#nav').innerHTML=navHtml()}return}
    const v={id:'V'+(db.visitors.length+1),fio:f,doc:d,to:t,why:$('#vi-w').value||'—',inT:NOW(),outT:null};db.visitors.unshift(v);closeDlg();aud('Регистрация посетителя',`${f} → ${t}`);toast(`Посетитель зарегистрирован: ${f} · стоп-лист — совпадений нет`);rerender()},
  'vis-out':el=>{const v=db.visitors.find(x=>x.id===el.dataset.id)||db.contractors.find(x=>x.id===el.dataset.id);v.outT=NOW();aud('Выход посетителя',v.fio);toast(`${v.fio} вышел · убран из счётчика «в здании»`);rerender()},
  temp:()=>dlgTemp(),
  'temp-ok':()=>{const id=$('#tp-k').value;if(!id){err('#tp-k','#tp-err','Выберите, кому выдать');return}const k=KBY(id),w=$('#tp-w').value;S.temp.unshift({fio:k.fio,why:w,t:NOW(),by:user().short,until:'сегодня 18:00'});if(w==='Забыл пропуск')k.day.forgot=true;closeDlg();aud('Временный пропуск',`${k.short} · ${w}`);toast(`Временный пропуск выдан: ${k.short} · до 18:00`);rerender()},
  import:()=>dlgImport(),
  'import-ok':()=>{closeDlg();aud('Импорт списка',`${P().kidsGen}: 12 новых, 7 изменённых`);toast('Импорт применён · дубликатов нет')},
  'kts-test':()=>{const e=addEvent({kind:'alarm',type:'kts',title:'Тест КТС · пост охраны 1',zone:'Пост охраны',cam:db.cams.find(c=>c.entry).id,desc:'Ежедневная проверка — сработка получена от КТС',sev:'low',status:'done',result:'учебное',by:user().short});S.kts={t:e.t,by:user().short,ev:e.title};aud('Журнал: проверка КТС','подтверждено событием «'+e.title+'»');toast('Сработка КТС получена · запись в журнале подтверждена событием (SKD-REG-02)');rerender()},
  jr:el=>toast(`Журнал «${el.dataset.j}» — открытие записи в следующей итерации прототипа`),
  'drill-proto':el=>drillProto(S.drills[+el.dataset.i]),
  export:el=>{aud(`Выгрузка ${el.dataset.f}`,el.dataset.what||'');toast(`Выгрузка ${el.dataset.f}: ${esc(el.dataset.what||'')} · записано в журнал аудита`)},
  sched:()=>toast('Расписание рассылки сохранено'),
  'tk-fixed':el=>{const t=db.tickets.find(x=>x.id===el.dataset.id);t.st='fixed';t.hist.push(['Устранена',NOW(),user().short]);aud('Заявка устранена',t.id);rerender()},
  'tk-confirm':el=>{const t=db.tickets.find(x=>x.id===el.dataset.id);t.st='confirmed';t.hist.push(['Подтверждена',NOW(),user().short]);aud('Заявка подтверждена',t.id);toast(`Заявка ${t.id} подтверждена`);rerender()},
  'tk-new':el=>{const id='З-'+(119+db.tickets.filter(t=>+t.id.slice(2)>118).length),s=db.sys.find(x=>x.id===el.dataset.sys),f=s.faults.find(x=>x.dev===el.dataset.dev);f.ticket=id;db.tickets.unshift({id,sys:s.id,dev:f.dev,org:s.id==='video'?'ООО «Телеком-Сервис»':'ООО «Пожтехника»',created:NOW(),st:'created',hist:[['Создана',NOW(),user().short]]});aud('Заявка создана',`${id} · ${f.dev}`);toast(`Заявка ${id} отправлена на e-mail обслуживающей организации`);rerender()},
  'sla-save':()=>{['video','fire','kts','other'].forEach(k=>S.sla[k]=+$('#sla-'+k).value||S.sla[k]);aud('SLA изменён',JSON.stringify(S.sla));toast('SLA сохранён');rerender()},
  'settings-save':()=>{aud('Настройки сохранены','правила дня, уведомления, вместимость');toast('Настройки сохранены')},
  profile:el=>{switchProfile(el.dataset.v)},
  'sim-fire':()=>{OnePsimKit.closeMenu();if(S.mode==='evac'){toast('Эвакуация уже идёт');return}setMode('evac','ДИП-21 · 2 эт., помещение 214')},
  'sim-dontknow':()=>{OnePsimKit.closeMenu();simDontKnow()},
  'sim-fight':()=>{OnePsimKit.closeMenu();addEvent({kind:'analytics',type:'fight',title:'Драка',zone:'Двор · спортплощадка',cam:db.cams.find(c=>/Двор|площадка/.test(c.name)).id,desc:'Детектор агрессивного поведения · уверенность 91 %',sev:'high'});toast('Детектор: драка · двор','alarm');rerender()},
  'sim-fault':()=>{OnePsimKit.closeMenu();const s=db.sys[0];if(s.faults.some(f=>f.dev.includes('Актовый')||f.dev.includes('Музыкальный')))return;const c=db.cams.find(c=>/Актовый|Музыкальный/.test(c.name));c.fault='Нет сигнала с '+hm(NOW());s.faults.push({dev:`Камера «${c.name}»`,zone:c.b,since:hm(NOW()),what:'Нет сигнала',ticket:null});addEvent({kind:'fault',type:'fault',title:`Нет сигнала: камера «${c.name}»`,zone:c.b,cam:null,desc:'Создайте заявку в «Обслуживании»',sev:'low'});toast(`Неисправность: камера «${c.name}»`,'alarm');rerender()},
};
function simDontKnow(){const p=P();if(!p.parents){toast('В профиле «Колледж» уведомления родителям выключены');return}
  const k=db.kids.find(k=>k.day.st==='absent'&&!k.day.reason&&k.parent.max&&!k.day.max.some(m=>m.reply==='не знаю'))||db.kids.find(k=>k.day.st==='absent');
  let m=k.day.max.find(x=>x.text.includes('Укажите'));if(!m){m={t:at(...p.rules.miss),text:`${k.short} не пришёл${k.m?'':'а'} к ${p.rules.miss[0]}:${pad(p.rules.miss[1])}. Укажите причину отсутствия.`,st:'прочитано'};k.day.max.push(m)}m.reply='не знаю';
  addEvent({kind:'presence',type:'dontknow',title:'Родитель не знает, где ребёнок',zone:k.g,cam:null,desc:`${k.short}, ${k.g} · ответ в MAX «не знаю» · уведомлены ${p.respShort} и администрация (SKD-NTF-04)`,person:k.id,sev:'high'});
  toast(`Ответ «не знаю»: ${k.short}, ${k.g} — событие ответственному и администрации`,'alarm');rerender();return k}
function camStep(d){const L=(S.route==='home'?db.cams.filter(c=>c.fav):S.route==='video'?db.cams.filter(c=>(!S.camB||c.b===S.camB)&&(S.role!=='guard'||c.entry)):db.cams);const list=L.length?L:db.cams;const i=list.findIndex(c=>c.id===S.camSel);openCam(list[(i+d+list.length)%list.length].id)}
function switchProfile(pid){
  if(S.evac){toast('Во время эвакуации профиль не меняется','alarm');return}
  S.profile=pid;db=buildDB(pid);seedAudit();S.kts={t:at(8,14),by:ROLES.guard.short,ev:'Тест КТС · пост охраны 1'};S.mode='day';S.lock=null;S.doors='normal';S.alarm={};S.temp=[];
  S.att={tab:'sum',day:0,g:'',q:'',st:'',page:0};S.ho.g='';S.rc.g='';
  S.drills=[{date:'15.09.2026',t:'10:05',kids:Math.round(db.kids.length*.93),dur:'04:12',slow:db.groups[3].id+' · 04:12',by:ROLES.director.short},{date:'20.10.2026',t:'11:20',kids:Math.round(db.kids.length*.91),dur:'03:48',slow:db.groups[7].id+' · 03:48',by:ROLES.security.short}];
  $('#pp-profile').value=pid;
  if(!allowed(S.route)) location.hash='#'+ROLES[S.role].home; rerender();
}
document.addEventListener('click',e=>{
  const act=e.target.closest('[data-act]');
  if(act&&A[act.dataset.act]&&!act.disabled){A[act.dataset.act](act,e);return}
  const go=e.target.closest('[data-go]'); if(go){location.hash='#'+go.dataset.go;return}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&$('#sheet').hasAttribute('data-open')) closeSheet();
  if($('#dlg').open&&S.camSel&&$('#dlg .player')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();camStep(e.key==='ArrowRight'?1:-1)}
  const c=e.target.closest&&e.target.closest('.cam[data-act]'); if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openCam(c.dataset.id)}
});
$('#sheet-scrim').addEventListener('click',closeSheet);
$('#menu-btn').addEventListener('click',()=>$('#side').toggleAttribute('data-open'));
$('#dlg').addEventListener('close',()=>{S.camSel=null});
document.addEventListener('input',e=>{const t=e.target;
  if(t.id==='att-q'){S.att.q=t.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(t.id==='ev-q'){S.ev.q=t.value;$('#ev-res').innerHTML=evResults()}
  if(t.id==='ppl-q'){S.ppl.q=t.value;S.ppl.page=0;const y=t.selectionStart;rerender();const n=$('#ppl-q');n.focus();n.setSelectionRange(y,y)}
  if(t.id==='aud-q'){S.aud.q=t.value;S.aud.page=0;const y=t.selectionStart;rerender();const n=$('#aud-q');n.focus();n.setSelectionRange(y,y)}
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='att-day'){S.att.day=+t.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(t.id==='att-g'){S.att.g=t.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(t.id==='att-st'){S.att.st=t.value;S.att.page=0;$('#att-res').innerHTML=attResults()}
  if(t.id==='ev-st'){S.ev.st=t.value;$('#ev-res').innerHTML=evResults()}
  if(t.id==='ppl-cat'){S.ppl.cat=t.value;S.ppl.page=0;rerender()}
  if(t.id==='ppl-st'){S.ppl.st=t.value;S.ppl.page=0;rerender()}
  if(t.id==='aud-user'){S.aud.user=t.value;S.aud.page=0;rerender()}
  if(t.id==='ho-g'){S.ho.g=t.value;rerender()}
  if(t.id==='rc-g'){S.rc.g=t.value;rerender()}
  if(t.id==='k-rel'){const k=KBY(t.dataset.id);k.day.released=t.checked;aud('Отметка «отпущен»',`${k.short}: ${t.checked?'да':'нет'}`);toast(t.checked?`${k.short} отпущен${k.m?'':'а'} — уход не считается самовольным`:'Отметка снята')}
  if(t.dataset.notif){S.notif[t.dataset.notif]=t.checked}
  if(t.id==='pp-profile') switchProfile(t.value);
  if(t.id==='pp-role'){S.role=t.value;location.hash='#'+ROLES[S.role].home;rerender()}
  if(t.id==='pp-state'){S.ds=t.value;rerender()}
  if(t.id==='pp-offline'){S.offline=t.checked;if(!t.checked){S.lastUpd=NOW();const q=S.evac?.queue||[];if(q.length){const n=q.length;q.splice(0).forEach(([id,v])=>markKid(id,v,{flush:1}));toast(`Связь восстановлена · отправлено ${n} ${plural(n,'отметка','отметки','отметок')} из очереди`)}else toast('Связь восстановлена · данные обновлены')}header();rerender()}
});
document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');const tip=$('#tip');if(!t){tip.hidden=true;return}tip.textContent=t.dataset.tip;tip.hidden=false;const x=Math.min(e.clientX+12,innerWidth-tip.offsetWidth-8);tip.style.left=x+'px';tip.style.top=(e.clientY-40)+'px'});

/* ================= live: часы, эскалация, поток проходов (SKD-DSH-02, SKD-EVT-03) ================= */
function tick(now=NOW()){
  $$('.timer[data-t0]').forEach(t=>{const d=now-(+t.dataset.t0);t.textContent=fmtDur(d);t.classList.toggle('late',d>ESC_AFTER)});
  $$('.timer[data-since]').forEach(t=>{t.textContent=fmtDur(now-(+t.dataset.since))});
  $$('[data-clock]').forEach(t=>t.textContent=hms(now));
  $('#fx-time').textContent=hms(now);
  let changed=false;
  db.events.forEach(e=>{if(e.status==='new'&&e.sev==='high'&&!e.esc&&now-e.t>ESC_AFTER){e.esc=S.role==='director'?'Морозова Т. В. → Управление образования (дежурный)':ROLES.director.short+' (директор)';changed=true;aud('Эскалация события',`${e.title} · не обработано 60 с → ${e.esc}`,{user:{short:'Система',role:'Эскалация'}})}});
  if(changed&&['home','events','post'].includes(S.route)&&!$('#dlg').open&&!$('#sheet').hasAttribute('data-open')) rerender(); else if(changed) $('#nav').innerHTML=navHtml();
}
function refresh(){if(S.offline)return;S.lastUpd=NOW();header()}
function simPass(){
  const p=P(), now=NOW();
  const back=db.kids.find(k=>k.day.st==='out_tmp'), late=db.kids.filter(k=>k.day.st==='absent'&&!k.day.reason);
  let k=null,dir='in';
  if(back&&Math.random()<.35){k=back;k.day.st='in'}
  else if(late.length&&!p.handover){k=late[Math.floor(Math.random()*late.length)];k.day.st='in';k.day.inT=now;k.day.late=now>at(...p.rules.late);if(p.parents&&k.parent.max&&S.notif.in){k.day.max=k.day.max.filter(m=>!m.text.includes('Укажите')||m.reply);k.day.max.push({t:now,text:`${k.short} пришёл${k.m?'':'а'} в ${hm(now)}`,st:'доставлено'})}}
  if(!k) return null;
  const pt=ENTRY[p.id][k.b]; k.day.passes.push({t:now,dir,pt}); db.passes.unshift({t:now,dir,pt,who:k.id,fresh:true}); db.passes.length=Math.min(db.passes.length,60);
  if(!S.offline&&['home','post','attendance'].includes(S.route)&&!$('#dlg').open&&!$('#sheet').hasAttribute('data-open')&&!document.querySelector('.menu:not([hidden]),.popover:not([hidden])')&&!S.evac) rerender();
  return k;
}
const SELFTEST=/[?&]selftest\b/.test(location.search);
if(SELFTEST){$('#pp-sim').checked=false;$('#pp-auto').checked=false}
setInterval(()=>tick(),1000);
setInterval(()=>refresh(),10000);
setInterval(()=>{if($('#pp-sim').checked&&S.mode!=='evac'&&S.mode!=='drill')simPass()},6000);
setInterval(()=>autoMark(),1500);

/* hooks for prorotypes/src/selftest.js — not part of the product */
window.SE={S,A,get db(){return db},render,rerender,tick,simPass,setMode,startEvac,markKid,evacCounts,stats,inBuilding,sysState,switchProfile,closeSheet,closeDlg,openKid,openEvent,verifyChain,simDontKnow,ESC_AFTER,NOW,skew:ms=>{SKEW+=ms},allowed};

switchProfile('school'); S.lastUpd=NOW(); header(); render(); $('#fx-time').textContent=hms(NOW());
})();
