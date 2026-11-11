/* ONE PSIM Prototype Kit — minimal runtime (D-007). Plain JS, no build, driven by data attributes so a
 * template stays ordinary HTML. Covers only what a reviewer needs to follow a flow: theme, drawer, tabs,
 * dialog, menu, segmented toggle. Everything else (filters, sorting, fixture data) lives in the page.
 *
 *   data-kit-theme            button: toggles [data-theme] on <html>, remembers in localStorage
 *   data-kit-drawer="#id"     button: opens the drawer; [data-kit-close] inside closes; scrim/Esc close
 *   data-kit-tabs             container with [role=tab] buttons and [role=tabpanel] panels (aria-controls)
 *   data-kit-dialog="#id"     button: showModal() on the <dialog>; [data-kit-close] closes
 *   data-kit-menu="#id"       button: toggles a .menu or a .popover (any content), closes on outside click / Esc;
 *                             positioned under the button, flipped above / aligned right when it would overflow
 *   data-kit-keep-open        on a .popover: a click inside it does NOT close it (filter panel, D-059)
 *   data-kit-seg              container of buttons; click sets aria-pressed on one, clears the rest
 *   .seg                      дорожка с ползунком: место выбранной ячейки меряется здесь (D-082)
 *   data-tip="text"           any element: tooltip after 400ms, on :focus-visible too (D-054)
 *   data-loading              on a .btn: busy — the repeat click is swallowed here (D-058)
 */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const KEY = "kit-theme";

  // ---- theme -------------------------------------------------------------------------------------
  const root = document.documentElement;
  let saved;
  try { saved = localStorage.getItem(KEY); } catch { /* Storage may be blocked in an embed. */ }
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  else if (!root.getAttribute("data-theme")) root.setAttribute("data-theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kit-theme]");
    if (!b) return;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch { /* Theme still works for this visit. */ }
    document.dispatchEvent(new CustomEvent("kit:theme", { detail: next }));
  });

  // ---- drawer ------------------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-kit-drawer]");
    if (open) {
      const d = $(open.getAttribute("data-kit-drawer"));
      if (!d) return;
      d.setAttribute("data-open", "");
      let scrim = d.previousElementSibling;
      if (!scrim || !scrim.classList.contains("drawer-scrim")) {
        scrim = document.createElement("div");
        scrim.className = "drawer-scrim";
        d.before(scrim);
      }
      scrim.hidden = false;
      scrim.onclick = () => closeDrawer(d);
      ($("[data-kit-close]", d) || d).focus?.();
      return;
    }
    const close = e.target.closest(".drawer [data-kit-close]");
    if (close) closeDrawer(close.closest(".drawer"));
  });
  function closeDrawer(d) {
    d.removeAttribute("data-open");
    const scrim = d.previousElementSibling;
    if (scrim && scrim.classList.contains("drawer-scrim")) scrim.hidden = true;
  }

  // ---- tabs --------------------------------------------------------------------------------------
  $$("[data-kit-tabs]").forEach((group) => {
    const tabs = $$("[role=tab]", group);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const p = t.getAttribute("aria-controls") && document.getElementById(t.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus();
        select(n);
      });
    });
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  });

  // ---- dialog ------------------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-kit-dialog]");
    if (open) {
      const d = $(open.getAttribute("data-kit-dialog"));
      if (d && typeof d.showModal === "function") {
        document.dispatchEvent(new CustomEvent("kit:dialog", { detail: { dialog: d, trigger: open } }));
        d.showModal();
      }
      return;
    }
    const close = e.target.closest("dialog [data-kit-close]");
    if (close) close.closest("dialog").close();
  });
  // click on the backdrop closes: the target is the <dialog> itself only when the click landed outside its
  // children (the .dialog has no padding). Not a geometry test — a click that resizes the dialog (tab switch,
  // step change) would otherwise measure against the NEW box and close it (found by the Codex trial, 1b).
  $$("dialog").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

  // ---- menu --------------------------------------------------------------------------------------
  let openMenu = null;
  function closeMenu() {
    if (!openMenu) return;
    openMenu.menu.hidden = true;
    openMenu.button.setAttribute("aria-expanded", "false");
    openMenu = null;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kit-menu]");
    if (b) {
      const m = $(b.getAttribute("data-kit-menu"));
      if (!m) return;
      if (openMenu && openMenu.menu === m) return closeMenu();
      closeMenu();
      m.hidden = false;
      b.setAttribute("aria-expanded", "true");
      // position under the button; flip above when it would overflow the bottom, align right when it would
      // overflow the right edge — the popup is sized by its content, never clipped by the viewport
      const r = b.getBoundingClientRect();
      m.style.position = "fixed";
      const w = m.offsetWidth, h = m.offsetHeight;
      const below = r.bottom + 4 + h <= window.innerHeight - 8 || r.top - 4 - h < 8;
      m.style.top = (below ? r.bottom + 4 : r.top - 4 - h) + "px";
      m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
      m.style.maxHeight = "calc(100vh - 16px)";
      openMenu = { menu: m, button: b };
      ($(".menu-item, input, button, select, textarea", m) || m).focus?.();
      return;
    }
    if (openMenu && !e.target.closest(".menu, .popover")) closeMenu();
    // A click on a .menu-item closes the popup — right for a menu, where picking an action is the last thing
    // you do there. A filter panel is the opposite: several settings are set in a row, so a .popover marked
    // data-kit-keep-open stays open and only [data-kit-close] (or Esc / an outside click) shuts it. D-059.
    else if (openMenu && e.target.closest("[data-kit-close]")) closeMenu();
    else if (openMenu && e.target.closest(".menu-item") && !e.target.closest("[data-kit-keep-open]")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
    hideTip();                                  // declared below; a function declaration is hoisted (D-054)
    $$(".drawer[data-open]").forEach(closeDrawer);
  });

  // ---- busy button (D-058) -----------------------------------------------------------------------
  // A busy control keeps its fill and its focus and is NOT disabled, so the browser still delivers clicks to
  // it — the repeat press is swallowed here instead, in the capture phase, so a page handler never sees it.
  // aria-busy / aria-disabled are the page's to set along with data-loading; this only guards the second press.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-loading]");
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);

  // ---- tooltip (D-054) ---------------------------------------------------------------------------
  // One node per page, positioned under the trigger (above it when there is no room below) and clamped to an
  // 8px margin horizontally. 400ms before showing, instant hiding: a tip that appears at once turns a move
  // across a toolbar into a flicker. Shown on :focus-visible as well, because an icon-only button reached by
  // keyboard has to explain itself the same way; aria-describedby points the screen reader at the same text.
  // Any scroll closes it (capture): the trigger moves out from under a fixed node.
  const tip = document.createElement("div");
  tip.className = "tip";
  tip.id = "kit-tip";
  tip.setAttribute("role", "tooltip");
  let tipTimer = null, tipTarget = null;
  const placeTip = (el) => {
    const r = el.getBoundingClientRect();
    tip.style.left = "0px";                                      // measure at free width first
    tip.style.top = "0px";
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const below = r.bottom + 6 + h <= window.innerHeight - 8 || r.top - 6 - h < 8;
    tip.style.top = (below ? r.bottom + 6 : r.top - 6 - h) + "px";
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8)) + "px";
  };
  function showTip(el) {
    if (!tip.isConnected) document.body.appendChild(tip);
    tipTarget = el;
    tip.textContent = el.dataset.tip;
    tip.setAttribute("data-open", "");
    el.setAttribute("aria-describedby", tip.id);
    placeTip(el);
  }
  function hideTip() {
    if (tipTarget) tipTarget.removeAttribute("aria-describedby");
    tipTarget = null;
    clearTimeout(tipTimer);
    tip.removeAttribute("data-open");
  }
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest("[data-tip]");
    if (!el || el === tipTarget) return;
    hideTip();
    tipTimer = setTimeout(() => showTip(el), 400);
  });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest("[data-tip]");
    if (!el) return;
    // Переход ВНУТРЬ самого триггера (на его глиф) — не уход: pointerout всплывает и на переходе к
    // потомку, и без этой проверки он гасил ещё не сработавшую задержку. Поймано тем, что подсказка
    // не появлялась при наведении из теста, хотя по синтетическому событию работала.
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;
    if (el === tipTarget) hideTip();
    else clearTimeout(tipTimer);
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest("[data-tip]");
    if (el && el.matches(":focus-visible")) showTip(el);
  });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, true);

  // ---- segmented toggle --------------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kit-seg] > button");
    if (!b) return;
    $$("button", b.parentElement).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    b.parentElement.dispatchEvent(new CustomEvent("kit:seg", { detail: b.value ?? b.textContent.trim(), bubbles: true }));
  });

  // ---- segmented toggle: ползунок (D-082) --------------------------------------------------------
  // Ширина ячейки берётся из подписи, поэтому место ползунка в CSS не вычислить — его меряем здесь и
  // отдаём стилю четырьмя переменными. Считаем по getBoundingClientRect, а не по offsetLeft: тот
  // отсчитывается от разных краёв в зависимости от рамки родителя, а у дорожки рамка есть.
  function layoutSeg(seg) {
    const on = seg.querySelectorAll(':scope > [aria-pressed="true"], :scope > .active');
    const box = on.length === 1 && on[0].getBoundingClientRect();
    // Ползунок умеет показать ТОЛЬКО ОДИН выбор. Группа скрыта, ничего не выбрано — или включено
    // несколько (ряд независимых тумблеров, одетый в `.seg`: в мониторе так собраны «Панели») —
    // метка снимается, и плашку рисует каждая включённая ячейка сама (запасной вид).
    if (!box || !box.width) { seg.removeAttribute("data-seg-ready"); return; }
    const s = seg.getBoundingClientRect();
    const cs = getComputedStyle(seg);
    const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
    seg.style.setProperty("--seg-x", (box.left - s.left - bl) + "px");
    seg.style.setProperty("--seg-y", (box.top - s.top - bt) + "px");
    seg.style.setProperty("--seg-w", box.width + "px");
    seg.style.setProperty("--seg-h", box.height + "px");
    seg.setAttribute("data-seg-ready", "");
  }
  const segRO = typeof ResizeObserver === "function" ? new ResizeObserver((rs) => rs.forEach((r) => layoutSeg(r.target))) : null;
  function scanSegs() {
    $$(".seg").forEach((seg) => {
      if (segRO && !seg.dataset.segObserved) { seg.dataset.segObserved = "1"; segRO.observe(seg); }
      layoutSeg(seg);
    });
  }
  scanSegs();
  // Выбор меняют и страницы своим кодом (не только `data-kit-seg`), поэтому следим за самим атрибутом.
  new MutationObserver((ms) => {
    let rescan = false;
    ms.forEach((m) => {
      if (m.type === "childList") rescan = true;
      else { const seg = m.target.parentElement; if (seg && seg.classList.contains("seg")) layoutSeg(seg); }
    });
    if (rescan) scanSegs();
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed", "class"] });
  addEventListener("resize", scanSegs);
  // Подписи меряются до загрузки Inter — после неё ширина ячейки другая.
  document.fonts?.ready.then(scanSegs);

  window.kit = { closeMenu, closeDrawer, hideTip, layoutSegs: scanSegs };
})();
