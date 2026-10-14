'use strict';
// Textos: tx('texto en español', {vars}) para la interfaz; tr('dato guardado') para datos que pueden
// venir en español (nombres de días, notas, objetivos de reps). Ver i18n.js.

/* ================= Utilidades ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const weekStart = (k) => { const d = parseKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return keyOf(d); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtLong = (k) => cap(parseKey(k).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }));
const fmtShort = (k) => parseKey(k).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }).replace('.', '');
const fmtNum = (n, d = 1) => Number(n).toLocaleString(LOCALE, { maximumFractionDigits: d });
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const relDay = (k) => { const d = daysBetween(k, todayKey()); return d === 0 ? tx('Hoy') : d === 1 ? tx('Ayer') : fmtLong(k); };
const clone = (o) => JSON.parse(JSON.stringify(o));
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const dayName = (wd) => DAY_NAMES[wd];
const dayAbbr = (wd) => DAY_NAMES[wd].slice(0, 3);

const P = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  good: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>',
  play: '<path d="M8 5.5v13l11-6.5z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
};
const icon = (n, c = 'ic') => `<svg class="${c}" viewBox="0 0 24 24">${P[n]}</svg>`;

/* ================= Datos ================= */
const STORE_KEY = 'forma:v1';
const defaultProfile = () => ({
  name: '', sex: '', age: '', height: '', startWeight: '', goalWeight: '', activity: 'ligero',
  waterGoal: 8, rest: 90, trainDays: [1, 3, 5], onboarded: false,
});
const defaults = () => ({ v: 2, profile: defaultProfile(), program: null, sessions: [], days: {}, weights: [], since: todayKey() });

// Datos de la versión 1 (rutina fija): se convierten a la rutina clásica editable sin perder historial.
function migrate(d) {
  if (d.v >= 2) return d;
  const used = d.sessions?.length || Object.keys(d.days || {}).length || d.weights?.length;
  d.v = 2;
  if (!used) return { ...d, profile: { ...defaultProfile(), ...d.profile, onboarded: false }, program: null };
  const prog = classicProgram('grasa');
  d.program = prog;
  d.profile = { ...defaultProfile(), ...d.profile, trainDays: [1, 2, 3, 4, 5], onboarded: true };
  for (const s of d.sessions || []) {
    const day = prog.days.find((x) => x.id === s.group);
    if (day) { s.title = day.name; s.color = day.color; }
    for (const e of s.exercises || []) {
      const entry = prog.days.flatMap((x) => x.blocks.flat()).find((x) => x.ex === e.id);
      if (entry && e.t === undefined) { e.t = entry.t; e.r = entry.r; }
    }
  }
  return d;
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = migrate(JSON.parse(raw));
      return { ...defaults(), ...d, profile: { ...defaultProfile(), ...d.profile } };
    }
  } catch { /* datos corruptos o storage bloqueado: arrancamos vacío */ }
  return defaults();
}
let S = load();
let saveT;
function save(now) {
  clearTimeout(saveT);
  const write = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { toast(tx('No se pudo guardar')); } };
  if (now) write(); else saveT = setTimeout(write, 250);
}
window.addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
navigator.storage?.persist?.().catch(() => {});

const UI = { calMonth: todayKey().slice(0, 7), calSel: todayKey(), planTab: 'rutina', lib: { m: '', all: false, q: '' }, ob: null, pending: null, pick: null };

/* ---------- Rutina y objetivo ---------- */
const objective = () => S.program?.objective || 'salud';
const OBJ = () => OBJECTIVES[objective()];
const progDay = (id) => S.program?.days.find((d) => d.id === id);
const exName = (e) => CATALOG[e.ex || e.id]?.name || e.name || tx('Ejercicio');
const dName = (day) => tr(day.name);
const placeEq = () => PLACES[S.program?.place || 'gym'].eq;
function trainDays() {
  const n = S.program?.days.length || 3;
  let td = (S.profile.trainDays || []).slice().sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  if (td.length !== n) td = DEFAULT_WEEKDAYS[Math.min(6, Math.max(2, n))] || WEEK_ORDER.slice(0, n);
  return td.slice(0, n);
}
// Abreviatura de 2 letras para los círculos de la semana ("Torso A" → "TA", "Pecho" → "Pe")
function dayShort(day) {
  const w = dName(day).replace(/\(.*?\)/g, '').split(/[\s·]+/).filter(Boolean);
  return w.length > 1 && w.at(-1).length === 1 ? w[0][0] + w.at(-1) : w[0].slice(0, 2);
}
const sessionInfo = (s) => s.group === 'cardio' ? { name: tx('Cardio'), color: MUSCLES.cardio.color }
  : s.group === 'libre' ? { name: tx('Libre'), color: '#A1A1AA' }
  : { name: tr(progDay(s.group)?.name || s.title || tx('Entreno')), color: progDay(s.group)?.color || s.color || '#A1A1AA' };
const sessionExName = (e) => CATALOG[e.id]?.name || e.name;

// Objetivo de reps por serie a partir del texto ("8–12" → 12, "25 · 20 · 15 · 10" → lista, "fallo"/"30 s" → null)
function parseTarget(t, sets) {
  const txt = String(t || '').toLowerCase();
  if (!txt || /fallo|falha|seg|\d\s*s\b|min/.test(txt)) return null;
  const nums = (txt.match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  if (nums.length >= 3) return Array.from({ length: sets }, (_, i) => nums[i] ?? nums.at(-1));
  return Array(sets).fill(Math.max(...nums));
}
const isTimed = (t) => /\d\s*s\b|seg|min/i.test(String(t || ''));

/* ---------- Días (alimentación / hábitos) ---------- */
const dayGet = (k) => S.days[k] || { meals: {}, habits: {}, water: 0 };
const dayEdit = (k) => (S.days[k] ||= { meals: {}, habits: {}, water: 0 });
const MEAL_VAL = { plan: 1, parcial: 0.5, off: 0 };
const activeHabits = () => NUTRITION[objective()].habits;
const mealPlanFor = (k) => NUTRITION[objective()].plan[parseKey(k).getDay()];
function dayScore(k) {
  const d = S.days[k];
  if (!d) return null;
  const habits = activeHabits();
  let pts = 0, logged = 0;
  for (const m of MEALS) { const s = d.meals[m.key]?.s; if (s) { pts += MEAL_VAL[s]; logged++; } }
  const hDone = habits.filter((h) => d.habits[h]).length;
  if (!logged && !hDone && !d.water) return null;
  pts += hDone + Math.min(1, (d.water || 0) / S.profile.waterGoal);
  return Math.round((pts / (MEALS.length + habits.length + 1)) * 100);
}
const isLogged = (k) => MEALS.some((m) => S.days[k]?.meals[m.key]?.s);

/* ---------- Sesiones de entreno ---------- */
const sessionsOn = (k) => S.sessions.filter((s) => s.date === k);
const findSession = (id) => S.sessions.find((s) => s.id === id);
const sortedSessions = () => [...S.sessions].sort((a, b) => a.date.localeCompare(b.date) || (a.startedAt || 0) - (b.startedAt || 0));
const isStrength = (s) => s.group !== 'cardio';
const emptySets = (n) => Array.from({ length: n }, () => ({ kg: '', reps: '', done: false }));
const mkExercise = (entry, block) => ({ id: entry.ex, name: exName(entry), block, t: entry.t || '', r: entry.r ?? null, sets: emptySets(entry.sets || 3) });

function newSession(group, date) {
  const s = { id: uid(), date, group, startedAt: Date.now(), finishedAt: null, exercises: [], note: '' };
  if (group === 'cardio') s.cardio = { kind: CARDIO_KINDS[0], min: '', km: '' };
  const day = progDay(group);
  if (day) {
    s.title = day.name; s.color = day.color;
    day.blocks.forEach((block, b) => block.forEach((entry) => s.exercises.push(mkExercise(entry, b))));
  }
  S.sessions.push(s);
  save();
  return s;
}

// Historial de series completadas por ejercicio, en orden cronológico.
function exerciseHistory(excludeId) {
  const h = {};
  for (const s of sortedSessions()) {
    if (s.id === excludeId) continue;
    for (const e of s.exercises || []) {
      const sets = e.sets.filter((x) => x.done).map((x) => ({ kg: num(x.kg), reps: num(x.reps) }));
      if (sets.length) (h[e.id] ||= []).push({ date: s.date, name: sessionExName(e), r: e.r, sets });
    }
  }
  return h;
}
const topKg = (sets) => Math.max(0, ...sets.map((s) => s.kg || 0));
const volume = (s) => (s.exercises || []).reduce((t, e) => t + e.sets.reduce((a, x) => a + (x.done ? (num(x.kg) || 0) * (num(x.reps) || 0) : 0), 0), 0);
const doneSets = (s) => (s.exercises || []).reduce((t, e) => t + e.sets.filter((x) => x.done).length, 0);

// Valores sugeridos para una serie: peso de la última vez y reps objetivo de la rutina.
function suggest(e, j, last) {
  const lastSet = last?.sets[j] || last?.sets.at(-1);
  const target = Array.isArray(e.r) ? e.r[j] ?? e.r.at(-1) : undefined;
  const fallo = e.r === null && !isTimed(e.t);
  return { kg: lastSet?.kg ?? '', reps: target ?? lastSet?.reps ?? '', fallo, timed: isTimed(e.t) };
}

function sessionSummary(s) {
  if (s.group === 'cardio') {
    const c = s.cardio || {};
    return [c.kind && tr(c.kind), c.min && `${c.min} min`, c.km && `${fmtNum(num(c.km))} km`].filter(Boolean).join(' · ');
  }
  const exs = s.exercises.filter((e) => e.sets.some((x) => x.done)).length;
  const vol = volume(s);
  return `${tx('{n} ejercicios · {s} series', { n: exs, s: doneSets(s) })}${vol ? ` · ${fmtNum(vol, 0)} kg` : ''}${s.finishedAt ? '' : ` · ${tx('en curso')}`}`;
}

/* ---------- Plan semanal adaptativo ----------
   Cada semana tiene que cubrir todos los días de la rutina, en orden. Lo ya entrenado se descuenta y
   lo pendiente se reparte en los días de entrenamiento elegidos que quedan; si no alcanzan, en los
   días libres más próximos. Si un día hacés otra cosa, lo que quedó pendiente se corre solo. */
function weekPlan(ref = todayKey()) {
  const ws = weekStart(ref), today = todayKey();
  const ids = S.program?.days.map((d) => d.id) || [];
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(ws, i);
    const ss = sessionsOn(date);
    return {
      date,
      done: [...new Set(ss.filter((s) => ids.includes(s.group) && doneSets(s) > 0).map((s) => s.group))],
      other: ss.some((s) => !ids.includes(s.group) && (doneSets(s) > 0 || s.group === 'cardio')),
      cardio: ss.some((s) => s.group === 'cardio'),
      planned: null,
    };
  });
  if (!ids.length) return days;
  const td = trainDays();
  const doneAll = new Set(days.flatMap((d) => d.done));
  // La semana en que empezaste a usar la app no te reclama los días anteriores a ese primer uso.
  const pending = ids.filter((id, i) => !doneAll.has(id) && addDays(ws, (td[i] + 6) % 7) >= S.since);
  const open = days.filter((d) => d.date > today || (d.date === today && !d.done.length));
  const preferred = open.filter((d) => td.includes(parseKey(d.date).getDay()));
  const extra = open.filter((d) => !td.includes(parseKey(d.date).getDay()));
  const chosen = [...preferred, ...extra.slice(0, Math.max(0, pending.length - preferred.length))].sort((a, b) => a.date.localeCompare(b.date));
  pending.forEach((id, i) => { if (chosen[i]) chosen[i].planned = id; });
  return days;
}
const plannedFor = (k) => weekPlan(k).find((d) => d.date === k)?.planned || null;
const nextPlanned = (k = todayKey()) => weekPlan(k).find((d) => d.date > k && d.planned) || null;
const whenLabel = (k) => { const d = daysBetween(todayKey(), k); return d === 0 ? tx('hoy') : d === 1 ? tx('mañana') : dayName(parseKey(k).getDay()).toLowerCase(); };
const baseDayFor = (k) => { const i = trainDays().indexOf(parseKey(k).getDay()); return i >= 0 ? S.program?.days[i]?.id : null; };

/* ---------- Peso ---------- */
const weightsSorted = () => [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
const currentWeight = () => weightsSorted().at(-1)?.kg ?? num(S.profile.startWeight);
const targets = () => calcTargets({ ...S.profile, weight: currentWeight() }, objective(), S.program?.days.length);

/* ================= Recomendaciones ================= */
function recommendations() {
  const out = [];
  const today = todayKey();
  const used = daysBetween(S.since, today) + 1;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const p = S.profile, obj = OBJ();
  const R = (tone, title, body) => out.push({ tone, title, body });

  // --- Progresión por ejercicio
  const hist = exerciseHistory();
  const prog = [];
  for (const h of Object.values(hist)) {
    if (h.length < 2) continue;
    const last = h.at(-1), prev = h.at(-2);
    const tLast = topKg(last.sets), tPrev = topKg(prev.sets);
    const goals = Array.isArray(last.r) ? last.r : null;
    const hitAll = goals && goals.some((r) => r !== null) && last.sets.length >= goals.length &&
      goals.every((r, i) => r === null || (last.sets[i]?.reps ?? 0) >= r);
    if (hitAll && tLast > 0 && tLast >= tPrev) {
      const inc = tLast >= 20 ? 2.5 : 1;
      prog.push({ date: last.date, r: { tone: 'up', title: tx('Subí el peso en {e}', { e: last.name }), body: tx('Completaste todas las reps con {a} kg. Probá con {b} kg la próxima vez.', { a: fmtNum(tLast), b: fmtNum(tLast + inc) }) } });
    } else if (h.length >= 3 && tLast > 0 && topKg(h.at(-3).sets) === tLast && tPrev === tLast) {
      prog.push({ date: last.date, r: { tone: 'warn', title: tx('Estancado en {e}', { e: last.name }), body: tx('Llevás 3 sesiones con {a} kg sin completar las reps. Revisá técnica, descanso y comida, o bajá un 10 % y volvé a subir.', { a: fmtNum(tLast) }) } });
    }
  }
  prog.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).forEach((x) => out.push(x.r));

  // --- Días de la rutina descuidados
  const strength = S.sessions.filter((s) => isStrength(s) && doneSets(s) > 0);
  for (const day of S.program?.days || []) {
    const lastD = strength.filter((s) => s.group === day.id).map((s) => s.date).sort().at(-1);
    const gap = lastD ? daysBetween(lastD, today) : null;
    if (gap !== null && gap >= 10) R('warn', tx('Hace {n} días que no hacés {d}', { n: gap, d: dName(day) }), tx('Sumalo en el próximo día libre: el plan de la semana ya lo tiene en cuenta.'));
  }

  // --- Frecuencia y movimiento
  const week = strength.filter((s) => last7.includes(s.date));
  const goalDays = S.program?.days.length || 3;
  if (!S.sessions.length) {
    const g = plannedFor(today);
    R('up', tx('Registrá tu primer entreno'), `${g ? tx('Hoy toca {d}.', { d: dName(progDay(g)) }) + ' ' : ''}${tx('Anotá los pesos de cada serie: con eso la app te va a decir cuándo subir.')}`);
  } else if (used >= 7 && week.length < Math.min(3, goalDays)) {
    R('warn', tx('{n} entrenos en los últimos 7 días', { n: week.length }), tx('Tu rutina es de {n} días por semana. La constancia es lo que más resultado da.', { n: goalDays }));
  }
  const trainedDays = new Set(S.sessions.filter((s) => doneSets(s) > 0 || s.group === 'cardio').map((s) => s.date));
  let streak = 0;
  for (let k = today; trainedDays.has(k); k = addDays(k, -1)) streak++;
  if (streak >= 6) R('warn', tx('{n} días seguidos entrenando', { n: streak }), tx('Buenísimo, pero el músculo crece en el descanso. Tomate un día de descanso activo (caminata suave).'));

  if (['grasa', 'recomp', 'resistencia', 'salud'].includes(objective()) && used >= 5) {
    const cardioDays = new Set(S.sessions.filter((s) => s.group === 'cardio' && last7.includes(s.date)).map((s) => s.date));
    const walkDays = last7.filter((k) => S.days[k]?.habits.caminata).length;
    if (cardioDays.size + walkDays < 3) R('warn', tx('Moverte más durante la semana'), objective() === 'resistencia'
      ? tx('Sumá 2–3 sesiones de cardio (trote, bici, soga) y registralas como Cardio.')
      : tx('Caminatas de 20–30′ o trote suave casi todos los días. Empezá corto y sumá tiempo cada semana.'));
  }

  // --- Alimentación y hábitos (últimos 7 días registrados)
  const logged = last7.filter(isLogged);
  if (logged.length >= 3) {
    const n = logged.length;
    const weak = activeHabits().map((h) => ({ h, c: logged.filter((k) => S.days[k].habits[h]).length })).filter((x) => x.c < n * 0.6).sort((a, b) => a.c - b.c);
    weak.slice(0, 2).forEach(({ h, c }) => R('warn', tx('{h}: {c} de {n} días', { h: HABIT_INFO[h].name, c, n }), HABIT_INFO[h].tip));
    const water = logged.reduce((t, k) => t + (S.days[k].water || 0), 0) / n;
    if (water < p.waterGoal * 0.75) R('warn', tx('Tomás {n} vasos de agua por día', { n: fmtNum(water) }), tx('Tu meta es {n}. Arrancá con un vaso grande al levantarte y llevá una botella al entrenar.', { n: p.waterGoal }));
    const worst = MEALS.map((m) => ({ m, off: logged.filter((k) => ['off', 'parcial'].includes(S.days[k].meals[m.key]?.s)).length })).sort((a, b) => b.off - a.off)[0];
    if (worst.off >= 2) {
      const plan = mealPlanFor(today)[worst.m.key];
      R('warn', tx('{m} es donde más te salís', { m: worst.m.art }), tx('Planificalo con anticipación. Tu guía sugiere: {s}.', { s: plan.items.slice(0, 2).join(', ').toLowerCase() }));
    }
    const avg = logged.reduce((t, k) => t + (dayScore(k) || 0), 0) / n;
    if (avg >= 80) R('good', tx('Semana sólida: {n} % de adherencia', { n: Math.round(avg) }), tx('Así se cambia el cuerpo: hábitos que se repiten. Seguí igual.'));
  } else if (used >= 2) {
    R('up', tx('Registrá tus comidas'), tx('Con 3 días registrados empiezo a detectar qué comida o hábito te cuesta más.'));
  }

  // --- Peso según el objetivo
  const ws = weightsSorted();
  if (!ws.length) {
    R('up', tx('Registrá tu peso'), tx('Pesate en ayunas, una vez por semana, siempre a la misma hora.'));
  } else {
    const lastW = ws.at(-1);
    const since = daysBetween(lastW.date, today);
    if (since >= 7) R('up', tx('Hace {n} días que no te pesás', { n: since }), tx('Pesate en ayunas, después del baño, para comparar siempre en las mismas condiciones.'));
    const ref = [...ws].reverse().find((w) => daysBetween(w.date, lastW.date) >= 12);
    if (ref) {
      const weeks = Math.round(daysBetween(ref.date, lastW.date) / 7);
      const rate = (lastW.kg - ref.kg) / (daysBetween(ref.date, lastW.date) / 7);
      const r = `${rate >= 0 ? '+' : ''}${fmtNum(rate, 2)} kg/${tx('sem')}`;
      if (obj.weight === 'down') {
        if (rate > -0.2) R('warn', tx('El peso no está bajando'), tx('Últimas {w} semanas: {r}. Achicá un poco las porciones de carbohidratos, sumá 10′ de caminata y revisá los fines de semana.', { w: weeks, r }));
        else if (rate < -1.2) R('warn', tx('Bajás {n} kg por semana', { n: fmtNum(-rate) }), tx('Es rápido. Asegurate de comer proteína en todas las comidas para no perder músculo y fuerza.'));
        else R('good', tx('Bajando {n} kg por semana', { n: fmtNum(-rate) }), tx('Ritmo ideal y sostenible (0,3–1 kg/sem). Seguí así.'));
      } else if (obj.weight === 'down-slow') {
        if (rate > 0.15) R('warn', tx('El peso está subiendo'), tx('Últimas {w} semanas: {r}. Para recomposición conviene un déficit chico: recortá algo de carbohidratos o snacks.', { w: weeks, r }));
        else R('good', tx('Peso estable o bajando despacio'), tx('Es lo ideal para recomposición: fijate que tus pesos en el gym suban.'));
      } else if (obj.weight === 'up') {
        if (rate < 0.1) R('warn', tx('El peso no está subiendo'), tx('Últimas {w} semanas: {r}. Sumá ~200 kcal por día: un licuado de leche y banana o un puñado de frutos secos.', { w: weeks, r }));
        else if (rate > 0.6) R('warn', tx('Subís {n} kg por semana', { n: fmtNum(rate) }), tx('Es rápido y puede ser grasa. Bajá un poco las porciones: lo ideal es 0,25–0,5 kg por semana.'));
        else R('good', tx('Subiendo {n} kg por semana', { n: fmtNum(rate) }), tx('Ritmo ideal para ganar músculo con poca grasa.'));
      } else if (Math.abs(rate) > 0.5) {
        R('warn', tx('Tu peso cambió {r}', { r }), tx('Para tu objetivo conviene mantenerlo estable. Revisá si comés de más o de menos.'));
      }
    }
  }
  if (!targets()) R('up', tx('Completá tu perfil'), tx('Con edad, sexo, altura y peso calculo cuántas calorías y proteína necesitás.'));

  const order = { warn: 0, up: 1, good: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}

const recHtml = (r) => `<div class="card rec ${r.tone}">
  <div class="badge">${icon(r.tone === 'good' ? 'good' : r.tone === 'warn' ? 'alert' : 'up')}</div>
  <div class="grow"><h3 style="font-size:15px">${esc(r.title)}</h3><p>${esc(r.body)}</p></div></div>`;

/* ================= Componentes ================= */
function ring(pct, size = 92, stroke = 8, label = tx('día')) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(100, pct) / 100)}" style="transition:stroke-dashoffset .5s"/></svg>
    <div class="val"><div>${pct}<span style="font-size:13px">%</span><small>${label}</small></div></div></div>`;
}

function lineChart(pts, unit = 'kg') {
  if (pts.length < 2) return `<div class="empty small">${tx('Con 2 registros o más aparece el gráfico.')}</div>`;
  const W = 320, H = 150, L = 34, R = 10, T = 12, B = 22;
  const xs = pts.map((p) => parseKey(p.x).getTime());
  const ys = pts.map((p) => p.y);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y1 - y0 < 1) { y0 -= 1; y1 += 1; } else { const m = (y1 - y0) * 0.15; y0 -= m; y1 += m; }
  const X = (t) => L + ((t - xs[0]) / (xs.at(-1) - xs[0] || 1)) * (W - L - R);
  const Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${X(xs.at(-1)).toFixed(1)},${H - B}L${L},${H - B}Z`;
  const grid = [0, 0.5, 1].map((f) => { const v = y0 + (y1 - y0) * f; return `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${L - 6}" y="${Y(v) + 3}" text-anchor="end">${fmtNum(v)}</text>`; }).join('');
  const dots = pts.map((p, i) => `<circle cx="${X(xs[i])}" cy="${Y(p.y)}" r="${i === pts.length - 1 ? 4 : 2.2}" fill="var(--accent)"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${unit}">
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#g)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}
    <text x="${L}" y="${H - 6}">${fmtShort(pts[0].x)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${fmtShort(pts.at(-1).x)}</text></svg>`;
}

const infoBtn = (id, name) => `<button class="info-btn" aria-label="${tx('Cómo se hace')}" data-act="info" data-ex="${esc(id)}" data-name="${esc(name || '')}">${icon('info', '')}</button>`;

function mealCard(k, m) {
  const plan = mealPlanFor(k)[m.key];
  const d = dayGet(k).meals[m.key] || {};
  const seg = [['plan', tx('Según plan')], ['parcial', tx('Parcial')], ['off', tx('Me salí')]]
    .map(([v, l]) => `<button data-act="meal" data-date="${k}" data-meal="${m.key}" data-v="${v}" class="${d.s === v ? 'on' : ''}">${l}</button>`).join('');
  return `<div class="card">
    <div class="card-title"><h3>${m.name}</h3><span class="pill">${esc(plan.title)}</span></div>
    <ul class="meal-plan">${plan.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    ${plan.tip ? `<div class="tip">${esc(plan.tip)}</div>` : ''}
    <div class="seg">${seg}</div>
    <textarea class="note-input" rows="1" placeholder="${tx('¿Qué comiste? (opcional)')}" data-bind="mealNote" data-date="${k}" data-meal="${m.key}">${esc(d.note)}</textarea>
  </div>`;
}

function waterCard(k) {
  const w = dayGet(k).water || 0, goal = S.profile.waterGoal;
  const n = Math.max(goal, w + 1);
  const glasses = Array.from({ length: n }, (_, i) => `<button aria-label="${i + 1}" class="${i < w ? 'on' : ''}" data-act="water" data-date="${k}" data-n="${i + 1}"></button>`).join('');
  return `<div class="card"><div class="card-title"><h3>${tx('Agua')}</h3><span class="muted small">${tx('{a} / {b} vasos', { a: w, b: goal })}</span></div><div class="water">${glasses}</div></div>`;
}

function habitsCard(k) {
  const h = dayGet(k).habits;
  return `<div class="card" style="padding:4px 16px">${activeHabits().map((x) => `<div class="toggle-row"><span>${HABIT_INFO[x].name}</span>
    <button class="switch ${h[x] ? 'on' : ''}" aria-label="${HABIT_INFO[x].name}" data-act="habit" data-date="${k}" data-h="${x}"></button></div>`).join('')}</div>`;
}

const macrosHtml = (t) => `<div class="macros"><div><b>${fmtNum(t.kcal, 0)}</b><span>kcal</span></div><div><b>${t.protein} g</b><span>${tx('proteína')}</span></div><div><b>${t.carbs} g</b><span>${tx('carbos')}</span></div><div><b>${t.fat} g</b><span>${tx('grasas')}</span></div></div>`;
function targetsCard() {
  const t = targets();
  if (!t) return `<a class="card tap row between" href="#/ajustes"><div><h3 style="font-size:15px">${tx('Calculá tus calorías')}</h3><p class="muted small" style="margin:4px 0 0">${tx('Completá edad, sexo, altura y peso en tu perfil.')}</p></div>${icon('next')}</a>`;
  return `<div class="card"><div class="card-title"><h3>${tx('Tu meta diaria')}</h3><span class="pill">${esc(OBJ().name)}</span></div>
    ${macrosHtml(t)}<p class="faint small" style="margin:10px 0 0">${tx('Estimación orientativa. Gastás ~{n} kcal por día.', { n: fmtNum(t.tdee, 0) })}</p></div>`;
}

// Semana actual: hecho (círculo lleno), planificado (abreviatura del día), libre (–)
function weekStrip() {
  const today = todayKey();
  return `<div class="row">${weekPlan().map((d, i) => {
    const day = progDay(d.done[0] || d.planned);
    const done = d.done.length > 0;
    return `<div style="flex:1;text-align:center">
      <div class="small faint" style="font-weight:600">${WD_LETTERS[i]}</div>
      <div class="wk ${done ? 'done' : ''} ${d.date === today && !done ? 'now' : ''}" style="${done ? `background:${day.color}` : day ? `color:${day.color}` : ''}">${done ? icon('check', 'ic')
        : `<span class="small" style="font-weight:700">${day ? esc(dayShort(day)) : d.other || d.cardio ? '·' : '–'}</span>`}</div></div>`;
  }).join('')}</div>`;
}

/* ================= Vistas ================= */
function vHoy() {
  const k = todayKey(), p = S.profile;
  const group = plannedFor(k);
  const base = baseDayFor(k);
  const after = nextPlanned(k);
  const afterTxt = after ? tx('Después: {d} {w}', { d: `<b style="color:var(--text)">${esc(dName(progDay(after.planned)))}</b>`, w: whenLabel(after.date) }) : '';
  const active = S.sessions.find((s) => !s.finishedAt);
  const doneToday = sessionsOn(k).filter((s) => s.finishedAt);
  let train;
  if (active) {
    train = `<div class="eyebrow">${tx('Sesión en curso')}</div><h3>${esc(sessionInfo(active).name)}</h3>
      <a class="btn primary sm" style="margin-top:12px" href="#/sesion/${active.id}">${tx('Continuar')}</a>`;
  } else if (doneToday.length) {
    train = `<div class="eyebrow">${tx('Entreno de hoy')}</div><h3>${doneToday.map((s) => esc(sessionInfo(s).name)).join(' + ')} ✓</h3>
      <p class="muted small" style="margin:6px 0 0">${afterTxt || esc(sessionSummary(doneToday[0]))}</p>`;
  } else if (group) {
    const day = progDay(group);
    const baseDay = base && weekPlan(k).find((d) => d.planned === base);
    const why = group === base ? ''
      : !base ? tx('Te quedó pendiente esta semana')
      : baseDay ? tx('Primero lo pendiente; {d} pasa a {w}', { d: esc(dName(progDay(base))), w: whenLabel(baseDay.date) })
      : tx('{d} ya lo hiciste esta semana', { d: esc(dName(progDay(base))) });
    train = `<div class="eyebrow">${tx('Hoy toca')}</div><h3 style="color:${day.color}">${esc(dName(day))}</h3>
      ${why ? `<p class="muted small" style="margin:4px 0 0">${why}</p>` : ''}
      <div class="row" style="margin-top:12px;gap:8px">
        <button class="btn primary sm" data-act="start" data-group="${group}" data-date="${k}">${tx('Empezar')}</button>
        <button class="btn sm" data-act="addSheet" data-date="${k}">${tx('Otro')}</button></div>
      ${afterTxt ? `<p class="muted small" style="margin:10px 0 0">${afterTxt}</p>` : ''}`;
  } else {
    const allDone = weekPlan(k).filter((d) => d.done.length).length >= (S.program?.days.length || 0);
    train = `<div class="eyebrow">${allDone ? tx('Semana completa 💪') : tx('Día libre')}</div><h3>${tx('Descanso activo')}</h3>
      <p class="muted small" style="margin:4px 0 0">${afterTxt || tx('Caminata, trote suave o soga.')}</p>
      <div class="row" style="margin-top:12px;gap:8px"><button class="btn sm" data-act="start" data-group="cardio" data-date="${k}">${tx('Registrar cardio')}</button>
      <button class="btn sm" data-act="addSheet" data-date="${k}">${tx('Entrenar igual')}</button></div>`;
  }

  const hour = new Date().getHours();
  const meals = dayGet(k).meals;
  const next = MEALS.find((m) => !meals[m.key]?.s && hour < m.time + 3) || MEALS.find((m) => !meals[m.key]?.s);
  const nDays = S.program?.days.length || 0;
  const thisWeek = weekPlan(k).filter((d) => d.done.length).length;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(k, -i)).filter(isLogged);
  const adh = last7.length ? Math.round(last7.reduce((t, d) => t + dayScore(d), 0) / last7.length) : null;
  const ws = weightsSorted();
  const recs = recommendations();

  return `
  <div class="head">
    <div><div class="eyebrow">${fmtLong(k)}</div><h1>${tx('Hola')}${p.name ? `, ${esc(p.name)}` : ''}</h1></div>
    <a class="icon-btn" href="#/ajustes" aria-label="${tx('Ajustes')}">${icon('settings')}</a>
  </div>

  <div class="card hero">${ring(dayScore(k) ?? 0)}<div class="grow">${train}</div></div>

  <div class="stat-grid" style="margin-top:10px">
    <button class="stat" style="text-align:left" data-act="weightSheet"><b>${currentWeight() ? fmtNum(currentWeight()) : '–'}</b><span>${ws.length ? tx('kg actual') : tx('kg · registrar')}</span></button>
    <a class="stat" href="#/plan"><b>${thisWeek}<span style="font-size:14px;color:var(--faint)">/${nDays}</span></b><span>${tx('entrenos semana')}</span></a>
    <a class="stat" href="#/comida"><b>${adh ?? '–'}${adh !== null ? '<span style="font-size:14px;color:var(--faint)">%</span>' : ''}</b><span>${tx('adherencia 7d')}</span></a>
  </div>

  <h2>${next ? tx('Próxima comida') : tx('Comidas')}</h2>
  ${next ? mealCard(k, next) : `<div class="card row between"><span>${tx('Todas las comidas registradas ✓')}</span><a class="link" href="#/comida">${tx('Ver')}</a></div>`}

  <h2>${tx('Hidratación')}</h2>
  ${waterCard(k)}

  <h2 class="row between"><span>${tx('Recomendaciones')}</span>${recs.length > 3 ? `<a class="link" style="text-transform:none;letter-spacing:0" href="#/progreso">${tx('Ver todas')}</a>` : ''}</h2>
  ${recs.slice(0, 3).map(recHtml).join('') || `<div class="card muted">${tx('Todo en orden. Seguí registrando.')}</div>`}
  `;
}

function vEntreno() {
  const today = todayKey();
  const [y, m] = UI.calMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysIn = new Date(y, m, 0).getDate();
  const cells = Math.ceil((offset + daysIn) / 7) * 7;
  const byDate = {};
  for (const s of S.sessions) (byDate[s.date] ||= []).push(s);

  let cal = [...WD_LETTERS].map((d) => `<div class="wd">${d}</div>`).join('');
  for (let i = 0; i < cells; i++) {
    const d = new Date(y, m - 1, 1 - offset + i);
    const k = keyOf(d);
    const ss = byDate[k] || [];
    const colors = [...new Set(ss.map((s) => sessionInfo(s).color))];
    const cls = ['d', d.getMonth() !== m - 1 && 'out', k === today && 'today', k === UI.calSel && 'sel', ss.length && 'trained'].filter(Boolean).join(' ');
    cal += `<button class="${cls}" data-act="calSel" data-date="${k}"><span>${d.getDate()}</span>
      <span class="dots">${colors.slice(0, 3).map((c) => `<i style="background:${c}"></i>`).join('')}</span></button>`;
  }
  const monthCount = S.sessions.filter((s) => s.date.startsWith(UI.calMonth) && (doneSets(s) || s.group === 'cardio')).length;
  const monthLabel = cap(first.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }));
  const sel = UI.calSel;
  const selSessions = byDate[sel] || [];
  const active = S.sessions.find((s) => !s.finishedAt);
  const legend = [...(S.program?.days || []).map((d) => ({ name: dName(d), color: d.color })), { name: tx('Cardio'), color: MUSCLES.cardio.color }];

  return `
  <div class="head"><div><div class="eyebrow">${monthCount === 1 ? tx('1 entreno este mes') : tx('{n} entrenos este mes', { n: monthCount })}</div><h1>${tx('Entreno')}</h1></div>
    <button class="icon-btn" data-act="addSheet" data-date="${sel}" aria-label="${tx('Registrar entreno')}">${icon('plus')}</button></div>

  ${active ? `<a class="card tap row between" style="margin-bottom:10px;border:1px solid var(--accent)" href="#/sesion/${active.id}">
    <div><div class="eyebrow" style="color:var(--accent)">${tx('Sesión en curso')}</div><h3>${esc(sessionInfo(active).name)}</h3></div>${icon('next')}</a>` : ''}

  <a class="card tap" style="display:block" href="#/plan">${weekStrip()}</a>

  <div class="card">
    <div class="cal-head">
      <button class="icon-btn" style="width:34px;height:34px" data-act="calMove" data-n="-1" aria-label="-1">${icon('back')}</button>
      <h3>${monthLabel}</h3>
      <button class="icon-btn" style="width:34px;height:34px" data-act="calMove" data-n="1" aria-label="+1">${icon('next')}</button>
    </div>
    <div class="cal">${cal}</div>
    <div class="legend">${legend.map((g) => `<span><i class="dot" style="background:${g.color}"></i>${esc(g.name)}</span>`).join('')}</div>
  </div>

  <h2 style="text-transform:none;letter-spacing:0;font-size:15px;color:var(--text)">${relDay(sel)}</h2>
  ${selSessions.map((s) => `<a class="card tap session-row" href="#/sesion/${s.id}">
      <span class="bar" style="background:${sessionInfo(s).color}"></span>
      <div class="grow"><h3>${esc(sessionInfo(s).name)}</h3><div class="muted small">${esc(sessionSummary(s))}</div></div>${icon('next')}</a>`).join('')}
  ${selSessions.length ? '' : `<div class="card empty">${tx('Sin entrenos este día')}</div>`}
  <button class="btn ghost block" style="margin-top:10px" data-act="addSheet" data-date="${sel}">${icon('plus')} ${tx('Registrar entreno')}</button>
  `;
}

function vSesion(id) {
  const s = findSession(id);
  if (!s) return `<div class="empty">${tx('Sesión no encontrada.')} <a class="link" href="#/entreno">${tx('Volver')}</a></div>`;
  const info = sessionInfo(s);
  const head = `<div class="head">
    <a class="icon-btn" href="#/entreno" aria-label="${tx('Volver')}">${icon('back')}</a>
    <div class="grow"><div class="eyebrow">${relDay(s.date)}</div><h1 style="color:${info.color};font-size:26px">${esc(info.name)}</h1></div>
    <button class="icon-btn" data-act="sessionMenu" data-id="${s.id}" aria-label="${tx('Opciones')}">${icon('more')}</button></div>`;
  const finishBtn = `<div class="sticky-actions"><div><button class="btn primary block" data-act="finish" data-id="${s.id}">${s.finishedAt ? tx('Listo') : tx('Terminar entreno')}</button></div></div>`;

  if (s.group === 'cardio') {
    const c = s.cardio;
    return `${head}<div class="card">
      <div class="field"><span>${tx('Actividad')}</span><div class="chips">${CARDIO_KINDS.map((x) => `<button class="${c.kind === x ? 'on' : ''}" data-act="cardioKind" data-v="${esc(x)}">${esc(tr(x))}</button>`).join('')}</div></div>
      <div class="row" style="gap:10px">
        <label class="field grow"><span>${tx('Minutos')}</span><input inputmode="numeric" data-bind="cardio" data-f="min" value="${esc(c.min)}" placeholder="30"></label>
        <label class="field grow"><span>${tx('Distancia (km)')}</span><input inputmode="decimal" data-bind="cardio" data-f="km" value="${esc(c.km)}" placeholder="${tx('opcional')}"></label>
      </div>
      <label class="field"><span>${tx('Notas')}</span><textarea data-bind="sessionNote" placeholder="${tx('¿Cómo te sentiste?')}">${esc(s.note)}</textarea></label>
    </div>${finishBtn}`;
  }

  const hist = exerciseHistory(s.id);
  const blocks = [...new Set(s.exercises.map((e) => e.block))];
  const notes = S.program?.notes || [];
  const warm = notes.length && progDay(s.group) ? `<details class="card" style="margin-bottom:10px"><summary class="row between" style="list-style:none;cursor:pointer">
      <h3 style="font-size:15px">${tx('Antes de empezar')}</h3><span class="muted small">${tx('ver')}</span></summary>
      <ul class="meal-plan">${notes.map((n) => `<li>${esc(tr(n))}</li>`).join('')}</ul></details>` : '';

  const blockHtml = blocks.map((b, bi) => {
    const items = s.exercises.map((e, i) => ({ e, i })).filter((x) => x.e.block === b);
    const allDone = items.every(({ e }) => e.sets.length && e.sets.every((x) => x.done));
    const kind = items.length === 2 ? tx('Superserie') : items.length > 2 ? tx('Circuito') : '';
    return `<div class="block ${allDone ? 'done' : ''}">${items.map(({ e, i }, n) => exHtml(e, i, hist[e.id]?.at(-1), `${bi + 1}${items.length > 1 ? 'ABCDE'[n] : ''}${n === 0 && kind ? ` · ${kind}` : ''}`)).join('')}</div>`;
  }).join('');

  return `${head}${warm}${blockHtml || `<div class="card empty">${tx('Agregá ejercicios para empezar')}</div>`}
    <button class="btn ghost block" style="margin-top:10px" data-act="libSheet" data-mode="session">${icon('plus')} ${tx('Agregar ejercicio')}</button>
    <label class="field" style="margin-top:16px"><span>${tx('Notas de la sesión')}</span><textarea data-bind="sessionNote" placeholder="${tx('Energía, molestias, sensaciones…')}">${esc(s.note)}</textarea></label>
    ${finishBtn}`;
}

function exHtml(e, i, last, label) {
  const name = sessionExName(e);
  const rows = e.sets.map((set, j) => {
    const sg = suggest(e, j, last);
    return `<div class="n">${j + 1}</div>
      <input inputmode="decimal" enterkeyhint="next" data-set="${i}:${j}:kg" value="${esc(set.kg)}" placeholder="${sg.kg === '' ? 'kg' : fmtNum(sg.kg)}">
      <input inputmode="numeric" enterkeyhint="done" data-set="${i}:${j}:reps" value="${esc(set.reps)}" placeholder="${sg.timed ? tx('seg') : sg.fallo ? tx('fallo') : sg.reps || 'reps'}">
      <button class="check ${set.done ? 'on' : ''}" aria-label="✓" data-act="toggleSet" data-i="${i}" data-j="${j}">${icon('check', '')}</button>`;
  }).join('');
  const lastTxt = last ? `${tx('Última')} · ${fmtShort(last.date)}: ${last.sets.map((x) => `${x.kg != null ? fmtNum(x.kg) : '–'}×${x.reps ?? '?'}`).join('  ')}` : tx('Primera vez: anotá el peso que uses');
  const note = (S.program?.days.flatMap((d) => d.blocks.flat()).find((x) => x.ex === e.id) || {}).note;
  return `<div class="exercise">
    <div class="combo">${label}</div>
    <div class="ex-head"><div class="grow"><div class="ex-name">${esc(name)} ${infoBtn(e.id, name)}</div>
      <div class="ex-meta">${e.t ? `${esc(tr(e.t))} · ` : ''}${esc(lastTxt)}</div></div>
      <button class="icon-btn" style="width:34px;height:34px;background:var(--surface-2)" data-act="exMenu" data-i="${i}" aria-label="${tx('Opciones')}">${icon('more')}</button></div>
    ${note ? `<p class="ex-note">${esc(tr(note))}</p>` : ''}
    <div class="sets"><div class="h">#</div><div class="h" style="text-align:center">kg</div><div class="h" style="text-align:center">${isTimed(e.t) ? tx('seg') : 'reps'}</div><div></div>${rows}</div>
  </div>`;
}

function vComida(k) {
  const today = todayKey();
  if (!k || k > today) k = today;
  const score = dayScore(k);
  return `
  <div class="head"><div><div class="eyebrow">${tx('Alimentación')} · ${esc(OBJ().name)}</div><h1>${tx('Comida')}</h1></div>${score !== null ? ring(score, 56, 6, '') : ''}</div>
  <div class="date-nav">
    <a href="#/comida/${addDays(k, -1)}" aria-label="-1">${icon('back')}</a>
    <span class="lbl">${relDay(k)}</span>
    ${k < today ? `<a href="#/comida/${addDays(k, 1)}" aria-label="+1">${icon('next')}</a>` : '<span style="width:40px"></span>'}
  </div>
  ${k === today ? targetsCard() : ''}
  ${MEALS.map((m) => mealCard(k, m)).join('')}
  <h2>${tx('Hábitos')}</h2>${habitsCard(k)}
  <h2>${tx('Hidratación')}</h2>${waterCard(k)}`;
}

function vProgreso() {
  const today = todayKey(), p = S.profile;
  const ws = weightsSorted();
  const cur = currentWeight();
  const start = num(p.startWeight) ?? ws[0]?.kg;
  const delta = cur && start ? cur - start : 0;
  const bmi = cur && num(p.height) ? cur / (num(p.height) / 100) ** 2 : null;
  const goal = num(p.goalWeight);
  const nDays = S.program?.days.length || 3;

  const thisW = weekStart(today);
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisW, -7 * (7 - i)));
  const counts = weeks.map((w) => new Set(S.sessions.filter((s) => isStrength(s) && doneSets(s) > 0 && weekStart(s.date) === w).map((s) => s.date)).size);
  const maxC = Math.max(nDays, ...counts);

  const days14 = Array.from({ length: 14 }, (_, i) => addDays(today, -i)).filter(isLogged);
  const mealAdh = MEALS.map((m) => {
    const vals = days14.map((k) => S.days[k].meals[m.key]?.s).filter(Boolean);
    return { m, pct: vals.length ? Math.round((vals.reduce((t, v) => t + MEAL_VAL[v], 0) / vals.length) * 100) : null };
  });

  const hist = exerciseHistory();
  const prs = Object.entries(hist).map(([id, h]) => ({ id, name: CATALOG[id]?.name || h.at(-1).name, m: CATALOG[id]?.m || 'otros', kg: Math.max(...h.map((x) => topKg(x.sets))), n: h.length }))
    .filter((x) => x.kg > 0).sort((a, b) => b.kg - a.kg);
  const groups = [...Object.keys(MUSCLES), 'otros'];
  const recs = recommendations();

  return `
  <div class="head"><div><div class="eyebrow">${tx('Tu evolución')}</div><h1>${tx('Progreso')}</h1></div></div>

  <div class="card">
    <div class="card-title"><h3>${tx('Peso')}</h3><button class="btn sm primary" data-act="weightSheet">${icon('plus')} ${tx('Registrar')}</button></div>
    <div class="row" style="margin-top:12px;align-items:flex-end;gap:16px">
      <div><span style="font-size:34px;font-weight:700;letter-spacing:-.03em">${cur ? fmtNum(cur) : '–'}</span> <span class="muted">kg</span></div>
      ${start && ws.length ? `<div class="small" style="padding-bottom:6px;color:var(--muted)">${tx('{n} kg desde el inicio', { n: `${delta > 0 ? '+' : ''}${fmtNum(delta)}` })}</div>` : ''}
    </div>
    ${lineChart(ws.map((w) => ({ x: w.date, y: w.kg })))}
    <div class="divider"></div>
    <div class="row between small"><span class="muted">${tx('IMC')}</span><b>${bmi ? fmtNum(bmi) : '–'}</b></div>
    ${goal && cur ? `<div class="row between small" style="margin-top:6px"><span class="muted">${tx('Objetivo {n} kg', { n: fmtNum(goal) })}</span><b>${Math.abs(cur - goal) < 0.5 ? tx('alcanzado 🎉') : (cur > goal ? tx('faltan bajar {n} kg', { n: fmtNum(cur - goal) }) : tx('faltan subir {n} kg', { n: fmtNum(goal - cur) }))}</b></div>` : ''}
  </div>

  <h2>${tx('Entrenos por semana')}</h2>
  <div class="card"><div class="bars">${counts.map((c, i) => `<div><i class="${c ? '' : 'zero'}" style="height:${(c / maxC) * 100}%"></i><span>${i === 7 ? tx('esta') : fmtShort(weeks[i]).split(' ')[0]}</span></div>`).join('')}</div>
    <div class="muted small" style="margin-top:10px">${tx('Meta: {n} por semana', { n: nDays })}</div></div>

  <h2>${tx('Alimentación · 14 días')}</h2>
  <div class="card">${days14.length ? mealAdh.map(({ m, pct }) => `<div style="margin:6px 0 12px">
      <div class="row between small"><span>${m.name}</span><b>${pct ?? '–'}${pct !== null ? ' %' : ''}</b></div>
      <div style="height:6px;border-radius:3px;background:var(--surface-2);margin-top:6px"><div style="height:100%;width:${pct || 0}%;border-radius:3px;background:${pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}"></div></div></div>`).join('')
    : `<div class="empty">${tx('Registrá tus comidas para ver la adherencia.')}</div>`}</div>

  <h2>${tx('Récords por ejercicio')}</h2>
  ${prs.length ? groups.map((g) => {
    const list = prs.filter((x) => x.m === g);
    if (!list.length) return '';
    const mu = MUSCLES[g] || { name: tx('Otros'), color: '#A1A1AA' };
    return `<details class="card"><summary class="row between" style="list-style:none;cursor:pointer">
      <span class="row"><i class="dot" style="background:${mu.color}"></i><h3>${mu.name}</h3></span>
      <span class="muted small">${tx('{n} ejercicios · máx {k} kg', { n: list.length, k: fmtNum(list[0].kg) })}</span></summary>
      <div style="margin-top:6px">${list.map((x) => `<button class="pr-row" style="width:100%;text-align:left" data-act="exHistory" data-ex="${esc(x.id)}">
        <div class="grow"><div style="font-weight:500">${esc(x.name)}</div><div class="faint small">${x.n === 1 ? tx('1 sesión') : tx('{n} sesiones', { n: x.n })}</div></div><b>${fmtNum(x.kg)} kg</b></button>`).join('')}</div></details>`;
  }).join('') : `<div class="card empty">${tx('Tus pesos máximos aparecen acá a medida que entrenás.')}</div>`}

  <h2>${tx('Recomendaciones')}</h2>
  ${recs.map(recHtml).join('') || `<div class="card muted">${tx('Todo en orden.')}</div>`}
  <button class="btn ghost block" style="margin-top:10px" data-act="claude">${icon('spark')} ${tx('Copiar resumen para Claude')}</button>
  <p class="faint small" style="text-align:center;margin:8px 0 0">${tx('Pegalo en Claude para un análisis más profundo de tus últimas 2 semanas.')}</p>
  `;
}

/* ---------- Plan ---------- */
function vPlan() {
  const t = UI.planTab;
  const tabs = `<div class="tabs">${[['rutina', tx('Rutina')], ['ejercicios', tx('Ejercicios')], ['comidas', tx('Comidas')], ['guia', tx('Guía')]].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="planTab" data-v="${k}">${l}</button>`).join('')}</div>`;
  const body = t === 'rutina' ? planRutina() : t === 'ejercicios' ? libraryHtml('browse') : t === 'comidas' ? planComidas() : planGuia();
  return `<div class="head"><div><div class="eyebrow">${esc(OBJ().name)}</div><h1>${tx('Plan')}</h1></div>
    <button class="icon-btn" data-act="shareProgram" aria-label="${tx('Compartir')}">${icon('share')}</button></div>${tabs}${body}`;
}

function planRutina() {
  const pr = S.program;
  const week = weekPlan();
  const today = todayKey();
  const todayG = plannedFor(today);
  const status = (id) => {
    const done = week.find((d) => d.done.includes(id));
    if (done) return tx('Hecho ✓ · {d}', { d: dayName(parseKey(done.date).getDay()).toLowerCase() });
    const pl = week.find((d) => d.planned === id);
    return pl ? tx('Esta semana: {w}', { w: whenLabel(pl.date) }) : tx('Próxima semana');
  };
  const weekRows = week.map((d) => {
    const day = progDay(d.done[0] || d.planned);
    const moved = !d.done.length && d.planned && baseDayFor(d.date) !== d.planned;
    return `<li class="row between" style="${d.date === today ? 'font-weight:600' : ''}">
      <span class="row"><span style="width:84px" class="${d.date < today ? 'faint' : ''}">${d.date === today ? tx('Hoy') : dayName(parseKey(d.date).getDay())}</span>
        ${day ? `<i class="dot" style="background:${day.color}"></i><span>${d.done.map((x) => esc(dName(progDay(x)))).join(' + ') || esc(dName(day))}</span>` : `<span class="faint">${d.cardio ? tx('Cardio') : d.other ? tx('Otro entreno') : tx('Descanso')}</span>`}</span>
      <span class="small ${d.done.length ? '' : 'muted'}" style="${d.done.length ? 'color:var(--good)' : ''}">${d.done.length ? tx('hecho ✓') : moved ? tx('reprogramado') : d.planned ? tx('planificado') : ''}</span></li>`;
  }).join('');
  return `<div class="card" style="margin-bottom:10px"><div class="card-title"><h3>${tx('Esta semana')}</h3><span class="muted small">${tx('se ajusta sola')}</span></div>
      <ul class="plan-list" style="margin-top:6px">${weekRows}</ul>
      <p class="faint small" style="margin:8px 0 0">${tx('Si un día entrenás otra cosa, lo que quedó pendiente pasa al próximo día libre.')}</p></div>
    <div class="card" style="margin-bottom:10px"><div class="eyebrow">${tx('Tu rutina')}</div><h3 style="margin-top:2px">${esc(tr(pr.name))}</h3>
      <ul class="meal-plan">${pr.notes.map((n) => `<li>${esc(tr(n))}</li>`).join('')}</ul>
      <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
        <a class="btn sm" href="#/bienvenida/rehacer">${tx('Cambiar objetivo o rutina')}</a>
        <button class="btn sm" data-act="shareProgram">${icon('share')} ${tx('Compartir')}</button></div></div>` +
    pr.days.map((day) => `<details class="card" ${todayG === day.id ? 'open' : ''}>
      <summary class="row between" style="list-style:none;cursor:pointer"><div><div class="day-tag" style="color:${day.color}">${status(day.id)}</div><h3>${esc(dName(day))}</h3></div>
        <span class="muted small">${tx('{n} ejercicios', { n: day.blocks.flat().length })}</span></summary>
      <ul class="plan-list" style="margin-top:8px">${day.blocks.map((b, i) => `<li><div class="combo">${i + 1}${b.length === 2 ? ` · ${tx('Superserie')}` : b.length > 2 ? ` · ${tx('Circuito')}` : ''}</div>${b.map((e) => `<div class="row" style="margin-top:6px;align-items:flex-start">
        <div class="grow"><div style="font-weight:500">${esc(exName(e))}</div><div class="muted small">${e.sets} × ${esc(tr(e.t))}${e.note ? ` — ${esc(tr(e.note))}` : ''}</div></div>${infoBtn(e.ex, exName(e))}</div>`).join('')}</li>`).join('')}</ul>
      <div class="row" style="gap:8px;margin-top:12px"><a class="btn sm" href="#/editar/${day.id}">${icon('edit')} ${tx('Editar')}</a>
        <button class="btn sm primary" data-act="start" data-group="${day.id}" data-date="${today}">${tx('Empezar hoy')}</button></div></details>`).join('') +
    `<button class="btn ghost block" style="margin-top:10px" data-act="addDay">${icon('plus')} ${tx('Agregar un día')}</button>`;
}

function planComidas() {
  const plan = NUTRITION[objective()].plan;
  const varies = plan[1] !== plan[2];
  const dayCards = varies ? [1, 2, 3, 4, 5, 6] : [1];
  return targetsCard() + dayCards.map((wd) => {
    const pl = plan[wd];
    const title = !varies ? tx('Guía diaria') : wd === 6 ? tx('Fin de semana') : dayName(wd);
    const open = !varies || new Date().getDay() === wd || (wd === 6 && new Date().getDay() === 0);
    return `<details class="card" ${open ? 'open' : ''}>
      <summary class="row between" style="list-style:none;cursor:pointer"><h3>${title}</h3><span class="muted small">${MEALS.map((m) => pl[m.key].title.split(' ')[0]).join(' · ')}</span></summary>
      <ul class="plan-list" style="margin-top:8px">${MEALS.map((m) => `<li><div class="combo">${m.name}</div><div style="font-weight:500">${esc(pl[m.key].title)}</div><div class="muted small">${pl[m.key].items.map(esc).join(' · ')}</div>${pl[m.key].tip ? `<div class="tip">${esc(pl[m.key].tip)}</div>` : ''}</li>`).join('')}</ul></details>`;
  }).join('') + `<div class="card"><h3>${esc(RECIPE.title)}</h3><ul class="meal-plan">${RECIPE.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    <ol class="muted small" style="padding-left:18px;margin:10px 0 0">${RECIPE.steps.map((s) => `<li style="padding:2px 0">${esc(s)}</li>`).join('')}</ol></div>`;
}

function planGuia() {
  return `<div class="card"><div class="eyebrow">${tx('Objetivo')}</div><h3 style="margin-top:2px">${esc(OBJ().name)}</h3><p class="muted small" style="margin:6px 0 0">${esc(OBJ().tip)}</p></div>
    <div class="card"><h3>${tx('Reglas de alimentación')}</h3><ul class="plan-list" style="margin-top:6px">${NUTRITION[objective()].rules.map((r) => `<li class="small">${esc(r)}</li>`).join('')}</ul></div>
    <div class="card"><h3>${tx('El plato saludable')}</h3><ul class="plan-list" style="margin-top:6px">${PLATE.map(([a, b]) => `<li class="small"><b style="color:var(--accent)">${a}</b> <span class="muted">${esc(b)}</span></li>`).join('')}</ul></div>
    <div class="card"><p style="margin:0;font-style:italic" class="muted">${tx('“El cuerpo cambia cuando los hábitos se repiten, no cuando se fuerzan.”')}</p></div>
    <p class="faint small" style="text-align:center;margin-top:16px">${tx('Las rutinas y guías son orientativas y no reemplazan la consulta con un médico, nutricionista o entrenador. Si tenés alguna condición de salud, consultá antes de empezar.')}</p>`;
}

/* ---------- Biblioteca de ejercicios ---------- */
function libraryHtml(mode) {
  const f = UI.lib;
  const eq = placeEq();
  const q = f.q.trim().toLowerCase();
  const list = CATALOG_LIST.filter((e) => (!f.m || e.m === f.m) && (f.all || mode === 'browse' || eq.includes(e.eq)) && (!q || e.name.toLowerCase().includes(q)));
  const chips = [['', tx('Todos')], ...Object.entries(MUSCLES).map(([k, v]) => [k, v.name])]
    .map(([k, l]) => `<button class="${f.m === k ? 'on' : ''}" data-act="libFilter" data-m="${k}">${l}</button>`).join('');
  return `<label class="field" style="margin-top:0"><input data-bind="libSearch" value="${esc(f.q)}" placeholder="${tx('Buscar ejercicio')}" autocomplete="off"></label>
    <div class="chips scroll-x" style="margin-top:10px">${chips}</div>
    ${mode !== 'browse' ? `<button class="toggle-row" style="width:100%" data-act="libAll"><span class="small muted">${tx('Mostrar también los que necesitan otro equipamiento')}</span><span class="switch ${f.all ? 'on' : ''}"></span></button>` : ''}
    <div class="card" style="padding:4px 16px;margin-top:10px">${list.map((e) => `<div class="lib-row">
      <button class="grow" style="text-align:left" data-act="${mode === 'browse' ? 'info' : 'libPick'}" data-ex="${e.id}">
        <div style="font-weight:500">${esc(e.name)}</div><div class="faint small">${MUSCLES[e.m].name} · ${EQUIP[e.eq]}</div></button>
      ${mode === 'browse' ? icon('next') : infoBtn(e.id, e.name)}</div>`).join('') || `<div class="empty">${tx('Sin resultados')}</div>`}</div>
    ${mode !== 'browse' ? `<div class="row" style="gap:8px;margin-top:10px"><input class="note-input" style="margin:0" id="customEx" placeholder="${tx('O escribí uno nuevo')}"><button class="btn sm primary" data-act="libCustom">${tx('Agregar')}</button></div>` : ''}`;
}

/* ---------- Editor de un día de la rutina ---------- */
// Representación plana para editar: cada ejercicio sabe si va "combinado" con el anterior
const flatDay = (day) => day.blocks.flatMap((b) => b.map((e, i) => ({ ...e, join: i > 0 })));
function unflat(items) {
  const blocks = [];
  for (const it of items) { const { join, ...e } = it; if (join && blocks.length) blocks.at(-1).push(e); else blocks.push([e]); }
  return blocks;
}

function vEditar(dayId) {
  const day = progDay(dayId);
  if (!day) return `<div class="empty">${tx('Día no encontrado.')} <a class="link" href="#/plan">${tx('Volver')}</a></div>`;
  const items = flatDay(day);
  return `<div class="head"><a class="icon-btn" href="#/plan" aria-label="${tx('Volver')}">${icon('back')}</a>
    <div class="grow"><div class="eyebrow">${tx('Editar día')}</div><h1 style="font-size:26px;color:${day.color}">${esc(dName(day))}</h1></div></div>
  <label class="field" style="margin-top:0"><span>${tx('Nombre del día')}</span><input data-bind="dayName" data-day="${dayId}" value="${esc(dName(day))}"></label>
  <div class="card" style="margin-top:12px;padding:6px 14px">${items.map((e, i) => `<div class="edit-row ${e.join ? 'joined' : ''}">
      <div class="row" style="align-items:flex-start"><div class="grow"><div style="font-weight:500">${e.join ? '<span class="combo" style="display:inline">+ </span>' : ''}${esc(exName(e))}</div></div>
        ${infoBtn(e.ex, exName(e))}<button class="icon-btn" style="width:32px;height:32px;background:var(--surface-2)" data-act="editMenu" data-day="${dayId}" data-i="${i}" aria-label="${tx('Opciones')}">${icon('more')}</button></div>
      <div class="row" style="gap:8px;margin-top:8px">
        <label class="mini"><span>${tx('Series')}</span><input inputmode="numeric" data-bind="editSets" data-day="${dayId}" data-i="${i}" value="${e.sets}"></label>
        <label class="mini grow"><span>${tx('Reps / objetivo')}</span><input data-bind="editTarget" data-day="${dayId}" data-i="${i}" value="${esc(tr(e.t))}" placeholder="${tx('8–12, 25·20·15·10, fallo, 30 s')}"></label>
      </div></div>`).join('') || `<div class="empty">${tx('Sin ejercicios')}</div>`}</div>
  <button class="btn ghost block" style="margin-top:10px" data-act="libSheet" data-mode="add" data-day="${dayId}">${icon('plus')} ${tx('Agregar ejercicio')}</button>
  ${S.program.days.length > 1 ? `<button class="btn ghost block danger" style="margin-top:10px" data-act="deleteDay" data-day="${dayId}">${tx('Eliminar este día')}</button>` : ''}
  <p class="faint small" style="margin-top:12px">${tx('Los cambios se guardan solos. Los entrenos que ya hiciste no se modifican.')}</p>`;
}

/* ---------- Bienvenida / configuración inicial ---------- */
const STEPS = ['inicio', 'perfil', 'objetivo', 'entreno', 'resumen'];
function obInit(rehacer) {
  const p = S.profile, pr = S.program;
  UI.ob = {
    step: rehacer ? 2 : 0, rehacer: !!rehacer,
    d: {
      name: p.name, sex: p.sex, age: p.age, height: p.height, startWeight: p.startWeight || currentWeight() || '', goalWeight: p.goalWeight,
      activity: p.activity || 'ligero', objective: pr?.objective || '', place: pr?.place || 'gym', level: pr?.level || 'principiante',
      days: pr?.days.length || 3, trainDays: pr ? trainDays() : [1, 3, 5], template: 'auto',
    },
  };
}
function obProgram() {
  const d = UI.ob.d;
  if (UI.pending) return { ...clone(UI.pending), objective: d.objective || UI.pending.objective };
  if (d.template === 'clasica') return classicProgram(d.objective);
  return generateProgram({ objective: d.objective, place: d.place, level: d.level, days: d.days });
}

function vBienvenida(arg) {
  if (!UI.ob || (arg === 'rehacer' && !UI.ob.rehacer)) obInit(arg === 'rehacer');
  const { step, d } = UI.ob;
  const opt = (field, value, title, desc) => `<button class="opt ${d[field] === value ? 'on' : ''}" data-act="obSet" data-f="${field}" data-v="${value}"><b>${title}</b>${desc ? `<span>${desc}</span>` : ''}</button>`;
  const chip = (field, value, label) => `<button class="${String(d[field]) === String(value) ? 'on' : ''}" data-act="obSet" data-f="${field}" data-v="${value}">${label}</button>`;
  const input = (field, label, mode = 'decimal', ph = '') => `<label class="field"><span>${label}</span><input inputmode="${mode}" data-bind="ob" data-f="${field}" value="${esc(d[field])}" placeholder="${ph}"></label>`;
  const dots = `<div class="ob-dots">${STEPS.slice(1).map((_, i) => `<i class="${i + 1 <= step ? 'on' : ''}"></i>`).join('')}</div>`;
  const nav = (nextLabel) => `<div class="sticky-actions"><div>
    ${step > (UI.ob.rehacer ? 2 : 0) ? `<button class="btn" data-act="obBack">${tx('Atrás')}</button>` : UI.ob.rehacer ? `<a class="btn" href="#/plan">${tx('Cancelar')}</a>` : ''}
    <button class="btn primary grow" data-act="obNext">${nextLabel}</button></div></div>`;
  let body = '';

  if (step === 0) {
    return `<div class="ob-hero"><img class="logo" src="icons/icon-192.png" alt="">
      <h1 style="font-size:36px;margin-top:20px">Forma</h1>
      <div class="chips" style="justify-content:center;margin-top:14px">${Object.entries(LANGS).map(([k, l]) => `<button class="${LANG === k ? 'on' : ''}" data-act="setLang" data-v="${k}">${l}</button>`).join('')}</div>
      <p class="muted" style="font-size:17px;margin:16px 0 0">${tx('Tu entrenamiento y tu alimentación, en un solo lugar. Armamos una rutina según tu objetivo y la app la va acomodando a tu semana.')}</p>
      ${UI.pending ? `<div class="card" style="margin-top:20px;text-align:left"><div class="eyebrow">${tx('Te compartieron una rutina')}</div><h3 style="margin-top:2px">${esc(tr(UI.pending.name))}</h3><p class="muted small" style="margin:6px 0 0">${tx('Primero completá tu perfil y después la usamos.')}</p></div>` : ''}
      <ul class="meal-plan" style="text-align:left;margin-top:20px">
        <li>${tx('Todo se guarda solo en tu teléfono: sin cuentas, sin nubes.')}</li>
        <li>${tx('Rutinas para gimnasio o para entrenar en casa.')}</li>
        <li>${tx('Cada ejercicio tiene una imagen de cómo se hace.')}</li></ul></div>
      <div class="sticky-actions"><div><button class="btn" data-act="import">${tx('Tengo un respaldo')}</button><button class="btn primary grow" data-act="obNext">${tx('Empezar')}</button></div></div>
      <input type="file" id="importFile" accept="application/json,.json" hidden>`;
  }
  if (step === 1) {
    body = `<h1>${tx('Sobre vos')}</h1><p class="muted">${tx('Lo uso para calcular calorías y proteína. Queda solo en tu teléfono.')}</p>
      <label class="field"><span>${tx('Nombre')}</span><input data-bind="ob" data-f="name" value="${esc(d.name)}" placeholder="${tx('Cómo te llamo')}" autocomplete="off"></label>
      <div class="field"><span>${tx('Sexo biológico (para el cálculo de calorías)')}</span><div class="chips">${chip('sex', 'm', tx('Hombre'))}${chip('sex', 'f', tx('Mujer'))}</div></div>
      <div class="row" style="gap:10px">${input('age', tx('Edad'), 'numeric', '30')}${input('height', tx('Altura (cm)'), 'numeric', '170')}</div>
      <div class="row" style="gap:10px">${input('startWeight', tx('Peso (kg)'), 'decimal', '75')}${input('goalWeight', tx('Peso objetivo (opcional)'), 'decimal', '')}</div>
      <div class="field"><span>${tx('Actividad fuera del entrenamiento')}</span></div>
      <div class="opts">${Object.entries(ACTIVITY).map(([k, a]) => opt('activity', k, a.name, a.desc)).join('')}</div>`;
  } else if (step === 2) {
    body = `<h1>${tx('¿Cuál es tu objetivo?')}</h1><p class="muted">${tx('Define la rutina, las repeticiones y la guía de alimentación.')}</p>
      <div class="opts">${Object.entries(OBJECTIVES).map(([k, o]) => opt('objective', k, o.name, o.desc)).join('')}</div>`;
  } else if (step === 3) {
    const n = UI.pending ? UI.pending.days.length : d.days;
    body = `<h1>${tx('Tu entrenamiento')}</h1>
      ${UI.pending ? `<p class="muted">${tx('Vas a usar la rutina compartida ({n} días). Elegí qué días entrenás.', { n })}</p>` : `
      <div class="field"><span>${tx('¿Dónde entrenás?')}</span></div>
      <div class="opts">${Object.entries(PLACES).map(([k, p]) => opt('place', k, p.name, p.desc)).join('')}</div>
      <div class="field"><span>${tx('Nivel')}</span><div class="chips">${Object.entries(LEVELS).map(([k, l]) => chip('level', k, l.name)).join('')}</div>
        <p class="faint small" style="margin:6px 0 0">${LEVELS[d.level].desc}</p></div>
      <div class="field"><span>${tx('Días por semana')}</span><div class="chips">${[2, 3, 4, 5, 6].map((x) => chip('days', x, tx('{n} días', { n: x }))).join('')}</div></div>`}
      <div class="field"><span>${tx('¿Qué días? (elegí {n})', { n })}</span><div class="chips">${WEEK_ORDER.map((wd) => `<button class="${d.trainDays.includes(wd) ? 'on' : ''}" data-act="obDay" data-wd="${wd}">${dayAbbr(wd)}</button>`).join('')}</div>
        <p class="faint small" style="margin:6px 0 0">${tx('Si un día no podés, la app corre el entreno al próximo día libre.')}</p></div>`;
  } else {
    const pr = obProgram();
    const t = calcTargets({ ...d, weight: d.startWeight }, d.objective, pr.days.length);
    const sortedTd = d.trainDays.slice().sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
    body = `<h1>${tx('Tu plan')}</h1><p class="muted">${esc(OBJECTIVES[d.objective].tip)}</p>
      ${!UI.pending && d.place === 'gym' && d.days === 5 ? `<div class="chips" style="margin:14px 0 0">${chip('template', 'auto', tx('Rutina sugerida'))}${chip('template', 'clasica', tx('Clásica por grupo muscular'))}</div>` : ''}
      <div class="card" style="margin-top:14px"><div class="eyebrow">${tx('Rutina')}</div><h3 style="margin-top:2px">${esc(tr(pr.name))}</h3>
        <ul class="plan-list" style="margin-top:6px">${pr.days.map((day, i) => `<li><div class="row"><i class="dot" style="background:${day.color}"></i><b>${esc(dName(day))}</b><span class="faint small" style="margin-left:auto">${sortedTd[i] !== undefined ? dayName(sortedTd[i]) : ''}</span></div>
          <div class="muted small" style="margin-top:4px">${day.blocks.flat().map((e) => esc(exName(e))).join(' · ')}</div></li>`).join('')}</ul>
        <p class="faint small" style="margin:8px 0 0">${tx('Después podés cambiar ejercicios, series y repeticiones.')}</p></div>
      ${t ? `<div class="card"><div class="eyebrow">${tx('Alimentación')}</div>${macrosHtml(t)}</div>` : ''}
      <p class="faint small">${tx('Las rutinas y guías son orientativas y no reemplazan a un profesional de la salud. Si tenés alguna lesión o condición médica, consultá antes de empezar.')}</p>`;
  }
  return `<div class="ob">${dots}${body}</div>${nav(step === 4 ? (UI.ob.rehacer ? tx('Guardar cambios') : tx('Empezar')) : tx('Siguiente'))}`;
}

function obValidate() {
  const { step, d } = UI.ob;
  if (step === 1) {
    if (!d.sex) return tx('Elegí una opción en sexo');
    if (!(num(d.age) >= 12 && num(d.age) <= 100)) return tx('Ingresá tu edad');
    if (!(num(d.height) >= 120 && num(d.height) <= 230)) return tx('Ingresá tu altura en cm');
    if (!(num(d.startWeight) >= 30 && num(d.startWeight) <= 300)) return tx('Ingresá tu peso en kg');
  }
  if (step === 2 && !d.objective) return tx('Elegí un objetivo');
  if (step === 3) {
    const n = UI.pending ? UI.pending.days.length : d.days;
    if (d.trainDays.length !== n) return tx('Elegí {n} días de la semana', { n });
  }
  return null;
}

function obFinish() {
  const d = UI.ob.d;
  const program = obProgram();
  S.profile = {
    ...S.profile, name: d.name.trim(), sex: d.sex, age: num(d.age), height: num(d.height),
    startWeight: num(d.startWeight), goalWeight: num(d.goalWeight) || '', activity: d.activity,
    trainDays: d.trainDays, rest: program.rest || 90, onboarded: true,
  };
  if (!S.weights.length && num(d.startWeight)) S.weights.push({ date: todayKey(), kg: num(d.startWeight) });
  S.program = program;
  const was = UI.ob.rehacer;
  UI.ob = null; UI.pending = null;
  save(true);
  location.hash = was ? '#/plan' : '#/hoy';
  render(); window.scrollTo(0, 0);
  toast(was ? tx('Rutina actualizada') : tx('¡Listo! Tu plan está armado'));
}

/* ---------- Rutina compartida ---------- */
const b64e = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function encodeProgram(p) {
  const d = p.days.map((day) => [day.name, day.color, day.blocks.map((b) => b.map((e) => [e.ex, e.sets, e.t, CATALOG[e.ex] ? 0 : e.name || '', e.note || '']))]);
  return b64e(JSON.stringify([1, p.name, p.objective, p.place, p.level, p.rest, p.notes, d]));
}
function decodeProgram(str) {
  const [v, name, objective, place, level, rest, notes, d] = JSON.parse(b64d(str));
  if (v !== 1 || !Array.isArray(d)) throw new Error('formato');
  return {
    name, objective: OBJECTIVES[objective] ? objective : 'salud', place: PLACES[place] ? place : 'gym', level, rest, notes: notes || [],
    days: d.map(([dn, color, blocks], i) => ({
      id: `d${i + 1}`, name: dn, color,
      blocks: blocks.map((b) => b.map(([ex, sets, t, cname, note]) => ({ ex, sets, t, r: parseTarget(t, sets), ...(cname ? { name: cname } : {}), ...(note ? { note } : {}) }))),
    })),
  };
}
function vCompartida(data) {
  let pr;
  try { pr = decodeProgram(data); } catch { return `<div class="empty">${tx('El link de la rutina no es válido.')} <a class="link" href="#/hoy">${tx('Ir al inicio')}</a></div>`; }
  UI.shared = pr;
  return `<div class="head"><div><div class="eyebrow">${tx('Te compartieron una rutina')}</div><h1 style="font-size:26px">${esc(tr(pr.name))}</h1></div></div>
    ${pr.days.map((day) => `<div class="card"><div class="row"><i class="dot" style="background:${day.color}"></i><h3>${esc(dName(day))}</h3></div>
      <ul class="plan-list" style="margin-top:6px">${day.blocks.flat().map((e) => `<li class="row"><div class="grow"><div>${esc(exName(e))}</div><div class="muted small">${e.sets} × ${esc(tr(e.t))}</div></div>${infoBtn(e.ex, exName(e))}</li>`).join('')}</ul></div>`).join('')}
    <div class="sticky-actions"><div><a class="btn" href="#/hoy">${tx('Cancelar')}</a><button class="btn primary grow" data-act="useShared">${tx('Usar esta rutina')}</button></div></div>`;
}

function vAjustes() {
  const p = S.profile;
  const f = (key, label, mode = 'decimal', ph = '') => `<label class="field"><span>${label}</span><input inputmode="${mode}" data-bind="profile" data-f="${key}" value="${esc(p[key])}" placeholder="${ph}"></label>`;
  const sel = (key, label, opts) => `<label class="field"><span>${label}</span><select data-bind="profile" data-f="${key}">${opts.map(([v, l]) => `<option value="${v}" ${String(p[key]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const td = S.profile.trainDays || [];
  const n = S.program?.days.length || 0;
  return `<div class="head"><a class="icon-btn" href="#/hoy" aria-label="${tx('Volver')}">${icon('back')}</a><div class="grow"><h1>${tx('Ajustes')}</h1></div></div>
  <div class="card">
    <div class="field" style="margin-top:0"><span>${tx('Idioma')}</span><div class="chips">${Object.entries(LANGS).map(([k, l]) => `<button class="${LANG === k ? 'on' : ''}" data-act="setLang" data-v="${k}">${l}</button>`).join('')}</div></div>
    <label class="field"><span>${tx('Nombre')}</span><input data-bind="profile" data-f="name" value="${esc(p.name)}" placeholder="${tx('Tu nombre')}" autocomplete="off"></label>
    <div class="row" style="gap:10px">${sel('sex', tx('Sexo'), [['', '—'], ['m', tx('Hombre')], ['f', tx('Mujer')]])}${f('age', tx('Edad'), 'numeric')}</div>
    <div class="row" style="gap:10px">${f('height', tx('Altura (cm)'), 'numeric')}${f('waterGoal', tx('Agua (vasos)'), 'numeric')}</div>
    <div class="row" style="gap:10px">${f('startWeight', tx('Peso inicial (kg)'))}${f('goalWeight', tx('Peso objetivo (kg)'))}</div>
    ${sel('activity', tx('Actividad diaria'), Object.entries(ACTIVITY).map(([k, a]) => [k, a.name]))}
    ${f('rest', tx('Descanso entre series (segundos)'), 'numeric')}
  </div>
  <h2>${tx('Entrenamiento')}</h2>
  <div class="card">
    <div class="eyebrow">${tx('Objetivo y rutina')}</div><h3 style="margin-top:2px">${esc(tr(S.program?.name || '—'))}</h3>
    <div class="field"><span>${tx('Días que entrenás ({n})', { n })}</span><div class="chips">${WEEK_ORDER.map((wd) => `<button class="${td.includes(wd) ? 'on' : ''}" data-act="toggleTrainDay" data-wd="${wd}">${dayAbbr(wd)}</button>`).join('')}</div>
      ${td.length !== n ? `<p class="small" style="color:var(--warn);margin:6px 0 0">${tx('Elegí {n} días. Mientras tanto uso: {d}.', { n, d: trainDays().map(dayAbbr).join(', ') })}</p>` : ''}</div>
    <a class="btn block" style="margin-top:14px" href="#/bienvenida/rehacer">${tx('Cambiar objetivo o rutina')}</a>
  </div>
  <h2>${tx('Tus datos')}</h2>
  <div class="card stack">
    <p class="muted small" style="margin:0">${tx('Todo se guarda solo en este teléfono. Exportá un respaldo de vez en cuando por si cambiás de celular o borrás Safari.')}</p>
    <button class="btn block" data-act="export">${tx('Exportar respaldo')}</button>
    <button class="btn block" data-act="import">${tx('Importar respaldo')}</button>
    <button class="btn block" data-act="claude">${icon('spark')} ${tx('Copiar resumen para Claude')}</button>
    <input type="file" id="importFile" accept="application/json,.json" hidden>
  </div>
  <h2>${tx('Zona peligrosa')}</h2>
  <button class="btn ghost block danger" data-act="reset">${tx('Borrar todos los datos')}</button>
  <p class="faint small" style="text-align:center;margin-top:24px">${tx('Forma · tu entrenamiento y tu plan, sin cuentas ni nubes.')}<br>${tx('Imágenes de ejercicios: Free Exercise DB (dominio público).')}</p>`;
}

/* ================= Sheets / timer / toast ================= */
function openSheet(html) {
  $('#sheet-root').innerHTML = `<div class="sheet-bg" data-act="closeSheet"></div><div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
}
const closeSheet = () => { $('#sheet-root').innerHTML = ''; UI.pick = null; };

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200);
}

let timerEnd = 0, timerTick, timerMode = '';
function startTimer(sec = S.profile.rest) { timerEnd = Date.now() + (num(sec) || 90) * 1000; updateTimer(); }
function updateTimer() {
  const el = $('#timer');
  clearTimeout(timerTick);
  if (!timerEnd) { el.hidden = true; timerMode = ''; return; }
  const left = Math.ceil((timerEnd - Date.now()) / 1000);
  if (left <= -5) { timerEnd = 0; el.hidden = true; timerMode = ''; return; }
  el.hidden = false;
  const mode = left > 0 ? 'run' : 'done';
  if (mode !== timerMode) {
    timerMode = mode;
    el.className = `timer ${mode === 'done' ? 'done' : ''}`;
    el.innerHTML = mode === 'run'
      ? '<span id="timerTxt"></span><button data-act="timerAdd">+15</button><button data-act="timerStop" aria-label="✕">✕</button>'
      : `<span>${tx('¡A la próxima serie!')}</span><button data-act="timerStop">OK</button>`;
    if (mode === 'done') navigator.vibrate?.([200, 100, 200]);
  }
  if (mode === 'run') $('#timerTxt').textContent = `${tx('Descanso')} ${Math.floor(left / 60)}:${pad(left % 60)}`;
  timerTick = setTimeout(updateTimer, 250);
}

// Modal "cómo se hace": imagen inicial ↔ final animada, técnica y video
function infoSheet(id, fallbackName) {
  const e = CATALOG[id];
  const name = e?.name || fallbackName || tx('Ejercicio');
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} ${tx('técnica ejercicio')}`)}`;
  openSheet(`<h3>${esc(name)}</h3>
    ${e ? `<div class="row" style="gap:6px;margin:-6px 0 12px;flex-wrap:wrap"><span class="pill"><i class="dot" style="background:${MUSCLES[e.m].color}"></i>${MUSCLES[e.m].name}</span><span class="pill">${EQUIP[e.eq]}</span></div>` : ''}
    ${e?.img ? `<div class="ex-img"><img src="img/ex/${e.img}/0.jpg" alt=""><img class="b" src="img/ex/${e.img}/1.jpg" alt=""></div>
      <p class="faint small" style="text-align:center;margin:6px 0 0">${tx('Posición inicial ↔ final')}</p>`
      : `<div class="ex-img empty-img">${icon('info', '')}<span>${tx('Sin imagen para este ejercicio')}</span></div>`}
    ${e?.cue ? `<p style="margin:14px 0 0;line-height:1.5">${esc(e.cue)}</p>` : ''}
    <a class="btn block ${e?.img ? '' : 'primary'}" style="margin-top:14px" href="${yt}" target="_blank" rel="noopener">${icon('play')} ${tx('Ver videos en YouTube')}</a>
    ${e ? `<button class="btn ghost block" style="margin-top:8px" data-act="exHistory" data-ex="${id}">${tx('Mi historial en este ejercicio')}</button>` : ''}`);
}

function exHistorySheet(id) {
  const h = (exerciseHistory()[id] || []).slice();
  const name = CATALOG[id]?.name || h.at(-1)?.name || tx('Ejercicio');
  openSheet(`<h3>${esc(name)}</h3>
    ${lineChart(h.map((x) => ({ x: x.date, y: topKg(x.sets) })).filter((x) => x.y > 0))}
    <div style="margin-top:8px">${h.reverse().map((x) => `<div class="pr-row"><span class="muted small">${fmtShort(x.date)}</span>
      <span class="small" style="text-align:right">${x.sets.map((s) => `${s.kg != null ? fmtNum(s.kg) : '–'}×${s.reps ?? '?'}`).join(' · ')}</span></div>`).join('') || `<div class="empty">${tx('Sin registros todavía')}</div>`}</div>`);
}

/* ================= Resumen para Claude ================= */
function claudeSummary() {
  const p = S.profile, today = todayKey();
  const from = addDays(today, -13);
  const t = targets();
  const sexo = p.sex === 'f' ? tx('mujer') : p.sex === 'm' ? tx('hombre') : '';
  const lines = [
    tx('Sos mi coach de entrenamiento y nutrición. Analizá mis últimos 14 días y dame recomendaciones concretas y priorizadas: qué cambiar o mejorar en la alimentación y en los ejercicios (pesos, progresión, volumen, frecuencia, descanso).'),
    '',
    tx('Perfil: {sexo}, {edad} años, altura {h} cm, peso inicial {pi} kg, actual {pa} kg, objetivo {po} kg.', { sexo, edad: p.age || '?', h: p.height || '?', pi: p.startWeight || '?', pa: currentWeight() ? fmtNum(currentWeight()) : '?', po: p.goalWeight || '?' }),
    `${tx('Objetivo')}: ${OBJ().name}. ${t ? tx('Meta estimada: {k} kcal, {p} g de proteína.', { k: t.kcal, p: t.protein }) : ''}`,
    `${tx('Rutina')}: ${tr(S.program?.name || '')}. ${S.program?.days.map(dName).join(', ')}.`,
    `${tx('Pautas de alimentación')}: ${NUTRITION[objective()].rules.slice(0, 6).join(' ')}`,
    '', `## ${tx('Entrenos')}`,
  ];
  for (const s of sortedSessions().filter((s) => s.date >= from)) {
    if (s.group === 'cardio') { lines.push(`- ${s.date} ${tx('Cardio')}: ${sessionSummary(s)}${s.note ? ` (${s.note})` : ''}`); continue; }
    const exs = s.exercises.filter((e) => e.sets.some((x) => x.done))
      .map((e) => `${sessionExName(e)} ${e.sets.filter((x) => x.done).map((x) => `${x.kg || '?'}kg×${x.reps || '?'}`).join(', ')}`);
    lines.push(`- ${s.date} ${sessionInfo(s).name}: ${exs.join('; ') || tx('sin series registradas')}${s.note ? ` (${s.note})` : ''}`);
  }
  lines.push('', `## ${tx('Alimentación y hábitos')}`);
  const lbl = { plan: tx('Según plan'), parcial: tx('Parcial'), off: tx('Me salí') };
  for (let i = 13; i >= 0; i--) {
    const k = addDays(today, -i), d = S.days[k];
    if (!d) continue;
    const meals = MEALS.map((m) => { const x = d.meals[m.key]; return x?.s || x?.note ? `${m.name}: ${lbl[x.s] || '—'}${x.note ? ` ("${x.note}")` : ''}` : null; }).filter(Boolean);
    const habits = activeHabits().map((h) => `${HABIT_INFO[h].name} ${d.habits[h] ? '✓' : '✗'}`);
    lines.push(`- ${k}: ${meals.join('; ') || '—'}. ${tx('Hábitos')}: ${habits.join(', ')}. ${tx('Agua')} ${d.water || 0}/${p.waterGoal}.`);
  }
  lines.push('', `## ${tx('Peso')}`);
  weightsSorted().slice(-10).forEach((w) => lines.push(`- ${w.date}: ${w.kg} kg`));
  return lines.join('\n');
}

async function copyText(text, msg = tx('Copiado. Pegalo en Claude')) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else toast(tx('No se pudo copiar'));
  }
}

/* ================= Acciones ================= */
const curSession = () => findSession(location.hash.split('/')[2]);
const editDay = (id) => progDay(id);
const saveFlat = (day, items) => { day.blocks = unflat(items); save(); };

const A = {
  closeSheet,
  start({ group, date }) {
    closeSheet();
    const open = S.sessions.find((s) => s.date === date && s.group === group && !s.finishedAt);
    const s = open || newSession(group, date);
    location.hash = `#/sesion/${s.id}`;
  },
  addSheet({ date }) {
    const sug = (weekStart(date) === weekStart(todayKey()) && plannedFor(date)) || baseDayFor(date);
    const opts = [...S.program.days.map((d) => [d.id, dName(d), d.color]), ['cardio', tx('Cardio'), MUSCLES.cardio.color], ['libre', tx('Libre (armalo vos)'), '#A1A1AA']];
    openSheet(`<h3>${tx('Registrar entreno')}</h3><p class="muted small" style="margin:-8px 0 14px">${fmtLong(date)}</p>
      <div class="stack">${opts.map(([k, n, c]) => `<button class="choice" style="width:100%;${k === sug ? 'box-shadow:inset 0 0 0 1.5px var(--accent)' : ''}" data-act="start" data-group="${k}" data-date="${date}">
        <i class="dot" style="background:${c};width:10px;height:10px"></i>${esc(n)}${k === sug ? `<span class="faint small" style="margin-left:auto">${tx('sugerido')}</span>` : ''}</button>`).join('')}</div>`);
  },
  calSel({ date }) { UI.calSel = date; if (date.slice(0, 7) !== UI.calMonth) UI.calMonth = date.slice(0, 7); render(); },
  calMove({ n }) {
    const [y, m] = UI.calMonth.split('-').map(Number);
    UI.calMonth = keyOf(new Date(y, m - 1 + Number(n), 1)).slice(0, 7);
    render();
  },
  toggleSet({ i, j }) {
    const s = curSession(); if (!s) return;
    const e = s.exercises[i], set = e.sets[j];
    if (!set.done) {
      const sg = suggest(e, j, exerciseHistory(s.id)[e.id]?.at(-1));
      if (set.kg === '' && sg.kg !== '') set.kg = String(sg.kg);
      if (set.reps === '' && sg.reps !== '' && !sg.fallo) set.reps = String(sg.reps);
      set.done = true;
      const block = s.exercises.filter((x) => x.block === e.block);
      if (block.at(-1) === e) startTimer();
    } else set.done = false;
    save(); render();
  },
  exMenu({ i }) {
    const s = curSession(), e = s.exercises[i], name = sessionExName(e);
    openSheet(`<h3>${esc(name)}</h3><div class="stack">
      <button class="btn block" data-act="info" data-ex="${esc(e.id)}" data-name="${esc(name)}">${tx('Cómo se hace')}</button>
      <button class="btn block" data-act="exHistory" data-ex="${esc(e.id)}">${tx('Ver historial')}</button>
      <button class="btn block" data-act="addSet" data-i="${i}">${tx('Agregar serie')}</button>
      ${e.sets.length > 1 ? `<button class="btn block" data-act="removeSet" data-i="${i}">${tx('Quitar última serie')}</button>` : ''}
      <button class="btn block danger" data-act="removeEx" data-i="${i}">${tx('Quitar ejercicio de esta sesión')}</button></div>`);
  },
  info({ ex: id, name }) { infoSheet(id, name); },
  exHistory({ ex: id }) { exHistorySheet(id); },
  addSet({ i }) { const s = curSession(); s.exercises[i].sets.push({ kg: '', reps: '', done: false }); save(); closeSheet(); render(); },
  removeSet({ i }) { const s = curSession(); s.exercises[i].sets.pop(); save(); closeSheet(); render(); },
  removeEx({ i }) { const s = curSession(); s.exercises.splice(Number(i), 1); save(); closeSheet(); render(); },

  // Biblioteca como selector (agregar a la sesión, agregar o reemplazar en el editor)
  libSheet({ mode, day, i }) {
    UI.lib = { m: '', all: false, q: '' };
    openSheet(`<h3>${mode === 'replace' ? tx('Reemplazar ejercicio') : tx('Agregar ejercicio')}</h3><div id="libBody">${libraryHtml(mode)}</div>`);
    UI.pick = { mode, day, i: i === undefined ? undefined : Number(i) };
  },
  libFilter({ m }) { UI.lib.m = m; refreshLib(); },
  libAll() { UI.lib.all = !UI.lib.all; refreshLib(); },
  libPick({ ex: id }) { pickExercise({ ex: id }); },
  libCustom() {
    const name = $('#customEx')?.value.trim();
    if (!name) { toast(tx('Escribí el nombre del ejercicio')); return; }
    const id = 'custom:' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
    pickExercise({ ex: id, name });
  },

  sessionMenu({ id }) {
    const s = findSession(id);
    openSheet(`<h3>${tx('Opciones')}</h3>
      <label class="field" style="margin-top:0"><span>${tx('Fecha')}</span><input type="date" value="${s.date}" max="${todayKey()}" data-bind="sessionDate"></label>
      <button class="btn block danger" style="margin-top:14px" data-act="deleteSession" data-id="${id}">${tx('Eliminar entreno')}</button>`);
  },
  deleteSession({ id }) {
    if (!confirm(tx('¿Eliminar este entreno? No se puede deshacer.'))) return;
    S.sessions = S.sessions.filter((s) => s.id !== id);
    save(); closeSheet(); location.hash = '#/entreno';
  },
  finish({ id }) {
    const s = findSession(id);
    if (!s.finishedAt) {
      const empty = s.group === 'cardio' ? !num(s.cardio.min) : doneSets(s) === 0;
      if (empty && !confirm(s.group === 'cardio' ? tx('No cargaste los minutos. ¿Guardar igual?') : tx('No marcaste ninguna serie. ¿Guardar igual?'))) return;
      s.finishedAt = Date.now();
      toast(s.group === 'cardio' ? tx('Cardio guardado') : tx('Entreno guardado 💪'));
    }
    timerEnd = 0;
    UI.calSel = s.date; UI.calMonth = s.date.slice(0, 7);
    save(); location.hash = '#/entreno';
  },
  cardioKind({ v }) { const s = curSession(); s.cardio.kind = v; save(); render(); },
  timerAdd() { timerEnd += 15000; updateTimer(); },
  timerStop() { timerEnd = 0; updateTimer(); },
  meal({ date, meal, v }) {
    const d = dayEdit(date);
    const m = (d.meals[meal] ||= {});
    m.s = m.s === v ? null : v;
    save(); render();
  },
  habit({ date, h }) { const d = dayEdit(date); d.habits[h] = !d.habits[h]; save(); render(); },
  water({ date, n }) { const d = dayEdit(date); n = Number(n); d.water = d.water === n ? n - 1 : n; save(); render(); },
  weightSheet() {
    openSheet(`<h3>${tx('Registrar peso')}</h3>
      <div class="row" style="gap:10px">
        <label class="field grow" style="margin-top:0"><span>${tx('Peso (kg)')}</span><input id="wKg" inputmode="decimal" placeholder="${currentWeight() ? fmtNum(currentWeight()) : '75'}"></label>
        <label class="field grow" style="margin-top:0"><span>${tx('Fecha')}</span><input id="wDate" type="date" value="${todayKey()}" max="${todayKey()}"></label>
      </div>
      <button class="btn primary block" style="margin-top:14px" data-act="saveWeight">${tx('Guardar')}</button>
      ${S.weights.length ? `<h2>${tx('Últimos')}</h2>${weightsSorted().slice(-5).reverse().map((w) => `<div class="pr-row"><span class="muted">${fmtShort(w.date)}</span><span class="row"><b>${fmtNum(w.kg)} kg</b><button class="link" style="color:var(--bad)" data-act="delWeight" data-date="${w.date}">${tx('Borrar')}</button></span></div>`).join('')}` : ''}`);
    setTimeout(() => $('#wKg')?.focus(), 250);
  },
  saveWeight() {
    const kg = num($('#wKg').value), date = $('#wDate').value || todayKey();
    if (!kg || kg < 30 || kg > 300) { toast(tx('Ingresá un peso válido')); return; }
    S.weights = S.weights.filter((w) => w.date !== date).concat({ date, kg });
    save(); closeSheet(); render(); toast(tx('Peso guardado'));
  },
  delWeight({ date }) { S.weights = S.weights.filter((w) => w.date !== date); save(); A.weightSheet(); render(); },
  planTab({ v }) { UI.planTab = v; UI.lib = { m: '', all: false, q: '' }; render(); },

  // Editor de rutina
  editMenu({ day: dayId, i }) {
    const day = editDay(dayId), items = flatDay(day), e = items[i];
    i = Number(i);
    openSheet(`<h3>${esc(exName(e))}</h3><div class="stack">
      <button class="btn block" data-act="libSheet" data-mode="replace" data-day="${dayId}" data-i="${i}">${tx('Reemplazar por otro')}</button>
      ${i > 0 ? `<button class="btn block" data-act="editJoin" data-day="${dayId}" data-i="${i}">${e.join ? tx('Separar del anterior') : tx('Combinar con el anterior (superserie)')}</button>` : ''}
      ${i > 0 ? `<button class="btn block" data-act="editMove" data-day="${dayId}" data-i="${i}" data-d="-1">${tx('Subir')}</button>` : ''}
      ${i < items.length - 1 ? `<button class="btn block" data-act="editMove" data-day="${dayId}" data-i="${i}" data-d="1">${tx('Bajar')}</button>` : ''}
      <button class="btn block danger" data-act="editRemove" data-day="${dayId}" data-i="${i}">${tx('Quitar de la rutina')}</button></div>`);
  },
  editJoin({ day: dayId, i }) { const day = editDay(dayId), items = flatDay(day); items[i].join = !items[i].join; saveFlat(day, items); closeSheet(); render(); },
  editMove({ day: dayId, i, d }) {
    const day = editDay(dayId), items = flatDay(day); i = Number(i); const j = i + Number(d);
    [items[i], items[j]] = [items[j], items[i]];
    items[0].join = false;
    saveFlat(day, items); closeSheet(); render();
  },
  editRemove({ day: dayId, i }) {
    const day = editDay(dayId), items = flatDay(day);
    items.splice(Number(i), 1);
    if (items[0]) items[0].join = false;
    saveFlat(day, items); closeSheet(); render();
  },
  addDay() {
    const n = S.program.days.length;
    if (n >= 7) { toast(tx('Máximo 7 días')); return; }
    const id = 'd' + uid();
    S.program.days.push({ id, name: `${tx('Día')} ${n + 1}`, color: DAY_COLORS[n % DAY_COLORS.length], blocks: [] });
    const free = WEEK_ORDER.find((wd) => !trainDays().includes(wd));
    S.profile.trainDays = [...trainDays(), free];
    save(); location.hash = `#/editar/${id}`;
  },
  deleteDay({ day: dayId }) {
    if (!confirm(tx('¿Eliminar este día de la rutina? Los entrenos que ya hiciste se mantienen.'))) return;
    const i = S.program.days.findIndex((d) => d.id === dayId);
    S.profile.trainDays = trainDays().filter((_, k) => k !== i);
    S.program.days.splice(i, 1);
    save(); location.hash = '#/plan';
  },
  toggleTrainDay({ wd }) {
    wd = Number(wd);
    const n = S.program.days.length;
    let td = (S.profile.trainDays || []).slice();
    if (td.includes(wd)) td = td.filter((x) => x !== wd);
    else if (td.length < n) td.push(wd);
    else { toast(tx('Tu rutina tiene {n} días: primero sacá uno', { n })); return; }
    S.profile.trainDays = td.sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
    save(); render();
  },

  // Compartir
  shareProgram() {
    const url = `${location.origin}${location.pathname}#/rutina/${encodeProgram(S.program)}`;
    const text = tx('Te paso mi rutina en Forma: {r}', { r: tr(S.program.name) });
    if (navigator.share) navigator.share({ title: 'Forma', text, url }).catch(() => {});
    else copyText(url, tx('Link copiado'));
  },
  useShared() {
    const pr = UI.shared;
    if (!pr) return;
    if (S.profile.onboarded && S.program) {
      if (!confirm(tx('Esto reemplaza tu rutina actual por la compartida. Tu historial se mantiene. ¿Continuar?'))) return;
      S.program = pr;
      const n = pr.days.length;
      if (trainDays().length !== n) S.profile.trainDays = DEFAULT_WEEKDAYS[Math.min(6, Math.max(2, n))] || WEEK_ORDER.slice(0, n);
      save(true); location.hash = '#/plan'; toast(tx('Rutina cargada'));
    } else {
      UI.pending = pr; UI.ob = null;
      location.hash = '#/bienvenida';
    }
  },

  // Idioma: se guarda aparte y se recarga la app para aplicar todos los textos
  setLang({ v }) {
    if (v === LANG) return;
    save(true);
    try { localStorage.setItem(LANG_KEY, v); } catch { /* sin storage: queda el idioma del teléfono */ }
    location.reload();
  },

  // Bienvenida
  obSet({ f, v }) {
    const d = UI.ob.d;
    d[f] = f === 'days' ? Number(v) : v;
    if (f === 'days') d.trainDays = DEFAULT_WEEKDAYS[d.days].slice();
    if (f === 'objective' && d.template === 'clasica') d.template = 'auto';
    render();
  },
  obDay({ wd }) {
    const d = UI.ob.d; wd = Number(wd);
    d.trainDays = d.trainDays.includes(wd) ? d.trainDays.filter((x) => x !== wd) : [...d.trainDays, wd];
    render();
  },
  obNext() {
    const err = obValidate();
    if (err) { toast(err); return; }
    if (UI.ob.step === 4) { obFinish(); return; }
    UI.ob.step++;
    if (UI.ob.step === 3 && UI.pending) UI.ob.d.trainDays = (DEFAULT_WEEKDAYS[Math.min(6, Math.max(2, UI.pending.days.length))] || []).slice();
    render(); window.scrollTo(0, 0);
  },
  obBack() { UI.ob.step--; render(); window.scrollTo(0, 0); },

  claude() { copyText(claudeSummary()); },
  async export() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const name = `forma-${todayKey()}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import() { $('#importFile').click(); },
  reset() {
    if (!confirm(tx('¿Borrar TODOS tus datos? Esto no se puede deshacer.'))) return;
    if (!confirm(tx('¿Seguro? Te recomiendo exportar un respaldo antes.'))) return;
    S = defaults(); UI.ob = null; save(true); location.hash = '#/bienvenida'; render(); toast(tx('Datos borrados'));
  },
};

function refreshLib() {
  const body = $('#libBody');
  if (body && UI.pick) body.innerHTML = libraryHtml(UI.pick.mode);
  else render();
}

function pickExercise(entryBase) {
  const pick = UI.pick;
  if (!pick) return;
  const obj = OBJ();
  const timed = TIMED.has(entryBase.ex);
  const sets = Math.max(2, obj.sets);
  const entry = { ...entryBase, sets, t: timed ? '30–45 s' : `${obj.reps[0]}–${obj.reps[1]}`, r: timed ? null : Array(sets).fill(obj.reps[1]) };
  if (pick.mode === 'session') {
    const s = curSession();
    const block = Math.max(-1, ...s.exercises.map((e) => e.block)) + 1;
    s.exercises.push(mkExercise(entry, block));
    save(); closeSheet(); render();
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
    return;
  }
  const day = editDay(pick.day), items = flatDay(day);
  if (pick.mode === 'replace') {
    const old = items[pick.i];
    items[pick.i] = { ...entry, sets: old.sets, t: timed ? entry.t : old.t, r: timed ? null : parseTarget(old.t, old.sets), join: old.join };
  } else items.push({ ...entry, join: false });
  saveFlat(day, items); closeSheet(); render();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t || !A[t.dataset.act]) return;
  e.preventDefault();
  e.stopPropagation();
  A[t.dataset.act]({ ...t.dataset }, t);
});

document.addEventListener('input', (e) => {
  const t = e.target, d = t.dataset;
  if (d.set) {
    const s = curSession(); if (!s) return;
    const [i, j, f] = d.set.split(':');
    s.exercises[i].sets[j][f] = t.value.trim();
    save(); return;
  }
  switch (d.bind) {
    case 'mealNote': { const day = dayEdit(d.date); (day.meals[d.meal] ||= {}).note = t.value; save(); break; }
    case 'sessionNote': { const s = curSession(); if (s) { s.note = t.value; save(); } break; }
    case 'cardio': { const s = curSession(); if (s) { s.cardio[d.f] = t.value.trim(); save(); } break; }
    case 'profile': {
      if (['name', 'sex', 'activity'].includes(d.f)) S.profile[d.f] = t.value.trim();
      else { const v = num(t.value); S.profile[d.f] = v ?? ''; }
      save();
      break;
    }
    case 'ob': UI.ob.d[d.f] = t.value; break;
    case 'libSearch': {
      UI.lib.q = t.value;
      const pos = t.selectionStart;
      refreshLib();
      const again = $('[data-bind="libSearch"]');
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
      break;
    }
    case 'sessionDate': {
      const s = curSession();
      if (s && t.value) { s.date = t.value; save(); render(); }
      break;
    }
    case 'dayName': { const day = editDay(d.day); if (day) { day.name = t.value || tx('Día'); save(); } break; }
    case 'editSets': {
      const day = editDay(d.day), items = flatDay(day), it = items[d.i];
      const n = Math.round(num(t.value));
      if (n >= 1 && n <= 10) { it.sets = n; it.r = parseTarget(it.t, n); saveFlat(day, items); }
      break;
    }
    case 'editTarget': {
      const day = editDay(d.day), items = flatDay(day), it = items[d.i];
      it.t = t.value; it.r = parseTarget(t.value, it.sets);
      saveFlat(day, items);
      break;
    }
  }
});

// Auto-alto de las notas de comidas
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('note-input')) { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }
});

// Saltar del campo kg al de reps con "siguiente" en el teclado del iPhone
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.dataset.set) return;
  e.preventDefault();
  const inputs = $$('[data-set]');
  const next = inputs[inputs.indexOf(e.target) + 1];
  if (next && e.target.dataset.set.endsWith(':kg')) next.focus(); else e.target.blur();
});

document.addEventListener('change', (e) => {
  if (e.target.id !== 'importFile' || !e.target.files[0]) return;
  e.target.files[0].text().then((txt) => {
    const d = migrate(JSON.parse(txt));
    if (!Array.isArray(d.sessions) || typeof d.days !== 'object') throw new Error('formato');
    if (!confirm(tx('Esto reemplaza los datos actuales por los del respaldo. ¿Continuar?'))) return;
    S = { ...defaults(), ...d, profile: { ...defaultProfile(), ...d.profile } };
    UI.ob = null;
    save(true); location.hash = S.profile.onboarded ? '#/hoy' : '#/bienvenida'; render(); toast(tx('Respaldo importado'));
  }).catch(() => toast(tx('El archivo no es un respaldo válido')));
  e.target.value = '';
});

/* ================= Router ================= */
const VIEWS = {
  hoy: vHoy, entreno: vEntreno, sesion: vSesion, comida: vComida, progreso: vProgreso, plan: vPlan,
  ajustes: vAjustes, editar: vEditar, bienvenida: vBienvenida, rutina: vCompartida,
};
const NO_TABBAR = new Set(['sesion', 'bienvenida', 'rutina', 'editar']);
function render() {
  const [r, ...rest] = (location.hash.slice(2) || 'hoy').split('/');
  let view = VIEWS[r] ? r : 'hoy';
  // Sin perfil armado, todo lleva a la bienvenida (salvo abrir una rutina compartida)
  if ((!S.profile.onboarded || !S.program) && view !== 'rutina') view = 'bienvenida';
  document.body.classList.toggle('in-session', NO_TABBAR.has(view));
  const tab = { sesion: 'entreno', ajustes: 'hoy', editar: 'plan' }[view] || view;
  $$('.tabbar a').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab));
  $('#view').innerHTML = VIEWS[view](rest.join('/'));
  updateTimer();
}
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

// Al volver a la app otro día, refrescar "Hoy"
let lastDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && todayKey() !== lastDay) { lastDay = todayKey(); UI.calSel = lastDay; UI.calMonth = lastDay.slice(0, 7); render(); }
});

// Etiquetas fijas del HTML (barra inferior)
$$('.tabbar a span').forEach((el) => { el.textContent = tx(el.textContent); });
document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'es';

render();
