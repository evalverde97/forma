// Idiomas. El español es el idioma base: todo el código y los datos guardados están en español.
// En portugués:
//   tx('texto')  → traduce textos de la interfaz (UI_PT)
//   tr('dato')   → traduce datos guardados en español (nombres de días, notas, objetivos de reps…)
//   applyPT()    → reemplaza en memoria los catálogos (ejercicios, objetivos, alimentación) por su versión en portugués

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
  'Hoy': 'Hoje', 'Ayer': 'Ontem', 'No se pudo guardar': 'Não foi possível salvar', 'Ejercicio': 'Exercício',
  'Cardio': 'Cardio', 'Libre': 'Livre', 'Entreno': 'Treino', '{n} ejercicios · {s} series': '{n} exercícios · {s} séries',
  'en curso': 'em andamento', 'hoy': 'hoje', 'mañana': 'amanhã',
  'Subí el peso en {e}': 'Aumente o peso em {e}',
  'Completaste todas las reps con {a} kg. Probá con {b} kg la próxima vez.': 'Você completou todas as reps com {a} kg. Tente {b} kg na próxima vez.',
  'Estancado en {e}': 'Estagnado em {e}',
  'Llevás 3 sesiones con {a} kg sin completar las reps. Revisá técnica, descanso y comida, o bajá un 10 % y volvé a subir.': 'São 3 sessões com {a} kg sem completar as reps. Revise técnica, descanso e alimentação, ou reduza 10 % e volte a subir.',
  'Hace {n} días que no hacés {d}': 'Faz {n} dias que você não faz {d}',
  'Sumalo en el próximo día libre: el plan de la semana ya lo tiene en cuenta.': 'Encaixe no próximo dia livre: o plano da semana já leva isso em conta.',
  'Registrá tu primer entreno': 'Registre seu primeiro treino', 'Hoy toca {d}.': 'Hoje é dia de {d}.',
  'Anotá los pesos de cada serie: con eso la app te va a decir cuándo subir.': 'Anote os pesos de cada série: com isso o app vai te dizer quando aumentar.',
  '{n} entrenos en los últimos 7 días': '{n} treinos nos últimos 7 dias',
  'Tu rutina es de {n} días por semana. La constancia es lo que más resultado da.': 'Seu treino é de {n} dias por semana. Constância é o que mais dá resultado.',
  '{n} días seguidos entrenando': '{n} dias seguidos treinando',
  'Buenísimo, pero el músculo crece en el descanso. Tomate un día de descanso activo (caminata suave).': 'Ótimo, mas o músculo cresce no descanso. Tire um dia de descanso ativo (caminhada leve).',
  'Moverte más durante la semana': 'Se mexer mais durante a semana',
  'Sumá 2–3 sesiones de cardio (trote, bici, soga) y registralas como Cardio.': 'Adicione 2–3 sessões de cardio (corrida, bike, corda) e registre como Cardio.',
  'Caminatas de 20–30′ o trote suave casi todos los días. Empezá corto y sumá tiempo cada semana.': 'Caminhadas de 20–30′ ou corrida leve quase todos os dias. Comece curto e aumente o tempo a cada semana.',
  '{h}: {c} de {n} días': '{h}: {c} de {n} dias',
  'Tomás {n} vasos de agua por día': 'Você toma {n} copos de água por dia',
  'Tu meta es {n}. Arrancá con un vaso grande al levantarte y llevá una botella al entrenar.': 'Sua meta é {n}. Comece com um copo grande ao acordar e leve uma garrafa ao treino.',
  '{m} es donde más te salís': '{m} é onde você mais sai do plano',
  'Planificalo con anticipación. Tu guía sugiere: {s}.': 'Planeje com antecedência. Seu guia sugere: {s}.',
  'Semana sólida: {n} % de adherencia': 'Semana sólida: {n} % de adesão',
  'Así se cambia el cuerpo: hábitos que se repiten. Seguí igual.': 'É assim que o corpo muda: hábitos que se repetem. Continue assim.',
  'Registrá tus comidas': 'Registre suas refeições',
  'Con 3 días registrados empiezo a detectar qué comida o hábito te cuesta más.': 'Com 3 dias registrados começo a detectar qual refeição ou hábito é mais difícil para você.',
  'Registrá tu peso': 'Registre seu peso',
  'Pesate en ayunas, una vez por semana, siempre a la misma hora.': 'Pese-se em jejum, uma vez por semana, sempre no mesmo horário.',
  'Hace {n} días que no te pesás': 'Faz {n} dias que você não se pesa',
  'Pesate en ayunas, después del baño, para comparar siempre en las mismas condiciones.': 'Pese-se em jejum, depois de ir ao banheiro, para comparar sempre nas mesmas condições.',
  'sem': 'sem', 'El peso no está bajando': 'O peso não está baixando',
  'Últimas {w} semanas: {r}. Achicá un poco las porciones de carbohidratos, sumá 10′ de caminata y revisá los fines de semana.': 'Últimas {w} semanas: {r}. Diminua um pouco as porções de carboidratos, some 10′ de caminhada e revise os fins de semana.',
  'Bajás {n} kg por semana': 'Você perde {n} kg por semana',
  'Es rápido. Asegurate de comer proteína en todas las comidas para no perder músculo y fuerza.': 'É rápido. Garanta proteína em todas as refeições para não perder músculo e força.',
  'Bajando {n} kg por semana': 'Perdendo {n} kg por semana',
  'Ritmo ideal y sostenible (0,3–1 kg/sem). Seguí así.': 'Ritmo ideal e sustentável (0,3–1 kg/sem). Continue assim.',
  'El peso está subiendo': 'O peso está subindo',
  'Últimas {w} semanas: {r}. Para recomposición conviene un déficit chico: recortá algo de carbohidratos o snacks.': 'Últimas {w} semanas: {r}. Para recomposição convém um déficit pequeno: corte um pouco de carboidratos ou lanches.',
  'Peso estable o bajando despacio': 'Peso estável ou baixando devagar',
  'Es lo ideal para recomposición: fijate que tus pesos en el gym suban.': 'É o ideal para recomposição: confira se suas cargas na academia sobem.',
  'El peso no está subiendo': 'O peso não está subindo',
  'Últimas {w} semanas: {r}. Sumá ~200 kcal por día: un licuado de leche y banana o un puñado de frutos secos.': 'Últimas {w} semanas: {r}. Adicione ~200 kcal por dia: uma vitamina de leite e banana ou um punhado de castanhas.',
  'Subís {n} kg por semana': 'Você ganha {n} kg por semana',
  'Es rápido y puede ser grasa. Bajá un poco las porciones: lo ideal es 0,25–0,5 kg por semana.': 'É rápido e pode ser gordura. Diminua um pouco as porções: o ideal é 0,25–0,5 kg por semana.',
  'Subiendo {n} kg por semana': 'Ganhando {n} kg por semana',
  'Ritmo ideal para ganar músculo con poca grasa.': 'Ritmo ideal para ganhar músculo com pouca gordura.',
  'Tu peso cambió {r}': 'Seu peso mudou {r}',
  'Para tu objetivo conviene mantenerlo estable. Revisá si comés de más o de menos.': 'Para o seu objetivo convém mantê-lo estável. Veja se está comendo demais ou de menos.',
  'Completá tu perfil': 'Complete seu perfil',
  'Con edad, sexo, altura y peso calculo cuántas calorías y proteína necesitás.': 'Com idade, sexo, altura e peso calculo quantas calorias e proteína você precisa.',
  'día': 'dia', 'Con 2 registros o más aparece el gráfico.': 'Com 2 registros ou mais aparece o gráfico.',
  'Cómo se hace': 'Como se faz', 'Según plan': 'No plano', 'Parcial': 'Parcial', 'Me salí': 'Saí do plano',
  '¿Qué comiste? (opcional)': 'O que você comeu? (opcional)', 'Agua': 'Água', '{a} / {b} vasos': '{a} / {b} copos',
  'proteína': 'proteína', 'carbos': 'carbos', 'grasas': 'gorduras',
  'Calculá tus calorías': 'Calcule suas calorias', 'Completá edad, sexo, altura y peso en tu perfil.': 'Complete idade, sexo, altura e peso no seu perfil.',
  'Tu meta diaria': 'Sua meta diária', 'Estimación orientativa. Gastás ~{n} kcal por día.': 'Estimativa aproximada. Você gasta ~{n} kcal por dia.',
  'Después: {d} {w}': 'Depois: {d} {w}', 'Sesión en curso': 'Sessão em andamento', 'Continuar': 'Continuar',
  'Entreno de hoy': 'Treino de hoje', 'Te quedó pendiente esta semana': 'Ficou pendente esta semana',
  'Primero lo pendiente; {d} pasa a {w}': 'Primeiro o pendente; {d} passa para {w}',
  '{d} ya lo hiciste esta semana': '{d} você já fez esta semana', 'Hoy toca': 'Hoje é dia de',
  'Empezar': 'Começar', 'Otro': 'Outro', 'Semana completa 💪': 'Semana completa 💪', 'Día libre': 'Dia livre',
  'Descanso activo': 'Descanso ativo', 'Caminata, trote suave o soga.': 'Caminhada, corrida leve ou corda.',
  'Registrar cardio': 'Registrar cardio', 'Entrenar igual': 'Treinar mesmo assim', 'Hola': 'Olá', 'Ajustes': 'Ajustes',
  'kg actual': 'kg atual', 'kg · registrar': 'kg · registrar', 'entrenos semana': 'treinos semana', 'adherencia 7d': 'adesão 7d',
  'Próxima comida': 'Próxima refeição', 'Comidas': 'Refeições', 'Todas las comidas registradas ✓': 'Todas as refeições registradas ✓',
  'Ver': 'Ver', 'Hidratación': 'Hidratação', 'Recomendaciones': 'Recomendações', 'Ver todas': 'Ver todas',
  'Todo en orden. Seguí registrando.': 'Tudo certo. Continue registrando.', '1 entreno este mes': '1 treino este mês',
  '{n} entrenos este mes': '{n} treinos este mês', 'Registrar entreno': 'Registrar treino', 'Sin entrenos este día': 'Sem treinos neste dia',
  'Sesión no encontrada.': 'Sessão não encontrada.', 'Volver': 'Voltar', 'Opciones': 'Opções', 'Listo': 'Pronto',
  'Terminar entreno': 'Finalizar treino', 'Actividad': 'Atividade', 'Minutos': 'Minutos', 'Distancia (km)': 'Distância (km)',
  'opcional': 'opcional', 'Notas': 'Notas', '¿Cómo te sentiste?': 'Como você se sentiu?', 'Antes de empezar': 'Antes de começar',
  'ver': 'ver', 'Superserie': 'Superssérie', 'Circuito': 'Circuito', 'Agregá ejercicios para empezar': 'Adicione exercícios para começar',
  'Agregar ejercicio': 'Adicionar exercício', 'Notas de la sesión': 'Notas da sessão', 'Energía, molestias, sensaciones…': 'Energia, dores, sensações…',
  'seg': 'seg', 'fallo': 'falha', 'Última': 'Última', 'Primera vez: anotá el peso que uses': 'Primeira vez: anote o peso que usar',
  'Alimentación': 'Alimentação', 'Comida': 'Comida', 'Hábitos': 'Hábitos', 'Tu evolución': 'Sua evolução', 'Progreso': 'Progresso',
  'Peso': 'Peso', 'Registrar': 'Registrar', '{n} kg desde el inicio': '{n} kg desde o início', 'IMC': 'IMC',
  'Objetivo {n} kg': 'Objetivo {n} kg', 'alcanzado 🎉': 'alcançado 🎉', 'faltan bajar {n} kg': 'faltam perder {n} kg',
  'faltan subir {n} kg': 'faltam ganhar {n} kg', 'Entrenos por semana': 'Treinos por semana', 'esta': 'esta',
  'Meta: {n} por semana': 'Meta: {n} por semana', 'Alimentación · 14 días': 'Alimentação · 14 dias',
  'Registrá tus comidas para ver la adherencia.': 'Registre suas refeições para ver a adesão.', 'Récords por ejercicio': 'Recordes por exercício',
  'Otros': 'Outros', '{n} ejercicios · máx {k} kg': '{n} exercícios · máx {k} kg', '1 sesión': '1 sessão', '{n} sesiones': '{n} sessões',
  'Tus pesos máximos aparecen acá a medida que entrenás.': 'Suas cargas máximas aparecem aqui conforme você treina.',
  'Todo en orden.': 'Tudo certo.', 'Copiar resumen para Claude': 'Copiar resumo para o Claude',
  'Pegalo en Claude para un análisis más profundo de tus últimas 2 semanas.': 'Cole no Claude para uma análise mais profunda das suas últimas 2 semanas.',
  'Rutina': 'Treino', 'Ejercicios': 'Exercícios', 'Guía': 'Guia', 'Plan': 'Plano', 'Compartir': 'Compartilhar',
  'Hecho ✓ · {d}': 'Feito ✓ · {d}', 'Esta semana: {w}': 'Esta semana: {w}', 'Próxima semana': 'Próxima semana',
  'Otro entreno': 'Outro treino', 'Descanso': 'Descanso', 'hecho ✓': 'feito ✓', 'reprogramado': 'reprogramado', 'planificado': 'planejado',
  'Esta semana': 'Esta semana', 'se ajusta sola': 'se ajusta sozinha',
  'Si un día entrenás otra cosa, lo que quedó pendiente pasa al próximo día libre.': 'Se um dia você treinar outra coisa, o que ficou pendente passa para o próximo dia livre.',
  'Tu rutina': 'Seu treino', 'Cambiar objetivo o rutina': 'Mudar objetivo ou treino', '{n} ejercicios': '{n} exercícios',
  'Editar': 'Editar', 'Empezar hoy': 'Começar hoje', 'Agregar un día': 'Adicionar um dia', 'Guía diaria': 'Guia diário',
  'Fin de semana': 'Fim de semana', 'Objetivo': 'Objetivo', 'Reglas de alimentación': 'Regras de alimentação', 'El plato saludable': 'O prato saudável',
  '“El cuerpo cambia cuando los hábitos se repiten, no cuando se fuerzan.”': '“O corpo muda quando os hábitos se repetem, não quando são forçados.”',
  'Las rutinas y guías son orientativas y no reemplazan la consulta con un médico, nutricionista o entrenador. Si tenés alguna condición de salud, consultá antes de empezar.': 'Os treinos e guias são orientativos e não substituem a consulta com médico, nutricionista ou treinador. Se você tem alguma condição de saúde, consulte antes de começar.',
  'Todos': 'Todos', 'Buscar ejercicio': 'Buscar exercício', 'Mostrar también los que necesitan otro equipamiento': 'Mostrar também os que precisam de outro equipamento',
  'Sin resultados': 'Sem resultados', 'O escribí uno nuevo': 'Ou escreva um novo', 'Agregar': 'Adicionar', 'Día no encontrado.': 'Dia não encontrado.',
  'Editar día': 'Editar dia', 'Nombre del día': 'Nome do dia', 'Series': 'Séries', 'Reps / objetivo': 'Reps / objetivo',
  '8–12, 25·20·15·10, fallo, 30 s': '8–12, 25·20·15·10, falha, 30 s', 'Sin ejercicios': 'Sem exercícios', 'Eliminar este día': 'Excluir este dia',
  'Los cambios se guardan solos. Los entrenos que ya hiciste no se modifican.': 'As mudanças são salvas sozinhas. Os treinos que você já fez não mudam.',
  'Atrás': 'Voltar', 'Cancelar': 'Cancelar',
  'Tu entrenamiento y tu alimentación, en un solo lugar. Armamos una rutina según tu objetivo y la app la va acomodando a tu semana.': 'Seu treino e sua alimentação em um só lugar. Montamos um treino de acordo com seu objetivo e o app vai ajustando à sua semana.',
  'Te compartieron una rutina': 'Compartilharam um treino com você', 'Primero completá tu perfil y después la usamos.': 'Primeiro complete seu perfil e depois usamos.',
  'Todo se guarda solo en tu teléfono: sin cuentas, sin nubes.': 'Tudo fica salvo só no seu celular: sem contas, sem nuvem.',
  'Rutinas para gimnasio o para entrenar en casa.': 'Treinos para academia ou para treinar em casa.',
  'Cada ejercicio tiene una imagen de cómo se hace.': 'Cada exercício tem uma imagem de como se faz.',
  'Tengo un respaldo': 'Tenho um backup', 'Sobre vos': 'Sobre você', 'Lo uso para calcular calorías y proteína. Queda solo en tu teléfono.': 'Uso para calcular calorias e proteína. Fica só no seu celular.',
  'Nombre': 'Nome', 'Cómo te llamo': 'Como te chamo', 'Sexo biológico (para el cálculo de calorías)': 'Sexo biológico (para o cálculo de calorias)',
  'Hombre': 'Homem', 'Mujer': 'Mulher', 'Edad': 'Idade', 'Altura (cm)': 'Altura (cm)', 'Peso (kg)': 'Peso (kg)', 'Peso objetivo (opcional)': 'Peso objetivo (opcional)',
  'Actividad fuera del entrenamiento': 'Atividade fora do treino', '¿Cuál es tu objetivo?': 'Qual é o seu objetivo?',
  'Define la rutina, las repeticiones y la guía de alimentación.': 'Define o treino, as repetições e o guia de alimentação.',
  'Tu entrenamiento': 'Seu treino', 'Vas a usar la rutina compartida ({n} días). Elegí qué días entrenás.': 'Você vai usar o treino compartilhado ({n} dias). Escolha em quais dias você treina.',
  '¿Dónde entrenás?': 'Onde você treina?', 'Nivel': 'Nível', 'Días por semana': 'Dias por semana', '{n} días': '{n} dias',
  '¿Qué días? (elegí {n})': 'Quais dias? (escolha {n})', 'Si un día no podés, la app corre el entreno al próximo día libre.': 'Se um dia você não puder, o app passa o treino para o próximo dia livre.',
  'Tu plan': 'Seu plano', 'Rutina sugerida': 'Treino sugerido', 'Clásica por grupo muscular': 'Clássico por grupo muscular',
  'Después podés cambiar ejercicios, series y repeticiones.': 'Depois você pode mudar exercícios, séries e repetições.',
  'Las rutinas y guías son orientativas y no reemplazan a un profesional de la salud. Si tenés alguna lesión o condición médica, consultá antes de empezar.': 'Os treinos e guias são orientativos e não substituem um profissional de saúde. Se você tem alguma lesão ou condição médica, consulte antes de começar.',
  'Guardar cambios': 'Salvar mudanças', 'Siguiente': 'Próximo', 'Elegí una opción en sexo': 'Escolha uma opção em sexo',
  'Ingresá tu edad': 'Informe sua idade', 'Ingresá tu altura en cm': 'Informe sua altura em cm', 'Ingresá tu peso en kg': 'Informe seu peso em kg',
  'Elegí un objetivo': 'Escolha um objetivo', 'Elegí {n} días de la semana': 'Escolha {n} dias da semana', 'Rutina actualizada': 'Treino atualizado',
  '¡Listo! Tu plan está armado': 'Pronto! Seu plano está montado', 'El link de la rutina no es válido.': 'O link do treino não é válido.',
  'Ir al inicio': 'Ir para o início', 'Usar esta rutina': 'Usar este treino', 'Idioma': 'Idioma', 'Tu nombre': 'Seu nome', 'Sexo': 'Sexo',
  'Agua (vasos)': 'Água (copos)', 'Peso inicial (kg)': 'Peso inicial (kg)', 'Peso objetivo (kg)': 'Peso objetivo (kg)',
  'Actividad diaria': 'Atividade diária', 'Descanso entre series (segundos)': 'Descanso entre séries (segundos)', 'Entrenamiento': 'Treino',
  'Objetivo y rutina': 'Objetivo e treino', 'Días que entrenás ({n})': 'Dias em que você treina ({n})',
  'Elegí {n} días. Mientras tanto uso: {d}.': 'Escolha {n} dias. Enquanto isso uso: {d}.', 'Tus datos': 'Seus dados',
  'Todo se guarda solo en este teléfono. Exportá un respaldo de vez en cuando por si cambiás de celular o borrás Safari.': 'Tudo fica salvo só neste celular. Exporte um backup de vez em quando, caso troque de celular ou limpe o Safari.',
  'Exportar respaldo': 'Exportar backup', 'Importar respaldo': 'Importar backup', 'Zona peligrosa': 'Zona de perigo', 'Borrar todos los datos': 'Apagar todos os dados',
  'Forma · tu entrenamiento y tu plan, sin cuentas ni nubes.': 'Forma · seu treino e seu plano, sem contas nem nuvem.',
  'Imágenes de ejercicios: Free Exercise DB (dominio público).': 'Imagens dos exercícios: Free Exercise DB (domínio público).',
  '¡A la próxima serie!': 'Próxima série!', 'técnica ejercicio': 'execução exercício', 'Posición inicial ↔ final': 'Posição inicial ↔ final',
  'Sin imagen para este ejercicio': 'Sem imagem para este exercício', 'Ver videos en YouTube': 'Ver vídeos no YouTube',
  'Mi historial en este ejercicio': 'Meu histórico neste exercício', 'Sin registros todavía': 'Sem registros ainda', 'mujer': 'mulher', 'hombre': 'homem',
  'Sos mi coach de entrenamiento y nutrición. Analizá mis últimos 14 días y dame recomendaciones concretas y priorizadas: qué cambiar o mejorar en la alimentación y en los ejercicios (pesos, progresión, volumen, frecuencia, descanso).': 'Você é meu coach de treino e nutrição. Analise meus últimos 14 dias e me dê recomendações concretas e priorizadas: o que mudar ou melhorar na alimentação e nos exercícios (cargas, progressão, volume, frequência, descanso).',
  'Perfil: {sexo}, {edad} años, altura {h} cm, peso inicial {pi} kg, actual {pa} kg, objetivo {po} kg.': 'Perfil: {sexo}, {edad} anos, altura {h} cm, peso inicial {pi} kg, atual {pa} kg, objetivo {po} kg.',
  'Meta estimada: {k} kcal, {p} g de proteína.': 'Meta estimada: {k} kcal, {p} g de proteína.', 'Pautas de alimentación': 'Diretrizes de alimentação',
  'Entrenos': 'Treinos', 'sin series registradas': 'sem séries registradas', 'Alimentación y hábitos': 'Alimentação e hábitos',
  'Copiado. Pegalo en Claude': 'Copiado. Cole no Claude', 'No se pudo copiar': 'Não foi possível copiar', 'Libre (armalo vos)': 'Livre (monte você)',
  'sugerido': 'sugerido', 'Ver historial': 'Ver histórico', 'Agregar serie': 'Adicionar série', 'Quitar última serie': 'Remover última série',
  'Quitar ejercicio de esta sesión': 'Remover exercício desta sessão', 'Reemplazar ejercicio': 'Substituir exercício',
  'Escribí el nombre del ejercicio': 'Escreva o nome do exercício', 'Fecha': 'Data', 'Eliminar entreno': 'Excluir treino',
  '¿Eliminar este entreno? No se puede deshacer.': 'Excluir este treino? Não dá para desfazer.',
  'No cargaste los minutos. ¿Guardar igual?': 'Você não informou os minutos. Salvar mesmo assim?',
  'No marcaste ninguna serie. ¿Guardar igual?': 'Você não marcou nenhuma série. Salvar mesmo assim?', 'Cardio guardado': 'Cardio salvo',
  'Entreno guardado 💪': 'Treino salvo 💪', 'Registrar peso': 'Registrar peso', 'Guardar': 'Salvar', 'Últimos': 'Últimos', 'Borrar': 'Apagar',
  'Ingresá un peso válido': 'Informe um peso válido', 'Peso guardado': 'Peso salvo', 'Reemplazar por otro': 'Substituir por outro',
  'Separar del anterior': 'Separar do anterior', 'Combinar con el anterior (superserie)': 'Combinar com o anterior (superssérie)',
  'Subir': 'Subir', 'Bajar': 'Descer', 'Quitar de la rutina': 'Remover do treino', 'Máximo 7 días': 'Máximo 7 dias', 'Día': 'Dia',
  '¿Eliminar este día de la rutina? Los entrenos que ya hiciste se mantienen.': 'Excluir este dia do treino? Os treinos que você já fez são mantidos.',
  'Tu rutina tiene {n} días: primero sacá uno': 'Seu treino tem {n} dias: primeiro tire um', 'Te paso mi rutina en Forma: {r}': 'Te passo meu treino no Forma: {r}',
  'Link copiado': 'Link copiado', 'Esto reemplaza tu rutina actual por la compartida. Tu historial se mantiene. ¿Continuar?': 'Isso substitui seu treino atual pelo compartilhado. Seu histórico é mantido. Continuar?',
  'Rutina cargada': 'Treino carregado', '¿Borrar TODOS tus datos? Esto no se puede deshacer.': 'Apagar TODOS os seus dados? Não dá para desfazer.',
  '¿Seguro? Te recomiendo exportar un respaldo antes.': 'Tem certeza? Recomendo exportar um backup antes.', 'Datos borrados': 'Dados apagados',
  'Esto reemplaza los datos actuales por los del respaldo. ¿Continuar?': 'Isso substitui os dados atuais pelos do backup. Continuar?',
  'Respaldo importado': 'Backup importado', 'El archivo no es un respaldo válido': 'O arquivo não é um backup válido',
};

function tx(key, vars) {
  let s = LANG === 'pt' ? (UI_PT[key] ?? key) : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}

/* ---------- Datos guardados en español → portugués ---------- */
const TR_PT = {
  // Días de las plantillas
  'Cuerpo completo A': 'Corpo inteiro A', 'Cuerpo completo B': 'Corpo inteiro B', 'Cuerpo completo C': 'Corpo inteiro C',
  'Torso A': 'Superiores A', 'Torso B': 'Superiores B', 'Piernas A': 'Inferiores A', 'Piernas B': 'Inferiores B',
  'Empuje · pecho, hombros y tríceps': 'Empurrar · peito, ombros e tríceps', 'Tirón · espalda y bíceps': 'Puxar · costas e bíceps',
  'Piernas': 'Pernas', 'Pecho': 'Peito', 'Brazos': 'Braços', 'Espalda': 'Costas', 'Hombros': 'Ombros',
  // Tipos de cardio
  'Caminata': 'Caminhada', 'Correr': 'Corrida', 'Saltar la soga': 'Pular corda', 'Bicicleta': 'Bicicleta', 'Natación': 'Natação', 'Trote ligero': 'Trote leve', 'Otro': 'Outro',
  // Notas de las rutinas generadas
  'Calentá 5–10 minutos antes: movilidad de articulaciones y 1–2 series livianas del primer ejercicio.': 'Aqueça 5–10 minutos antes: mobilidade das articulações e 1–2 séries leves do primeiro exercício.',
  'Técnica primero: si no podés hacer bien el movimiento, bajá el peso.': 'Técnica primeiro: se não conseguir fazer bem o movimento, diminua o peso.',
  'Los ejercicios del mismo bloque se hacen en superserie: uno después del otro y recién ahí descansás.': 'Os exercícios do mesmo bloco são feitos em superssérie: um depois do outro e só então você descansa.',
  'Cada bloque es un circuito: hacé los ejercicios seguidos y descansá al terminar la vuelta.': 'Cada bloco é um circuito: faça os exercícios em sequência e descanse ao terminar a volta.',
  'Final de acondicionamiento: lo más intenso que puedas sosteniendo la técnica.': 'Final de condicionamento: o mais intenso que conseguir mantendo a técnica.',
  // Rutina clásica
  'Todos los ejercicios son 4 series.': 'Todos os exercícios são 4 séries.',
  'Técnica primero: si no puedo hacer bien la técnica, bajo el peso.': 'Técnica primeiro: se não consigo fazer bem a técnica, diminuo o peso.',
  'Calentamiento de articulaciones antes de empezar: vuelos laterales ×30, vuelos frontales ×30, bíceps ×30 (4 series de todo). Si se puede, unas dominadas.': 'Aquecimento das articulações antes de começar: elevação lateral ×30, elevação frontal ×30, bíceps ×30 (4 séries de tudo). Se der, algumas barras fixas.',
  'Apretá el disco con ambas manos hacia el medio y, sin soltar la contracción, llevalo lento hacia adelante. Parado o acostado.': 'Aperte a anilha com as duas mãos para o centro e, sem soltar a contração, leve devagar para frente. Em pé ou deitado.',
  'Espalda apoyada, a un brazo.': 'Costas apoiadas, um braço.', 'De mayor a menor peso.': 'Do maior para o menor peso.',
  'Arrodillado o parado.': 'Ajoelhado ou em pé.', 'Apoyá bien la axila y trabá los pies atrás.': 'Apoie bem a axila e trave os pés atrás.',
  'Cuerpo un poco inclinado hacia adelante, siempre derecho.': 'Corpo um pouco inclinado para frente, sempre reto.',
  'Mantené siempre un brazo arriba.': 'Mantenha sempre um braço em cima.', 'Entrada en calor. Si puedo, voy agregando peso.': 'Aquecimento. Se der, vou adicionando peso.',
  '10 con retención, 10 bajada lenta (10 seg arriba) y 10 continuas.': '10 com isometria, 10 descida lenta (10 seg em cima) e 10 contínuas.',
  'Abajo cuento 1-2 y subo.': 'Embaixo conto 1-2 e subo.', 'Bajo el peso y otras 10 con retención + 10 continuas.': 'Diminuo o peso e mais 10 com isometria + 10 contínuas.',
  'Si puedo, subo el peso en cada vuelta.': 'Se der, aumento o peso a cada volta.', 'Últimas 5 abro las manos, bien cortitas.': 'Últimas 5 abro as mãos, bem curtinhas.',
  // Objetivos de reps de la rutina clásica
  '15 reps': '15 reps', '15–20 reps': '15–20 reps', '12–20 reps': '12–20 reps', '10 c/brazo': '10 c/braço', '10 c/lado': '10 c/lado',
  '10 + 10 + 10 (drop)': '10 + 10 + 10 (drop)', 'Al fallo': 'Até a falha', '20 reps': '20 reps', '10 reps': '10 reps', '4 × 20': '4 × 20',
  '10 ret. + 10 lenta + 10': '10 isom. + 10 lenta + 10', '15 cortitas': '15 curtinhas', '10 ret. + 10 cortas + 5 pies juntos': '10 isom. + 10 curtas + 5 pés juntos',
  '10 ret. + 10 (drop)': '10 isom. + 10 (drop)', 'Contar hasta 50': 'Contar até 50', 'Al fallo, subiendo': 'Até a falha, subindo', '15 pesado': '15 pesado',
  '10 + 10 cambio agarre': '10 + 10 trocando pegada',
  'Clásica por grupo muscular · 5 días · Gimnasio': 'Clássico por grupo muscular · 5 dias · Academia',
};
const TR_PATTERNS = [
  [/^(.+) · (\d) días · (.+)$/, (m, a, n, b) => `${tr(a)} · ${n} dias · ${tr(b)}`],
  [/^(.+) \(variante\)$/, (m, a) => `${tr(a)} (variação)`],
  [/^Día (\d+)$/, (m, n) => `Dia ${n}`],
  [/^Cuando completes todas las series en el tope del rango \((.+?)\), subí el peso: 2,5 kg en barra o 1–2 kg en mancuernas\. Sin peso: más reps o una variante más difícil\.$/,
    (m, r) => `Quando completar todas as séries no topo da faixa (${r}), aumente o peso: 2,5 kg na barra ou 1–2 kg nos halteres. Sem peso: mais reps ou uma variação mais difícil.`],
];
function tr(s) {
  if (LANG !== 'pt' || !s) return s;
  if (TR_PT[s] !== undefined) return TR_PT[s];
  for (const [re, f] of TR_PATTERNS) if (re.test(s)) return s.replace(re, f);
  return s;
}

/* ---------- Catálogos en portugués ---------- */
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

const FAT_PLAN_PT = (() => {
  const W = {
    desayuno: { title: 'Flexível mas controlado', items: ['Pode incluir um doce pequeno', 'Sempre acompanhado de proteína'] },
    almuerzo: { title: 'Flexível e consciente', items: ['Proteína principal (carne / frango / peixe)', 'Verduras sempre presentes', 'Carboidratos só se houve treino forte'] },
    merienda: { title: 'Igual aos dias de semana', items: ['Proteína + gorduras boas', 'Sem farinhas nem açúcar'] },
    cena: { title: 'Flexível sem carboidratos', items: ['Proteína: carne, frango ou peixe', 'Verduras sempre presentes', 'Evitar farinhas, pão, arroz, batata e macarrão'] },
  };
  return {
    1: {
      desayuno: { title: 'Aveia + iogurte', items: ['Aveia cozida (porção pequena)', 'Iogurte natural', 'Sementes (chia ou linhaça)', 'Opcional: mirtilo, morango, banana ou maçã', 'Mix seco: amêndoas, nozes, cereal sem açúcar'] },
      almuerzo: { title: 'Peixe', items: ['Peixe (merluza, atum, salmão)', '1 punhado pequeno de arroz + quinoa + lentilha', 'Espinafre e brócolis refogados', '½ abacate'], tip: 'Ideal para desinflamar e melhorar a recuperação.' },
      merienda: { title: 'Sem carboidratos', items: ['Ovo cozido', 'Queijo magro', 'Abacate com tomate e azeite', 'Nozes / amêndoas', 'Biscoito de arroz com pasta de amendoim', 'Chimarrão ou café sem açúcar'] },
      cena: { title: 'Ovos / peixe', items: ['Ovos mexidos ou omelete, ou peixe', 'Espinafre, cebola, pimentão, brócolis', 'Azeite (1 colher)'], tip: 'Jantar leve e reparador.' },
    },
    2: {
      desayuno: { title: 'Torradas + ovos', items: ['Torrada integral (2)', 'Cream cheese light', 'Ovos mexidos', 'Café ou chimarrão'] },
      almuerzo: { title: 'Frango', items: ['Peito de frango', 'Salada grande (alface, tomate, cenoura, cebola)', 'Azeite (1 colher)'], tip: 'Leve, sacia e é fácil de digerir.' },
      merienda: { title: 'Iogurte + castanhas', items: ['Iogurte natural ou grego', 'Punhado pequeno de nozes', 'Punhado de amêndoas'] },
      cena: { title: 'Frango', items: ['Peito de frango', 'Salada verde ou legumes refogados', 'Limão e temperos'], tip: 'Muita saciedade sem pesar.' },
    },
    3: {
      desayuno: { title: 'Banana + iogurte', items: ['Banana', 'Iogurte natural', 'Sementes', 'Aveia'] },
      almuerzo: { title: 'Carne', items: ['Carne bovina magra', 'Purê de abóbora ou batata (porção controlada)', 'Brócolis ou espinafre'], tip: 'Mais energia e força para treinos intensos.' },
      merienda: { title: 'Queijo + ovo', items: ['Queijo', 'Ovo cozido', 'Chá de hortelã ou chá verde'] },
      cena: { title: 'Peixe', items: ['Peixe (merluza, atum, salmão)', 'Brócolis, abobrinha ou espinafre', 'Abacate ou azeite'], tip: 'Anti-inflamatório, ideal pós-treino.' },
    },
    4: {
      desayuno: { title: 'Pão integral + ovo', items: ['Pão integral (2 fatias)', 'Queijo + ovo ou presunto com ovo', 'Café, chimarrão ou chá verde'] },
      almuerzo: { title: 'Frango', items: ['Frango', 'Arroz integral ou leguminosas (porção pequena)', 'Legumes variados refogados'], tip: 'Repetir não é ruim: simplifica e melhora a adesão.' },
      merienda: { title: 'Shake de proteína', items: ['Shake de proteína', 'Água ou chá verde', 'Se bater muita fome: ovo mexido com presunto'] },
      cena: { title: 'Carne', items: ['Carne bovina magra', 'Mix de legumes assados ou refogados', 'Temperos naturais'], tip: 'Mais força e recuperação muscular.' },
    },
    5: {
      desayuno: { title: 'Fruta + iogurte', items: ['Fruta (maçã ou frutas vermelhas)', 'Iogurte natural', 'Sementes — misturar tudo'] },
      almuerzo: { title: 'Peixe', items: ['Peixe', 'Salada morna de legumes', 'Abacate ou azeite'], tip: 'Fechamento de semana leve e anti-inflamatório.' },
      merienda: { title: 'Ovo + queijo', items: ['Ovo cozido', 'Queijo e tomate tipo salada'] },
      cena: { title: 'Queijos + ovos', items: ['Queijo magro ou meia cura', 'Ovos, abacate com tomate', 'Brócolis, abobrinha, espinafre, acelga'], tip: 'Prático e rápido para fechar a semana.' },
    },
    6: W, 0: W,
  };
})();
const SAME_PT = (p) => ({ 0: p, 1: p, 2: p, 3: p, 4: p, 5: p, 6: p });
const NUTRITION_PT = {
  grasa: {
    plan: FAT_PLAN_PT,
    rules: ['Priorizar proteínas em todas as refeições.', 'Verduras à vontade (cruas ou cozidas).', 'Carboidratos só até a tarde (idealmente antes das 18–19 h).', 'Gorduras boas controladas (azeite, ovos, castanhas).', 'No jantar NÃO se comem carboidratos: nada de pão, arroz, batata, macarrão nem farinhas.', 'O lanche da tarde é proteína + gorduras boas, sem farinhas.', 'Caminhada leve de 20–30 min depois do almoço.', 'Ao acordar, 1 copo grande de água. Hidratação constante.', 'Evitar pular refeições. Alarmes para as refeições principais.', 'Se mexer todos os dias. Constância antes de intensidade.'],
  },
  recomp: {
    plan: SAME_PT({
      desayuno: { title: 'Proteína + carbo integral', items: ['2–3 ovos ou iogurte grego', 'Aveia ou pão integral (porção pequena)', 'Fruta'] },
      almuerzo: { title: 'Prato completo', items: ['Proteína: frango, carne magra, peixe ou leguminosas (uma palma e meia)', 'Carboidrato: arroz, batata ou macarrão (1 punho)', 'Verduras: meio prato'], tip: 'Se treina à tarde, este é o momento dos carboidratos.' },
      merienda: { title: 'Proteína', items: ['Iogurte grego ou queijo magro', 'Castanhas (punhado)', 'Ou shake de proteína se treinar'] },
      cena: { title: 'Proteína + verduras', items: ['Proteína', 'Verduras à vontade', 'Carboidrato pequeno só se treinou à noite'] },
    }),
    rules: ['Proteína em todas as refeições: é o que permite ganhar músculo enquanto perde gordura.', 'Um déficit pequeno: não precisa passar fome.', 'Os carboidratos, em volta do treino.', 'Dormir 7–8 horas: a recuperação é metade do progresso.', 'Caminhar todos os dias soma sem cansar para o treino.'],
  },
  masa: {
    plan: SAME_PT({
      desayuno: { title: 'Café da manhã reforçado', items: ['Aveia com leite e banana', '2–3 ovos', 'Ou torradas integrais com abacate e ovo'] },
      almuerzo: { title: 'Prato caprichado', items: ['Proteína: 150–200 g de frango, carne, peixe ou feijão', 'Carboidrato generoso: arroz, batata, macarrão, batata-doce', 'Verduras + 1 colher de azeite'] },
      merienda: { title: 'Lanche com proteína', items: ['Iogurte grego com granola ou aveia e fruta', 'Ou sanduíche integral de frango, atum ou ovo', 'Ou vitamina de leite, banana e aveia (com whey se usar)'], tip: 'Se custa comer mais, some um lanche extra com castanhas.' },
      cena: { title: 'Proteína + carboidrato', items: ['Proteína', 'Carboidrato moderado (arroz, batata, macarrão)', 'Verduras'] },
    }),
    rules: ['Comer um pouco mais do que gasta: se o peso não subir em 2 semanas, some ~200 kcal (uma fruta + um punhado de castanhas).', 'Proteína em cada refeição.', 'Não pular refeições: no mínimo 4 refeições.', 'Carboidratos antes e depois do treino.', 'Dormir 7–8 horas.', 'Subir de peso devagar (0,25–0,5 kg por semana) para ser músculo e não gordura.'],
  },
  fuerza: {
    plan: SAME_PT({
      desayuno: { title: 'Energia + proteína', items: ['Aveia ou pão integral', '2–3 ovos ou iogurte grego', 'Fruta'] },
      almuerzo: { title: 'Prato completo', items: ['Proteína: carne, frango, peixe', 'Carboidrato: arroz, batata, macarrão', 'Verduras'] },
      merienda: { title: 'Pré ou pós-treino', items: ['Antes: banana, torrada com mel ou uma barrinha', 'Depois: iogurte ou shake + fruta'], tip: 'Treinar com fome tira força: coma algo 1–2 h antes.' },
      cena: { title: 'Recuperação', items: ['Proteína', 'Carboidrato moderado', 'Verduras'] },
    }),
    rules: ['Comer o suficiente: em déficit a força não sobe.', 'Proteína em cada refeição.', 'Carboidratos antes do treino para render nas séries pesadas.', 'Dormir 7–9 horas: a força depende muito do descanso.'],
  },
  resistencia: {
    plan: SAME_PT({
      desayuno: { title: 'Carboidratos + proteína', items: ['Aveia, pão integral ou frutas', 'Ovos ou iogurte', 'Café ou chimarrão'] },
      almuerzo: { title: 'Prato com energia', items: ['Carboidrato: arroz, macarrão, batata, feijão', 'Proteína magra', 'Verduras'] },
      merienda: { title: 'Pré-treino', items: ['Banana ou fruta', 'Torradas com mel ou geleia', 'Iogurte'], tip: '1–2 horas antes do treino, algo leve com carboidratos.' },
      cena: { title: 'Recuperação', items: ['Proteína', 'Carboidrato se o treino foi longo', 'Verduras'] },
    }),
    rules: ['Os carboidratos são seu combustível: não os evite em dias de treino.', 'Hidrate-se antes, durante e depois. Se sua muito, some sais (uma pitada de sal ou isotônico).', 'Proteína para recuperar.', 'Mobilidade e alongamentos para evitar lesões.'],
  },
  salud: {
    plan: SAME_PT({
      desayuno: { title: 'Equilibrado', items: ['Fruta', 'Iogurte ou ovos', 'Aveia ou pão integral'] },
      almuerzo: { title: 'O prato saudável', items: ['½ prato de verduras', '¼ de proteína', '¼ de carboidrato integral'] },
      merienda: { title: 'Simples', items: ['Fruta + castanhas', 'Ou iogurte', 'Chá sem açúcar'] },
      cena: { title: 'Leve', items: ['Proteína', 'Verduras', 'Porção pequena de carboidrato se tiver fome'] },
    }),
    rules: ['Comida caseira na maior parte do tempo.', 'Verduras no almoço e no jantar.', 'Água como bebida principal; evitar bebidas açucaradas.', 'Se mexer todos os dias: 30 minutos de caminhada ou 8.000 passos.', 'Dormir 7–8 horas.'],
  },
};

const HABIT_PT = {
  agua_manana: ['Copo de água ao acordar', 'Deixe um copo ou garrafa no criado-mudo para tomar assim que acordar.'],
  caminata: ['Caminhada de 20–30′ (ou 8.000 passos)', '20–30 minutos leves depois do almoço ajudam a controlar o açúcar no sangue e somam na queima de gordura.'],
  cena_sin_carbos: ['Jantar sem carboidratos', 'Proteína forte + verduras, e nada de pão, arroz, batata nem macarrão à noite.'],
  sin_azucar: ['Sem açúcar nem bebidas açucaradas', 'Troque refrigerantes e sucos por água, água com gás ou chás. Doce, só de vez em quando.'],
  proteina: ['Proteína em cada refeição', 'Ovos, iogurte grego, carne, frango, peixe, queijo ou feijão: algo disso em cada refeição.'],
  comidas: ['Fiz todas as refeições', 'Se custa chegar, some líquidos com calorias (vitamina de leite e banana) ou castanhas.'],
  sueno: ['Dormi 7–8 horas', 'Horário fixo para deitar e telas longe 30 minutos antes de dormir.'],
  carbos_pre: ['Comi carboidratos antes de treinar', 'Uma banana ou torradas 1–2 h antes do treino dão energia para render.'],
  movilidad: ['Mobilidade ou alongamento 10′', '10 minutos de mobilidade depois do treino reduzem dores e lesões.'],
  verduras: ['Verduras no almoço e no jantar', 'Tenha verduras já lavadas e cortadas na geladeira para facilitar.'],
};

function applyPT() {
  const set = (obj, map) => { for (const [k, v] of Object.entries(map)) if (obj[k]) Object.assign(obj[k], v); };
  // Guardar los nombres en español para que los datos nuevos se sigan guardando en el idioma base
  for (const o of Object.values(OBJECTIVES)) { o.nameEs = o.name; o.tipEs = o.tip; }
  for (const p of Object.values(PLACES)) p.nameEs = p.name;
  const reg = (es, pt) => { TR_PT[es] = pt; };

  set(MUSCLES, { pecho: { name: 'Peito' }, espalda: { name: 'Costas' }, hombros: { name: 'Ombros' }, biceps: { name: 'Bíceps' }, triceps: { name: 'Tríceps' }, piernas: { name: 'Pernas' }, gluteos: { name: 'Glúteos' }, gemelos: { name: 'Panturrilhas' }, core: { name: 'Abdômen' }, cardio: { name: 'Cardio' } });
  Object.assign(EQUIP, { barra: 'Barra', mancuernas: 'Halteres', maquina: 'Máquina', polea: 'Polia', cuerpo: 'Peso corporal', kettlebell: 'Kettlebell / halter', barra_dom: 'Barra fixa', otro: 'Outro' });
  set(PLACES, {
    gym: { name: 'Academia', desc: 'Máquinas, polias, barras e halteres' },
    mancuernas: { name: 'Casa com halteres', desc: 'Um par de halteres e uma cadeira ou banco' },
    casa: { name: 'Casa sem equipamento', desc: 'Só o peso do corpo' },
  });
  set(OBJECTIVES, {
    grasa: { name: 'Perder gordura', desc: 'Perder gordura mantendo o músculo', tip: 'Supersséries com pouco descanso, cardio leve quase todos os dias e um déficit calórico moderado.' },
    masa: { name: 'Ganhar massa muscular', desc: 'Mais músculo com um superávit leve', tip: 'Mais séries por músculo, faixa de 8–12 reps e comer um pouco acima do que você gasta.' },
    fuerza: { name: 'Ganhar força', desc: 'Levantar mais nos exercícios básicos', tip: 'Os dois primeiros exercícios de cada dia são pesados (3–5 reps) com descansos longos. O resto, acessórios.' },
    resistencia: { name: 'Resistência', desc: 'Aguentar mais: circuitos e cardio', tip: 'Circuitos de 3 exercícios sem pausa entre eles, muitas repetições e um bloco final de condicionamento.' },
    recomp: { name: 'Recomposição', desc: 'Perder gordura e ganhar músculo ao mesmo tempo (ideal se está começando)', tip: 'Treino de força com progressão, muita proteína e um déficit pequeno.' },
    salud: { name: 'Saúde e bem-estar', desc: 'Se mexer melhor, mais energia e bons hábitos', tip: 'Treinos curtos de corpo inteiro, constância e movimento diário.' },
  });
  for (const o of Object.values(OBJECTIVES)) { reg(o.nameEs, o.name); reg(o.tipEs, o.tip); }
  for (const p of Object.values(PLACES)) reg(p.nameEs, p.name);
  set(LEVELS, {
    principiante: { name: 'Iniciante', desc: 'Menos de 6 meses treinando de forma constante' },
    intermedio: { name: 'Intermediário', desc: 'Mais de 6 meses treinando e conhece os exercícios básicos' },
  });
  set(ACTIVITY, {
    sedentario: { name: 'Sedentária', desc: 'Trabalho sentado, pouco movimento' },
    ligero: { name: 'Leve', desc: 'Caminho um pouco durante o dia' },
    activo: { name: 'Ativa', desc: 'Trabalho em pé ou muito ativo' },
  });
  const meals = { desayuno: ['Café da manhã', 'O café da manhã'], almuerzo: ['Almoço', 'O almoço'], merienda: ['Lanche', 'O lanche'], cena: ['Jantar', 'O jantar'] };
  for (const m of MEALS) [m.name, m.art] = meals[m.key];
  for (const [id, [name, cue]] of Object.entries(CATALOG_PT)) if (CATALOG[id]) Object.assign(CATALOG[id], { name, cue });
  for (const [k, v] of Object.entries(NUTRITION_PT)) Object.assign(NUTRITION[k], v);
  for (const [k, [name, tip]] of Object.entries(HABIT_PT)) Object.assign(HABIT_INFO[k], { name, tip });
  PLATE.splice(0, PLATE.length,
    ['½ prato', 'Verduras e frutas, com cor e variedade (a batata não conta).'],
    ['¼ prato', 'Grãos integrais: aveia, arroz integral, quinoa, trigo integral.'],
    ['¼ prato', 'Proteína: peixe, frango, feijão, castanhas. Limitar carne vermelha, evitar processados.'],
    ['Óleos', 'Azeite, canola, girassol, com moderação. Evitar gorduras trans.'],
    ['Bebidas', 'Água, café ou chá. Sem bebidas açucaradas; suco no máximo um copo pequeno.']);
  Object.assign(RECIPE, {
    title: 'Panquecas de aveia (5 un.)',
    items: ['4 ovos', '100 g de aveia em flocos', '1 colher de chá de fermento', '100 ml de leite de soja', '1 pitada de sal', '1 fava de baunilha'],
    steps: ['Bater tudo no liquidificador e deixar descansar 20 min.', 'Na frigideira, virar quando aparecerem bolhas.', 'Acompanhar com fruta fresca e um quadradinho de chocolate amargo.'],
  });
}
if (LANG === 'pt') applyPT();
