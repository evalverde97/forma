'use strict';
// Forma (versión simple): rutina del día, plan de comidas y lista de compras.
// Textos de interfaz con tx('texto en español'); datos traducidos en i18n.js.

/* ================= Utilidades ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => keyOf(new Date());
const fmtNum = (n, d = 1) => Number(n).toLocaleString(LOCALE, { maximumFractionDigits: d });
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const P = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
};
const icon = (n, c = 'ic') => `<svg class="${c}" viewBox="0 0 24 24">${P[n]}</svg>`;

/* ================= Datos guardados ================= */
const STORE_KEY = 'forma:simple';
const defaults = () => ({ kcal: 3000, done: {}, habits: {}, shop: { period: 'semana', got: {} } });
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (d) return { ...defaults(), ...d, shop: { ...defaults().shop, ...d.shop } };
  } catch { /* datos corruptos o storage bloqueado: arrancamos de cero */ }
  return defaults();
}
let S = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { toast(tx('No se pudo guardar')); }
}

const today = new Date().getDay();
const UI = { train: WEEK_ROUTINE[today] || ['pt', 'A'], foodDay: today };

/* ================= Hábitos diarios ================= */
const HABITS = [
  { key: 'meditar', name: 'Meditar' },
  { key: 'leer', name: 'Leer' },
  { key: 'estudiar', name: 'Estudiar' },
  { key: 'journaling', name: 'Journaling' },
];
const dayKeyBack = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return keyOf(d); };
const habitDone = (key, k) => !!S.habits[k]?.[key];
// Días seguidos: cuenta hacia atrás desde hoy (o desde ayer si hoy todavía no lo marcaste)
function habitStreak(key) {
  let n = 0;
  for (let i = habitDone(key, todayKey()) ? 0 : 1; habitDone(key, dayKeyBack(i)); i++) n++;
  return n;
}
function habitsCard() {
  const k = todayKey();
  const doneToday = HABITS.filter((h) => habitDone(h.key, k)).length;
  const rows = HABITS.map((h) => {
    const on = habitDone(h.key, k), streak = habitStreak(h.key);
    const dots = [6, 5, 4, 3, 2, 1, 0].map((i) => `<i class="${habitDone(h.key, dayKeyBack(i)) ? 'on' : ''}"></i>`).join('');
    return `<button class="habit-row ${on ? 'done' : ''}" data-act="habit" data-h="${h.key}">
      <span class="ex-check">${on ? icon('check', '') : ''}</span>
      <span class="grow" style="text-align:left"><span class="habit-name">${tx(h.name)}</span>
        <span class="faint small">${streak ? (streak === 1 ? tx('1 día seguido') : tx('{n} días seguidos', { n: streak })) : tx('Empezá hoy')}</span></span>
      <span class="habit-dots">${dots}</span></button>`;
  }).join('');
  return `<div class="card home-card">
    <div class="card-title"><div><div class="eyebrow">${tx('Hábitos')}</div><h3>${doneToday === HABITS.length ? tx('Todo hecho hoy ✓') : tx('{a} de {b} hoy', { a: doneToday, b: HABITS.length })}</h3></div></div>
    <div style="margin-top:6px">${rows}</div></div>`;
}

/* ================= Formato de cantidades ================= */
function fmtQty(id, q) {
  const u = FOODS[id].unit;
  if (u === 'u') {
    const whole = Math.floor(q), half = q - whole >= 0.5;
    return `${whole || ''}${half ? '½' : ''}` || '0';
  }
  if (q >= 1000) return `${fmtNum(q / 1000)} ${u === 'ml' ? 'L' : 'kg'}`;
  return `${Math.round(q)} ${u}`;
}

/* ================= Vistas ================= */
const head = (title, sub) => `<div class="head"><div><div class="eyebrow">${sub}</div><h1>${title}</h1></div>
  <button class="icon-btn" data-act="settings" aria-label="${tx('Ajustes')}">${icon('settings')}</button></div>`;

// Comida que corresponde según la hora del día
const nextMealKey = () => { const h = new Date().getHours(); return h < 11 ? 'desayuno' : h < 16 ? 'almuerzo' : h < 19 ? 'merienda' : 'cena'; };

function vHoy() {
  const now = new Date();
  const dateTxt = now.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
  const r = WEEK_ROUTINE[today];
  const done = S.done[todayKey()] || {};

  let train;
  if (r) {
    const day = ROUTINE[r[0]], list = day[r[1]];
    const n = list.filter(([id]) => done[id]).length;
    const pct = Math.round((n / list.length) * 100);
    train = `<a class="card tap home-card" href="#/entreno" data-act="goTrain">
      <div class="card-title"><div><div class="eyebrow">${tx('Entreno de hoy')}</div><h3 style="color:${day.color}">${esc(day.name)} · ${r[1]}</h3></div>
        <span class="pill">${n === list.length ? tx('Completo ✓') : `${n}/${list.length}`}</span></div>
      <div class="bar-track"><div style="width:${pct}%;background:${day.color}"></div></div>
      <p class="muted small" style="margin:10px 0 0">${list.slice(0, 3).map(([id]) => esc(CATALOG[id].name)).join(' · ')}${list.length > 3 ? ` · ${tx('y {n} más', { n: list.length - 3 })}` : ''}</p>
    </a>`;
  } else {
    train = `<div class="card home-card"><div class="eyebrow">${tx('Entreno de hoy')}</div><h3>${tx('Descanso')}</h3>
      <p class="muted small" style="margin:6px 0 0">${tx('Aprovechá para caminar y recuperarte. Mañana arrancás de nuevo.')}</p></div>`;
  }

  const plan = dayPlan(today, S.kcal);
  const nk = nextMealKey();
  const next = plan.meals.find((m) => m.key === nk);
  const meals = plan.meals.map((m) => `<li class="${m.key === nk ? 'now' : ''}"><span>${esc(m.name)}</span><span class="muted">${esc(m.title)}</span><b>${fmtNum(m.kcal, 0)}</b></li>`).join('');

  const shop = shoppingList(S.kcal, S.shop.period === 'mes' ? 30 / 7 : 1);
  const got = S.shop.got[S.shop.period] || {};
  const missing = shop.filter((x) => !got[x.id]).length;

  return `<div class="head"><div><div class="eyebrow">${esc(dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1))}</div><h1>${tx('Hoy')}</h1></div>
    <button class="icon-btn" data-act="settings" aria-label="${tx('Ajustes')}">${icon('settings')}</button></div>
  ${train}
  ${habitsCard()}
  <a class="card tap home-card" href="#/comida" data-act="goFood">
    <div class="card-title"><div><div class="eyebrow">${tx('Próxima comida')} · ${esc(next.name)}</div><h3>${esc(next.title)}</h3></div><span class="pill">${fmtNum(next.kcal, 0)} kcal</span></div>
    <ul class="food-list">${next.items.map((x) => `<li><span>${esc(FOODS[x.id].name)}</span><b>${fmtQty(x.id, x.q)}</b></li>`).join('')}</ul>
  </a>
  <a class="card tap home-card" href="#/comida" data-act="goFood">
    <div class="card-title"><h3>${tx('Comidas de hoy')}</h3><span class="muted small">${fmtNum(plan.kcal, 0)} kcal · ${fmtNum(plan.prot, 0)} g ${tx('proteína')}</span></div>
    <ul class="day-meals">${meals}</ul>
  </a>
  <a class="card tap home-card row between" href="#/compras">
    <div><div class="eyebrow">${tx('Compras')}</div><h3>${missing ? tx('Te faltan {n} productos', { n: missing }) : tx('Tenés todo lo de la lista ✓')}</h3></div>
    <span class="muted small">${S.shop.period === 'mes' ? tx('Mes') : tx('Semana')}</span>
  </a>`;
}

function vEntreno() {
  const [g, v] = UI.train;
  const day = ROUTINE[g];
  const list = day[v];
  const done = S.done[todayKey()] || {};

  const week = WEEK_ORDER.map((wd) => {
    const r = WEEK_ROUTINE[wd];
    const sel = r && r[0] === g && r[1] === v;
    return `<button class="wk-day ${sel ? 'sel' : ''} ${wd === today ? 'now' : ''}" ${r ? `data-act="pick" data-g="${r[0]}" data-v="${r[1]}"` : 'disabled'}>
      <span>${DAY_NAMES[wd].slice(0, 3)}</span><i style="background:${r ? ROUTINE[r[0]].color : 'var(--surface-2)'}"></i>
      <b>${r ? `${ROUTINE[r[0]].short}<small>${r[1]}</small>` : '–'}</b></button>`;
  }).join('');

  const rows = list.map(([id, sets, reps], i) => {
    const e = CATALOG[id];
    return `<div class="ex-row ${done[id] ? 'done' : ''}">
      <button class="ex-check" data-act="toggle" data-id="${id}" aria-label="✓">${done[id] ? icon('check', '') : i + 1}</button>
      <button class="grow ex-main" data-act="info" data-ex="${id}">
        <div class="ex-name">${esc(e.name)}</div><div class="faint small">${MUSCLES[e.m].name}</div></button>
      <div class="ex-sets">${sets} × ${esc(tr(reps))}</div>
      <button class="info-btn" data-act="info" data-ex="${id}" aria-label="${tx('Cómo se hace')}">${icon('info', '')}</button>
    </div>`;
  }).join('');
  const doneCount = list.filter(([id]) => done[id]).length;

  return `${head(tx('Entreno'), today === 0 ? tx('Hoy es día de descanso') : tx('Hoy toca {d}', { d: ROUTINE[WEEK_ROUTINE[today][0]].name }))}
  <div class="week">${week}</div>
  <div class="chips" style="margin-top:14px">${Object.entries(ROUTINE).map(([k, r]) => `<button class="${g === k ? 'on' : ''}" data-act="pick" data-g="${k}" data-v="${v}">${esc(r.name)}</button>`).join('')}</div>
  <div class="tabs" style="margin-top:10px">${['A', 'B'].map((x) => `<button class="${v === x ? 'on' : ''}" data-act="pick" data-g="${g}" data-v="${x}">${tx('Variante {v}', { v: x })}</button>`).join('')}</div>
  <div class="card list-card">
    <div class="card-title" style="padding:4px 2px 10px"><h3 style="color:${day.color}">${esc(day.name)} · ${v}</h3>
      <span class="muted small">${doneCount ? `${doneCount}/${list.length} ✓` : tx('{n} ejercicios', { n: list.length })}</span></div>
    ${rows}
  </div>
  <p class="faint small" style="margin:12px 4px 0">${tx('Tocá el número para marcarlo como hecho y el nombre para ver cómo se hace.')}</p>
  <details class="card" style="margin-top:10px"><summary class="row between" style="list-style:none;cursor:pointer"><h3 style="font-size:15px">${tx('Consejos')}</h3><span class="muted small">${tx('ver')}</span></summary>
    <ul class="meal-plan">${ROUTINE_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>`;
}

function vComida() {
  const wd = UI.foodDay;
  const plan = dayPlan(wd, S.kcal);
  const days = WEEK_ORDER.map((d) => `<button class="${d === wd ? 'on' : ''}" data-act="foodDay" data-d="${d}">${DAY_NAMES[d].slice(0, 3)}</button>`).join('');
  return `${head(tx('Comida'), wd === today ? tx('Hoy') : DAY_NAMES[wd])}
  <div class="chips day-chips">${days}</div>
  <div class="card totals">
    <div><b>${fmtNum(plan.kcal, 0)}</b><span>kcal</span></div>
    <div><b>${fmtNum(plan.prot, 0)} g</b><span>${tx('proteína')}</span></div>
    <div><b>${MEALS.length}</b><span>${tx('comidas')}</span></div>
  </div>
  ${plan.meals.map((m) => `<div class="card meal">
    <div class="card-title"><div><div class="eyebrow">${esc(m.name)}</div><h3>${esc(m.title)}</h3></div><span class="pill">${fmtNum(m.kcal, 0)} kcal</span></div>
    <ul class="food-list">${m.items.map((x) => `<li><span>${esc(FOODS[x.id].name)}</span><b>${fmtQty(x.id, x.q)}</b></li>`).join('')}</ul>
  </div>`).join('')}
  <p class="faint small" style="margin:12px 4px 0">${tx('Verduras para elegir: {v}', { v: VEGGIE_IDEAS })} ${tx('Carnes, arroz, fideos y porotos pesados en crudo.')}</p>`;
}

function vCompras() {
  const per = S.shop.period;
  const weeks = per === 'mes' ? 30 / 7 : 1;
  const list = shoppingList(S.kcal, weeks);
  const got = S.shop.got[per] || {};
  const cats = Object.keys(FOOD_CATS).map((c) => {
    const items = list.filter((x) => FOODS[x.id].cat === c).sort((a, b) => FOODS[a.id].name.localeCompare(FOODS[b.id].name));
    if (!items.length) return '';
    return `<h2>${FOOD_CATS[c]}</h2><div class="card list-card">${items.map((x) => {
      const f = FOODS[x.id];
      // Sugerencia de envases solo cuando se compra por paquete (no para kg sueltos ni unidades sueltas)
      const byPack = f.unit === 'u' ? f.buy[0] > 1 : f.buy[1] !== 'kg';
      const hint = byPack ? `≈ ${x.packs} × ${f.buy[1]}` : '';
      const qty = f.unit === 'u' ? `${Math.ceil(x.qty)} ${f.buy[0] > 1 ? 'u.' : f.buy[1]}` : fmtQty(x.id, x.qty);
      return `<button class="shop-row ${got[x.id] ? 'done' : ''}" data-act="got" data-id="${x.id}">
        <span class="ex-check">${got[x.id] ? icon('check', '') : ''}</span>
        <span class="grow" style="text-align:left"><span class="shop-name">${esc(f.name)}</span>${hint ? `<span class="faint small">${hint}</span>` : ''}</span>
        <b>${qty}</b></button>`;
    }).join('')}</div>`;
  }).join('');
  const nGot = list.filter((x) => got[x.id]).length;
  return `${head(tx('Compras'), tx('Para ~{k} kcal por día', { k: fmtNum(S.kcal, 0) }))}
  <div class="tabs">${[['semana', tx('Semana')], ['mes', tx('Mes')]].map(([k, l]) => `<button class="${per === k ? 'on' : ''}" data-act="period" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="row between small" style="margin:0 4px"><span class="muted">${tx('{a} de {b} en el carrito', { a: nGot, b: list.length })}</span>
    ${nGot ? `<button class="link" data-act="clearShop">${tx('Desmarcar todo')}</button>` : ''}</div>
  ${cats}
  <p class="faint small" style="margin:12px 4px 0">${tx('Cantidades aproximadas según tu plan de comidas, redondeadas para arriba al envase.')}</p>`;
}

/* ================= Modal, ajustes, toast ================= */
function openSheet(html) {
  $('#sheet-root').innerHTML = `<div class="sheet-bg" data-act="closeSheet"></div><div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
}
const closeSheet = () => { $('#sheet-root').innerHTML = ''; };
let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200);
}

// "Cómo se hace": imagen inicial ↔ final animada, técnica y video
function infoSheet(id) {
  const e = CATALOG[id];
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${e.name} ${tx('técnica ejercicio')}`)}`;
  openSheet(`<h3>${esc(e.name)}</h3>
    <div class="row" style="gap:6px;margin:-6px 0 12px;flex-wrap:wrap"><span class="pill"><i class="dot" style="background:${MUSCLES[e.m].color}"></i>${MUSCLES[e.m].name}</span><span class="pill">${EQUIP[e.eq]}</span></div>
    ${e.img ? `<div class="ex-img"><img src="img/ex/${e.img}/0.jpg" alt=""><img class="b" src="img/ex/${e.img}/1.jpg" alt=""></div>
      <p class="faint small" style="text-align:center;margin:6px 0 0">${tx('Posición inicial ↔ final')}</p>`
      : `<div class="ex-img empty-img">${icon('info', '')}<span>${tx('Sin imagen para este ejercicio')}</span></div>`}
    <p style="margin:14px 0 0;line-height:1.5">${esc(e.cue)}</p>
    <a class="btn block ${e.img ? '' : 'primary'}" style="margin-top:14px" href="${yt}" target="_blank" rel="noopener">${icon('play')} ${tx('Ver videos en YouTube')}</a>`);
}

function settingsSheet() {
  openSheet(`<h3>${tx('Ajustes')}</h3>
    <div class="field" style="margin-top:0"><span>${tx('Idioma')}</span><div class="chips">${Object.entries(LANGS).map(([k, l]) => `<button class="${LANG === k ? 'on' : ''}" data-act="setLang" data-v="${k}">${l}</button>`).join('')}</div></div>
    <label class="field"><span>${tx('Calorías por día')}</span><input id="kcalIn" inputmode="numeric" value="${S.kcal}"></label>
    <div class="chips" style="margin-top:8px">${[2500, 2800, 3000, 3200, 3500].map((k) => `<button data-act="kcal" data-v="${k}">${fmtNum(k, 0)}</button>`).join('')}</div>
    <p class="faint small" style="margin:10px 0 0">${tx('Las porciones del plan y la lista de compras se ajustan a este número.')}</p>
    <button class="btn primary block" style="margin-top:14px" data-act="saveKcal">${tx('Guardar')}</button>
    <p class="faint small" style="text-align:center;margin-top:18px">${tx('Imágenes de ejercicios: Free Exercise DB (dominio público).')}</p>`);
}

/* ================= Acciones ================= */
const A = {
  closeSheet,
  pick({ g, v }) { UI.train = [g, v]; render(); },
  goTrain() { if (WEEK_ROUTINE[today]) UI.train = WEEK_ROUTINE[today]; location.hash = '#/entreno'; },
  goFood() { UI.foodDay = today; location.hash = '#/comida'; },
  habit({ h }) {
    const k = todayKey();
    const day = (S.habits[k] ||= {});
    day[h] = !day[h];
    save(); render();
  },
  toggle({ id }) {
    const k = todayKey();
    S.done = { [k]: { ...(S.done[k] || {}) } }; // solo se guarda el día de hoy
    S.done[k][id] = !S.done[k][id];
    save(); render();
  },
  info({ ex }) { infoSheet(ex); },
  foodDay({ d }) { UI.foodDay = Number(d); render(); },
  period({ v }) { S.shop.period = v; save(); render(); },
  got({ id }) {
    const g = (S.shop.got[S.shop.period] ||= {});
    g[id] = !g[id];
    save(); render();
  },
  clearShop() { S.shop.got[S.shop.period] = {}; save(); render(); },
  settings: settingsSheet,
  kcal({ v }) { $('#kcalIn').value = v; },
  saveKcal() {
    const k = Math.round(Number($('#kcalIn').value));
    if (!(k >= 1500 && k <= 5000)) { toast(tx('Ingresá un número entre 1500 y 5000')); return; }
    S.kcal = k; save(); closeSheet(); render(); toast(tx('Plan ajustado a {k} kcal', { k: fmtNum(k, 0) }));
  },
  setLang({ v }) {
    if (v === LANG) return;
    try { localStorage.setItem(LANG_KEY, v); } catch { /* sin storage */ }
    location.reload();
  },
};

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t || !A[t.dataset.act]) return;
  e.preventDefault();
  A[t.dataset.act]({ ...t.dataset }, t);
});

/* ================= Router ================= */
const VIEWS = { hoy: vHoy, entreno: vEntreno, comida: vComida, compras: vCompras };
function render() {
  const r = location.hash.slice(2).split('/')[0];
  const view = VIEWS[r] ? r : 'hoy';
  $$('.tabbar a').forEach((x) => x.classList.toggle('on', x.dataset.tab === view));
  $('#view').innerHTML = VIEWS[view]();
}
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

// Al volver a la app otro día, recargar para tomar el día nuevo
const openedOn = todayKey();
document.addEventListener('visibilitychange', () => { if (!document.hidden && todayKey() !== openedOn) location.reload(); });

$$('.tabbar a span').forEach((el) => { el.textContent = tx(el.textContent); });
document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'es';
render();
