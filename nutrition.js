// Guías de alimentación por objetivo, hábitos y cálculo de calorías/macros.
// Son pautas generales, no reemplazan a un/a nutricionista.

const MEALS = [
  { key: 'desayuno', name: 'Desayuno', time: 8, art: 'El desayuno' },
  { key: 'almuerzo', name: 'Almuerzo', time: 13, art: 'El almuerzo' },
  { key: 'merienda', name: 'Merienda', time: 17, art: 'La merienda' },
  { key: 'cena',     name: 'Cena',     time: 21, art: 'La cena' },
];

// ---------- Bajar grasa: plan semanal día por día ----------
const FAT_WEEKEND = {
  desayuno: { title: 'Flexible pero controlado', items: ['Puede incluir algo dulce chico', 'Siempre acompañado de proteína'] },
  almuerzo: { title: 'Flexible y consciente', items: ['Proteína principal (carne / pollo / pescado)', 'Verduras siempre presentes', 'Carbohidratos solo si hubo entrenamiento fuerte'] },
  merienda: { title: 'Igual que entre semana', items: ['Proteína + grasas buenas', 'Sin harinas ni azúcar'] },
  cena:     { title: 'Flexible sin carbos', items: ['Proteína: carne, pollo o pescado', 'Verduras siempre presentes', 'Evitar harinas, pan, arroz, papa y fideos'] },
};
const FAT_PLAN = {
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
  6: FAT_WEEKEND,
  0: FAT_WEEKEND,
};

// ---------- Guías para el resto de los objetivos (iguales todos los días, con opciones) ----------
const SAME = (plan) => ({ 0: plan, 1: plan, 2: plan, 3: plan, 4: plan, 5: plan, 6: plan });

const NUTRITION = {
  grasa: {
    plan: FAT_PLAN,
    habits: ['agua_manana', 'caminata', 'cena_sin_carbos', 'sin_azucar'],
    rules: [
      'Priorizar proteínas en todas las comidas.',
      'Verduras libres (crudas o cocidas).',
      'Carbohidratos solo hasta la tarde (idealmente antes de las 18–19 hs).',
      'Grasas buenas controladas (aceite de oliva, huevos, frutos secos).',
      'En la cena NO se consumen carbohidratos: nada de pan, arroz, papa, fideos ni harinas.',
      'La merienda es proteína + grasas buenas, sin harinas.',
      'Caminata suave de 20–30 min después del almuerzo.',
      'Al levantarse, 1 vaso grande de agua. Hidratación constante.',
      'Evitar saltear comidas. Alarmas para las comidas principales.',
      'Moverse todos los días. Constancia antes que intensidad.',
    ],
  },
  recomp: {
    plan: SAME({
      desayuno: { title: 'Proteína + carbo integral', items: ['2–3 huevos o yogur griego', 'Avena o pan integral (porción chica)', 'Fruta'] },
      almuerzo: { title: 'Plato completo', items: ['Proteína: pollo, carne magra, pescado o legumbres (palma de la mano y media)', 'Carbohidrato: arroz, papa o pasta (1 puño)', 'Verduras: medio plato'] , tip: 'Si entrenás a la tarde, este es el momento de los carbohidratos.' },
      merienda: { title: 'Proteína', items: ['Yogur griego o queso magro', 'Frutos secos (puñado)', 'O batido proteico si entrenás'] },
      cena:     { title: 'Proteína + verduras', items: ['Proteína', 'Verduras abundantes', 'Carbohidrato chico solo si entrenaste a la noche'] },
    }),
    habits: ['proteina', 'caminata', 'sin_azucar', 'sueno'],
    rules: [
      'Proteína en todas las comidas: es lo que permite ganar músculo mientras bajás grasa.',
      'Un déficit chico: no hace falta pasar hambre.',
      'Los carbohidratos, alrededor del entrenamiento.',
      'Dormir 7–8 horas: la recuperación es la mitad del progreso.',
      'Caminar todos los días suma sin cansarte para entrenar.',
    ],
  },
  masa: {
    plan: SAME({
      desayuno: { title: 'Desayuno fuerte', items: ['Avena con leche y banana', '2–3 huevos', 'O tostadas integrales con palta y huevo'] },
      almuerzo: { title: 'Plato abundante', items: ['Proteína: 150–200 g de pollo, carne, pescado o legumbres', 'Carbohidrato generoso: arroz, papa, pasta, batata', 'Verduras + 1 cda de aceite de oliva'] },
      merienda: { title: 'Snack con proteína', items: ['Yogur griego con granola o avena y fruta', 'O sándwich integral de pollo, atún o huevo', 'O batido de leche, banana y avena (con proteína si usás)'], tip: 'Si te cuesta comer más, sumá un snack extra con frutos secos.' },
      cena:     { title: 'Proteína + carbohidrato', items: ['Proteína', 'Carbohidrato moderado (arroz, papa, pasta)', 'Verduras'] },
    }),
    habits: ['agua_manana', 'proteina', 'comidas', 'sueno'],
    rules: [
      'Comer un poco más de lo que gastás: si el peso no sube en 2 semanas, sumá ~200 kcal (una fruta + un puñado de frutos secos).',
      'Proteína en cada comida.',
      'No saltear comidas: 4 comidas como mínimo.',
      'Carbohidratos antes y después de entrenar.',
      'Dormir 7–8 horas.',
      'Subir de peso despacio (0,25–0,5 kg por semana) para que sea músculo y no grasa.',
    ],
  },
  fuerza: {
    plan: SAME({
      desayuno: { title: 'Energía + proteína', items: ['Avena o pan integral', '2–3 huevos o yogur griego', 'Fruta'] },
      almuerzo: { title: 'Plato completo', items: ['Proteína: carne, pollo, pescado', 'Carbohidrato: arroz, papa, pasta', 'Verduras'] },
      merienda: { title: 'Pre o post entreno', items: ['Antes: banana, tostada con miel o una barrita', 'Después: yogur o batido + fruta'], tip: 'Entrenar con hambre te quita fuerza: comé algo 1–2 h antes.' },
      cena:     { title: 'Recuperación', items: ['Proteína', 'Carbohidrato moderado', 'Verduras'] },
    }),
    habits: ['proteina', 'comidas', 'sueno', 'agua_manana'],
    rules: [
      'Comer suficiente: en déficit la fuerza no sube.',
      'Proteína en cada comida.',
      'Carbohidratos antes de entrenar para rendir en las series pesadas.',
      'Dormir 7–9 horas: la fuerza depende mucho del descanso.',
    ],
  },
  resistencia: {
    plan: SAME({
      desayuno: { title: 'Carbohidratos + proteína', items: ['Avena, pan integral o frutas', 'Huevos o yogur', 'Café o mate'] },
      almuerzo: { title: 'Plato con energía', items: ['Carbohidrato: arroz, pasta, papa, legumbres', 'Proteína magra', 'Verduras'] },
      merienda: { title: 'Pre-entreno', items: ['Banana o fruta', 'Tostadas con miel o mermelada', 'Yogur'], tip: '1–2 horas antes de entrenar, algo liviano con carbohidratos.' },
      cena:     { title: 'Recuperación', items: ['Proteína', 'Carbohidrato si el entrenamiento fue largo', 'Verduras'] },
    }),
    habits: ['carbos_pre', 'movilidad', 'sueno', 'agua_manana'],
    rules: [
      'Los carbohidratos son tu combustible: no los evites en días de entrenamiento.',
      'Hidratate antes, durante y después. Si sudás mucho, sumá sales (una pizca de sal o bebida isotónica).',
      'Proteína para recuperar.',
      'Movilidad y estiramientos para evitar lesiones.',
    ],
  },
  salud: {
    plan: SAME({
      desayuno: { title: 'Equilibrado', items: ['Fruta', 'Yogur o huevos', 'Avena o pan integral'] },
      almuerzo: { title: 'El plato saludable', items: ['½ plato de verduras', '¼ de proteína', '¼ de carbohidrato integral'] },
      merienda: { title: 'Simple', items: ['Fruta + frutos secos', 'O yogur', 'Infusión sin azúcar'] },
      cena:     { title: 'Liviana', items: ['Proteína', 'Verduras', 'Porción chica de carbohidrato si tenés hambre'] },
    }),
    habits: ['caminata', 'verduras', 'sin_azucar', 'sueno'],
    rules: [
      'Comida casera la mayor parte del tiempo.',
      'Verduras en almuerzo y cena.',
      'Agua como bebida principal; evitar bebidas azucaradas.',
      'Moverte todos los días: 30 minutos de caminata u 8.000 pasos.',
      'Dormir 7–8 horas.',
    ],
  },
};

const HABIT_INFO = {
  agua_manana:     { name: 'Vaso de agua al levantarte', tip: 'Dejá un vaso o botella en la mesa de luz para tomarlo apenas te levantás.' },
  caminata:        { name: 'Caminata de 20–30′ (o 8.000 pasos)', tip: '20–30 minutos suaves después de almorzar ayudan a controlar el azúcar en sangre y suman a la quema de grasa.' },
  cena_sin_carbos: { name: 'Cena sin carbohidratos', tip: 'Proteína fuerte + verduras, y nada de pan, arroz, papa ni fideos a la noche.' },
  sin_azucar:      { name: 'Sin azúcar ni bebidas azucaradas', tip: 'Cambiá gaseosas y jugos por agua, soda o infusiones. Lo dulce, solo de vez en cuando.' },
  proteina:        { name: 'Proteína en cada comida', tip: 'Huevos, yogur griego, carne, pollo, pescado, queso o legumbres: algo de eso en cada comida.' },
  comidas:         { name: 'Hice todas mis comidas', tip: 'Si te cuesta llegar, sumá líquidos con calorías (licuado con leche y banana) o frutos secos.' },
  sueno:           { name: 'Dormí 7–8 horas', tip: 'Horario fijo para acostarte y pantallas lejos 30 minutos antes de dormir.' },
  carbos_pre:      { name: 'Comí carbohidratos antes de entrenar', tip: 'Una banana o tostadas 1–2 h antes del entrenamiento te dan energía para rendir.' },
  movilidad:       { name: 'Movilidad o estiramientos 10′', tip: '10 minutos de movilidad después de entrenar reducen molestias y lesiones.' },
  verduras:        { name: 'Verduras en almuerzo y cena', tip: 'Tené verduras ya lavadas y cortadas en la heladera para que sea fácil.' },
};

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

// Calorías y macros estimados (Mifflin-St Jeor). Devuelve null si faltan datos del perfil.
function calcTargets(p, objective, trainDays) {
  const w = Number(p.weight || p.startWeight), h = Number(p.height), a = Number(p.age);
  if (!w || !h || !a || !p.sex) return null;
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'm' ? 5 : -161);
  const factor = (ACTIVITY[p.activity]?.f || 1.35) + 0.03 * (trainDays || 3);
  const obj = OBJECTIVES[objective] || OBJECTIVES.salud;
  const kcal = Math.round((bmr * factor * (1 + obj.kcal)) / 10) * 10;
  // Con sobrepeso, la proteína se calcula sobre un peso de referencia (IMC 25) para no exagerar
  const refW = Math.min(w, 25 * (h / 100) ** 2);
  const protein = Math.round(obj.prot * refW);
  const fat = Math.round(0.9 * refW);
  const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs, tdee: Math.round(bmr * factor) };
}
