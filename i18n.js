// Idiomas. El español es el idioma base: todo el código y los datos guardados están en español.
// En portugués:
//   tx('texto')  → traduce textos de la interfaz (UI_PT)
//   applyPT()    → reemplaza en memoria ejercicios, rutina, alimentos y comidas por su versión en portugués

const LANG_KEY = 'forma:lang';
const LANGS = { es: 'Español', pt: 'Português' };
const LANG = (() => {
  try { const v = localStorage.getItem(LANG_KEY); if (LANGS[v]) return v; } catch { /* sin storage */ }
  return /^pt/i.test(navigator.language || '') ? 'pt' : 'es';
})();
const LOCALE = LANG === 'pt' ? 'pt-BR' : 'es-AR';
const DAY_NAMES = LANG === 'pt'
  ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WD_LETTERS = LANG === 'pt' ? 'STQQSSD' : 'LMXJVSD'; // lunes → domingo

const UI_PT = {
  'No se pudo guardar': 'Não foi possível salvar', 'Ajustes': 'Ajustes', 'Cómo se hace': 'Como se faz', 'Entreno': 'Treino',
  'Hoy es día de descanso': 'Hoje é dia de descanso', 'Hoy toca {d}': 'Hoje é dia de {d}', 'Variante {v}': 'Variação {v}',
  '{n} ejercicios': '{n} exercícios', 'Tocá el número para marcarlo como hecho y el nombre para ver cómo se hace.': 'Toque no número para marcar como feito e no nome para ver como se faz.',
  'Consejos': 'Dicas', 'ver': 'ver', 'Comida': 'Comida', 'Hoy': 'Hoje', 'proteína': 'proteína', 'comidas': 'refeições',
  'Verduras para elegir: {v}': 'Verduras para escolher: {v}', 'Carnes, arroz, fideos y porotos pesados en crudo.': 'Carnes, arroz, macarrão e feijão pesados crus.',
  'Compras': 'Compras', 'Para ~{k} kcal por día': 'Para ~{k} kcal por dia', 'Semana': 'Semana', 'Mes': 'Mês',
  '{a} de {b} en el carrito': '{a} de {b} no carrinho', 'Desmarcar todo': 'Desmarcar tudo',
  'Cantidades aproximadas según tu plan de comidas, redondeadas para arriba al envase.': 'Quantidades aproximadas segundo seu plano de refeições, arredondadas para cima pela embalagem.',
  'técnica ejercicio': 'execução exercício', 'Posición inicial ↔ final': 'Posição inicial ↔ final', 'Sin imagen para este ejercicio': 'Sem imagem para este exercício',
  'Ver videos en YouTube': 'Ver vídeos no YouTube', 'Idioma': 'Idioma', 'Calorías por día': 'Calorias por dia',
  'Las porciones del plan y la lista de compras se ajustan a este número.': 'As porções do plano e a lista de compras se ajustam a este número.',
  'Guardar': 'Salvar', 'Imágenes de ejercicios: Free Exercise DB (dominio público).': 'Imagens dos exercícios: Free Exercise DB (domínio público).',
  'Ingresá un número entre 1500 y 5000': 'Informe um número entre 1500 e 5000', 'Plan ajustado a {k} kcal': 'Plano ajustado para {k} kcal',
};

function tx(key, vars) {
  let s = LANG === 'pt' ? (UI_PT[key] ?? key) : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

// Textos sueltos de los datos (repeticiones especiales de la rutina)
const TR_PT = { '10 c/pierna': '10 c/perna' };
const tr = (s) => (LANG === 'pt' && TR_PT[s] !== undefined ? TR_PT[s] : s);

/* ---------- Catálogo de ejercicios en portugués ---------- */
const CATALOG_PT = {
  banco_plano: ['Supino reto com barra', 'Escápulas juntas e apoiadas, pés firmes. Desça a barra controlada até o peito (na altura dos mamilos) e empurre sem tirar o quadril do banco.'],
  press_banca_manc: ['Supino reto com halteres', 'Halteres na altura do peito, cotovelos a ~45° do corpo. Empurre para cima aproximando-os em cima, sem bater.'],
  banco_inclinado: ['Supino inclinado com barra', 'Banco a 30–45°. Desça a barra até a parte alta do peito e empurre em linha reta. Trabalha mais a parte superior do peito.'],
  press_inclinado_manc: ['Supino inclinado com halteres', 'Banco a 30–45°. Desça os halteres ao lado da parte alta do peito e empurre para cima. Em casa, apoie as costas numa almofada alta.'],
  banco_declinado: ['Supino declinado com barra', 'Banco declinado com as pernas travadas. Desça a barra até a parte baixa do peito e empurre. Trabalha a parte inferior do peito.'],
  declinado_manc: ['Supino declinado com halteres', 'Igual ao declinado com barra, mas com halteres: mais amplitude e cada braço trabalha separado.'],
  press_suelo_manc: ['Supino no chão com halteres', 'Deitado no chão com joelhos flexionados. Desça até os cotovelos tocarem o chão de leve e empurre. Ideal se não tiver banco.'],
  press_hammer_pecho: ['Supino na máquina', 'Ajuste o banco para as pegadas ficarem na altura do peito. Empurre sem travar totalmente os cotovelos e volte devagar.'],
  press_svend: ['Svend press (com anilha)', 'Aperte uma anilha entre as palmas na altura do peito e, sem parar de apertar, estenda os braços para frente e volte devagar.'],
  apertura_manc: ['Crucifixo com halteres', 'Cotovelos levemente flexionados e fixos. Abra os braços em arco até sentir o alongamento do peito e feche como se abraçasse uma árvore.'],
  mariposa: ['Voador (peck deck)', 'Costas apoiadas, cotovelos na altura dos ombros. Feche os braços à frente apertando o peito e abra controlado.'],
  contractor_un_brazo: ['Voador unilateral', 'Na máquina voador, um braço de cada vez com as costas apoiadas. Feche até o centro e volte devagar.'],
  cruces_polea: ['Crossover (alto, médio e baixo)', 'Um passo à frente, tronco levemente inclinado. Junte as mãos à frente em arco com cotovelos semiflexionados. Varie a altura da polia para cada parte do peito.'],
  fondos_paralelas: ['Mergulho nas paralelas', 'Tronco inclinado para frente para focar o peito. Desça até os ombros ficarem na altura dos cotovelos e suba.'],
  flexiones: ['Flexão de braço', 'Mãos um pouco mais abertas que os ombros, corpo reto da cabeça aos calcanhares. Desça o peito quase até o chão e empurre. Se for difícil, apoie os joelhos.'],
  flexiones_inclinadas: ['Flexão inclinada (mãos elevadas)', 'Mãos sobre uma mesa, cadeira ou degrau. Mais fácil que a flexão normal: ideal para começar.'],
  flexiones_declinadas: ['Flexão declinada (pés elevados)', 'Pés sobre uma cadeira ou cama. Mais difícil que a flexão normal e trabalha mais a parte alta do peito e os ombros.'],
  dominadas: ['Barra fixa', 'Pegada pronada um pouco mais aberta que os ombros. Suba levando o peito à barra e desça completo. Se não sair, use elástico ou máquina assistida.'],
  dominadas_supinas: ['Barra fixa supinada (chin-up)', 'Palmas para você, na largura dos ombros. Suba até passar o queixo da barra. Trabalha muito o bíceps também.'],
  jalon_pecho: ['Puxada frontal', 'Pegada aberta, peito para cima. Leve a barra até a parte alta do peito puxando os cotovelos para baixo e volte controlado.'],
  dorsalera_tras_nuca: ['Puxada por trás da nuca', 'Pegada aberta, desça a barra atrás da cabeça sem forçar o pescoço. Se incomodar o ombro, faça pela frente.'],
  dorsalera_cerrado: ['Puxada com pegada fechada', 'Pegada fechada (triângulo ou barra). Leve as mãos ao peito com os cotovelos colados ao corpo.'],
  dorsal_un_brazo_atras: ['Puxada unilateral (duplo rebote)', 'Um braço de cada vez, puxe o cotovelo para baixo e para trás. Duplo rebote: duas meias repetições embaixo antes de voltar.'],
  dorsal_un_brazo_costado: ['Puxada unilateral de lado', 'Em pé de lado para a polia, puxe com um braço na diagonal em direção ao quadril.'],
  remo_barra: ['Remada curvada com barra', 'Tronco inclinado ~45°, costas retas. Leve a barra ao umbigo apertando as escápulas e desça controlado.'],
  remo_barra_t: ['Remada cavalinho (barra T)', 'Peito aberto, costas neutras. Puxe a barra em direção ao abdômen com os cotovelos colados.'],
  remo_polea: ['Remada sentada na polia', 'Costas retas, sem balançar. Leve a pegada ao abdômen apertando as escápulas e estenda os braços devagar.'],
  remo_un_brazo: ['Remada unilateral com halter', 'Mão e joelho apoiados num banco ou cadeira. Suba o halter em direção ao quadril, cotovelo colado ao corpo.'],
  serrucho: ['Remada serrote', 'Como a remada unilateral, com um percurso longo em direção ao quadril, como se estivesse serrando.'],
  remo_manc_dos: ['Remada curvada com halteres', 'Tronco inclinado e costas retas. Leve os dois halteres à cintura apertando as costas.'],
  remo_hammer: ['Remada na máquina', 'Peito contra o apoio. Puxe as pegadas levando os cotovelos para trás e aperte as escápulas.'],
  remo_invertido: ['Remada invertida (debaixo da mesa)', 'Deitado debaixo de uma mesa firme, segure na borda e suba o peito até ela com o corpo reto. Flexione os joelhos para facilitar.'],
  pullover_polea_soga: ['Pulldown com corda (braços estendidos)', 'Braços quase retos, leve a corda de cima até as coxas em arco, sentindo os dorsais.'],
  pullover_manc: ['Pullover com halter', 'Deitado, halter sobre o peito. Leve-o para trás da cabeça com os cotovelos levemente flexionados e volte.'],
  superman: ['Super-homem', 'De barriga para baixo, levante ao mesmo tempo braços, peito e pernas alguns centímetros. Segure 2 segundos e desça.'],
  hiperextensiones: ['Hiperextensão lombar', 'Quadril sobre o apoio, desça o tronco com as costas retas e suba até ficar alinhado, sem passar para trás.'],
  encogimiento_manc: ['Encolhimento com halteres', 'Braços estendidos, suba os ombros em direção às orelhas, pausa em cima e desça. Sem girar os ombros.'],
  encogimiento_hammer: ['Encolhimento na máquina', 'Igual ao com halteres, mas na máquina: suba os ombros, pausa e desça devagar.'],
  encogimiento_smith: ['Encolhimento no Smith', 'Barra do Smith atrás ou na frente do corpo. Suba os ombros e desça controlado.'],
  press_militar: ['Desenvolvimento militar com barra', 'Em pé, glúteos e abdômen firmes. Empurre a barra da clavícula até acima da cabeça sem arquear as costas.'],
  press_hombros_manc: ['Desenvolvimento com halteres', 'Sentado ou em pé, halteres na altura das orelhas. Empurre para cima sem bater e desça controlado.'],
  press_arnold: ['Desenvolvimento Arnold', 'Comece com as palmas para você na altura do queixo e gire os punhos enquanto empurra para cima.'],
  press_hombros_smith: ['Desenvolvimento no Smith', 'Sentado embaixo da barra do Smith. Desça até o queixo e empurre para cima.'],
  press_hombros_hammer: ['Desenvolvimento na máquina', 'Ajuste o banco com as pegadas na altura dos ombros. Empurre para cima e desça devagar.'],
  vuelos_laterales: ['Elevação lateral com halteres', 'Cotovelos levemente flexionados. Suba os braços para os lados até a altura dos ombros, como se servisse uma jarra, e desça devagar.'],
  lateral_polea_baja: ['Elevação lateral na polia baixa', 'De lado para a polia, suba o braço até a altura do ombro. A polia mantém a tensão em todo o percurso.'],
  elevaciones_frontales: ['Elevação frontal', 'Suba os halteres à frente até a altura dos olhos com os braços quase retos e desça controlado.'],
  posteriores_manc: ['Crucifixo inverso com halteres', 'Tronco inclinado para frente, abra os braços para os lados apertando a parte de trás do ombro.'],
  posteriores_maquina: ['Crucifixo inverso na máquina', 'No voador inverso, peito no encosto. Abra os braços para trás e volte devagar.'],
  posteriores_soga: ['Face pull (corda)', 'Polia na altura do rosto. Puxe a corda em direção aos olhos separando as mãos e abrindo os cotovelos.'],
  w_a_la_pera: ['Remada alta', 'Barra colada ao corpo, suba até o peito levando os cotovelos para cima e para fora. Não suba mais se incomodar o ombro.'],
  flexiones_pica: ['Flexão pike', 'Quadril bem alto formando um V invertido. Desça a cabeça em direção ao chão entre as mãos e empurre. Trabalha os ombros sem pesos.'],
  curl_barra: ['Rosca direta com barra', 'Cotovelos colados ao corpo e parados. Suba a barra sem balançar o tronco e desça devagar.'],
  curl_manc: ['Rosca direta com halteres', 'Cotovelos fixos ao lado, suba os halteres girando as palmas para cima e desça controlado.'],
  curl_alternado: ['Rosca alternada com halter', 'Um braço de cada vez, suba girando a palma para cima. Sem balançar.'],
  curl_martillo: ['Rosca martelo', 'Palmas viradas uma para a outra em todo o percurso. Trabalha bíceps e antebraço.'],
  curl_concentrado: ['Rosca concentrada', 'Sentado, cotovelo apoiado na parte interna da coxa. Suba o halter devagar apertando em cima.'],
  scott_barra_w: ['Rosca Scott', 'Braços apoiados no banco Scott. Suba a barra W e desça devagar sem estender o cotovelo de uma vez.'],
  biceps_barra_espinales: ['Rosca no banco inclinado de bruços', 'Peito apoiado num banco inclinado, braços pendurados. Suba a barra sem mexer os cotovelos.'],
  curl_smith: ['Rosca no Smith', 'Como a rosca com barra, mas na barra do Smith. Cotovelos colados e sem balanço.'],
  curl_hammer: ['Rosca na máquina', 'Braços apoiados no apoio, suba apertando o bíceps e desça devagar.'],
  triceps_polea: ['Tríceps na polia', 'Cotovelos colados ao corpo e parados. Empurre a barra para baixo até estender os braços e volte até 90°.'],
  triceps_soga: ['Tríceps corda', 'Como o tríceps na polia, separando as pontas da corda embaixo.'],
  triceps_agarre_remo: ['Tríceps com pegada em V', 'Pegada em V, corpo levemente inclinado. Empurre para baixo com os cotovelos fixos.'],
  ext_triceps_polea_baja: ['Tríceps francês na polia baixa', 'De costas para a polia baixa, estenda os braços acima da cabeça.'],
  triceps_tras_nuca: ['Tríceps francês com halter', 'Halter atrás da cabeça com os cotovelos apontando para o teto. Estenda os braços para cima e desça devagar.'],
  press_frances: ['Tríceps testa', 'Deitado, barra acima do peito. Desça flexionando só os cotovelos em direção à testa e estenda.'],
  patada_triceps: ['Tríceps coice', 'Tronco inclinado, cotovelo colado ao corpo e alto. Estenda o braço para trás e volte.'],
  press_triceps_smith: ['Supino fechado no Smith', 'Pegada na largura dos ombros, cotovelos colados. Desça até a parte baixa do peito e empurre.'],
  fondos_hammer: ['Mergulho na máquina', 'Sentado, empurre as pegadas para baixo até estender os braços e volte controlado.'],
  fondos_banco: ['Mergulho no banco ou cadeira', 'Mãos na borda de uma cadeira firme atrás de você. Desça flexionando os cotovelos para trás e empurre.'],
  flexiones_cerradas: ['Flexão fechada (diamante)', 'Mãos juntas embaixo do peito, cotovelos colados ao corpo. Foca o tríceps.'],
  sentadilla_barra: ['Agachamento livre com barra', 'Barra sobre o trapézio, pés na largura dos ombros. Desça sentando para trás com o peito para cima até pelo menos a paralela e suba empurrando o chão.'],
  sentadilla_goblet: ['Agachamento goblet', 'Halter seguro contra o peito. Desça com o tronco ereto e os cotovelos entre os joelhos.'],
  sentadilla_manc: ['Agachamento com halteres', 'Halteres ao lado do corpo, desça como no agachamento normal mantendo as costas retas.'],
  sentadilla_libre: ['Agachamento com peso corporal', 'Braços à frente, desça levando o quadril para trás como se sentasse numa cadeira. Joelhos na direção dos pés.'],
  hack_squat: ['Agachamento hack', 'Costas apoiadas na máquina, pés no meio da plataforma. Desça fundo e suba sem travar os joelhos.'],
  prensa: ['Leg press', 'Pés na largura dos ombros. Desça até ~90° de joelho sem tirar o quadril do banco e empurre com os calcanhares.'],
  prensa_boca_arriba: ['Leg press vertical', 'Deitado de barriga para cima embaixo da plataforma. Percursos curtos e controlados.'],
  sissy: ['Sissy squat', 'Segurando num apoio, incline-se para trás dobrando os joelhos para frente. Muito focado no quadríceps.'],
  zancadas_manc: ['Afundo com halteres', 'Passo longo à frente, desça o joelho de trás quase até o chão e volte. Tronco ereto.'],
  zancadas: ['Afundo', 'Passo longo, desça até os dois joelhos ficarem a 90° e empurre com a perna da frente.'],
  bulgara: ['Agachamento búlgaro / afundo', 'Um pé atrás (sobre um banco ou cadeira para o búlgaro). Desça na vertical e suba com a perna da frente.'],
  split_squat: ['Afundo estático sem peso', 'Pernas separadas à frente e atrás, desça o joelho de trás na vertical em direção ao chão e suba.'],
  step_up_manc: ['Subida no banco (step-up)', 'Suba num degrau ou banco firme empurrando com a perna de cima, sem tomar impulso com a de baixo.'],
  sentadilla_salto: ['Agachamento com salto', 'Desça no agachamento e salte explosivo. Aterrisse suave flexionando os joelhos.'],
  banco_cuadriceps: ['Cadeira extensora', 'Sentado na máquina, estenda as pernas até em cima, pausa e desça devagar.'],
  banco_femorales: ['Mesa flexora', 'De bruços, leve os calcanhares em direção ao glúteo sem levantar o quadril e desça devagar.'],
  curl_femoral_sentado: ['Cadeira flexora', 'Sentado, flexione os joelhos levando o rolo para baixo e volte controlado.'],
  aductor: ['Cadeira adutora', 'Feche as pernas contra os apoios apertando a parte interna da coxa e abra devagar.'],
  isometrico_cuadriceps: ['Agachamento isométrico na parede', 'Costas contra a parede, desça até os joelhos ficarem a 90° e sustente a posição.'],
  peso_muerto: ['Levantamento terra', 'Barra colada às canelas, costas neutras. Empurre o chão com as pernas e estenda o quadril. A barra sobe colada ao corpo.'],
  peso_muerto_rumano: ['Stiff / terra romeno', 'Joelhos levemente flexionados, leve o quadril para trás descendo a barra colada às pernas até sentir os posteriores. Costas retas.'],
  rumano_manc: ['Stiff com halteres', 'Como o stiff com barra: quadril para trás, costas retas, halteres perto das pernas.'],
  hip_thrust: ['Elevação pélvica (hip thrust)', 'Parte alta das costas apoiada num banco, barra sobre o quadril. Suba o quadril apertando os glúteos até ficar reto e desça.'],
  puente_gluteo: ['Ponte de glúteos', 'De barriga para cima, joelhos flexionados. Suba o quadril apertando os glúteos, pausa e desça. Pode colocar um halter sobre o quadril.'],
  puente_una_pierna: ['Ponte de glúteo unilateral', 'Como a ponte, com uma perna estendida no ar. Mais difícil e trabalha também os posteriores.'],
  patada_gluteo: ['Coice de glúteo', 'Em quatro apoios, leve uma perna para trás e para cima apertando o glúteo, sem arquear as costas.'],
  gemelos_maquina: ['Panturrilha na máquina', 'Suba na ponta dos pés o mais alto possível, pausa em cima e desça alongando bem o calcanhar.'],
  gemelos_smith: ['Panturrilha no Smith', 'Pontas dos pés sobre uma anilha ou degrau, barra nas costas. Suba e desça com amplitude completa.'],
  gemelos_manc: ['Panturrilha com halteres', 'Halteres ao lado do corpo, pontas sobre um degrau. Suba na ponta dos pés e desça devagar.'],
  gemelos_pie: ['Elevação de panturrilha', 'Num degrau, suba na ponta dos pés e desça o calcanhar abaixo do degrau. Pode fazer com uma perna.'],
  plancha: ['Prancha', 'Antebraços apoiados, corpo reto da cabeça aos calcanhares. Aperte abdômen e glúteos sem deixar o quadril cair.'],
  plancha_lateral: ['Prancha lateral', 'De lado sobre um antebraço, quadril para cima e corpo em linha reta. Sustente e troque de lado.'],
  crunch: ['Abdominal (crunch)', 'Joelhos flexionados, tire os ombros do chão apertando o abdômen. Não puxe o pescoço.'],
  elevacion_piernas: ['Elevação de pernas deitado', 'Deitado, pernas quase retas. Suba até 90° e desça devagar sem tirar a lombar do chão.'],
  elevacion_piernas_colgado: ['Elevação de pernas na barra', 'Pendurado na barra, suba os joelhos ou as pernas em direção ao peito sem balançar.'],
  dead_bug: ['Dead bug', 'De barriga para cima, braços e joelhos para cima. Estenda braço e perna opostos sem tirar a lombar do chão.'],
  russian_twist: ['Giro russo', 'Sentado com o tronco inclinado e os pés apoiados ou no ar. Gire o tronco de um lado para o outro.'],
  rueda_abdominal: ['Roda abdominal', 'De joelhos, role para frente com o abdômen contraído e volte sem arquear as costas.'],
  crunch_polea: ['Abdominal na polia', 'De joelhos de frente para a polia alta, flexione o tronco levando os cotovelos às coxas.'],
  burpees: ['Burpees', 'Agache, apoie as mãos, leve os pés para trás em prancha, volte e salte com os braços para cima.'],
  jumping_jacks: ['Polichinelo', 'Salte abrindo pernas e braços ao mesmo tempo e volte a fechar. Ritmo constante.'],
  mountain_climbers: ['Escalador (mountain climber)', 'Em posição de prancha alta, leve os joelhos ao peito alternando rápido.'],
  saltar_soga: ['Pular corda', 'Saltos curtos na ponta dos pés, punhos girando a corda. Comece com intervalos de 30–60 s.'],
  rodillas_altas: ['Skipping (joelhos altos)', 'Corra no lugar subindo os joelhos até a altura do quadril e movendo os braços.'],
  kb_swing: ['Swing com kettlebell', 'Dobradiça de quadril: leve o peso entre as pernas e projete à frente com um golpe de quadril, não com os braços.'],
  remo_ergometro: ['Remo ergômetro', 'Empurre primeiro com as pernas, depois incline para trás e puxe com os braços. Volte na ordem inversa.'],
  bici_fija: ['Bicicleta ergométrica', 'Banco na altura do quadril. Ritmo constante ou intervalos.'],
  cinta: ['Esteira (caminhar ou correr)', 'Caminhada inclinada ou trote leve. Olhe para frente e não se segure nas laterais.'],
};

const FOODS_PT = {
  avena: ['Aveia', 'pacote de 500 g'], pan: ['Pão integral', 'pacote de 500 g'], arroz: ['Arroz (cru)', 'pacote de 1 kg'],
  porotos: ['Feijão (cru)', 'pacote de 1 kg'], pasta: ['Macarrão seco', 'pacote de 500 g'], pollo: ['Peito de frango (cru)', 'kg'],
  carne: ['Carne bovina magra (crua)', 'kg'], picada: ['Carne moída magra (crua)', 'kg'], pescado: ['Peixe branco (cru)', 'kg'],
  atun: ['Atum em lata', 'latas'], huevo: ['Ovos', 'cartela de 30'], leche: ['Leite', 'caixa de 1 L'], yogur: ['Iogurte natural', 'pote de 1 kg'],
  queso: ['Queijo', 'pacote de 250 g'], banana: ['Bananas', 'unidades'], fruta: ['Fruta (maçã, laranja…)', 'unidades'],
  palta: ['Abacate', 'abacate de ~200 g'], papa: ['Batata', 'kg'], verduras: ['Verduras variadas', 'kg'], aceite: ['Azeite de oliva', 'garrafa de 500 ml'],
  mani: ['Pasta de amendoim', 'pote de ~350 g'], frutos: ['Castanhas', 'pacote de 200 g'], miel: ['Mel', 'pote de 500 g'], salsa: ['Molho de tomate', 'caixa de ~340 g'],
};
const MENUS_PT = {
  desayuno: { A: 'Aveia com leite e banana', B: 'Ovos com torradas' },
  almuerzo: { A: 'Arroz, feijão e frango', B: 'Macarrão com carne moída', C: 'Arroz com carne' },
  merienda: { A: 'Iogurte com aveia e castanhas', B: 'Sanduíche de atum' },
  cena: { A: 'Frango com arroz e abacate', B: 'Peixe com batatas', C: 'Omelete com pão' },
};

function applyPT() {
  const names = { pecho: 'Peito', espalda: 'Costas', hombros: 'Ombros', biceps: 'Bíceps', triceps: 'Tríceps', piernas: 'Pernas', gluteos: 'Glúteos', gemelos: 'Panturrilhas', core: 'Abdômen', cardio: 'Cardio' };
  for (const [k, n] of Object.entries(names)) MUSCLES[k].name = n;
  Object.assign(EQUIP, { barra: 'Barra', mancuernas: 'Halteres', maquina: 'Máquina', polea: 'Polia', cuerpo: 'Peso corporal', kettlebell: 'Kettlebell / halter', barra_dom: 'Barra fixa', otro: 'Outro' });
  for (const [id, [name, cue]] of Object.entries(CATALOG_PT)) if (CATALOG[id]) Object.assign(CATALOG[id], { name, cue });
  for (const [id, [name, label]] of Object.entries(FOODS_PT)) { FOODS[id].name = name; FOODS[id].buy[1] = label; }
  Object.assign(FOOD_CATS, { prot: 'Proteínas', lact: 'Laticínios e ovos', carb: 'Cereais, pães e leguminosas', veg: 'Frutas e verduras', otros: 'Outros' });
  const meals = { desayuno: 'Café da manhã', almuerzo: 'Almoço', merienda: 'Lanche', cena: 'Jantar' };
  for (const m of MEALS) m.name = meals[m.key];
  for (const [meal, opts] of Object.entries(MENUS_PT)) for (const [k, n] of Object.entries(opts)) MENUS[meal][k].name = n;
  VEGGIE_IDEAS = 'Brócolis, cenoura, tomate, alface, abobrinha, cebola, espinafre, pimentão.';
  Object.assign(ROUTINE.pt, { name: 'Peito · Tríceps', short: 'PT' });
  Object.assign(ROUTINE.ph, { name: 'Pernas · Ombros', short: 'PO' });
  Object.assign(ROUTINE.eb, { name: 'Costas · Bíceps', short: 'CB' });
  ROUTINE_NOTES.splice(0, ROUTINE_NOTES.length,
    'Aqueça 5–10 minutos e faça 1–2 séries leves do primeiro exercício.',
    'Descanse 2–3 minutos nos exercícios pesados e 60–90 segundos no resto.',
    'Quando completar todas as séries no topo da faixa, aumente o peso.');
}
if (LANG === 'pt') applyPT();
