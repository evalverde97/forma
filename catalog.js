// Catálogo de ejercicios. Imágenes: Free Exercise DB (dominio público, github.com/yuhonas/free-exercise-db),
// copiadas en img/ex/<img>/0.jpg y 1.jpg (posición inicial y final).
// eq: barra | mancuernas | maquina | polea | cuerpo | kettlebell | barra_dom (barra de dominadas) | otro

const MUSCLES = {
  pecho:    { name: 'Pecho',     color: '#FF7A59' },
  espalda:  { name: 'Espalda',   color: '#B78CFF' },
  hombros:  { name: 'Hombros',   color: '#FFD166' },
  biceps:   { name: 'Bíceps',    color: '#C6F432' },
  triceps:  { name: 'Tríceps',   color: '#9BE15D' },
  piernas:  { name: 'Piernas',   color: '#5AC8FA' },
  gluteos:  { name: 'Glúteos',   color: '#FF8FB1' },
  gemelos:  { name: 'Gemelos',   color: '#7DD3FC' },
  core:     { name: 'Abdomen',   color: '#F0ABFC' },
  cardio:   { name: 'Cardio',    color: '#4ADE80' },
};

const EQUIP = {
  barra: 'Barra', mancuernas: 'Mancuernas', maquina: 'Máquina', polea: 'Polea',
  cuerpo: 'Peso corporal', kettlebell: 'Kettlebell / mancuerna', barra_dom: 'Barra de dominadas', otro: 'Otro',
};

// Qué equipamiento hay según dónde entrena la persona
const PLACES = {
  gym:        { name: 'Gimnasio', desc: 'Máquinas, poleas, barras y mancuernas', eq: ['barra', 'mancuernas', 'maquina', 'polea', 'cuerpo', 'kettlebell', 'barra_dom', 'otro'] },
  mancuernas: { name: 'Casa con mancuernas', desc: 'Un par de mancuernas y una silla o banco', eq: ['mancuernas', 'cuerpo', 'kettlebell'] },
  casa:       { name: 'Casa sin equipo', desc: 'Solo tu peso corporal', eq: ['cuerpo'] },
};

const E = (id, name, m, eq, img, cue) => ({ id, name, m, eq, img, cue });

const CATALOG_LIST = [
  // ---------- Pecho ----------
  E('banco_plano', 'Press de banca con barra', 'pecho', 'barra', 'Barbell_Bench_Press_-_Medium_Grip', 'Escápulas juntas y apoyadas, pies firmes. Bajá la barra controlada hasta el pecho (a la altura de los pezones) y empujá sin despegar la cola del banco.'),
  E('press_banca_manc', 'Press de banca con mancuernas', 'pecho', 'mancuernas', 'Dumbbell_Bench_Press', 'Mancuernas a la altura del pecho, codos a ~45° del cuerpo. Empujá hacia arriba juntándolas apenas arriba, sin chocarlas.'),
  E('banco_inclinado', 'Press inclinado con barra', 'pecho', 'barra', 'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Banco a 30–45°. Bajá la barra a la parte alta del pecho y empujá en línea recta. Trabaja más la parte superior del pecho.'),
  E('press_inclinado_manc', 'Press inclinado con mancuernas', 'pecho', 'mancuernas', 'Incline_Dumbbell_Press', 'Banco a 30–45°. Bajá las mancuernas a los costados del pecho alto y empujá arriba. En casa podés apoyar la espalda en un almohadón alto.'),
  E('banco_declinado', 'Press declinado con barra', 'pecho', 'barra', 'Decline_Barbell_Bench_Press', 'Banco declinado con las piernas trabadas. Bajá la barra a la parte baja del pecho y empujá. Trabaja la parte inferior del pecho.'),
  E('declinado_manc', 'Press declinado con mancuernas', 'pecho', 'mancuernas', 'Decline_Dumbbell_Bench_Press', 'Igual que el declinado con barra pero con mancuernas: más recorrido y cada brazo trabaja por separado.'),
  E('press_suelo_manc', 'Press de pecho en el piso', 'pecho', 'mancuernas', 'Dumbbell_Floor_Press', 'Acostado en el piso con rodillas flexionadas. Bajá hasta que los codos toquen el piso suave y empujá. Ideal si no tenés banco.'),
  E('press_hammer_pecho', 'Press de pecho en máquina', 'pecho', 'maquina', 'Leverage_Chest_Press', 'Regulá el asiento para que las manijas queden a la altura del pecho. Empujá sin bloquear del todo los codos y volvé lento.'),
  E('press_svend', 'Press Svend (con disco)', 'pecho', 'otro', 'Svend_Press', 'Apretá un disco entre las palmas a la altura del pecho y, sin dejar de apretar, extendé los brazos hacia adelante y volvé lento.'),
  E('apertura_manc', 'Aperturas con mancuernas', 'pecho', 'mancuernas', 'Dumbbell_Flyes', 'Codos levemente flexionados y fijos. Abrí los brazos en arco hasta sentir el estiramiento del pecho y cerrá como abrazando un árbol.'),
  E('mariposa', 'Mariposa en máquina (pec deck)', 'pecho', 'maquina', 'Butterfly', 'Espalda apoyada, codos a la altura de los hombros. Cerrá los brazos al frente apretando el pecho y abrí controlado.'),
  E('contractor_un_brazo', 'Contractor de pecho a un brazo', 'pecho', 'maquina', 'Butterfly', 'En la máquina de mariposa, un brazo a la vez con la espalda apoyada. Cerrá hasta el centro y volvé lento.'),
  E('cruces_polea', 'Cruces en polea (alta, media y baja)', 'pecho', 'polea', 'Cable_Crossover', 'Paso adelante, torso apenas inclinado. Juntá las manos al frente en arco con codos semiflexionados. Variá la altura de la polea para cada parte del pecho.'),
  E('fondos_paralelas', 'Fondos en paralelas', 'pecho', 'barra_dom', 'Dips_-_Chest_Version', 'Torso inclinado hacia adelante para enfocar el pecho. Bajá hasta que los hombros queden a la altura de los codos y subí.'),
  E('flexiones', 'Flexiones de brazos', 'pecho', 'cuerpo', 'Pushups', 'Manos un poco más anchas que los hombros, cuerpo recto de cabeza a talones. Bajá el pecho casi al piso y empujá. Si cuesta, apoyá las rodillas.'),
  E('flexiones_inclinadas', 'Flexiones inclinadas (manos elevadas)', 'pecho', 'cuerpo', 'Incline_Push-Up', 'Manos sobre una mesa, silla o escalón. Más fácil que la flexión normal: ideal para empezar.'),
  E('flexiones_declinadas', 'Flexiones declinadas (pies elevados)', 'pecho', 'cuerpo', 'Decline_Push-Up', 'Pies sobre una silla o cama. Más difícil que la flexión normal y trabaja más la parte alta del pecho y los hombros.'),

  // ---------- Espalda ----------
  E('dominadas', 'Dominadas', 'espalda', 'barra_dom', 'Pullups', 'Agarre prono un poco más ancho que los hombros. Subí llevando el pecho a la barra y bajá completo. Si no salen, usá banda o máquina asistida.'),
  E('dominadas_supinas', 'Dominadas supinas (chin-up)', 'espalda', 'barra_dom', 'Chin-Up', 'Palmas hacia vos, al ancho de hombros. Subí hasta pasar el mentón por encima de la barra. Trabaja también mucho el bíceps.'),
  E('jalon_pecho', 'Jalón al pecho', 'espalda', 'polea', 'Wide-Grip_Lat_Pulldown', 'Agarre ancho, pecho arriba. Llevá la barra a la parte alta del pecho tirando con los codos hacia abajo y volvé controlado.'),
  E('dorsalera_tras_nuca', 'Jalón tras nuca', 'espalda', 'polea', 'Wide-Grip_Pulldown_Behind_The_Neck', 'Agarre ancho, bajá la barra detrás de la cabeza sin forzar el cuello. Si te molesta el hombro, hacelo al pecho.'),
  E('dorsalera_cerrado', 'Jalón agarre cerrado', 'espalda', 'polea', 'Close-Grip_Front_Lat_Pulldown', 'Agarre cerrado (triángulo o barra). Llevá las manos al pecho con los codos pegados al cuerpo.'),
  E('dorsal_un_brazo_atras', 'Jalón a un brazo (doble rebote)', 'espalda', 'polea', 'One_Arm_Lat_Pulldown', 'Un brazo a la vez, tirá el codo hacia abajo y atrás. Doble rebote: dos medios recorridos abajo antes de volver.'),
  E('dorsal_un_brazo_costado', 'Jalón a un brazo de costado', 'espalda', 'polea', 'One_Arm_Lat_Pulldown', 'Parado de costado a la polea, tirá con un brazo en diagonal hacia la cadera.'),
  E('remo_barra', 'Remo con barra', 'espalda', 'barra', 'Bent_Over_Barbell_Row', 'Torso inclinado ~45°, espalda recta. Llevá la barra al ombligo apretando las escápulas y bajá controlado.'),
  E('remo_barra_t', 'Remo en barra T', 'espalda', 'barra', 'T-Bar_Row_with_Handle', 'Pecho afuera, espalda neutra. Tirá la barra hacia el abdomen con los codos pegados.'),
  E('remo_polea', 'Remo sentado en polea', 'espalda', 'polea', 'Seated_Cable_Rows', 'Espalda recta, sin balancearte. Llevá el agarre al abdomen apretando las escápulas y estirá los brazos lento.'),
  E('remo_un_brazo', 'Remo a un brazo con mancuerna', 'espalda', 'mancuernas', 'One-Arm_Dumbbell_Row', 'Mano y rodilla apoyadas en un banco o silla. Subí la mancuerna hacia la cadera, codo pegado al cuerpo.'),
  E('serrucho', 'Serrucho a un brazo', 'espalda', 'mancuernas', 'One-Arm_Dumbbell_Row', 'Como el remo a un brazo, con un recorrido largo hacia la cadera, como si estuvieras serruchando.'),
  E('remo_manc_dos', 'Remo con dos mancuernas', 'espalda', 'mancuernas', 'Bent_Over_Two-Dumbbell_Row', 'Torso inclinado y espalda recta. Llevá las dos mancuernas a la cintura apretando la espalda.'),
  E('remo_hammer', 'Remo en máquina', 'espalda', 'maquina', 'Leverage_Iso_Row', 'Pecho contra el apoyo. Tirá de las manijas llevando los codos atrás y apretá las escápulas.'),
  E('remo_invertido', 'Remo invertido (bajo una mesa)', 'espalda', 'cuerpo', 'Inverted_Row', 'Acostado bajo una mesa firme, agarrate del borde y subí el pecho hacia ella con el cuerpo recto. Flexioná las rodillas para hacerlo más fácil.'),
  E('pullover_polea_soga', 'Pullover en polea con soga', 'espalda', 'polea', 'Rope_Straight-Arm_Pulldown', 'Brazos casi rectos, llevá la soga desde arriba hasta los muslos en arco, sintiendo los dorsales.'),
  E('pullover_manc', 'Pullover con mancuerna', 'espalda', 'mancuernas', 'Bent-Arm_Dumbbell_Pullover', 'Acostado, mancuerna sobre el pecho. Llevala atrás de la cabeza con los codos levemente flexionados y volvé.'),
  E('superman', 'Superman', 'espalda', 'cuerpo', 'Superman', 'Boca abajo, levantá a la vez brazos, pecho y piernas unos centímetros. Sostené 2 segundos y bajá.'),
  E('hiperextensiones', 'Hiperextensiones lumbares', 'espalda', 'maquina', 'Hyperextensions_Back_Extensions', 'Cadera sobre el apoyo, bajá el torso con la espalda recta y subí hasta quedar alineado, sin pasarte hacia atrás.'),
  E('encogimiento_manc', 'Encogimiento de hombros con mancuernas', 'espalda', 'mancuernas', 'Dumbbell_Shrug', 'Brazos colgando, subí los hombros hacia las orejas, pausa arriba y bajá. Sin girar los hombros.'),
  E('encogimiento_hammer', 'Encogimiento de hombros en máquina', 'espalda', 'maquina', 'Leverage_Shrug', 'Igual que con mancuernas pero en la máquina: subí los hombros, pausa y bajá lento.'),
  E('encogimiento_smith', 'Encogimiento de hombros en Smith', 'espalda', 'maquina', 'Smith_Machine_Behind_the_Back_Shrug', 'Barra del Smith detrás o delante del cuerpo. Subí los hombros y bajá controlado.'),

  // ---------- Hombros ----------
  E('press_militar', 'Press militar con barra', 'hombros', 'barra', 'Standing_Military_Press', 'Parado, glúteos y abdomen firmes. Empujá la barra desde la clavícula hasta arriba de la cabeza sin arquear la espalda.'),
  E('press_hombros_manc', 'Press de hombros con mancuernas', 'hombros', 'mancuernas', 'Dumbbell_Shoulder_Press', 'Sentado o parado, mancuernas a la altura de las orejas. Empujá arriba sin chocarlas y bajá controlado.'),
  E('press_arnold', 'Press Arnold', 'hombros', 'mancuernas', 'Arnold_Dumbbell_Press', 'Empezá con las palmas hacia vos a la altura del mentón y girá las muñecas mientras empujás hacia arriba.'),
  E('press_hombros_smith', 'Press de hombros en Smith', 'hombros', 'maquina', 'Smith_Machine_Overhead_Shoulder_Press', 'Sentado bajo la barra del Smith. Bajá hasta el mentón y empujá arriba.'),
  E('press_hombros_hammer', 'Press de hombros en máquina', 'hombros', 'maquina', 'Leverage_Shoulder_Press', 'Regulá el asiento con las manijas a la altura de los hombros. Empujá arriba y bajá lento.'),
  E('vuelos_laterales', 'Elevaciones laterales (vuelos)', 'hombros', 'mancuernas', 'Side_Lateral_Raise', 'Codos apenas flexionados. Subí los brazos a los costados hasta la altura de los hombros, como vertiendo una jarra, y bajá lento.'),
  E('lateral_polea_baja', 'Elevación lateral en polea baja', 'hombros', 'polea', 'Cable_Seated_Lateral_Raise', 'De costado a la polea, subí el brazo hasta la altura del hombro. La polea mantiene la tensión todo el recorrido.'),
  E('elevaciones_frontales', 'Elevaciones frontales', 'hombros', 'mancuernas', 'Front_Dumbbell_Raise', 'Subí las mancuernas al frente hasta la altura de los ojos con los brazos casi rectos y bajá controlado.'),
  E('posteriores_manc', 'Elevaciones posteriores con mancuernas', 'hombros', 'mancuernas', 'Seated_Bent-Over_Rear_Delt_Raise', 'Torso inclinado hacia adelante, abrí los brazos a los costados apretando la parte de atrás del hombro.'),
  E('posteriores_maquina', 'Posteriores en máquina', 'hombros', 'maquina', 'Reverse_Machine_Flyes', 'En la mariposa invertida, pecho al respaldo. Abrí los brazos hacia atrás y volvé lento.'),
  E('posteriores_soga', 'Face pull (posteriores con soga)', 'hombros', 'polea', 'Face_Pull', 'Polea a la altura de la cara. Tirá la soga hacia los ojos separando las manos y abriendo los codos.'),
  E('w_a_la_pera', 'Remo al mentón', 'hombros', 'barra', 'Upright_Barbell_Row', 'Barra pegada al cuerpo, subila hasta el pecho llevando los codos arriba y afuera. No subas más allá si molesta el hombro.'),
  E('flexiones_pica', 'Flexiones pica (pike push-up)', 'hombros', 'cuerpo', null, 'Cadera bien arriba formando una V invertida. Bajá la cabeza hacia el piso entre las manos y empujá. Trabaja los hombros sin pesas.'),

  // ---------- Bíceps ----------
  E('curl_barra', 'Curl de bíceps con barra', 'biceps', 'barra', 'Barbell_Curl', 'Codos pegados al cuerpo y quietos. Subí la barra sin balancear el torso y bajá lento.'),
  E('curl_manc', 'Curl de bíceps con mancuernas', 'biceps', 'mancuernas', 'Dumbbell_Bicep_Curl', 'Codos fijos al costado, subí las mancuernas girando las palmas hacia arriba y bajá controlado.'),
  E('curl_alternado', 'Curl alternado con mancuerna', 'biceps', 'mancuernas', 'Dumbbell_Alternate_Bicep_Curl', 'Un brazo por vez, subí girando la palma hacia arriba. Sin balancearte.'),
  E('curl_martillo', 'Curl martillo', 'biceps', 'mancuernas', 'Hammer_Curls', 'Palmas mirándose entre sí todo el recorrido. Trabaja bíceps y antebrazo.'),
  E('curl_concentrado', 'Curl concentrado', 'biceps', 'mancuernas', 'Concentration_Curls', 'Sentado, codo apoyado en la cara interna del muslo. Subí la mancuerna lento apretando arriba.'),
  E('scott_barra_w', 'Curl en banco Scott', 'biceps', 'barra', 'Preacher_Curl', 'Brazos apoyados en el banco Scott. Subí la barra W y bajá lento sin estirar de golpe el codo.'),
  E('biceps_barra_espinales', 'Curl en banco inclinado boca abajo', 'biceps', 'barra', 'Spider_Curl', 'Pecho apoyado en un banco inclinado, brazos colgando. Subí la barra sin mover los codos.'),
  E('curl_smith', 'Curl de bíceps en Smith', 'biceps', 'maquina', 'Barbell_Curl', 'Como el curl con barra pero en la barra del Smith. Codos pegados y sin balanceo.'),
  E('curl_hammer', 'Curl de bíceps en máquina', 'biceps', 'maquina', 'Machine_Bicep_Curl', 'Brazos apoyados en el pad, subí apretando el bíceps y bajá lento.'),

  // ---------- Tríceps ----------
  E('triceps_polea', 'Extensión de tríceps en polea', 'triceps', 'polea', 'Triceps_Pushdown', 'Codos pegados al cuerpo y quietos. Empujá la barra hacia abajo hasta estirar los brazos y volvé hasta 90°.'),
  E('triceps_soga', 'Extensión de tríceps con soga', 'triceps', 'polea', 'Triceps_Pushdown_-_Rope_Attachment', 'Como la extensión en polea, separando las puntas de la soga abajo.'),
  E('triceps_agarre_remo', 'Tríceps empuje con agarre de remo', 'triceps', 'polea', 'Triceps_Pushdown_-_V-Bar_Attachment', 'Agarre en V, cuerpo apenas inclinado. Empujá hacia abajo con los codos fijos.'),
  E('ext_triceps_polea_baja', 'Extensión de tríceps en polea baja', 'triceps', 'polea', 'Low_Cable_Triceps_Extension', 'De espaldas a la polea baja, extendé los brazos por encima de la cabeza.'),
  E('triceps_tras_nuca', 'Extensión de tríceps tras nuca', 'triceps', 'mancuernas', 'Dumbbell_One-Arm_Triceps_Extension', 'Mancuerna detrás de la cabeza con los codos apuntando al techo. Extendé los brazos arriba y bajá lento.'),
  E('press_frances', 'Press francés', 'triceps', 'barra', 'EZ-Bar_Skullcrusher', 'Acostado, barra arriba del pecho. Bajala flexionando solo los codos hacia la frente y extendé.'),
  E('patada_triceps', 'Patada de tríceps', 'triceps', 'mancuernas', 'Tricep_Dumbbell_Kickback', 'Torso inclinado, codo pegado al cuerpo y alto. Extendé el brazo hacia atrás y volvé.'),
  E('press_triceps_smith', 'Press cerrado en Smith', 'triceps', 'maquina', 'Smith_Machine_Close-Grip_Bench_Press', 'Agarre al ancho de hombros, codos pegados. Bajá al pecho bajo y empujá.'),
  E('fondos_hammer', 'Fondos de tríceps en máquina', 'triceps', 'maquina', 'Dip_Machine', 'Sentado, empujá las manijas hacia abajo hasta estirar los brazos y volvé controlado.'),
  E('fondos_banco', 'Fondos en banco o silla', 'triceps', 'cuerpo', 'Bench_Dips', 'Manos en el borde de una silla firme detrás tuyo. Bajá flexionando los codos hacia atrás y empujá.'),
  E('flexiones_cerradas', 'Flexiones cerradas (diamante)', 'triceps', 'cuerpo', 'Push-Ups_-_Close_Triceps_Position', 'Manos juntas bajo el pecho, codos pegados al cuerpo. Enfoca el tríceps.'),

  // ---------- Piernas ----------
  E('sentadilla_barra', 'Sentadilla con barra', 'piernas', 'barra', 'Barbell_Squat', 'Barra sobre los trapecios, pies al ancho de hombros. Bajá sentándote atrás con el pecho arriba hasta al menos paralelo y subí empujando el piso.'),
  E('sentadilla_goblet', 'Sentadilla goblet', 'piernas', 'mancuernas', 'Goblet_Squat', 'Mancuerna sostenida contra el pecho. Bajá con el torso erguido y los codos entre las rodillas.'),
  E('sentadilla_manc', 'Sentadilla con mancuernas', 'piernas', 'mancuernas', 'Dumbbell_Squat', 'Mancuernas a los costados, bajá como en la sentadilla normal manteniendo la espalda recta.'),
  E('sentadilla_libre', 'Sentadilla con peso corporal', 'piernas', 'cuerpo', 'Bodyweight_Squat', 'Brazos al frente, bajá llevando la cadera atrás como sentándote en una silla. Rodillas en la dirección de los pies.'),
  E('hack_squat', 'Sentadilla hack', 'piernas', 'maquina', 'Hack_Squat', 'Espalda apoyada en la máquina, pies al medio de la plataforma. Bajá profundo y subí sin bloquear las rodillas.'),
  E('prensa', 'Prensa de piernas', 'piernas', 'maquina', 'Leg_Press', 'Pies al ancho de hombros. Bajá hasta ~90° de rodilla sin despegar la cola del asiento y empujá con los talones.'),
  E('prensa_boca_arriba', 'Prensa vertical', 'piernas', 'maquina', 'Leg_Press', 'Acostado boca arriba bajo la plataforma. Recorridos cortos y controlados.'),
  E('sissy', 'Sissy squat', 'piernas', 'cuerpo', 'Weighted_Sissy_Squat', 'Agarrado de un soporte, inclinate hacia atrás doblando las rodillas hacia adelante. Muy enfocado en el cuádriceps.'),
  E('zancadas_manc', 'Zancadas con mancuernas', 'piernas', 'mancuernas', 'Dumbbell_Lunges', 'Paso largo adelante, bajá la rodilla de atrás casi al piso y volvé. Torso erguido.'),
  E('zancadas', 'Zancadas', 'piernas', 'cuerpo', 'Bodyweight_Walking_Lunge', 'Paso largo, bajá hasta que ambas rodillas queden a 90° y empujá con la pierna de adelante.'),
  E('bulgara', 'Sentadilla búlgara / split squat', 'piernas', 'mancuernas', 'Split_Squat_with_Dumbbells', 'Un pie atrás (sobre un banco o silla para la búlgara). Bajá vertical y subí con la pierna de adelante.'),
  E('split_squat', 'Split squat sin peso', 'piernas', 'cuerpo', 'Split_Squats', 'Piernas separadas adelante y atrás, bajá vertical la rodilla de atrás hacia el piso y subí.'),
  E('step_up_manc', 'Subidas al cajón (step-up)', 'piernas', 'mancuernas', 'Dumbbell_Step_Ups', 'Subí a un escalón o banco firme empujando con la pierna de arriba, sin impulsarte con la de abajo.'),
  E('sentadilla_salto', 'Sentadilla con salto', 'piernas', 'cuerpo', 'Freehand_Jump_Squat', 'Bajá a sentadilla y saltá explosivo. Caé suave flexionando las rodillas.'),
  E('banco_cuadriceps', 'Extensión de cuádriceps', 'piernas', 'maquina', 'Leg_Extensions', 'Sentado en la máquina, extendé las piernas hasta arriba, pausa y bajá lento.'),
  E('banco_femorales', 'Curl femoral acostado', 'piernas', 'maquina', 'Lying_Leg_Curls', 'Boca abajo, llevá los talones hacia la cola sin levantar la cadera y bajá lento.'),
  E('curl_femoral_sentado', 'Curl femoral sentado', 'piernas', 'maquina', 'Seated_Leg_Curl', 'Sentado, flexioná las rodillas llevando el rodillo hacia abajo y volvé controlado.'),
  E('aductor', 'Aductores en máquina', 'piernas', 'maquina', 'Thigh_Adductor', 'Cerrá las piernas contra los pads apretando la cara interna del muslo y abrí lento.'),
  E('isometrico_cuadriceps', 'Sentadilla isométrica en pared', 'piernas', 'cuerpo', null, 'Espalda contra la pared, bajá hasta que las rodillas queden a 90° y sostené la posición.'),
  E('peso_muerto', 'Peso muerto', 'piernas', 'barra', 'Barbell_Deadlift', 'Barra pegada a las canillas, espalda neutra. Empujá el piso con las piernas y extendé la cadera. La barra sube pegada al cuerpo.'),
  E('peso_muerto_rumano', 'Peso muerto rumano', 'piernas', 'barra', 'Romanian_Deadlift', 'Rodillas apenas flexionadas, llevá la cadera atrás bajando la barra pegada a las piernas hasta sentir los isquios. Espalda recta.'),
  E('rumano_manc', 'Peso muerto rumano con mancuernas', 'piernas', 'mancuernas', 'Stiff-Legged_Dumbbell_Deadlift', 'Como el rumano con barra: cadera atrás, espalda recta, mancuernas cerca de las piernas.'),

  // ---------- Glúteos ----------
  E('hip_thrust', 'Hip thrust', 'gluteos', 'barra', 'Barbell_Hip_Thrust', 'Espalda alta apoyada en un banco, barra sobre la cadera. Subí la cadera apretando los glúteos hasta quedar recto y bajá.'),
  E('puente_gluteo', 'Puente de glúteos', 'gluteos', 'cuerpo', 'Butt_Lift_Bridge', 'Boca arriba, rodillas flexionadas. Subí la cadera apretando los glúteos, pausa y bajá. Podés poner una mancuerna sobre la cadera.'),
  E('puente_una_pierna', 'Puente de glúteo a una pierna', 'gluteos', 'cuerpo', 'Single_Leg_Glute_Bridge', 'Como el puente, con una pierna estirada en el aire. Más difícil y trabaja también los isquios.'),
  E('patada_gluteo', 'Patada de glúteo', 'gluteos', 'cuerpo', 'Glute_Kickback', 'En cuatro apoyos, llevá una pierna hacia atrás y arriba apretando el glúteo, sin arquear la espalda.'),

  // ---------- Gemelos ----------
  E('gemelos_maquina', 'Gemelos en máquina', 'gemelos', 'maquina', 'Calf_Press', 'Subí en puntas de pie lo más alto posible, pausa arriba y bajá estirando bien el talón.'),
  E('gemelos_smith', 'Gemelos en Smith', 'gemelos', 'maquina', 'Rocking_Standing_Calf_Raise', 'Puntas de los pies sobre un disco o escalón, barra en la espalda. Subí y bajá con recorrido completo.'),
  E('gemelos_manc', 'Gemelos con mancuernas', 'gemelos', 'mancuernas', 'Standing_Dumbbell_Calf_Raise', 'Mancuernas a los costados, puntas sobre un escalón. Subí en puntas de pie y bajá lento.'),
  E('gemelos_pie', 'Elevación de talones', 'gemelos', 'cuerpo', 'Standing_Calf_Raises', 'En un escalón, subí en puntas de pie y bajá el talón por debajo del escalón. Podés hacerlo a una pierna.'),

  // ---------- Abdomen ----------
  E('plancha', 'Plancha', 'core', 'cuerpo', 'Plank', 'Antebrazos apoyados, cuerpo recto de cabeza a talones. Apretá abdomen y glúteos sin dejar caer la cadera.'),
  E('plancha_lateral', 'Plancha lateral', 'core', 'cuerpo', 'Side_Bridge', 'De costado sobre un antebrazo, cadera arriba y cuerpo en línea recta. Sostené y cambiá de lado.'),
  E('crunch', 'Abdominales (crunch)', 'core', 'cuerpo', 'Crunches', 'Rodillas flexionadas, subí los hombros del piso apretando el abdomen. No tires del cuello.'),
  E('elevacion_piernas', 'Elevación de piernas acostado', 'core', 'cuerpo', 'Flat_Bench_Lying_Leg_Raise', 'Acostado, piernas casi rectas. Subilas hasta 90° y bajá lento sin que la zona lumbar se despegue.'),
  E('elevacion_piernas_colgado', 'Elevación de piernas colgado', 'core', 'barra_dom', 'Hanging_Leg_Raise', 'Colgado de la barra, subí las rodillas o las piernas hacia el pecho sin balancearte.'),
  E('dead_bug', 'Dead bug', 'core', 'cuerpo', 'Dead_Bug', 'Boca arriba, brazos y rodillas arriba. Estirá brazo y pierna contrarios sin despegar la espalda baja del piso.'),
  E('russian_twist', 'Giros rusos', 'core', 'cuerpo', 'Russian_Twist', 'Sentado con el torso inclinado y los pies apoyados o en el aire. Girá el torso de lado a lado.'),
  E('rueda_abdominal', 'Rueda abdominal', 'core', 'otro', 'Ab_Roller', 'De rodillas, rodá hacia adelante con el abdomen apretado y volvé sin arquear la espalda.'),
  E('crunch_polea', 'Crunch en polea', 'core', 'polea', 'Cable_Crunch', 'De rodillas frente a la polea alta, flexioná el torso llevando los codos a los muslos.'),

  // ---------- Cardio / acondicionamiento ----------
  E('burpees', 'Burpees', 'cardio', 'cuerpo', null, 'Agachate, apoyá las manos, llevá los pies atrás a plancha, volvé y saltá con los brazos arriba.'),
  E('jumping_jacks', 'Saltos de tijera (jumping jacks)', 'cardio', 'cuerpo', null, 'Saltá abriendo piernas y brazos a la vez y volvé a cerrar. Ritmo constante.'),
  E('mountain_climbers', 'Escaladores (mountain climbers)', 'cardio', 'cuerpo', 'Mountain_Climbers', 'En posición de plancha alta, llevá las rodillas al pecho alternando rápido.'),
  E('saltar_soga', 'Saltar la soga', 'cardio', 'cuerpo', 'Rope_Jumping', 'Saltos cortos en puntas de pie, muñecas girando la soga. Empezá con intervalos de 30–60 s.'),
  E('rodillas_altas', 'Rodillas arriba (skipping)', 'cardio', 'cuerpo', null, 'Trotá en el lugar subiendo las rodillas a la altura de la cadera y moviendo los brazos.'),
  E('kb_swing', 'Swing con kettlebell', 'cardio', 'kettlebell', 'One-Arm_Kettlebell_Swings', 'Bisagra de cadera: llevá la pesa entre las piernas y proyectala al frente con un golpe de cadera, no con los brazos.'),
  E('remo_ergometro', 'Remo ergómetro', 'cardio', 'maquina', 'Rowing_Stationary', 'Empujá primero con las piernas, después inclinate atrás y tirá con los brazos. Volvé en orden inverso.'),
  E('bici_fija', 'Bicicleta fija', 'cardio', 'maquina', 'Bicycling_Stationary', 'Asiento a la altura de la cadera. Ritmo constante o intervalos.'),
  E('cinta', 'Cinta (caminar o correr)', 'cardio', 'maquina', 'Running_Treadmill', 'Caminata inclinada o trote suave. Mirá al frente y no te agarres de las barandas.'),
];

const CATALOG = Object.fromEntries(CATALOG_LIST.map((e) => [e.id, e]));
