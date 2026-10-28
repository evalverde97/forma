// Rutina: 3 días que se repiten 2 veces por semana (variante A la primera vez, B la segunda).
// Cada ejercicio: [id del catálogo, series, repeticiones]

const ROUTINE = {
  pt: {
    short: 'PT', name: 'Pecho · Tríceps', color: '#FF7A59',
    A: [['banco_plano', 4, '6–8'], ['press_inclinado_manc', 3, '8–10'], ['cruces_polea', 3, '12–15'], ['fondos_paralelas', 3, '8–12'], ['press_frances', 3, '10–12'], ['triceps_polea', 3, '12–15']],
    B: [['banco_inclinado', 4, '6–8'], ['press_banca_manc', 3, '8–10'], ['mariposa', 3, '12–15'], ['press_triceps_smith', 3, '8–10'], ['triceps_tras_nuca', 3, '10–12'], ['triceps_soga', 3, '12–15']],
  },
  ph: {
    short: 'PH', name: 'Piernas · Hombros', color: '#5AC8FA',
    A: [['sentadilla_barra', 4, '6–8'], ['peso_muerto_rumano', 3, '8–10'], ['prensa', 3, '10–12'], ['banco_femorales', 3, '10–12'], ['press_militar', 4, '6–8'], ['vuelos_laterales', 4, '12–15'], ['gemelos_maquina', 4, '12–15']],
    B: [['hack_squat', 4, '8–10'], ['hip_thrust', 3, '8–10'], ['bulgara', 3, '10 c/pierna'], ['banco_cuadriceps', 3, '12–15'], ['press_hombros_manc', 4, '8–10'], ['lateral_polea_baja', 3, '12–15'], ['posteriores_soga', 3, '15']],
  },
  eb: {
    short: 'EB', name: 'Espalda · Bíceps', color: '#B78CFF',
    A: [['dominadas', 4, '6–10'], ['remo_barra', 4, '8'], ['dorsalera_cerrado', 3, '10–12'], ['remo_un_brazo', 3, '10'], ['curl_barra', 3, '8–10'], ['curl_martillo', 3, '12']],
    B: [['jalon_pecho', 4, '8–10'], ['remo_polea', 3, '10–12'], ['remo_barra_t', 3, '8–10'], ['pullover_polea_soga', 3, '12–15'], ['scott_barra_w', 3, '10–12'], ['curl_concentrado', 3, '12'], ['encogimiento_manc', 3, '12–15']],
  },
};

// Semana (0 = domingo): lunes a sábado, cada día dos veces; domingo descanso
const WEEK_ROUTINE = { 1: ['pt', 'A'], 2: ['ph', 'A'], 3: ['eb', 'A'], 4: ['pt', 'B'], 5: ['ph', 'B'], 6: ['eb', 'B'], 0: null };

const ROUTINE_NOTES = [
  'Calentá 5–10 minutos y hacé 1–2 series livianas del primer ejercicio.',
  'Descansá 2–3 minutos en los ejercicios pesados y 60–90 segundos en el resto.',
  'Cuando completes todas las series en el tope del rango, subí el peso.',
];
