/* SafeEducation prototype — ядро: помощники, перевод, демо-время, сортировка, аудит.
 * Модули src/js/*.js склеиваются tools/build_prototype.py в одну функцию по порядку имён.
 * Источник истины — Specification/SafeEducation_Specification.md и «Корректировка дашборда …». */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[n]||''}</svg>`;
const pad=n=>String(n).padStart(2,'0');
const hm=d=>d?`${pad(d.getHours())}:${pad(d.getMinutes())}`:'—';
const hms=d=>`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const dm=d=>`${pad(d.getDate())}.${pad(d.getMonth()+1)}`;
const dmy=d=>`${dm(d)}.${d.getFullYear()}`;
const pct=(a,b)=>b?Math.round(a*100/b):0;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmtDur=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${pad(Math.floor(s/60))}:${pad(s%60)}`};

/* ---------- язык (как в Incident Manager: ru/en, выбор хранится в браузере) ----------
 * t('Строка на русском {n}', {n}) — ключ каталога = русская строка; английский — в src/i18n-en.js.
 * Названия, введённые людьми (ФИО, классы, камеры, зоны), не переводятся — как в IM. */
const LANGS=['ru','en'];
function loadLang(){try{const v=localStorage.getItem('se-lang');return LANGS.includes(v)?v:'ru'}catch(e){return 'ru'}}
function saveLang(v){try{localStorage.setItem('se-lang',v)}catch(e){}}
const MISSING=new Set();
function t(s,v){
  let r=s;
  if(S.lang==='en'){const e=I18N_EN[s];if(e===undefined)MISSING.add(s);else r=e}
  if(v) r=r.replace(/\{(\w+)\}/g,(m,k)=>v[k]!==undefined?v[k]:m);
  return r;
}
/* множественное число: ru — три формы, en — две */
function pl(n,ru,en){if(S.lang==='en')return n===1?en[0]:en[1];const m=n%10,h=n%100;return m===1&&h!==11?ru[0]:m>=2&&m<=4&&(h<10||h>=20)?ru[1]:ru[2]}
const WD_RU=['вс','пн','вт','ср','чт','пт','сб'], WD_EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const wd=d=>(S.lang==='en'?WD_EN:WD_RU)[d.getDay()];

/* ---------- демо-время: сегодня, начало 10:40 ---------- */
const BASE=new Date(); BASE.setHours(10,40,0,0); const START=Date.now();
let SKEW=0; const NOW=()=>new Date(+BASE+(Date.now()-START)+SKEW);
const at=(h,m,s=0,d=0)=>{const x=new Date(BASE);x.setDate(x.getDate()-d);x.setHours(h,m,s,0);return x};
const HOLIDAYS=['04.11','31.12','01.01','02.01','07.01','23.02','08.03','01.05','09.05','12.06'];
function schoolDays(n){const out=[];let x=new Date(BASE);for(let i=0;out.length<n&&i<40;i++){if(i>0)x.setDate(x.getDate()-1);const w=x.getDay();if(i===0||(w!==0&&w!==6&&!HOLIDAYS.includes(dm(x))))out.push({off:Math.round((BASE-new Date(x.getFullYear(),x.getMonth(),x.getDate(),10,40))/864e5),d:new Date(x)})}return out}
const DAYS=schoolDays(10);

/* ---------- состояние ---------- */
const S={lang:loadLang(),profile:'school',role:'director',route:'home',ds:'data',offline:false,lastUpd:null,mode:'day',doors:'normal',alarm:{},
  evac:null,evacLast:null,lock:null,grid:4,camSel:null,camArch:false,camNode:'',camQ:'',
  att:{tab:'sum',day:0,g:'',q:'',st:'',page:0},
  evw:{node:'',chips:{alarm:true,analytics:true,presence:true,fault:true,pass:false},st:'open',q:'',sel:null,card:null,limit:50},
  ppl:{tab:'holders',q:'',cat:'',st:'',page:0},aud:{q:'',user:'',page:0},
  ho:{g:''},rc:{g:''},cfg:{tab:'profile',route:null},round:null,
  sort:{},
  sla:{video:24,fire:8,kts:4,other:24},
  notif:{in:true,out:true,miss:true,early:true,quiet:true},
  drills:[], kts:null, temp:[], audit:[], rounds:[], roundLog:[], modes:[],
};
let db=null;

/* ---------- сортировка столбцов (замечания 5, 6, 9, 11, 13) ----------
 * th(table,key,label,{num}) — заголовок-кнопка; sortRows(table,rows,getters) — порядок по S.sort[table]. */
function th(tb,k,label,o={}){const s=S.sort[tb]||{},on=s.k===k;
  return `<th class="${o.num?'num':''}" ${on?`aria-sort="${s.dir>0?'ascending':'descending'}"`:''}><button class="th-sort" data-act="sort" data-t="${tb}" data-k="${k}">${label}${ic(on?(s.dir>0?'arrow-up':'arrow-down'):'arrow-both')}</button></th>`}
function sortRows(tb,rows,get){const s=S.sort[tb];if(!s||!get[s.k])return rows;const g=get[s.k];
  return rows.slice().sort((a,b)=>{const x=g(a),y=g(b);if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return (typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),'ru',{numeric:true}))*s.dir})}

/* ---------- аудит (SKD-AUD-01): только добавление, цепочка хешей ---------- */
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
/* action и obj хранятся ключом и параметрами — журнал переводится вместе с интерфейсом */
function aud(action,obj='',o={}){const prev=S.audit[0]?.h||'00000000';const u=o.user||user();const e={t:o.t||NOW(),user:u.short,role:u.roleKey||u.role,action,av:o.av||null,obj,prev};e.h=fnv(prev+e.t.toISOString()+e.user+action+obj);S.audit.unshift(e);return e}
function verifyChain(){for(let i=S.audit.length-1;i>=0;i--){const e=S.audit[i],prev=S.audit[i+1]?.h||'00000000';if(e.prev!==prev||e.h!==fnv(prev+e.t.toISOString()+e.user+e.action+e.obj))return i}return -1}
