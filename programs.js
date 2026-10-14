// Objetivos, generador de rutinas y plantillas.
// Una rutina ("program") se guarda en el teléfono de cada persona y se puede editar libremente:
// { name, objective, place, level, rest, notes[], days: [{ id, name, color, blocks: [[ {ex, name?, sets, t, r, note?} ]] }] }
//   t = objetivo en texto ("8–12", "25 · 20 · 15 · 10", "30–45 s")
//   r = reps meta por serie (para sugerir subir el peso) o null si es al fallo / por tiempo

const OBJECTIVES = {
  grasa:       { name: 'Bajar grasa', desc: 'Perder grasa conservando el músculo', kcal: -0.20, prot: 2.0, sets: 3, reps: [12, 15], rest: 60, group: 2, finisher: true, weight: 'down',
                 tip: 'Superseries con poco descanso, cardio suave casi todos los días y un déficit calórico moderado.' },
  masa:        { name: 'Ganar masa muscular', desc: 'Más músculo con un superávit leve', kcal: 0.10, prot: 1.8, sets: 4, reps: [8, 12], rest: 90, group: 1, weight: 'up',
                 tip: 'Más series por músculo, rango de 8–12 reps y comer un poco por encima de lo que gastás.' },
  fuerza:      { name: 'Ganar fuerza', desc: 'Levantar más en los ejercicios básicos', kcal: 0.05, prot: 1.8, sets: 3, reps: [8, 10], rest: 120, group: 1, main: { sets: 5, reps: [3, 5], rest: 180 }, weight: 'up',
                 tip: 'Los dos primeros ejercicios de cada día son pesados (3–5 reps) con descansos largos. El resto, accesorios.' },
  resistencia: { name: 'Resistencia', desc: 'Aguantar más: circuitos y cardio', kcal: 0, prot: 1.5, sets: 3, reps: [15, 20], rest: 45, group: 3, finisher: true, weight: 'keep',
                 tip: 'Circuitos de 3 ejercicios sin pausa entre ellos, muchas repeticiones y un bloque final de acondicionamiento.' },
  recomp:      { name: 'Recomposición', desc: 'Bajar grasa y ganar músculo a la vez (ideal si recién empezás)', kcal: -0.10, prot: 2.0, sets: 3, reps: [8, 12], rest: 75, group: 2, weight: 'down-slow',
                 tip: 'Entrenamiento de fuerza con progresión, mucha proteína y un déficit chico.' },
  salud:       { name: 'Salud y bienestar', desc: 'Moverte mejor, más energía y buenos hábitos', kcal: 0, prot: 1.4, sets: 2, reps: [10, 15], rest: 60, group: 2, weight: 'keep',
                 tip: 'Rutinas cortas de cuerpo completo, constancia y movimiento diario.' },
};

const LEVELS = {
  principiante: { name: 'Principiante', desc: 'Menos de 6 meses entrenando de forma constante' },
  intermedio:   { name: 'Intermedio', desc: 'Más de 6 meses entrenando y conocés los ejercicios básicos' },
};

const ACTIVITY = {
  sedentario: { name: 'Sedentaria', desc: 'Trabajo sentado, poco movimiento', f: 1.2 },
  ligero:     { name: 'Ligera', desc: 'Camino algo durante el día', f: 1.35 },
  activo:     { name: 'Activa', desc: 'Trabajo de pie o muy activo', f: 1.5 },
};

const DAY_COLORS = ['#FF7A59', '#5AC8FA', '#C6F432', '#B78CFF', '#FFD166', '#FF8FB1'];

// Patrones de movimiento → candidatos en orden de preferencia (se filtran por el equipamiento disponible)
const SLOTS = {
  sentadilla: ['sentadilla_barra', 'hack_squat', 'prensa', 'sentadilla_goblet', 'sentadilla_manc', 'sentadilla_libre', 'sentadilla_salto'],
  bisagra:    ['peso_muerto_rumano', 'peso_muerto', 'rumano_manc', 'puente_una_pierna', 'puente_gluteo'],
  unilateral: ['bulgara', 'zancadas_manc', 'step_up_manc', 'zancadas', 'split_squat'],
  cuadriceps: ['banco_cuadriceps', 'isometrico_cuadriceps'],
  femoral:    ['banco_femorales', 'curl_femoral_sentado', 'rumano_manc', 'puente_una_pierna'],
  gluteo:     ['hip_thrust', 'puente_gluteo', 'patada_gluteo'],
  gemelos:    ['gemelos_maquina', 'gemelos_smith', 'gemelos_manc', 'gemelos_pie'],
  empuje_h:   ['banco_plano', 'press_banca_manc', 'press_hammer_pecho', 'press_suelo_manc', 'flexiones'],
  empuje_inc: ['press_inclinado_manc', 'banco_inclinado', 'flexiones_declinadas', 'flexiones_inclinadas'],
  empuje_v:   ['press_militar', 'press_hombros_manc', 'press_hombros_hammer', 'press_arnold', 'flexiones_pica'],
  tiron_v:    ['jalon_pecho', 'dominadas', 'dorsalera_cerrado', 'dominadas_supinas', 'remo_un_brazo', 'remo_invertido'],
  tiron_h:    ['remo_barra', 'remo_polea', 'remo_hammer', 'remo_un_brazo', 'remo_manc_dos', 'remo_invertido', 'superman'],
  aperturas:  ['cruces_polea', 'mariposa', 'apertura_manc'],
  laterales:  ['vuelos_laterales', 'lateral_polea_baja'],
  posterior:  ['posteriores_soga', 'posteriores_maquina', 'posteriores_manc', 'superman'],
  biceps:     ['curl_barra', 'curl_manc', 'scott_barra_w', 'curl_martillo', 'curl_alternado', 'curl_concentrado'],
  triceps:    ['triceps_polea', 'triceps_soga', 'press_frances', 'triceps_tras_nuca', 'patada_triceps', 'fondos_banco', 'flexiones_cerradas'],
  core:       ['plancha', 'crunch_polea', 'elevacion_piernas_colgado', 'dead_bug', 'crunch', 'elevacion_piernas', 'russian_twist', 'plancha_lateral'],
  cond:       ['kb_swing', 'remo_ergometro', 'burpees', 'mountain_climbers', 'saltar_soga', 'jumping_jacks', 'sentadilla_salto', 'rodillas_altas'],
};
const COMPOUND = new Set(['sentadilla', 'bisagra', 'empuje_h', 'empuje_inc', 'empuje_v', 'tiron_h', 'tiron_v']);
const TIMED = new Set(['plancha', 'plancha_lateral', 'isometrico_cuadriceps', 'burpees', 'jumping_jacks', 'mountain_climbers', 'saltar_soga', 'rodillas_altas', 'kb_swing', 'remo_ergometro', 'bici_fija', 'cinta', 'dead_bug']);
// Versiones más fáciles para quien recién empieza
const BEGINNER_SWAP = { flexiones_declinadas: 'flexiones_inclinadas', peso_muerto: 'peso_muerto_rumano', puente_una_pierna: 'puente_gluteo', dominadas: 'jalon_pecho', elevacion_piernas_colgado: 'dead_bug', burpees: 'jumping_jacks', sentadilla_salto: 'sentadilla_libre' };

const DAY_TEMPLATES = {
  fbA:     { name: 'Cuerpo completo A', slots: [['sentadilla', 0], ['empuje_h', 0], ['tiron_h', 0], ['bisagra', 0], ['empuje_v', 0], ['core', 0]] },
  fbB:     { name: 'Cuerpo completo B', slots: [['bisagra', 1], ['empuje_inc', 0], ['tiron_v', 0], ['unilateral', 0], ['laterales', 0], ['core', 1]] },
  fbC:     { name: 'Cuerpo completo C', slots: [['sentadilla', 1], ['empuje_h', 1], ['tiron_v', 1], ['gluteo', 0], ['biceps', 0], ['triceps', 0], ['core', 2]] },
  torsoA:  { name: 'Torso A', slots: [['empuje_h', 0], ['tiron_h', 0], ['empuje_v', 0], ['tiron_v', 0], ['laterales', 0], ['biceps', 0], ['triceps', 0]] },
  torsoB:  { name: 'Torso B', slots: [['empuje_inc', 0], ['tiron_v', 1], ['empuje_h', 1], ['tiron_h', 1], ['posterior', 0], ['biceps', 1], ['triceps', 1]] },
  piernaA: { name: 'Piernas A', slots: [['sentadilla', 0], ['bisagra', 0], ['unilateral', 0], ['femoral', 0], ['gemelos', 0], ['core', 0]] },
  piernaB: { name: 'Piernas B', slots: [['bisagra', 1], ['sentadilla', 1], ['gluteo', 0], ['cuadriceps', 0], ['gemelos', 1], ['core', 1]] },
  empuje:  { name: 'Empuje · pecho, hombros y tríceps', slots: [['empuje_h', 0], ['empuje_inc', 0], ['empuje_v', 0], ['aperturas', 0], ['laterales', 0], ['triceps', 0], ['triceps', 1]] },
  tiron:   { name: 'Tirón · espalda y bíceps', slots: [['tiron_v', 0], ['tiron_h', 0], ['tiron_h', 1], ['posterior', 0], ['biceps', 0], ['biceps', 1], ['core', 0]] },
  pierna:  { name: 'Piernas', slots: [['sentadilla', 0], ['bisagra', 0], ['unilateral', 0], ['cuadriceps', 0], ['femoral', 0], ['gemelos', 0]] },
};

function splitFor(days, o) {
  const fullBody = o.level === 'principiante' || o.place !== 'gym' || ['resistencia', 'salud', 'grasa', 'recomp'].includes(o.objective);
  // Sin equipo hay pocas variantes de espalda: con muchos días conviene rotar cuerpo completo
  if (o.place === 'casa' && days >= 5) return [['fbA'], ['fbB'], ['fbC'], ['fbA', 1], ['fbB', 1], ['fbC', 1]].slice(0, days);
  switch (days) {
    case 2: return [['fbA'], ['fbB']];
    case 3: return fullBody ? [['fbA'], ['fbB'], ['fbC']] : [['empuje'], ['tiron'], ['pierna']];
    case 4: return [['torsoA'], ['piernaA'], ['torsoB'], ['piernaB']];
    case 5: return [['torsoA'], ['piernaA'], ['empuje', 1], ['tiron', 1], ['piernaB']];
    default: return [['empuje'], ['tiron'], ['pierna'], ['empuje', 1], ['tiron', 1], ['pierna', 1]];
  }
}

const rangeTxt = ([a, b]) => `${a}–${b}`;

// Genera una rutina completa a partir de las respuestas de la persona
function generateProgram({ objective, place, level, days }) {
  const obj = OBJECTIVES[objective];
  const eq = PLACES[place].eq;
  const beginner = level === 'principiante';
  const maxEx = beginner ? 5 : 7;

  const pick = (slot, alt, used) => {
    let list = SLOTS[slot].map((id) => (beginner && BEGINNER_SWAP[id]) || id).filter((id, i, a) => a.indexOf(id) === i && eq.includes(CATALOG[id].eq));
    const free = list.filter((id) => !used.has(id));
    if (!free.length) return null;
    return free[alt % free.length];
  };
  const entry = (id, scheme) => {
    const timed = TIMED.has(id);
    const sets = Math.max(2, scheme.sets - (beginner ? 1 : 0));
    return { ex: id, sets, t: timed ? '30–45 s' : rangeTxt(scheme.reps), r: timed ? null : Array(sets).fill(scheme.reps[1]) };
  };

  const plan = splitFor(days, { objective, place, level });
  const dayList = plan.map(([tpl, shift = 0], i) => {
    const T = DAY_TEMPLATES[tpl];
    const used = new Set();
    const items = [];
    for (const [slot, alt] of T.slots) {
      if (items.length >= maxEx) break;
      const id = pick(slot, alt + shift, used);
      if (!id) continue;
      used.add(id);
      const isMain = obj.main && items.length < 2 && COMPOUND.has(slot);
      const scheme = isMain ? (CATALOG[id].eq === 'cuerpo' ? { sets: 4, reps: [6, 10] } : obj.main) : obj;
      items.push(entry(id, scheme));
    }
    // Agrupar en superseries / circuitos según el objetivo (los ejercicios principales de fuerza van solos)
    const blocks = [];
    const size = obj.group;
    for (let k = 0; k < items.length; k += size) blocks.push(items.slice(k, k + size));
    if (obj.finisher) {
      const id = pick('cond', i, used);
      if (id) blocks.push([{ ex: id, sets: beginner ? 2 : 3, t: '30–40 s', r: null, note: 'Final de acondicionamiento: lo más intenso que puedas sosteniendo la técnica.' }]);
    }
    const name = T.name + (shift ? ' (variante)' : '');
    return { id: `d${i + 1}`, name, color: DAY_COLORS[i % DAY_COLORS.length], blocks };
  });

  return {
    // Nombre y notas se guardan en español (idioma base); i18n.js los traduce al mostrarlos
    name: `${obj.nameEs || obj.name} · ${days} días · ${PLACES[place].nameEs || PLACES[place].name}`,
    objective, place, level, rest: obj.main ? 150 : obj.rest,
    notes: [
      'Calentá 5–10 minutos antes: movilidad de articulaciones y 1–2 series livianas del primer ejercicio.',
      'Técnica primero: si no podés hacer bien el movimiento, bajá el peso.',
      `Cuando completes todas las series en el tope del rango (${rangeTxt(obj.reps)}), subí el peso: 2,5 kg en barra o 1–2 kg en mancuernas. Sin peso: más reps o una variante más difícil.`,
      obj.group === 2 ? 'Los ejercicios del mismo bloque se hacen en superserie: uno después del otro y recién ahí descansás.' : '',
      obj.group === 3 ? 'Cada bloque es un circuito: hacé los ejercicios seguidos y descansá al terminar la vuelta.' : '',
      obj.tipEs || obj.tip,
    ].filter(Boolean),
    days: dayList,
  };
}

// ---------- Plantilla: rutina clásica por grupo muscular (5 días, gimnasio) ----------
const L = (ex, t, r, note) => ({ ex, sets: 4, t, r, note });
const P4 = (a, b, c, d) => [a, b, c, d];
const F4 = [null, null, null, null];
const CLASSIC_DAYS = [
  ['pecho', 'Pecho', '#FF7A59', [
    [L('banco_plano', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('press_banca_manc', '15 reps', P4(15, 15, 15, 15))],
    [L('banco_inclinado', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('press_svend', '15–20 reps', P4(15, 15, 15, 15), 'Apretá el disco con ambas manos hacia el medio y, sin soltar la contracción, llevalo lento hacia adelante. Parado o acostado.')],
    [L('banco_declinado', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('declinado_manc', '15–20 reps', P4(15, 15, 15, 15))],
    [L('apertura_manc', '12–20 reps', P4(12, 12, 12, 12)), L('contractor_un_brazo', '10 c/brazo', P4(10, 10, 10, 10), 'Espalda apoyada, a un brazo.')],
    [L('cruces_polea', '10 + 10 + 10', P4(10, 10, 10, 10))],
    [L('mariposa', '10 + 10 + 10 (drop)', P4(10, 10, 10, 10), 'De mayor a menor peso.')],
    [L('press_hammer_pecho', '10 + 10 + 10 (drop)', P4(10, 10, 10, 10), 'De mayor a menor peso.')],
  ]],
  ['brazos', 'Brazos', '#C6F432', [
    [L('scott_barra_w', '20 · 15 · 12 · 10', P4(20, 15, 12, 10)), L('ext_triceps_polea_baja', 'Al fallo', F4, 'Arrodillado o parado.')],
    [L('biceps_barra_espinales', '20 · 15 · 12 · 10', P4(20, 15, 12, 10), 'Apoyá bien la axila y trabá los pies atrás.'), L('triceps_agarre_remo', 'Al fallo', F4, 'Cuerpo un poco inclinado hacia adelante, siempre derecho.')],
    [L('curl_alternado', '20 reps', P4(20, 20, 20, 20)), L('triceps_tras_nuca', 'Al fallo', F4)],
    [L('curl_smith', '15 reps', P4(15, 15, 15, 15)), L('press_triceps_smith', 'Al fallo', F4)],
    [L('curl_hammer', 'Al fallo', F4, 'Mantené siempre un brazo arriba.'), L('fondos_hammer', 'Al fallo', F4)],
  ]],
  ['piernas', 'Piernas', '#5AC8FA', [
    [L('sissy', '4 × 20', P4(20, 20, 20, 20), 'Entrada en calor. Si puedo, voy agregando peso.')],
    [L('banco_femorales', '10 ret. + 10 lenta + 10', P4(10, 10, 10, 10), '10 con retención, 10 bajada lenta (10 seg arriba) y 10 continuas.'), L('prensa_boca_arriba', '15 cortitas', P4(15, 15, 15, 15))],
    [L('hack_squat', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('gemelos_maquina', 'Al fallo', F4)],
    [L('prensa', '10 ret. + 10 cortas + 5 pies juntos', P4(10, 10, 10, 10), 'Abajo cuento 1-2 y subo.'), L('banco_cuadriceps', 'Al fallo', F4)],
    [L('curl_femoral_sentado', '10 ret. + 10 (drop)', P4(10, 10, 10, 10), 'Bajo el peso y otras 10 con retención + 10 continuas.'), L('gemelos_smith', 'Al fallo', F4)],
    [L('aductor', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('isometrico_cuadriceps', 'Contar hasta 50', F4)],
  ]],
  ['espalda', 'Espalda', '#B78CFF', [
    [L('dorsalera_tras_nuca', '25 · 20 · 15 · 10', P4(25, 20, 15, 10)), L('dorsal_un_brazo_atras', '10 c/brazo', P4(10, 10, 10, 10))],
    [L('dorsalera_cerrado', '20 · 15 · 12 · 10', P4(20, 15, 12, 10)), L('dorsal_un_brazo_costado', '10 c/lado', P4(10, 10, 10, 10))],
    [L('remo_barra_t', '10 + 10 + 10 (drop)', P4(10, 10, 10, 10)), L('pullover_polea_soga', 'Al fallo', F4)],
    [L('remo_un_brazo', '10 reps', P4(10, 10, 10, 10)), L('serrucho', '10 reps', P4(10, 10, 10, 10))],
    [L('pullover_manc', 'Al fallo, subiendo', F4, 'Si puedo, subo el peso en cada vuelta.'), L('encogimiento_manc', 'Al fallo', F4)],
    [L('remo_hammer', 'Al fallo', F4), L('encogimiento_hammer', 'Al fallo', F4)],
  ]],
  ['hombros', 'Hombros', '#FFD166', [
    [L('press_hombros_smith', '25 · 20 · 15 · 10', P4(25, 20, 15, 10), 'Últimas 5 abro las manos, bien cortitas.'), L('lateral_polea_baja', '10 reps', P4(10, 10, 10, 10))],
    [L('press_hombros_manc', 'Al fallo', F4), L('press_arnold', 'Al fallo', F4)],
    [L('vuelos_laterales', '10 + 10 + 10 (drop)', P4(10, 10, 10, 10)), L('encogimiento_smith', 'Al fallo', F4)],
    [L('posteriores_manc', '10 + 10 + 10 (drop)', P4(10, 10, 10, 10)), L('posteriores_maquina', 'Al fallo', F4)],
    [L('w_a_la_pera', '15 pesado', P4(15, 15, 15, 15)), L('posteriores_soga', 'Al fallo', F4)],
    [L('press_hombros_hammer', '10 + 10 cambio agarre', P4(10, 10, 10, 10)), L('encogimiento_hammer', 'Al fallo', F4)],
  ]],
];

function classicProgram(objective = 'grasa') {
  return {
    name: 'Clásica por grupo muscular · 5 días · Gimnasio',
    objective, place: 'gym', level: 'intermedio', rest: 90,
    notes: [
      'Todos los ejercicios son 4 series.',
      'Técnica primero: si no puedo hacer bien la técnica, bajo el peso.',
      'Calentamiento de articulaciones antes de empezar: vuelos laterales ×30, vuelos frontales ×30, bíceps ×30 (4 series de todo). Si se puede, unas dominadas.',
    ],
    days: CLASSIC_DAYS.map(([id, name, color, blocks]) => ({ id, name, color, blocks: JSON.parse(JSON.stringify(blocks)) })),
  };
}

// Días de la semana sugeridos según cuántos días entrena (0 = domingo)
const DEFAULT_WEEKDAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };

const CARDIO_KINDS = ['Caminata', 'Correr', 'Saltar la soga', 'Bicicleta', 'Natación', 'Trote ligero', 'Otro'];
