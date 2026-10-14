// Datos de referencia extraídos de "RUTINA COMPLETA SEMANAL.docx" y "PLAN DE ALIMENTACIÓN.docx".
// reps: objetivo por serie (null = al fallo / por tiempo). Todas las series son 4 salvo que se indique.

const GROUPS = {
  pecho:    { name: 'Pecho',    color: '#FF7A59' },
  brazos:   { name: 'Brazos',   color: '#C6F432' },
  piernas:  { name: 'Piernas',  color: '#5AC8FA' },
  espalda:  { name: 'Espalda',  color: '#B78CFF' },
  hombros:  { name: 'Hombros',  color: '#FFD166' },
  cardio:   { name: 'Cardio',   color: '#4ADE80' },
  libre:    { name: 'Libre',    color: '#A1A1AA' },
};

const ex = (id, name, target, reps, note) => ({ id, name, target, reps, note });
const F = [null, null, null, null];

const ROUTINE = {
  pecho: {
    day: 1,
    blocks: [
      [ex('banco_plano', 'Banco plano con barra', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('press_banca_manc', 'Press de banca con mancuernas', '15 reps', [15, 15, 15, 15])],
      [ex('banco_inclinado', 'Banco inclinado con barra', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('press_svend', 'Press Svend', '15–20 reps', [15, 15, 15, 15],
         'Apretá el disco con ambas manos hacia el medio (contracción isométrica) y, sin soltar la contracción, llevalo lento hacia adelante extendiendo los brazos. Parado o acostado.')],
      [ex('banco_declinado', 'Banco declinado con barra', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('declinado_manc', 'Press declinado con mancuernas', '15–20 reps', [15, 15, 15, 15])],
      [ex('apertura_manc', 'Apertura con mancuernas', '12–20 reps', [12, 12, 12, 12]),
       ex('contractor_un_brazo', 'Apertura en contractor a un brazo', '10 c/brazo', [10, 10, 10, 10], 'Espalda apoyada, a un brazo.')],
      [ex('cruces_polea', 'Cruces de polea alta + media + baja', '10 + 10 + 10', [10, 10, 10, 10])],
      [ex('mariposa', 'Mariposa en máquina', '10 + 10 + 10 (drop)', [10, 10, 10, 10], 'De mayor a menor peso.')],
      [ex('press_hammer_pecho', 'Press de pecho Hammer', '10 + 10 + 10 (drop)', [10, 10, 10, 10], 'De mayor a menor peso.')],
    ],
  },
  brazos: {
    day: 2,
    blocks: [
      [ex('scott_barra_w', 'Banco Scott con barra W', '20 · 15 · 12 · 10', [20, 15, 12, 10]),
       ex('ext_triceps_polea_baja', 'Extensión de tríceps en polea baja', 'Al fallo', F, 'Arrodillado o parado.')],
      [ex('biceps_barra_espinales', 'Bíceps con barra recta en banco de espinales', '20 · 15 · 12 · 10', [20, 15, 12, 10], 'Apoyá bien la axila y trabá los pies atrás.'),
       ex('triceps_agarre_remo', 'Tríceps empuje abajo agarre de remo', 'Al fallo', F, 'Cuerpo un poco inclinado hacia adelante, siempre derecho.')],
      [ex('curl_alternado', 'Curl alternado con mancuerna y pechera', '20 reps', [20, 20, 20, 20]),
       ex('triceps_tras_nuca', 'Extensión de tríceps tras nuca', 'Al fallo', F)],
      [ex('curl_smith', 'Curl de bíceps en Smith', '15 reps', [15, 15, 15, 15]),
       ex('press_triceps_smith', 'Press de tríceps en banco (Smith)', 'Al fallo', F)],
      [ex('curl_hammer', 'Curl de bíceps en máquina Hammer', 'Al fallo', F, 'Mantené siempre un brazo arriba.'),
       ex('fondos_hammer', 'Fondos de tríceps en Hammer', 'Al fallo', F)],
    ],
  },
  piernas: {
    day: 3,
    blocks: [
      [ex('sissy', 'Sissy squat (entrada en calor)', '4 × 20', [20, 20, 20, 20], 'Si puedo, voy agregando peso.')],
      [ex('banco_femorales', 'Banco de femorales', '10 ret. + 10 lenta + 10', [10, 10, 10, 10], '10 con retención, 10 bajada lenta (10 seg arriba) y 10 continuas.'),
       ex('prensa_boca_arriba', 'Prensa boca arriba', '15 cortitas', [15, 15, 15, 15])],
      [ex('hack_squat', 'Hack squat', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('gemelos_maquina', 'Gemelos en máquina', 'Al fallo', F)],
      [ex('prensa', 'Prensa', '10 ret. + 10 cortas + 5 pies juntos', [10, 10, 10, 10], 'Abajo cuento 1-2 y subo.'),
       ex('banco_cuadriceps', 'Banco de cuádriceps', 'Al fallo', F)],
      [ex('curl_femoral_sentado', 'Curl femoral sentado', '10 ret. + 10 (drop)', [10, 10, 10, 10], 'Bajo el peso y otras 10 con retención + 10 continuas.'),
       ex('gemelos_smith', 'Gemelos en Smith', 'Al fallo', F)],
      [ex('aductor', 'Aductor interno en máquina', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('isometrico_cuadriceps', 'Isométrico de cuádriceps', 'Contar hasta 50', F)],
    ],
  },
  espalda: {
    day: 4,
    blocks: [
      [ex('dorsalera_tras_nuca', 'Dorsalera tras nuca', '25 · 20 · 15 · 10', [25, 20, 15, 10]),
       ex('dorsal_un_brazo_atras', 'Máquina a un brazo hacia atrás (doble rebote)', '10 c/brazo', [10, 10, 10, 10])],
      [ex('dorsalera_cerrado', 'Dorsalera agarre cerrado', '20 · 15 · 12 · 10', [20, 15, 12, 10]),
       ex('dorsal_un_brazo_costado', 'Misma máquina a un brazo de costado', '10 c/lado', [10, 10, 10, 10])],
      [ex('remo_barra_t', 'Remo bajo con barra T', '10 + 10 + 10 (drop)', [10, 10, 10, 10]),
       ex('pullover_polea_soga', 'Pullover en polea alta con soga', 'Al fallo', F)],
      [ex('remo_un_brazo', 'Remo a un brazo con mancuerna', '10 reps', [10, 10, 10, 10]),
       ex('serrucho', 'Serrucho a un brazo', '10 reps', [10, 10, 10, 10])],
      [ex('pullover_manc', 'Pullover con mancuerna', 'Al fallo, subiendo', F, 'Si puedo, subo el peso en cada vuelta.'),
       ex('encogimiento_manc', 'Encogimiento de hombros con mancuernas', 'Al fallo', F)],
      [ex('remo_hammer', 'Remo en máquina Hammer', 'Al fallo', F),
       ex('encogimiento_hammer', 'Encogimiento de hombros en Hammer', 'Al fallo', F)],
    ],
  },
  hombros: {
    day: 5,
    blocks: [
      [ex('press_hombros_smith', 'Press de hombros en Smith', '25 · 20 · 15 · 10', [25, 20, 15, 10], 'Últimas 5 abro las manos, bien cortitas.'),
       ex('lateral_polea_baja', 'Elevación lateral en polea baja', '10 reps', [10, 10, 10, 10])],
      [ex('press_hombros_manc', 'Press de hombros con mancuerna', 'Al fallo', F),
       ex('press_arnold', 'Press Arnold con mancuerna', 'Al fallo', F)],
      [ex('vuelos_laterales', 'Vuelos laterales con mancuernas', '10 + 10 + 10 (drop)', [10, 10, 10, 10]),
       ex('encogimiento_smith', 'Encogimiento de hombros en Smith', 'Al fallo', F)],
      [ex('posteriores_manc', 'Elevaciones posteriores con mancuernas', '10 + 10 + 10 (drop)', [10, 10, 10, 10]),
       ex('posteriores_maquina', 'Posteriores en máquina', 'Al fallo', F)],
      [ex('w_a_la_pera', 'W a la pera (trapecio)', '15 pesado', [15, 15, 15, 15]),
       ex('posteriores_soga', 'Posteriores con soga', 'Al fallo', F)],
      [ex('press_hombros_hammer', 'Press de hombros en Hammer', '10 + 10 cambio agarre', [10, 10, 10, 10]),
       ex('encogimiento_hammer', 'Encogimiento de hombros en Hammer', 'Al fallo', F)],
    ],
  },
};

const ROUTINE_NOTES = [
  'Todos los ejercicios son 4 series.',
  'Técnica primero: si no puedo hacer bien la técnica, bajo el peso.',
  'Calentamiento de articulaciones antes de empezar: vuelos laterales ×30, vuelos frontales ×30, bíceps ×30 (4 series de todo). Si se puede, unas dominadas.',
];

const CARDIO_KINDS = ['Caminata', 'Correr', 'Saltar la soga', 'Bicicleta', 'Trote ligero', 'Otro'];

// Índice plano de ejercicios por id (para historial y PRs)
const EXERCISES = {};
for (const [group, r] of Object.entries(ROUTINE)) {
  for (const block of r.blocks) for (const e of block) if (!EXERCISES[e.id]) EXERCISES[e.id] = { ...e, group };
}

const GROUP_BY_WEEKDAY = { 1: 'pecho', 2: 'brazos', 3: 'piernas', 4: 'espalda', 5: 'hombros' };

// ---------- Alimentación ----------
const MEALS = [
  { key: 'desayuno', name: 'Desayuno', time: 8 },
  { key: 'almuerzo', name: 'Almuerzo', time: 13 },
  { key: 'merienda', name: 'Merienda', time: 17 },
  { key: 'cena',     name: 'Cena',     time: 21 },
];

// Índice por día de semana JS (0 = domingo). Fin de semana comparte plan flexible.
const WEEKEND = {
  desayuno: { title: 'Flexible pero controlado', items: ['Puede incluir algo dulce chico', 'Siempre acompañado de proteína'] },
  almuerzo: { title: 'Flexible y consciente', items: ['Proteína principal (carne / pollo / pescado)', 'Verduras siempre presentes', 'Carbohidratos solo si hubo entrenamiento fuerte'] },
  merienda: { title: 'Igual que entre semana', items: ['Proteína + grasas buenas', 'Sin harinas ni azúcar'] },
  cena:     { title: 'Flexible sin carbos', items: ['Proteína: carne, pollo o pescado', 'Verduras siempre presentes', 'Evitar harinas, pan, arroz, papa y fideos'] },
};

const MEAL_PLAN = {
  1: {
    desayuno: { title: 'Avena + yogur', items: ['Avena cocida (porción chica)', 'Yogur natural', 'Semillas (chía o lino)', 'Opcional: arándanos, frutillas, banana o manzana', 'Mix seco: almendras, nueces, cereal sin azúcar'] },
    almuerzo: { title: 'Pescado', items: ['Pescado (merluza, atún, salmón)', '1 puñado chico de arroz + quinoa + lentejas', 'Espinaca y brócoli salteados', '½ palta'], tip: 'Ideal para desinflamar y mejorar la recuperación.' },
    merienda: { title: 'Sin carbohidratos', items: ['Huevo duro', 'Queso magro', 'Palta con tomate y aceite de oliva', 'Nueces / almendras', 'Galletas de arroz con pasta de maní', 'Mate o café sin azúcar'] },
    cena:     { title: 'Huevos / pescado', items: ['Huevos revueltos u omelette, o pescado', 'Espinaca, cebolla, morrón, brócoli', 'Aceite de oliva (1 cda)'], tip: 'Cena liviana y reparadora.' },
  },
  2: {
    desayuno: { title: 'Tostadas + huevos', items: ['Tostada integral (2)', 'Queso crema light', 'Huevos revueltos', 'Café o mate'] },
    almuerzo: { title: 'Pollo', items: ['Pechuga de pollo', 'Ensalada grande (lechuga, tomate, zanahoria, cebolla)', 'Aceite de oliva (1 cda)'], tip: 'Liviano, saciante y fácil de digerir.' },
    merienda: { title: 'Yogur + frutos secos', items: ['Yogur natural o griego', 'Puñado chico de nueces', 'Puñado de almendras'] },
    cena:     { title: 'Pollo', items: ['Pechuga de pollo', 'Ensalada verde o verduras salteadas', 'Limón y especias'], tip: 'Alta saciedad sin pesadez.' },
  },
  3: {
    desayuno: { title: 'Banana + yogur', items: ['Banana', 'Yogur natural', 'Semillas', 'Avena'] },
    almuerzo: { title: 'Carne', items: ['Carne vacuna magra', 'Puré de calabaza o papa (porción controlada)', 'Brócoli o espinaca'], tip: 'Más energía y fuerza para entrenamientos intensos.' },
    merienda: { title: 'Queso + huevo', items: ['Queso', 'Huevo duro', 'Mate con menta o té verde'] },
    cena:     { title: 'Pescado', items: ['Pescado (merluza, atún, salmón)', 'Brócoli, zapallito o espinaca', 'Palta o aceite de oliva'], tip: 'Antiinflamatoria, ideal post entrenamiento.' },
  },
  4: {
    desayuno: { title: 'Pan integral + huevo', items: ['Pan integral (2 rodajas)', 'Queso + huevo o jamón con huevo', 'Café, mate o té verde'] },
    almuerzo: { title: 'Pollo', items: ['Pollo', 'Arroz integral o legumbres (porción chica)', 'Salteado de verduras mixtas'], tip: 'Repetir no es malo: simplifica y mejora la adherencia.' },
    merienda: { title: 'Batido proteico', items: ['Batido proteico', 'Agua o té verde', 'Si hay mucha hambre: huevo revuelto con jamón'] },
    cena:     { title: 'Carne', items: ['Carne vacuna magra', 'Mix de verduras al horno o salteadas', 'Condimentos naturales'], tip: 'Más fuerza y recuperación muscular.' },
  },
  5: {
    desayuno: { title: 'Fruta + yogur', items: ['Fruta (manzana o frutos rojos)', 'Yogur natural', 'Semillas — mezclar todo'] },
    almuerzo: { title: 'Pescado', items: ['Pescado', 'Ensalada tibia de verduras', 'Palta o aceite de oliva'], tip: 'Cierre de semana liviano y antiinflamatorio.' },
    merienda: { title: 'Huevo + queso', items: ['Huevo duro', 'Queso y tomate tipo ensalada'] },
    cena:     { title: 'Quesos + huevos', items: ['Queso magro o semiduro', 'Huevos, palta con tomate', 'Brócoli, zapallito, espinaca, acelga, zucchini'], tip: 'Práctica y rápida para cerrar la semana.' },
  },
  6: WEEKEND,
  0: WEEKEND,
};

const NUTRITION_RULES = [
  'Priorizar proteínas en todas las comidas.',
  'Verduras libres (crudas o cocidas).',
  'Carbohidratos solo hasta la tarde (idealmente antes de las 18–19 hs).',
  'Grasas buenas controladas (aceite de oliva, huevos, frutos secos).',
  'Hidratación constante durante el día.',
  'Caminata suave de 20–30 min después del almuerzo.',
  'En la cena NO se consumen carbohidratos: nada de pan, arroz, papa, fideos ni harinas.',
  'La merienda es proteína + grasas buenas, sin harinas.',
  'Si hay entrenamiento temprano, priorizar el desayuno.',
  'Al levantarse, 1 vaso grande de agua.',
  'Evitar saltear comidas. Alarmas para las comidas principales.',
  'Moverse todos los días: caminata, trote, bici, saltos. Constancia antes que intensidad.',
];

const PLATE = [
  ['½ plato', 'Vegetales y frutas, con color y variedad (la papa no cuenta).'],
  ['¼ plato', 'Granos integrales: avena, arroz integral, quinoa, trigo integral.'],
  ['¼ plato', 'Proteína: pescado, pollo, legumbres, nueces. Limitar carne roja, evitar procesados.'],
  ['Aceites', 'Oliva, canola, girasol, en moderación. Evitar grasas trans.'],
  ['Bebidas', 'Agua, café o té. Sin bebidas azucaradas; jugo máx. un vaso chico.'],
];

const RECIPE = {
  title: 'Tortitas de avena (5 u.)',
  items: ['4 huevos', '100 g de copos de avena', '1 cdita de levadura', '100 ml de leche de soja', '1 pizca de sal', '1 vaina de vainilla'],
  steps: ['Licuar todo y dejar reposar 20 min.', 'En plancha, dar vuelta cuando salgan burbujas.', 'Acompañar con fruta fresca y una onza de chocolate negro.'],
};

const HABITS = [
  { key: 'agua_manana', name: 'Vaso de agua al levantarte' },
  { key: 'caminata', name: 'Caminata post-almuerzo 20–30′' },
  { key: 'cena_sin_carbos', name: 'Cena sin carbohidratos' },
  { key: 'sin_azucar', name: 'Sin azúcar ni bebidas azucaradas' },
];
