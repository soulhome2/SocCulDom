#!/usr/bin/env python3
"""Обходит прототип на английском (все роли × профили × разделы, режимы, окна) и печатает ключи каталога строк,
которых нет в src/i18n-en.js, — вместе со статическими t('…') из src/js. Код выхода 1, если что-то не переведено.

    python tools/check_i18n.py
"""
import glob, json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
src = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(str(ROOT / "prorotypes/src/js/*.js"))))
static = set(re.findall(r"\b(?:t|aud)\('((?:[^'\\]|\\.)*)'", src))
static = {s.replace("\\'", "'") for s in static if re.search("[А-Яа-яЁё]", s)}
from playwright.sync_api import sync_playwright
url = (ROOT / "prorotypes/index.html").as_uri()
TOUR = r"""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const S=SE.S;S.lang='en';
 const R=['home','events','video','attendance','people','journals','reports','service','config','audit','post','rounds','rollcall','handover'];
 const clickAll=async sel=>{for(const b of [...document.querySelectorAll(sel)].slice(0,3)){b.click();await sl(5);SE.closeDlg();SE.closeSheet()}};
 for(const pr of ['school','kinder','college']){SE.switchProfile(pr);
  for(const role of ['director','security','guard','teacher']){S.role=role;
   for(const r of R){location.hash='#'+r;SE.render();await sl(5);
     if(r==='attendance')for(const tb of ['sum','journal','check','trend']){S.att.tab=tb;SE.render()}
     if(r==='people')for(const tb of ['holders','visitors','temp']){S.ppl.tab=tb;SE.render();await clickAll('[data-act=person-add],[data-act=visitor],[data-act=temp],[data-act=block],[data-act=import]')}
     if(r==='config')for(const tb of ['profile','rules','modes','rounds','notify','zones','sla','roles']){S.cfg.tab=tb;SE.render();await clickAll('[data-act=mode-edit]')}
     if(r==='events'){await clickAll('[data-act=ev-view]');for(const id of SE.db.events.slice(0,6).map(e=>e.id)){S.evw.card=id;SE.render();document.querySelector('[data-act=ev-pass]')?.click();SE.closeDlg();document.querySelector('[data-act=ev-close]')?.click();SE.closeDlg()}S.evw.card=null;
       const e=SE.db.events.find(x=>x.status==='new');if(e)SE.A['ev-take']({dataset:{id:e.id}});SE.render();for(let i=0;i<5;i++){const c=document.querySelector('#st-ok');if(c)c.checked=true;const rr=document.querySelector('input[name=st-r]');if(rr)rr.checked=true;document.querySelector('[data-act=ev-next]')?.click()}S.evw.card=null}
     if(r==='rounds'&&role==='guard'){document.querySelector('[data-act=round-start]')?.click();SE.render();document.querySelector('[data-act=pt-mark][data-v=bad]')?.click();SE.closeDlg();S.round=null}
     if(r==='handover'){document.querySelector('[data-act=ho-give]')?.click();document.querySelector('[data-act=tp-stranger]')?.click();SE.closeDlg();document.querySelector('[data-act=ho-accept]')?.click();SE.closeDlg()}
     await clickAll('[data-act=kid],[data-act=inbuilding],.cam[data-act=cam-open],[data-act=drill-proto]');
   }}
  S.role='director';for(const m of ['event','lock','drill','evac']){SE.A.mode({dataset:{m}});SE.closeDlg()}
  SE.setMode('lock','x');location.hash='#home';SE.render();SE.A['lock-end']();SE.closeDlg();SE.setMode('day','x');
  SE.A['sim-fire']();SE.render();SE.A['evac-report']();SE.closeDlg();SE.A['mass-notify']();SE.closeDlg();SE.A['evac-end']();SE.closeDlg();
  S.role='teacher';location.hash='#rollcall';SE.render();S.offline=true;document.querySelector('[data-act=rc-mark]')?.click();S.offline=false;S.role='director';
  SE.S.evac.snap.forEach(x=>SE.markKid(x.id,'safe'));SE.A['evac-end']();SE.setMode('drill','x');SE.render();SE.S.evac.snap.forEach(x=>SE.markKid(x.id,'safe'));SE.A['evac-end']();
  SE.simDontKnow();SE.A['sim-fight']();SE.A['sim-fault']();SE.A['kts-test']();
  for(const ds of ['loading','empty','error']){S.ds=ds;location.hash='#attendance';S.att.tab='journal';SE.render()}S.ds='data';
  S.offline=true;SE.render();S.offline=false;SE.render();
 }
 return [...SE.MISSING]}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(url + "?selftest"); pg.wait_for_timeout(400)
    runtime = set(pg.evaluate(TOUR))
    en = pg.evaluate("()=>Object.keys(I18N_EN)")
    b.close()
missing = sorted((static | runtime) - set(en))
if "--dump" in sys.argv:
    json.dump(missing, open(sys.argv[sys.argv.index("--dump") + 1], "w", encoding="utf-8"), ensure_ascii=False, indent=0)
for m in missing[:400]: print("НЕТ ПЕРЕВОДА:", m)
if errs: print("ОШИБКИ JS:", errs[:10])
print(f"Ключей: статических {len(static)}, в обходе {len(runtime)}; без перевода {len(missing)}")
sys.exit(1 if missing or errs else 0)
