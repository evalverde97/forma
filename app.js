'use strict';

/* ================= Utilidades ================= */
const $ = (s, el = document) => el.querySelector(s);
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
const fmtLong = (k) => cap(parseKey(k).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
const fmtShort = (k) => parseKey(k).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
const fmtNum = (n, d = 1) => Number(n).toLocaleString('es-AR', { maximumFractionDigits: d });
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const relDay = (k) => { const d = daysBetween(k, todayKey()); return d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : fmtLong(k); };

const P = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  good: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
};
const icon = (n, c = 'ic') => `<svg class="${c}" viewBox="0 0 24 24">${P[n]}</svg>`;

/* ================= Datos ================= */
const STORE_KEY = 'forma:v1';
const defaults = () => ({
  profile: { name: '', height: 169, startWeight: 95, goalWeight: 85, waterGoal: 8, rest: 90 },
  sessions: [], days: {}, weights: [], since: todayKey(),
});
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return { ...defaults(), ...d, profile: { ...defaults().profile, ...d.profile } };
    }
  } catch { /* datos corruptos o storage bloqueado: arrancamos vacío */ }
  return defaults();
}
let S = load();
let saveT;
function save(now) {
  clearTimeout(saveT);
  const write = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { toast('No se pudo guardar'); } };
  if (now) write(); else saveT = setTimeout(write, 250);
}
window.addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
navigator.storage?.persist?.().catch(() => {});

const UI = { calMonth: todayKey().slice(0, 7), calSel: todayKey(), planTab: 'rutina' };

/* ---------- Días (alimentación / hábitos) ---------- */
const dayGet = (k) => S.days[k] || { meals: {}, habits: {}, water: 0 };
const dayEdit = (k) => (S.days[k] ||= { meals: {}, habits: {}, water: 0 });
const MEAL_VAL = { plan: 1, parcial: 0.5, off: 0 };
function dayScore(k) {
  const d = S.days[k];
  if (!d) return null;
  let pts = 0, logged = 0;
  for (const m of MEALS) { const s = d.meals[m.key]?.s; if (s) { pts += MEAL_VAL[s]; logged++; } }
  const habits = HABITS.filter((h) => d.habits[h.key]).length;
  if (!logged && !habits && !d.water) return null;
  pts += habits + Math.min(1, (d.water || 0) / S.profile.waterGoal);
  return Math.round((pts / (MEALS.length + HABITS.length + 1)) * 100);
}
const isLogged = (k) => MEALS.some((m) => S.days[k]?.meals[m.key]?.s);

/* ---------- Sesiones de entreno ---------- */
const sessionsOn = (k) => S.sessions.filter((s) => s.date === k);
const findSession = (id) => S.sessions.find((s) => s.id === id);
const sortedSessions = () => [...S.sessions].sort((a, b) => a.date.localeCompare(b.date) || (a.startedAt || 0) - (b.startedAt || 0));
const isStrength = (s) => s.group !== 'cardio';
const exMeta = (e) => EXERCISES[e.id] || { name: e.name, target: '', reps: null };
const mkExercise = (e, block) => ({ id: e.id, name: e.name, block, sets: Array.from({ length: 4 }, () => ({ kg: '', reps: '', done: false })) });

function newSession(group, date) {
  const s = { id: uid(), date, group, startedAt: Date.now(), finishedAt: null, exercises: [], note: '' };
  if (group === 'cardio') s.cardio = { kind: 'Caminata', min: '', km: '' };
  else if (ROUTINE[group]) ROUTINE[group].blocks.forEach((block, b) => block.forEach((e) => s.exercises.push(mkExercise(e, b))));
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
      if (sets.length) (h[e.id] ||= []).push({ date: s.date, name: e.name, sets });
    }
  }
  return h;
}
const topKg = (sets) => Math.max(0, ...sets.map((s) => s.kg || 0));
const volume = (s) => (s.exercises || []).reduce((t, e) => t + e.sets.reduce((a, x) => a + (x.done ? (num(x.kg) || 0) * (num(x.reps) || 0) : 0), 0), 0);
const doneSets = (s) => (s.exercises || []).reduce((t, e) => t + e.sets.filter((x) => x.done).length, 0);

// Valores sugeridos para una serie: peso de la última vez y reps objetivo de la rutina.
function suggest(e, j, last) {
  const meta = exMeta(e);
  const lastSet = last?.sets[j] || last?.sets.at(-1);
  const target = meta.reps ? meta.reps[j] ?? meta.reps.at(-1) : undefined;
  return { kg: lastSet?.kg ?? '', reps: target ?? lastSet?.reps ?? '', fallo: target === null };
}

function sessionSummary(s) {
  if (s.group === 'cardio') {
    const c = s.cardio || {};
    return [c.kind, c.min && `${c.min} min`, c.km && `${fmtNum(num(c.km))} km`].filter(Boolean).join(' · ');
  }
  const exs = s.exercises.filter((e) => e.sets.some((x) => x.done)).length;
  const vol = volume(s);
  return `${exs} ejercicios · ${doneSets(s)} series${vol ? ` · ${fmtNum(vol, 0)} kg` : ''}${s.finishedAt ? '' : ' · en curso'}`;
}

/* ---------- Plan semanal adaptativo ----------
   La semana (lunes a domingo) tiene que cubrir los 5 grupos de la rutina, en su orden.
   Lo ya entrenado se descuenta y lo pendiente se reparte en los días que quedan:
   primero los hábiles y, si no alcanzan, el fin de semana. Si un día hacés pecho en
   lugar de piernas, piernas pasa al próximo día libre. */
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function weekPlan(ref = todayKey()) {
  const ws = weekStart(ref), today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(ws, i);
    const ss = sessionsOn(date);
    return {
      date,
      done: [...new Set(ss.filter((s) => ROUTINE[s.group] && doneSets(s) > 0).map((s) => s.group))],
      cardio: ss.some((s) => s.group === 'cardio'),
      planned: null,
    };
  });
  const doneAll = new Set(days.flatMap((d) => d.done));
  // La semana en que empezaste a usar la app no te reclama los días anteriores a ese primer uso.
  const pending = Object.keys(ROUTINE).filter((g) => !doneAll.has(g) && addDays(ws, ROUTINE[g].day - 1) >= S.since);
  const slots = days.filter((d) => d.date > today || (d.date === today && !d.done.length));
  const weekdays = slots.filter((d) => parseKey(d.date).getDay() % 6 !== 0);
  const weekend = slots.filter((d) => parseKey(d.date).getDay() % 6 === 0);
  // Fin de semana solo si los días hábiles no alcanzan; si ya es fin de semana, hoy mismo.
  const order = [...weekdays, ...weekend];
  pending.forEach((g, i) => { if (order[i]) order[i].planned = g; });
  return days;
}
const plannedFor = (k) => weekPlan(k).find((d) => d.date === k)?.planned || null;
const nextPlanned = (k = todayKey()) => weekPlan(k).find((d) => d.date > k && d.planned) || null;
const whenLabel = (k) => { const d = daysBetween(todayKey(), k); return d === 0 ? 'hoy' : d === 1 ? 'mañana' : DAY_NAMES[parseKey(k).getDay()].toLowerCase(); };

/* ---------- Peso ---------- */
const weightsSorted = () => [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
const currentWeight = () => weightsSorted().at(-1)?.kg ?? S.profile.startWeight;

/* ================= Recomendaciones ================= */
const MEAL_TIPS = {
  desayuno: 'Dejá preparado yogur + semillas o huevos la noche anterior, y poné la alarma 30 min después de despertarte.',
  almuerzo: 'Armá el plato: ½ verduras, ¼ proteína y ¼ carbohidrato integral. Cociná pollo o pescado para 2–3 días.',
  merienda: 'Tené huevos duros, queso magro y frutos secos a mano: proteína + grasas buenas, sin harinas.',
  cena: 'Proteína + verduras y nada de pan, arroz, papa ni fideos. Si llegás con mucha hambre, reforzá la merienda.',
};

function recommendations() {
  const out = [];
  const today = todayKey();
  const used = daysBetween(S.since, today) + 1;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const p = S.profile;

  // --- Entrenamiento: progresión por ejercicio
  const hist = exerciseHistory();
  const prog = [];
  for (const [id, h] of Object.entries(hist)) {
    if (h.length < 2) continue;
    const last = h.at(-1), prev = h.at(-2);
    const meta = EXERCISES[id];
    const name = meta?.name || last.name;
    const tLast = topKg(last.sets), tPrev = topKg(prev.sets);
    const hitAll = meta?.reps && last.sets.length >= meta.reps.length &&
      meta.reps.every((r, i) => r === null || (last.sets[i]?.reps ?? 0) >= r);
    if (hitAll && tLast > 0 && tLast >= tPrev) {
      const inc = tLast >= 20 ? 2.5 : 1;
      prog.push({ date: last.date, r: { tone: 'up', title: `Subí el peso en ${name}`, body: `Completaste todas las reps con ${fmtNum(tLast)} kg. Probá con ${fmtNum(tLast + inc)} kg la próxima vez.` } });
    } else if (h.length >= 3 && tLast > 0 && topKg(h.at(-3).sets) === tLast && tPrev === tLast) {
      prog.push({ date: last.date, r: { tone: 'warn', title: `Estancado en ${name}`, body: `Llevás 3 sesiones con ${fmtNum(tLast)} kg sin completar las reps. Revisá técnica, descanso y comida, o bajá un 10 % y volvé a subir.` } });
    }
  }
  prog.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).forEach((x) => out.push(x.r));

  // --- Grupos musculares descuidados
  const strength = S.sessions.filter((s) => isStrength(s) && doneSets(s) > 0);
  for (const g of Object.keys(ROUTINE)) {
    const lastG = strength.filter((s) => s.group === g).map((s) => s.date).sort().at(-1);
    const gap = lastG ? daysBetween(lastG, today) : null;
    if (gap !== null && gap >= 10) out.push({ tone: 'warn', title: `Hace ${gap} días que no entrenás ${GROUPS[g].name.toLowerCase()}`, body: `Tu rutina lo tiene los ${['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'][ROUTINE[g].day]}. Si te salteaste el día, sumalo el fin de semana.` });
  }

  // --- Frecuencia y movimiento
  const week = strength.filter((s) => last7.includes(s.date));
  if (S.sessions.length === 0) {
    const g = plannedFor(todayKey());
    out.push({ tone: 'up', title: 'Registrá tu primer entreno', body: `${g ? `Hoy toca ${GROUPS[g].name.toLowerCase()}. ` : ''}Anotá los pesos de cada serie: con eso la app te va a decir cuándo subir.` });
  } else if (used >= 7 && week.length < 3) {
    out.push({ tone: 'warn', title: `${week.length} entrenos en los últimos 7 días`, body: 'La rutina es de lunes a viernes. Aunque sea, apuntá a 3–4 días por semana para ver progreso.' });
  }
  const trainedDays = new Set(S.sessions.filter((s) => doneSets(s) > 0 || s.group === 'cardio').map((s) => s.date));
  let streak = 0;
  for (let k = today; trainedDays.has(k); k = addDays(k, -1)) streak++;
  if (streak >= 6) out.push({ tone: 'warn', title: `${streak} días seguidos entrenando`, body: 'Buenísimo, pero el músculo crece en el descanso. Tomate un día de descanso activo (caminata suave).' });

  const cardioDays = new Set(S.sessions.filter((s) => s.group === 'cardio' && last7.includes(s.date)).map((s) => s.date));
  const walkDays = last7.filter((k) => S.days[k]?.habits.caminata).length;
  if (used >= 5 && cardioDays.size + walkDays < 4) {
    out.push({ tone: 'warn', title: 'Moverte todos los días', body: 'El plan pide movimiento diario: caminata post-almuerzo de 20–30′, trote suave o soga. Empezá corto y sumá tiempo cada semana.' });
  }

  // --- Alimentación (últimos 7 días registrados)
  const logged = last7.filter(isLogged);
  if (logged.length >= 3) {
    const n = logged.length;
    const cenaOk = logged.filter((k) => S.days[k].habits.cena_sin_carbos).length;
    if (cenaOk < n * 0.7) out.push({ tone: 'warn', title: `Cena sin carbos: ${cenaOk} de ${n} días`, body: 'Es la parte CLAVE del plan para bajar grasa. Proteína fuerte + verduras, y nada de pan, arroz, papa ni fideos a la noche.' });
    const walk = logged.filter((k) => S.days[k].habits.caminata).length;
    if (walk < n * 0.5) out.push({ tone: 'warn', title: `Caminata post-almuerzo: ${walk} de ${n} días`, body: '20–30 minutos suaves después de almorzar ayudan a controlar el azúcar en sangre y suman a la quema de grasa.' });
    const water = logged.reduce((t, k) => t + (S.days[k].water || 0), 0) / n;
    if (water < p.waterGoal * 0.75) out.push({ tone: 'warn', title: `Tomás ${fmtNum(water)} vasos de agua por día`, body: `Tu meta es ${p.waterGoal}. Arrancá con un vaso grande al levantarte y llevá una botella al gym.` });

    const worst = MEALS.map((m) => ({ m, off: logged.filter((k) => ['off', 'parcial'].includes(S.days[k].meals[m.key]?.s)).length }))
      .sort((a, b) => b.off - a.off)[0];
    if (worst.off >= 2) out.push({ tone: 'warn', title: `${{ desayuno: 'El desayuno', almuerzo: 'El almuerzo', merienda: 'La merienda', cena: 'La cena' }[worst.m.key]} es donde más te salís`, body: MEAL_TIPS[worst.m.key] });

    const avg = logged.reduce((t, k) => t + (dayScore(k) || 0), 0) / n;
    if (avg >= 80) out.push({ tone: 'good', title: `Semana sólida: ${Math.round(avg)} % de adherencia`, body: 'Así se cambia el cuerpo: hábitos que se repiten. Seguí igual.' });
  } else if (used >= 2) {
    out.push({ tone: 'up', title: 'Registrá tus comidas', body: 'Con 3 días registrados empiezo a detectar qué comida o hábito te cuesta más.' });
  }

  // --- Peso
  const ws = weightsSorted();
  if (!ws.length) {
    out.push({ tone: 'up', title: 'Registrá tu peso', body: `El plan arranca en ${fmtNum(p.startWeight)} kg. Pesate en ayunas, una vez por semana, siempre a la misma hora.` });
  } else {
    const lastW = ws.at(-1);
    const since = daysBetween(lastW.date, today);
    if (since >= 7) out.push({ tone: 'up', title: `Hace ${since} días que no te pesás`, body: 'Pesate en ayunas, después del baño, para comparar siempre en las mismas condiciones.' });
    const ref = [...ws].reverse().find((w) => daysBetween(w.date, lastW.date) >= 12);
    if (ref) {
      const weeks = daysBetween(ref.date, lastW.date) / 7;
      const rate = (lastW.kg - ref.kg) / weeks;
      if (rate > -0.2) out.push({ tone: 'warn', title: 'El peso no está bajando', body: `En las últimas ${Math.round(weeks)} semanas: ${rate >= 0 ? '+' : ''}${fmtNum(rate, 2)} kg/sem. Achicá la porción de carbos del almuerzo, sumá 10′ de caminata y revisá los fines de semana.` });
      else if (rate < -1.2) out.push({ tone: 'warn', title: `Bajás ${fmtNum(-rate)} kg por semana`, body: 'Es rápido. Asegurate de comer proteína en todas las comidas para no perder músculo y fuerza.' });
      else out.push({ tone: 'good', title: `Bajando ${fmtNum(-rate)} kg por semana`, body: 'Ritmo ideal y sostenible (0,3–1 kg/sem). Seguí así.' });
    }
  }

  const order = { warn: 0, up: 1, good: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}

const recHtml = (r) => `<div class="card rec ${r.tone}">
  <div class="badge">${icon(r.tone === 'good' ? 'good' : r.tone === 'warn' ? 'alert' : 'up')}</div>
  <div class="grow"><h3 style="font-size:15px">${esc(r.title)}</h3><p>${esc(r.body)}</p></div></div>`;

/* ================= Componentes ================= */
function ring(pct, size = 92, stroke = 8, label = 'día') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(100, pct) / 100)}" style="transition:stroke-dashoffset .5s"/></svg>
    <div class="val"><div>${pct}<span style="font-size:13px">%</span><small>${label}</small></div></div></div>`;
}

function lineChart(pts, unit = 'kg') {
  if (pts.length < 2) return `<div class="empty small">Con 2 registros o más aparece el gráfico.</div>`;
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
  const lx = X(xs.at(-1)), ly = Y(ys.at(-1));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico en ${unit}">
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#g)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lx}" cy="${ly}" r="4" fill="var(--accent)"/>
    <text x="${L}" y="${H - 6}">${fmtShort(pts[0].x)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${fmtShort(pts.at(-1).x)}</text></svg>`;
}

function mealCard(k, m) {
  const plan = MEAL_PLAN[parseKey(k).getDay()][m.key];
  const d = dayGet(k).meals[m.key] || {};
  const seg = [['plan', 'Según plan'], ['parcial', 'Parcial'], ['off', 'Me salí']]
    .map(([v, l]) => `<button data-act="meal" data-date="${k}" data-meal="${m.key}" data-v="${v}" class="${d.s === v ? 'on' : ''}">${l}</button>`).join('');
  return `<div class="card">
    <div class="card-title"><h3>${m.name}</h3><span class="pill">${esc(plan.title)}</span></div>
    <ul class="meal-plan">${plan.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    ${plan.tip ? `<div class="tip">${esc(plan.tip)}</div>` : ''}
    <div class="seg">${seg}</div>
    <textarea class="note-input" rows="1" placeholder="¿Qué comiste? (opcional)" data-bind="mealNote" data-date="${k}" data-meal="${m.key}">${esc(d.note)}</textarea>
  </div>`;
}

function waterCard(k) {
  const w = dayGet(k).water || 0, goal = S.profile.waterGoal;
  const n = Math.max(goal, w + 1);
  const glasses = Array.from({ length: n }, (_, i) => `<button aria-label="${i + 1} vasos" class="${i < w ? 'on' : ''}" data-act="water" data-date="${k}" data-n="${i + 1}"></button>`).join('');
  return `<div class="card"><div class="card-title"><h3>Agua</h3><span class="muted small">${w} / ${goal} vasos</span></div><div class="water">${glasses}</div></div>`;
}

function habitsCard(k) {
  const h = dayGet(k).habits;
  return `<div class="card" style="padding:4px 16px">${HABITS.map((x) => `<div class="toggle-row"><span>${x.name}</span>
    <button class="switch ${h[x.key] ? 'on' : ''}" aria-label="${x.name}" data-act="habit" data-date="${k}" data-h="${x.key}"></button></div>`).join('')}</div>`;
}

// Semana actual: hecho (círculo lleno), planificado (inicial del grupo), libre (–)
function weekStrip() {
  const today = todayKey();
  return `<div class="row">${weekPlan().map((d, i) => {
    const g = d.done[0] || d.planned;
    const done = d.done.length > 0;
    return `<div style="flex:1;text-align:center">
      <div class="small faint" style="font-weight:600">${'LMXJVSD'[i]}</div>
      <div style="margin:6px auto 0;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
        background:${done ? GROUPS[g].color : 'var(--surface-2)'};color:${done ? '#0B0B0C' : g ? GROUPS[g].color : 'var(--faint)'};
        ${d.date === today && !done ? 'box-shadow:inset 0 0 0 1.5px var(--text);' : ''}">${done ? icon('check', 'ic')
          : `<span class="small" style="font-weight:700">${g ? GROUPS[g].name.slice(0, 2) : d.cardio ? '·' : '–'}</span>`}</div></div>`;
  }).join('')}</div>`;
}

/* ================= Vistas ================= */
function vHoy() {
  const k = todayKey(), wd = new Date().getDay(), p = S.profile;
  const group = plannedFor(k);
  const base = GROUP_BY_WEEKDAY[wd];
  const after = nextPlanned(k);
  const afterTxt = after ? `Después: <b style="color:var(--text)">${GROUPS[after.planned].name}</b> ${whenLabel(after.date)}` : '';
  const active = S.sessions.find((s) => !s.finishedAt);
  const doneToday = sessionsOn(k).filter((s) => s.finishedAt);
  let train;
  if (active) {
    train = `<div class="eyebrow">Sesión en curso</div><h3>${GROUPS[active.group].name}</h3>
      <a class="btn primary sm" style="margin-top:12px" href="#/sesion/${active.id}">Continuar</a>`;
  } else if (doneToday.length) {
    train = `<div class="eyebrow">Entreno de hoy</div><h3>${doneToday.map((s) => GROUPS[s.group].name).join(' + ')} ✓</h3>
      <p class="muted small" style="margin:6px 0 0">${afterTxt || esc(sessionSummary(doneToday[0]))}</p>`;
  } else if (group) {
    const baseDay = base && weekPlan(k).find((d) => d.planned === base);
    const why = group === base ? ''
      : !base ? 'Te quedó pendiente esta semana'
      : baseDay ? `Primero lo pendiente; ${GROUPS[base].name.toLowerCase()} pasa a ${whenLabel(baseDay.date)}`
      : `${GROUPS[base].name} ya lo hiciste esta semana`;
    train = `<div class="eyebrow">Hoy toca</div><h3 style="color:${GROUPS[group].color}">${GROUPS[group].name}</h3>
      ${why ? `<p class="muted small" style="margin:4px 0 0">${why}</p>` : ''}
      <div class="row" style="margin-top:12px;gap:8px">
        <button class="btn primary sm" data-act="start" data-group="${group}" data-date="${k}">Empezar</button>
        <button class="btn sm" data-act="addSheet" data-date="${k}">Otro</button></div>
      ${afterTxt ? `<p class="muted small" style="margin:10px 0 0">${afterTxt}</p>` : ''}`;
  } else {
    train = `<div class="eyebrow">${wd % 6 === 0 ? 'Fin de semana' : 'Semana completa 💪'}</div><h3>Descanso activo</h3>
      <p class="muted small" style="margin:4px 0 0">${afterTxt || 'Caminata, trote suave o soga.'}</p>
      <button class="btn sm" style="margin-top:12px" data-act="start" data-group="cardio" data-date="${k}">Registrar cardio</button>`;
  }

  const hour = new Date().getHours();
  const meals = dayGet(k).meals;
  const next = MEALS.find((m) => !meals[m.key]?.s && hour < m.time + 3) || MEALS.find((m) => !meals[m.key]?.s);

  const thisWeek = new Set(S.sessions.filter((s) => isStrength(s) && doneSets(s) > 0 && weekStart(s.date) === weekStart(k)).map((s) => s.date)).size;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(k, -i)).filter(isLogged);
  const adh = last7.length ? Math.round(last7.reduce((t, d) => t + dayScore(d), 0) / last7.length) : null;
  const ws = weightsSorted();
  const recs = recommendations();

  return `
  <div class="head">
    <div><div class="eyebrow">${fmtLong(k)}</div><h1>Hola${p.name ? `, ${esc(p.name)}` : ''}</h1></div>
    <a class="icon-btn" href="#/ajustes" aria-label="Ajustes">${icon('settings')}</a>
  </div>

  <div class="card hero">${ring(dayScore(k) ?? 0)}<div class="grow">${train}</div></div>

  <div class="stat-grid" style="margin-top:10px">
    <button class="stat" style="text-align:left" data-act="weightSheet"><b>${fmtNum(currentWeight())}</b><span>${ws.length ? 'kg actual' : 'kg · registrar'}</span></button>
    <a class="stat" href="#/entreno"><b>${thisWeek}<span style="font-size:14px;color:var(--faint)">/5</span></b><span>entrenos semana</span></a>
    <a class="stat" href="#/comida"><b>${adh ?? '–'}${adh !== null ? '<span style="font-size:14px;color:var(--faint)">%</span>' : ''}</b><span>adherencia 7d</span></a>
  </div>

  <h2>${next ? 'Próxima comida' : 'Comidas'}</h2>
  ${next ? mealCard(k, next) : `<div class="card row between"><span>Todas las comidas registradas ✓</span><a class="link" href="#/comida">Ver</a></div>`}

  <h2>Hidratación</h2>
  ${waterCard(k)}

  <h2 class="row between"><span>Recomendaciones</span>${recs.length > 3 ? '<a class="link" style="text-transform:none;letter-spacing:0" href="#/progreso">Ver todas</a>' : ''}</h2>
  ${recs.slice(0, 3).map(recHtml).join('') || '<div class="card muted">Todo en orden. Seguí registrando.</div>'}
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

  let cal = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<div class="wd">${d}</div>`).join('');
  for (let i = 0; i < cells; i++) {
    const d = new Date(y, m - 1, 1 - offset + i);
    const k = keyOf(d);
    const ss = byDate[k] || [];
    const groups = [...new Set(ss.map((s) => s.group))];
    const cls = ['d', d.getMonth() !== m - 1 && 'out', k === today && 'today', k === UI.calSel && 'sel', ss.length && 'trained'].filter(Boolean).join(' ');
    cal += `<button class="${cls}" data-act="calSel" data-date="${k}"><span>${d.getDate()}</span>
      <span class="dots">${groups.slice(0, 3).map((g) => `<i style="background:${GROUPS[g].color}"></i>`).join('')}</span></button>`;
  }
  const monthCount = S.sessions.filter((s) => s.date.startsWith(UI.calMonth) && (doneSets(s) || s.group === 'cardio')).length;
  const monthLabel = cap(first.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }));

  const sel = UI.calSel;
  const selSessions = byDate[sel] || [];
  const active = S.sessions.find((s) => !s.finishedAt);

  const strip = weekStrip();

  return `
  <div class="head"><div><div class="eyebrow">${monthCount} ${monthCount === 1 ? 'entreno' : 'entrenos'} este mes</div><h1>Entreno</h1></div>
    <button class="icon-btn" data-act="addSheet" data-date="${sel}" aria-label="Agregar entreno">${icon('plus')}</button></div>

  ${active ? `<a class="card tap row between" style="margin-bottom:10px;border:1px solid var(--accent)" href="#/sesion/${active.id}">
    <div><div class="eyebrow" style="color:var(--accent)">Sesión en curso</div><h3>${GROUPS[active.group].name}</h3></div>${icon('next')}</a>` : ''}

  <a class="card tap" style="display:block" href="#/plan">${strip}</a>

  <div class="card">
    <div class="cal-head">
      <button class="icon-btn" style="width:34px;height:34px" data-act="calMove" data-n="-1" aria-label="Mes anterior">${icon('back')}</button>
      <h3>${monthLabel}</h3>
      <button class="icon-btn" style="width:34px;height:34px" data-act="calMove" data-n="1" aria-label="Mes siguiente">${icon('next')}</button>
    </div>
    <div class="cal">${cal}</div>
    <div class="legend">${Object.entries(GROUPS).map(([, g]) => `<span><i class="dot" style="background:${g.color}"></i>${g.name}</span>`).join('')}</div>
  </div>

  <h2 style="text-transform:none;letter-spacing:0;font-size:15px;color:var(--text)">${relDay(sel)}</h2>
  ${selSessions.map((s) => `<a class="card tap session-row" href="#/sesion/${s.id}">
      <span class="bar" style="background:${GROUPS[s.group].color}"></span>
      <div class="grow"><h3>${GROUPS[s.group].name}</h3><div class="muted small">${esc(sessionSummary(s))}</div></div>${icon('next')}</a>`).join('')}
  ${selSessions.length ? '' : `<div class="card empty">Sin entrenos este día</div>`}
  <button class="btn ghost block" style="margin-top:10px" data-act="addSheet" data-date="${sel}">${icon('plus')} Registrar entreno</button>
  `;
}

function vSesion(id) {
  const s = findSession(id);
  if (!s) return `<div class="empty">Sesión no encontrada. <a class="link" href="#/entreno">Volver</a></div>`;
  const g = GROUPS[s.group];
  const head = `<div class="head">
    <a class="icon-btn" href="#/entreno" aria-label="Volver">${icon('back')}</a>
    <div class="grow"><div class="eyebrow">${relDay(s.date)}</div><h1 style="color:${g.color}">${g.name}</h1></div>
    <button class="icon-btn" data-act="sessionMenu" data-id="${s.id}" aria-label="Opciones">${icon('more')}</button></div>`;
  const finishBtn = `<div class="sticky-actions"><div><button class="btn primary block" data-act="finish" data-id="${s.id}">${s.finishedAt ? 'Listo' : 'Terminar entreno'}</button></div></div>`;

  if (s.group === 'cardio') {
    const c = s.cardio;
    return `${head}<div class="card">
      <div class="field"><span>Actividad</span><div class="chips">${CARDIO_KINDS.map((x) => `<button class="${c.kind === x ? 'on' : ''}" data-act="cardioKind" data-v="${x}">${x}</button>`).join('')}</div></div>
      <div class="row" style="gap:10px">
        <label class="field grow"><span>Minutos</span><input inputmode="numeric" data-bind="cardio" data-f="min" value="${esc(c.min)}" placeholder="30"></label>
        <label class="field grow"><span>Distancia (km)</span><input inputmode="decimal" data-bind="cardio" data-f="km" value="${esc(c.km)}" placeholder="opcional"></label>
      </div>
      <label class="field"><span>Notas</span><textarea data-bind="sessionNote" placeholder="¿Cómo te sentiste?">${esc(s.note)}</textarea></label>
    </div>${finishBtn}`;
  }

  const hist = exerciseHistory(s.id);
  const blocks = [...new Set(s.exercises.map((e) => e.block))];
  const warm = ROUTINE[s.group] ? `<details class="card" style="margin-bottom:10px"><summary class="row between" style="list-style:none;cursor:pointer">
      <h3 style="font-size:15px">Antes de empezar</h3><span class="muted small">ver</span></summary>
      <ul class="meal-plan">${ROUTINE_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>` : '';

  const blockHtml = blocks.map((b, bi) => {
    const items = s.exercises.map((e, i) => ({ e, i })).filter((x) => x.e.block === b);
    const allDone = items.every(({ e }) => e.sets.length && e.sets.every((x) => x.done));
    return `<div class="block ${allDone ? 'done' : ''}">${items.map(({ e, i }, n) => exHtml(e, i, hist[e.id]?.at(-1), items.length > 1 ? `${bi + 1}${'ABC'[n]} · ${n === 0 ? 'Combinado' : 'Combino'}` : `${bi + 1}`)).join('')}</div>`;
  }).join('');

  return `${head}${warm}${blockHtml || '<div class="card empty">Agregá ejercicios para empezar</div>'}
    <button class="btn ghost block" style="margin-top:10px" data-act="addExSheet" data-id="${s.id}">${icon('plus')} Agregar ejercicio</button>
    <label class="field" style="margin-top:16px"><span>Notas de la sesión</span><textarea data-bind="sessionNote" placeholder="Energía, molestias, sensaciones…">${esc(s.note)}</textarea></label>
    ${finishBtn}`;
}

function exHtml(e, i, last, label) {
  const meta = exMeta(e);
  const rows = e.sets.map((set, j) => {
    const sg = suggest(e, j, last);
    return `<div class="n">${j + 1}</div>
      <input inputmode="decimal" enterkeyhint="next" data-set="${i}:${j}:kg" value="${esc(set.kg)}" placeholder="${sg.kg === '' ? 'kg' : fmtNum(sg.kg)}">
      <input inputmode="numeric" enterkeyhint="done" data-set="${i}:${j}:reps" value="${esc(set.reps)}" placeholder="${sg.fallo ? 'fallo' : sg.reps || 'reps'}">
      <button class="check ${set.done ? 'on' : ''}" aria-label="Serie hecha" data-act="toggleSet" data-i="${i}" data-j="${j}">${icon('check', '')}</button>`;
  }).join('');
  const lastTxt = last ? `Última · ${fmtShort(last.date)}: ${last.sets.map((x) => `${x.kg != null ? fmtNum(x.kg) : '–'}×${x.reps ?? '?'}`).join('  ')}` : 'Primera vez: anotá el peso que uses';
  return `<div class="exercise">
    <div class="combo">${label}</div>
    <div class="ex-head"><div class="grow"><div class="ex-name">${esc(e.name)}</div>
      <div class="ex-meta">${meta.target ? `${esc(meta.target)} · ` : ''}${esc(lastTxt)}</div></div>
      <button class="icon-btn" style="width:34px;height:34px;background:var(--surface-2)" data-act="exMenu" data-i="${i}" aria-label="Opciones del ejercicio">${icon('more')}</button></div>
    ${meta.note ? `<p class="ex-note">${esc(meta.note)}</p>` : ''}
    <div class="sets"><div class="h">#</div><div class="h" style="text-align:center">kg</div><div class="h" style="text-align:center">reps</div><div></div>${rows}</div>
  </div>`;
}

function vComida(k) {
  const today = todayKey();
  if (!k || k > today) k = today;
  const score = dayScore(k);
  return `
  <div class="head"><div><div class="eyebrow">Alimentación</div><h1>Comida</h1></div>${score !== null ? ring(score, 56, 6, '') : ''}</div>
  <div class="date-nav">
    <a href="#/comida/${addDays(k, -1)}" aria-label="Día anterior">${icon('back')}</a>
    <span class="lbl">${relDay(k)}</span>
    ${k < today ? `<a href="#/comida/${addDays(k, 1)}" aria-label="Día siguiente">${icon('next')}</a>` : '<span style="width:40px"></span>'}
  </div>
  ${MEALS.map((m) => mealCard(k, m)).join('')}
  <h2>Hábitos</h2>${habitsCard(k)}
  <h2>Hidratación</h2>${waterCard(k)}`;
}

function vProgreso() {
  const today = todayKey(), p = S.profile;
  const ws = weightsSorted();
  const cur = currentWeight();
  const delta = cur - p.startWeight;
  const bmi = cur / (p.height / 100) ** 2;
  const toGoal = cur - p.goalWeight;

  // Entrenos por semana (8 semanas)
  const thisW = weekStart(today);
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisW, -7 * (7 - i)));
  const counts = weeks.map((w) => new Set(S.sessions.filter((s) => isStrength(s) && doneSets(s) > 0 && weekStart(s.date) === w).map((s) => s.date)).size);
  const maxC = Math.max(5, ...counts);

  // Adherencia por comida (14 días)
  const days14 = Array.from({ length: 14 }, (_, i) => addDays(today, -i)).filter(isLogged);
  const mealAdh = MEALS.map((m) => {
    const vals = days14.map((k) => S.days[k].meals[m.key]?.s).filter(Boolean);
    return { m, pct: vals.length ? Math.round((vals.reduce((t, v) => t + MEAL_VAL[v], 0) / vals.length) * 100) : null };
  });

  // Récords
  const hist = exerciseHistory();
  const prs = Object.entries(hist).map(([id, h]) => ({ id, name: EXERCISES[id]?.name || h.at(-1).name, group: EXERCISES[id]?.group || 'libre', kg: Math.max(...h.map((x) => topKg(x.sets))), n: h.length }))
    .filter((x) => x.kg > 0).sort((a, b) => Object.keys(GROUPS).indexOf(a.group) - Object.keys(GROUPS).indexOf(b.group) || b.kg - a.kg);

  const recs = recommendations();

  return `
  <div class="head"><div><div class="eyebrow">Tu evolución</div><h1>Progreso</h1></div></div>

  <div class="card">
    <div class="card-title"><h3>Peso</h3><button class="btn sm primary" data-act="weightSheet">${icon('plus')} Registrar</button></div>
    <div class="row" style="margin-top:12px;align-items:flex-end;gap:16px">
      <div><span style="font-size:34px;font-weight:700;letter-spacing:-.03em">${fmtNum(cur)}</span> <span class="muted">kg</span></div>
      <div class="small" style="padding-bottom:6px;color:${delta <= 0 ? 'var(--good)' : 'var(--warn)'}">${delta > 0 ? '+' : ''}${fmtNum(delta)} kg desde el inicio</div>
    </div>
    ${lineChart(ws.map((w) => ({ x: w.date, y: w.kg })))}
    <div class="divider"></div>
    <div class="row between small"><span class="muted">IMC</span><b>${fmtNum(bmi)}</b></div>
    <div class="row between small" style="margin-top:6px"><span class="muted">Objetivo ${fmtNum(p.goalWeight)} kg</span><b>${toGoal > 0 ? `faltan ${fmtNum(toGoal)} kg` : 'alcanzado 🎉'}</b></div>
  </div>

  <h2>Entrenos por semana</h2>
  <div class="card"><div class="bars">${counts.map((c, i) => `<div><i class="${c ? '' : 'zero'}" style="height:${(c / maxC) * 100}%"></i><span>${i === 7 ? 'esta' : fmtShort(weeks[i]).split(' ')[0]}</span></div>`).join('')}</div>
    <div class="muted small" style="margin-top:10px">Meta: 5 por semana (lunes a viernes)</div></div>

  <h2>Alimentación · 14 días</h2>
  <div class="card">${days14.length ? mealAdh.map(({ m, pct }) => `<div style="margin:6px 0 12px">
      <div class="row between small"><span>${m.name}</span><b>${pct ?? '–'}${pct !== null ? ' %' : ''}</b></div>
      <div style="height:6px;border-radius:3px;background:var(--surface-2);margin-top:6px"><div style="height:100%;width:${pct || 0}%;border-radius:3px;background:${pct >= 75 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)'}"></div></div></div>`).join('')
    : '<div class="empty">Registrá tus comidas para ver la adherencia.</div>'}</div>

  <h2>Récords por ejercicio</h2>
  ${prs.length ? Object.keys(GROUPS).map((g) => {
    const list = prs.filter((x) => x.group === g);
    if (!list.length) return '';
    return `<details class="card"><summary class="row between" style="list-style:none;cursor:pointer">
      <span class="row"><i class="dot" style="background:${GROUPS[g].color}"></i><h3>${GROUPS[g].name}</h3></span>
      <span class="muted small">${list.length} ejercicios · máx ${fmtNum(list[0].kg)} kg</span></summary>
      <div style="margin-top:6px">${list.map((x) => `<button class="pr-row" style="width:100%;text-align:left" data-act="exHistory" data-ex="${esc(x.id)}">
        <div class="grow"><div style="font-weight:500">${esc(x.name)}</div><div class="faint small">${x.n} ${x.n === 1 ? 'sesión' : 'sesiones'}</div></div><b>${fmtNum(x.kg)} kg</b></button>`).join('')}</div></details>`;
  }).join('') : '<div class="card empty">Tus pesos máximos aparecen acá a medida que entrenás.</div>'}

  <h2>Recomendaciones</h2>
  ${recs.map(recHtml).join('') || '<div class="card muted">Todo en orden.</div>'}
  <button class="btn ghost block" style="margin-top:10px" data-act="claude">${icon('spark')} Copiar resumen para Claude</button>
  <p class="faint small" style="text-align:center;margin:8px 0 0">Pegalo en Claude para un análisis más profundo de tus últimas 2 semanas.</p>
  `;
}

function vPlan() {
  const t = UI.planTab;
  const tabs = `<div class="tabs">${[['rutina', 'Rutina'], ['comidas', 'Comidas'], ['reglas', 'Reglas']].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="planTab" data-v="${k}">${l}</button>`).join('')}</div>`;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  let body = '';
  if (t === 'rutina') {
    const week = weekPlan();
    const today = todayKey();
    const todayG = plannedFor(today);
    const status = (g) => {
      const done = week.find((d) => d.done.includes(g));
      if (done) return `Hecho ✓ · ${dayNames[parseKey(done.date).getDay()].toLowerCase()}`;
      const pl = week.find((d) => d.planned === g);
      return pl ? `Esta semana: ${whenLabel(pl.date)}` : 'Próxima semana';
    };
    const weekRows = week.map((d) => {
      const g = d.done[0] || d.planned;
      const moved = !d.done.length && d.planned && GROUP_BY_WEEKDAY[parseKey(d.date).getDay()] !== d.planned;
      return `<li class="row between" style="${d.date === today ? 'font-weight:600' : ''}">
        <span class="row"><span style="width:84px" class="${d.date < today ? 'faint' : ''}">${d.date === today ? 'Hoy' : dayNames[parseKey(d.date).getDay()]}</span>
          ${g ? `<i class="dot" style="background:${GROUPS[g].color}"></i><span>${d.done.map((x) => GROUPS[x].name).join(' + ') || GROUPS[g].name}</span>` : `<span class="faint">${d.cardio ? 'Cardio' : 'Descanso'}</span>`}</span>
        <span class="small ${d.done.length ? '' : 'muted'}" style="${d.done.length ? 'color:var(--good)' : ''}">${d.done.length ? 'hecho ✓' : moved ? 'reprogramado' : d.planned ? 'planificado' : ''}</span></li>`;
    }).join('');
    body = `<div class="card" style="margin-bottom:10px"><div class="card-title"><h3>Esta semana</h3><span class="muted small">se ajusta sola</span></div>
        <ul class="plan-list" style="margin-top:6px">${weekRows}</ul>
        <p class="faint small" style="margin:8px 0 0">Si un día entrenás otro grupo, lo que quedó pendiente pasa al próximo día libre.</p></div>
      <div class="card" style="margin-bottom:10px"><ul class="meal-plan" style="margin:0">${ROUTINE_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` +
      Object.entries(ROUTINE).map(([g, r]) => `<details class="card" ${todayG === g ? 'open' : ''}>
        <summary class="row between" style="list-style:none;cursor:pointer"><div><div class="day-tag" style="color:${GROUPS[g].color}">${status(g)}</div><h3>${GROUPS[g].name}</h3></div><span class="muted small">base: ${dayNames[r.day].toLowerCase()}</span></summary>
        <ul class="plan-list" style="margin-top:8px">${r.blocks.map((b, i) => `<li><div class="combo">${i + 1}${b.length > 1 ? ' · Combinado' : ''}</div>${b.map((e) => `<div style="margin-top:4px"><div style="font-weight:500">${esc(e.name)}</div><div class="muted small">${esc(e.target)}${e.note ? ` — ${esc(e.note)}` : ''}</div></div>`).join('')}</li>`).join('')}</ul></details>`).join('');
  } else if (t === 'comidas') {
    body = [1, 2, 3, 4, 5, 6].map((wd) => {
      const plan = MEAL_PLAN[wd];
      return `<details class="card" ${new Date().getDay() === wd || (wd === 6 && new Date().getDay() === 0) ? 'open' : ''}>
        <summary class="row between" style="list-style:none;cursor:pointer"><h3>${wd === 6 ? 'Fin de semana' : dayNames[wd]}</h3><span class="muted small">${MEALS.map((m) => plan[m.key].title.split(' ')[0]).join(' · ')}</span></summary>
        <ul class="plan-list" style="margin-top:8px">${MEALS.map((m) => `<li><div class="combo">${m.name}</div><div style="font-weight:500">${esc(plan[m.key].title)}</div><div class="muted small">${plan[m.key].items.map(esc).join(' · ')}</div>${plan[m.key].tip ? `<div class="tip">${esc(plan[m.key].tip)}</div>` : ''}</li>`).join('')}</ul></details>`;
    }).join('') + `<div class="card"><h3>${esc(RECIPE.title)}</h3><ul class="meal-plan">${RECIPE.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      <ol class="muted small" style="padding-left:18px;margin:10px 0 0">${RECIPE.steps.map((s) => `<li style="padding:2px 0">${esc(s)}</li>`).join('')}</ol></div>`;
  } else {
    body = `<div class="card"><h3>Reglas del plan</h3><ul class="plan-list" style="margin-top:6px">${NUTRITION_RULES.map((r) => `<li class="small">${esc(r)}</li>`).join('')}</ul></div>
      <div class="card"><h3>El plato saludable</h3><ul class="plan-list" style="margin-top:6px">${PLATE.map(([a, b]) => `<li class="small"><b style="color:var(--accent)">${a}</b> <span class="muted">${esc(b)}</span></li>`).join('')}</ul></div>
      <div class="card"><p style="margin:0;font-style:italic" class="muted">“El cuerpo cambia cuando los hábitos se repiten, no cuando se fuerzan.”</p></div>`;
  }
  return `<div class="head"><div><div class="eyebrow">Tu referencia</div><h1>Plan</h1></div></div>${tabs}${body}`;
}

function vAjustes() {
  const p = S.profile;
  const f = (key, label, mode = 'decimal', ph = '') => `<label class="field"><span>${label}</span><input inputmode="${mode}" data-bind="profile" data-f="${key}" value="${esc(p[key])}" placeholder="${ph}"></label>`;
  return `<div class="head"><a class="icon-btn" href="#/hoy" aria-label="Volver">${icon('back')}</a><div class="grow"><h1>Ajustes</h1></div></div>
  <div class="card">
    <label class="field" style="margin-top:0"><span>Nombre</span><input data-bind="profile" data-f="name" value="${esc(p.name)}" placeholder="Tu nombre" autocomplete="off"></label>
    <div class="row" style="gap:10px">${f('height', 'Altura (cm)', 'numeric')}${f('waterGoal', 'Meta de agua (vasos)', 'numeric')}</div>
    <div class="row" style="gap:10px">${f('startWeight', 'Peso inicial (kg)')}${f('goalWeight', 'Peso objetivo (kg)')}</div>
    ${f('rest', 'Descanso entre series (segundos)', 'numeric')}
  </div>
  <h2>Tus datos</h2>
  <div class="card stack">
    <p class="muted small" style="margin:0">Todo se guarda solo en este teléfono. Exportá un respaldo de vez en cuando por si cambiás de celular o borrás Safari.</p>
    <button class="btn block" data-act="export">Exportar respaldo</button>
    <button class="btn block" data-act="import">Importar respaldo</button>
    <button class="btn block" data-act="claude">${icon('spark')} Copiar resumen para Claude</button>
    <input type="file" id="importFile" accept="application/json,.json" hidden>
  </div>
  <h2>Zona peligrosa</h2>
  <button class="btn ghost block danger" data-act="reset">Borrar todos los datos</button>
  <p class="faint small" style="text-align:center;margin-top:24px">Forma · tu gym y tu plan, sin cuentas ni nubes</p>`;
}

/* ================= Sheets / timer / toast ================= */
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
      ? '<span id="timerTxt"></span><button data-act="timerAdd">+15</button><button data-act="timerStop" aria-label="Cerrar">✕</button>'
      : '<span>¡A la próxima serie!</span><button data-act="timerStop">OK</button>';
    if (mode === 'done') navigator.vibrate?.([200, 100, 200]);
  }
  if (mode === 'run') $('#timerTxt').textContent = `Descanso ${Math.floor(left / 60)}:${pad(left % 60)}`;
  timerTick = setTimeout(updateTimer, 250);
}

function exHistorySheet(id) {
  const h = (exerciseHistory()[id] || []).slice();
  const name = EXERCISES[id]?.name || h.at(-1)?.name || 'Ejercicio';
  openSheet(`<h3>${esc(name)}</h3>
    ${lineChart(h.map((x) => ({ x: x.date, y: topKg(x.sets) })).filter((x) => x.y > 0))}
    <div style="margin-top:8px">${h.reverse().map((x) => `<div class="pr-row"><span class="muted small">${fmtShort(x.date)}</span>
      <span class="small" style="text-align:right">${x.sets.map((s) => `${s.kg != null ? fmtNum(s.kg) : '–'}×${s.reps ?? '?'}`).join(' · ')}</span></div>`).join('') || '<div class="empty">Sin registros todavía</div>'}</div>`);
}

/* ================= Resumen para Claude ================= */
function claudeSummary() {
  const p = S.profile, today = todayKey();
  const from = addDays(today, -13);
  const lines = [
    'Sos mi coach de entrenamiento y nutrición. Analizá mis últimos 14 días y dame recomendaciones concretas y priorizadas: qué cambiar o mejorar en la alimentación y en los ejercicios (pesos, progresión, volumen, frecuencia, descanso).',
    '',
    `Perfil: altura ${p.height} cm, peso inicial ${p.startWeight} kg, peso actual ${fmtNum(currentWeight())} kg, objetivo ${p.goalWeight} kg. Objetivo del plan: salud y descenso de grasa.`,
    'Rutina: lunes pecho, martes brazos, miércoles piernas, jueves espalda, viernes hombros. 4 series por ejercicio, en bloques combinados.',
    `Reglas de mi plan de alimentación: ${NUTRITION_RULES.slice(0, 8).join(' ')}`,
    '', '## Entrenos',
  ];
  for (const s of sortedSessions().filter((s) => s.date >= from)) {
    if (s.group === 'cardio') { lines.push(`- ${s.date} Cardio: ${sessionSummary(s)}${s.note ? ` (${s.note})` : ''}`); continue; }
    const exs = s.exercises.filter((e) => e.sets.some((x) => x.done))
      .map((e) => `${e.name} ${e.sets.filter((x) => x.done).map((x) => `${x.kg || '?'}kg×${x.reps || '?'}`).join(', ')}`);
    lines.push(`- ${s.date} ${GROUPS[s.group].name}: ${exs.join('; ') || 'sin series registradas'}${s.note ? ` (nota: ${s.note})` : ''}`);
  }
  lines.push('', '## Alimentación y hábitos');
  const lbl = { plan: 'según plan', parcial: 'parcial', off: 'me salí' };
  for (let i = 13; i >= 0; i--) {
    const k = addDays(today, -i), d = S.days[k];
    if (!d) continue;
    const meals = MEALS.map((m) => { const x = d.meals[m.key]; return x?.s || x?.note ? `${m.name}: ${lbl[x.s] || '—'}${x.note ? ` ("${x.note}")` : ''}` : null; }).filter(Boolean);
    const habits = HABITS.map((h) => `${h.name} ${d.habits[h.key] ? 'sí' : 'no'}`);
    lines.push(`- ${k}: ${meals.join('; ') || 'comidas sin registrar'}. Hábitos: ${habits.join(', ')}. Agua ${d.water || 0}/${p.waterGoal} vasos.`);
  }
  lines.push('', '## Peso');
  weightsSorted().slice(-10).forEach((w) => lines.push(`- ${w.date}: ${w.kg} kg`));
  return lines.join('\n');
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copiado. Pegalo en Claude'); }
  catch {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else toast('No se pudo copiar');
  }
}

/* ================= Acciones ================= */
const curSession = () => findSession(location.hash.split('/')[2]);

const A = {
  closeSheet,
  start({ group, date }) {
    closeSheet();
    const open = S.sessions.find((s) => s.date === date && s.group === group && !s.finishedAt);
    const s = open || newSession(group, date);
    location.hash = `#/sesion/${s.id}`;
  },
  addSheet({ date }) {
    const sug = (weekStart(date) === weekStart(todayKey()) && plannedFor(date)) || GROUP_BY_WEEKDAY[parseKey(date).getDay()];
    openSheet(`<h3>Registrar entreno</h3><p class="muted small" style="margin:-8px 0 14px">${fmtLong(date)}</p>
      <div class="choice-grid">${Object.entries(GROUPS).map(([k, g]) => `<button class="choice" data-act="start" data-group="${k}" data-date="${date}" ${k === sug ? 'style="box-shadow:inset 0 0 0 1.5px var(--accent)"' : ''}>
        <i class="dot" style="background:${g.color};width:10px;height:10px"></i>${g.name}</button>`).join('')}</div>`);
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
    const s = curSession(), e = s.exercises[i];
    openSheet(`<h3>${esc(e.name)}</h3><div class="stack">
      <button class="btn block" data-act="exHistory" data-ex="${esc(e.id)}">Ver historial</button>
      <button class="btn block" data-act="addSet" data-i="${i}">Agregar serie</button>
      ${e.sets.length > 1 ? `<button class="btn block" data-act="removeSet" data-i="${i}">Quitar última serie</button>` : ''}
      <button class="btn block danger" data-act="removeEx" data-i="${i}">Quitar ejercicio de esta sesión</button></div>`);
  },
  exHistory({ ex: id }) { exHistorySheet(id); },
  addSet({ i }) { const s = curSession(); s.exercises[i].sets.push({ kg: '', reps: '', done: false }); save(); closeSheet(); render(); },
  removeSet({ i }) { const s = curSession(); s.exercises[i].sets.pop(); save(); closeSheet(); render(); },
  removeEx({ i }) { const s = curSession(); s.exercises.splice(Number(i), 1); save(); closeSheet(); render(); },
  addExSheet() {
    const groups = Object.keys(ROUTINE);
    openSheet(`<h3>Agregar ejercicio</h3>
      <label class="field" style="margin-top:0"><input data-bind="exSearch" placeholder="Buscar o escribir uno nuevo" autocomplete="off"></label>
      <button class="btn primary block" style="margin-top:10px" data-act="addCustomEx">Agregar como nuevo</button>
      <div id="exList" style="margin-top:8px">${groups.map((g) => `<div class="combo" style="margin-top:14px;color:${GROUPS[g].color}">${GROUPS[g].name}</div>` +
        Object.values(EXERCISES).filter((e) => e.group === g).map((e) => `<button class="pr-row" style="width:100%;text-align:left" data-act="addEx" data-ex="${e.id}" data-name="${esc(e.name.toLowerCase())}">${esc(e.name)}</button>`).join('')).join('')}</div>`);
  },
  addEx({ ex: id }) {
    const s = curSession();
    const block = Math.max(-1, ...s.exercises.map((e) => e.block)) + 1;
    s.exercises.push(mkExercise(EXERCISES[id], block));
    save(); closeSheet(); render();
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  },
  addCustomEx() {
    const name = $('[data-bind="exSearch"]')?.value.trim();
    if (!name) { toast('Escribí el nombre del ejercicio'); return; }
    const s = curSession();
    const id = 'custom:' + name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
    const block = Math.max(-1, ...s.exercises.map((e) => e.block)) + 1;
    s.exercises.push(mkExercise({ id, name }, block));
    save(); closeSheet(); render();
  },
  sessionMenu({ id }) {
    const s = findSession(id);
    openSheet(`<h3>Opciones</h3>
      <label class="field" style="margin-top:0"><span>Fecha</span><input type="date" value="${s.date}" max="${todayKey()}" data-bind="sessionDate"></label>
      <button class="btn block danger" style="margin-top:14px" data-act="deleteSession" data-id="${id}">Eliminar entreno</button>`);
  },
  deleteSession({ id }) {
    if (!confirm('¿Eliminar este entreno? No se puede deshacer.')) return;
    S.sessions = S.sessions.filter((s) => s.id !== id);
    save(); closeSheet(); location.hash = '#/entreno';
  },
  finish({ id }) {
    const s = findSession(id);
    if (!s.finishedAt) {
      const empty = s.group === 'cardio' ? !num(s.cardio.min) : doneSets(s) === 0;
      if (empty && !confirm(s.group === 'cardio' ? 'No cargaste los minutos. ¿Guardar igual?' : 'No marcaste ninguna serie. ¿Guardar igual?')) return;
      s.finishedAt = Date.now();
      toast(s.group === 'cardio' ? 'Cardio guardado' : 'Entreno guardado 💪');
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
    openSheet(`<h3>Registrar peso</h3>
      <div class="row" style="gap:10px">
        <label class="field grow" style="margin-top:0"><span>Peso (kg)</span><input id="wKg" inputmode="decimal" placeholder="${fmtNum(currentWeight())}"></label>
        <label class="field grow" style="margin-top:0"><span>Fecha</span><input id="wDate" type="date" value="${todayKey()}" max="${todayKey()}"></label>
      </div>
      <button class="btn primary block" style="margin-top:14px" data-act="saveWeight">Guardar</button>
      ${S.weights.length ? `<h2>Últimos</h2>${weightsSorted().slice(-5).reverse().map((w) => `<div class="pr-row"><span class="muted">${fmtShort(w.date)}</span><span class="row"><b>${fmtNum(w.kg)} kg</b><button class="link" style="color:var(--bad)" data-act="delWeight" data-date="${w.date}">Borrar</button></span></div>`).join('')}` : ''}`);
    setTimeout(() => $('#wKg')?.focus(), 250);
  },
  saveWeight() {
    const kg = num($('#wKg').value), date = $('#wDate').value || todayKey();
    if (!kg || kg < 30 || kg > 300) { toast('Ingresá un peso válido'); return; }
    S.weights = S.weights.filter((w) => w.date !== date).concat({ date, kg });
    save(); closeSheet(); render(); toast('Peso guardado');
  },
  delWeight({ date }) { S.weights = S.weights.filter((w) => w.date !== date); save(); A.weightSheet(); render(); },
  planTab({ v }) { UI.planTab = v; render(); },
  claude() { copyText(claudeSummary()); },
  async export() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const name = `forma-respaldo-${todayKey()}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import() { $('#importFile').click(); },
  reset() {
    if (!confirm('¿Borrar TODOS tus datos? Esto no se puede deshacer.')) return;
    if (!confirm('¿Seguro? Te recomiendo exportar un respaldo antes.')) return;
    S = defaults(); save(true); location.hash = '#/hoy'; render(); toast('Datos borrados');
  },
};

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t || !A[t.dataset.act]) return;
  e.preventDefault();
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
      const v = d.f === 'name' ? t.value.trim() : num(t.value);
      if (v !== null && v !== '') { S.profile[d.f] = v; save(); }
      else if (d.f === 'name') { S.profile.name = ''; save(); }
      break;
    }
    case 'exSearch': {
      const q = t.value.trim().toLowerCase();
      document.querySelectorAll('#exList [data-name]').forEach((b) => { b.hidden = q && !b.dataset.name.includes(q); });
      break;
    }
    case 'sessionDate': {
      const s = curSession();
      if (s && t.value) { s.date = t.value; save(); render(); }
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
  const inputs = [...document.querySelectorAll('[data-set]')];
  const next = inputs[inputs.indexOf(e.target) + 1];
  if (next && e.target.dataset.set.endsWith(':kg')) next.focus(); else e.target.blur();
});

document.addEventListener('change', (e) => {
  if (e.target.id !== 'importFile' || !e.target.files[0]) return;
  e.target.files[0].text().then((txt) => {
    const d = JSON.parse(txt);
    if (!Array.isArray(d.sessions) || typeof d.days !== 'object') throw new Error('formato');
    if (!confirm('Esto reemplaza los datos actuales por los del respaldo. ¿Continuar?')) return;
    S = { ...defaults(), ...d, profile: { ...defaults().profile, ...d.profile } };
    save(true); render(); toast('Respaldo importado');
  }).catch(() => toast('El archivo no es un respaldo válido'));
  e.target.value = '';
});

/* ================= Router ================= */
const VIEWS = { hoy: vHoy, entreno: vEntreno, sesion: vSesion, comida: vComida, progreso: vProgreso, plan: vPlan, ajustes: vAjustes };
function render() {
  const [r, a] = (location.hash.slice(2) || 'hoy').split('/');
  const view = VIEWS[r] ? r : 'hoy';
  document.body.classList.toggle('in-session', view === 'sesion');
  const tab = view === 'sesion' ? 'entreno' : view === 'ajustes' ? 'hoy' : view;
  document.querySelectorAll('.tabbar a').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab));
  $('#view').innerHTML = VIEWS[view](a);
  updateTimer();
}
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

// Al volver a la app otro día, refrescar "Hoy"
let lastDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && todayKey() !== lastDay) { lastDay = todayKey(); UI.calSel = lastDay; UI.calMonth = lastDay.slice(0, 7); render(); }
});

render();
