// Plan de alimentación (~3000 kcal por defecto) y datos para la lista de compras.
// Valores aproximados por 100 g / 100 ml (u = por unidad). Pesos de carnes, arroz, pasta y legumbres en crudo.

const FOOD_CATS = {
  prot: 'Proteínas',
  lact: 'Lácteos y huevos',
  carb: 'Cereales, pan y legumbres',
  veg: 'Frutas y verduras',
  otros: 'Otros',
};

// unit: g | ml | u ; kcal y p (proteína) por 100 g/ml o por unidad ; buy: tamaño del envase en la misma unidad
const FOODS = {
  avena:      { name: 'Avena',                       cat: 'carb',  unit: 'g',  kcal: 389, p: 16.9, buy: [500, 'paquete de 500 g'] },
  pan:        { name: 'Pan integral',                cat: 'carb',  unit: 'g',  kcal: 250, p: 9,    buy: [500, 'paquete de 500 g'] },
  arroz:      { name: 'Arroz (crudo)',               cat: 'carb',  unit: 'g',  kcal: 360, p: 7,    buy: [1000, 'bolsa de 1 kg'] },
  porotos:    { name: 'Porotos / feijão (crudo)',    cat: 'carb',  unit: 'g',  kcal: 340, p: 21,   buy: [1000, 'bolsa de 1 kg'] },
  pasta:      { name: 'Fideos secos',                cat: 'carb',  unit: 'g',  kcal: 371, p: 13,   buy: [500, 'paquete de 500 g'] },
  pollo:      { name: 'Pechuga de pollo (cruda)',    cat: 'prot',  unit: 'g',  kcal: 120, p: 23,   buy: [1000, 'kg'] },
  carne:      { name: 'Carne vacuna magra (cruda)',  cat: 'prot',  unit: 'g',  kcal: 150, p: 21.5, buy: [1000, 'kg'] },
  picada:     { name: 'Carne picada magra (cruda)',  cat: 'prot',  unit: 'g',  kcal: 150, p: 21,   buy: [1000, 'kg'] },
  pescado:    { name: 'Pescado blanco (crudo)',      cat: 'prot',  unit: 'g',  kcal: 96,  p: 20,   buy: [1000, 'kg'] },
  atun:       { name: 'Atún en lata',                cat: 'prot',  unit: 'u',  kcal: 140, p: 30,   buy: [1, 'latas'] },
  huevo:      { name: 'Huevos',                      cat: 'lact',  unit: 'u',  kcal: 72,  p: 6.3,  buy: [30, 'maple de 30'] },
  leche:      { name: 'Leche',                       cat: 'lact',  unit: 'ml', kcal: 61,  p: 3.2,  buy: [1000, 'cartón de 1 L'] },
  yogur:      { name: 'Yogur natural',               cat: 'lact',  unit: 'g',  kcal: 70,  p: 5,    buy: [1000, 'envase de 1 kg'] },
  queso:      { name: 'Queso',                       cat: 'lact',  unit: 'g',  kcal: 300, p: 22,   buy: [250, 'paquete de 250 g'] },
  banana:     { name: 'Bananas',                     cat: 'veg',   unit: 'u',  kcal: 105, p: 1.3,  buy: [1, 'unidades'] },
  fruta:      { name: 'Fruta (manzana, naranja…)',   cat: 'veg',   unit: 'u',  kcal: 80,  p: 0.5,  buy: [1, 'unidades'] },
  palta:      { name: 'Palta',                       cat: 'veg',   unit: 'g',  kcal: 160, p: 2,    buy: [200, 'palta de ~200 g'] },
  papa:       { name: 'Papa',                        cat: 'veg',   unit: 'g',  kcal: 77,  p: 2,    buy: [1000, 'kg'] },
  verduras:   { name: 'Verduras surtidas',           cat: 'veg',   unit: 'g',  kcal: 25,  p: 1.5,  buy: [1000, 'kg'] },
  aceite:     { name: 'Aceite de oliva',             cat: 'otros', unit: 'g',  kcal: 884, p: 0,    buy: [460, 'botella de 500 ml'] },
  mani:       { name: 'Pasta de maní',               cat: 'otros', unit: 'g',  kcal: 588, p: 25,   buy: [350, 'frasco de ~350 g'] },
  frutos:     { name: 'Frutos secos',                cat: 'otros', unit: 'g',  kcal: 600, p: 18,   buy: [200, 'bolsa de 200 g'] },
  miel:       { name: 'Miel',                        cat: 'otros', unit: 'g',  kcal: 304, p: 0.3,  buy: [500, 'frasco de 500 g'] },
  salsa:      { name: 'Salsa de tomate',             cat: 'otros', unit: 'g',  kcal: 30,  p: 1.3,  buy: [340, 'caja de ~340 g'] },
};

const MEALS = [
  { key: 'desayuno', name: 'Desayuno' },
  { key: 'almuerzo', name: 'Almuerzo' },
  { key: 'merienda', name: 'Merienda' },
  { key: 'cena',     name: 'Cena' },
];

// Menús base (para ~3000 kcal el día completo; después se escalan a la meta)
const MENUS = {
  desayuno: {
    A: { name: 'Avena con leche y banana', items: [['avena', 80], ['leche', 300], ['banana', 1], ['mani', 20]] },
    B: { name: 'Huevos con tostadas', items: [['huevo', 3], ['pan', 90], ['queso', 30], ['leche', 200], ['fruta', 1]] },
  },
  almuerzo: {
    A: { name: 'Arroz, porotos y pollo', items: [['arroz', 100], ['porotos', 50], ['pollo', 200], ['verduras', 200], ['aceite', 10]] },
    B: { name: 'Fideos con carne picada', items: [['pasta', 110], ['picada', 180], ['salsa', 100], ['verduras', 150], ['aceite', 10]] },
    C: { name: 'Arroz con carne', items: [['arroz', 100], ['carne', 200], ['verduras', 200], ['aceite', 10]] },
  },
  merienda: {
    A: { name: 'Yogur con avena y frutos secos', items: [['yogur', 200], ['avena', 40], ['frutos', 30], ['miel', 15]] },
    B: { name: 'Sándwich de atún', items: [['pan', 90], ['atun', 1], ['queso', 30], ['banana', 1]] },
  },
  cena: {
    A: { name: 'Pollo con arroz y palta', items: [['arroz', 80], ['pollo', 180], ['verduras', 200], ['palta', 70]] },
    B: { name: 'Pescado con papas', items: [['pescado', 200], ['papa', 300], ['verduras', 200], ['aceite', 10]] },
    C: { name: 'Omelette con pan', items: [['huevo', 4], ['pan', 60], ['queso', 30], ['verduras', 150]] },
  },
};

// Qué menú toca cada día de la semana (0 = domingo)
const WEEK_MENU = {
  1: { desayuno: 'A', almuerzo: 'A', merienda: 'A', cena: 'A' },
  2: { desayuno: 'B', almuerzo: 'B', merienda: 'B', cena: 'B' },
  3: { desayuno: 'A', almuerzo: 'C', merienda: 'A', cena: 'C' },
  4: { desayuno: 'B', almuerzo: 'A', merienda: 'B', cena: 'A' },
  5: { desayuno: 'A', almuerzo: 'B', merienda: 'A', cena: 'B' },
  6: { desayuno: 'B', almuerzo: 'C', merienda: 'B', cena: 'C' },
  0: { desayuno: 'A', almuerzo: 'A', merienda: 'A', cena: 'B' },
};

let VEGGIE_IDEAS = 'Brócoli, zanahoria, tomate, lechuga, zapallito, cebolla, espinaca, morrón.';

const foodKcal = (id, q) => (FOODS[id].unit === 'u' ? FOODS[id].kcal * q : (FOODS[id].kcal * q) / 100);
const foodProt = (id, q) => (FOODS[id].unit === 'u' ? FOODS[id].p * q : (FOODS[id].p * q) / 100);

// Redondeo amigable: unidades a 1 (½ para bananas/frutas), gramos a 5 (10 si es mucho), ml a 10
function roundQty(id, q) {
  const f = FOODS[id];
  if (f.unit === 'u') return id === 'huevo' || id === 'atun' ? Math.max(1, Math.round(q)) : Math.max(0.5, Math.round(q * 2) / 2);
  if (f.unit === 'ml') return Math.round(q / 10) * 10;
  return q >= 100 ? Math.round(q / 10) * 10 : Math.max(5, Math.round(q / 5) * 5);
}

// Plan del día escalado a la meta de calorías
function dayPlan(weekday, target) {
  const sel = WEEK_MENU[weekday];
  const raw = MEALS.map((m) => MENUS[m.key][sel[m.key]]);
  const base = raw.reduce((t, menu) => t + menu.items.reduce((a, [id, q]) => a + foodKcal(id, q), 0), 0);
  const k = target / base;
  const meals = MEALS.map((m, i) => {
    const items = raw[i].items.map(([id, q]) => ({ id, q: roundQty(id, q * k) }));
    return {
      key: m.key, name: m.name, title: raw[i].name, items,
      kcal: items.reduce((t, x) => t + foodKcal(x.id, x.q), 0),
      prot: items.reduce((t, x) => t + foodProt(x.id, x.q), 0),
    };
  });
  return { meals, kcal: meals.reduce((t, m) => t + m.kcal, 0), prot: meals.reduce((t, m) => t + m.prot, 0) };
}

// Lista de compras: suma de los 7 días (× semanas)
function shoppingList(target, weeks) {
  const tot = {};
  for (let wd = 0; wd < 7; wd++) for (const m of dayPlan(wd, target).meals) for (const x of m.items) tot[x.id] = (tot[x.id] || 0) + x.q;
  return Object.entries(tot).map(([id, q]) => {
    const f = FOODS[id];
    const qty = q * weeks;
    return { id, qty, packs: Math.ceil(qty / f.buy[0] - 0.05) || 1 };
  });
}
