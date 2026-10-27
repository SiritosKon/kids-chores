import type { ChangelogEntry } from './types';

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: '0.7.0',
    date: '2026-10-27',
    notes: {
      ru: [
        'Выпуск 0.7: аккаунт семьи. Вход через Google, а дальше — по Face ID или Touch ID',
        'Дети, задачи, награды, отметки и покупки хранятся в аккаунте и сами переходят на другие устройства семьи. Без сети изменения копятся на устройстве и уходят, когда связь появится',
        'Вход необязателен: без него всё работает, как раньше, на одном устройстве. Фото детей и вариантов наград остаются на устройстве',
        'В знакомстве с приложением подсказки крупнее, у каждой есть кнопка «Пропустить», а нажатие мимо подсказки тоже предлагает пропустить знакомство',
        'На широком экране меню всегда открыто слева, в нём название приложения. На узком меню открывается кнопкой, а шапка теперь от края до края',
        'Аккаунт — отдельным блоком наверху меню, там же видно, когда данные последний раз ушли на сервер',
        'После входа приложение сразу возвращает на главную, кнопки входа стали компактнее',
        'На странице аккаунта есть кнопка входа в родительский режим: Face ID и выход из аккаунта — там',
        'Аккаунт заработает в опубликованном приложении, когда у него появится свой сервер. Пока его можно попробовать в локальной сборке',
      ],
      en: [
        'Release 0.7: a family account. Sign in with Google, then with Face ID or Touch ID',
        "Kids, chores, rewards, marks and purchases are kept in the account and reach the family's other devices on their own. Offline, changes wait on the device and go out once there is a connection",
        'Signing in is optional: without it everything works as before on one device. Photos of kids and reward variants stay on the device',
        'The app tour has bigger tips, each with a Skip button, and tapping outside a tip also offers to skip the tour',
        'On wide screens the menu stays open on the left with the app name in it. On narrow screens the menu opens with a button, and the top bar now runs edge to edge',
        'The account has its own block at the top of the menu, showing when the data last reached the server',
        'After signing in the app goes straight back to the home screen, and the sign-in buttons are more compact',
        'The account page has a button to enter parent mode, where Face ID and signing out live',
        'The account will work in the published app once it has its own server. For now you can try it in a local build',
      ],
      es: [
        'Versión 0.7: una cuenta familiar. Inicia sesión con Google y después con Face ID o Touch ID',
        'Niños, tareas, premios, marcas y compras se guardan en la cuenta y llegan solos a los demás dispositivos de la familia. Sin conexión, los cambios esperan en el dispositivo y se envían cuando vuelve la conexión',
        'Iniciar sesión es opcional: sin ella todo funciona como antes en un solo dispositivo. Las fotos de los niños y de las variantes de premios se quedan en el dispositivo',
        'El recorrido por la app tiene consejos más grandes, cada uno con un botón Saltar, y tocar fuera de un consejo también ofrece saltar el recorrido',
        'En pantallas anchas el menú queda abierto a la izquierda con el nombre de la app. En pantallas estrechas se abre con un botón, y la barra superior ahora va de borde a borde',
        'La cuenta tiene su propio bloque arriba del menú, donde se ve cuándo los datos llegaron al servidor por última vez',
        'Después de iniciar sesión la app vuelve directamente a la pantalla principal, y los botones de inicio de sesión son más compactos',
        'La página de la cuenta tiene un botón para entrar al modo padres, donde están Face ID y el cierre de sesión',
        'La cuenta funcionará en la app publicada cuando tenga su propio servidor. Por ahora puedes probarla en una versión local',
      ],
    },
  },
  {
    version: '0.6.2',
    date: '2026-10-27',
    notes: {
      ru: ['Экран больше не уезжает под верхнюю панель iPad при прокрутке и после ввода с клавиатуры'],
      en: ['The screen no longer slides under the iPad top bar when scrolling or after typing'],
      es: ['La pantalla ya no se desliza bajo la barra superior del iPad al desplazarse o después de escribir'],
    },
  },
  {
    version: '0.6.1',
    date: '2026-10-27',
    notes: {
      ru: ['На широком экране меню выезжает от края экрана, а поля по бокам чёрные, а не серые'],
      en: ['On wide screens the menu slides in from the screen edge, and the side margins are black instead of grey'],
      es: ['En pantallas anchas el menú sale desde el borde de la pantalla y los márgenes laterales son negros, no grises'],
    },
  },
  {
    version: '0.6.0',
    date: '2026-10-18',
    notes: {
      ru: [
        'Выпуск 0.6: приложение теперь Little Big Deals и говорит на русском, английском и испанском',
        'Боковое меню, отдельные страницы вместо окон, кошелёк ребёнка и понятный первый запуск с примером — подробно в версиях 0.5.2–0.5.8 ниже',
      ],
      en: [
        'Release 0.6: the app is now Little Big Deals and speaks Russian, English and Spanish',
        'A side menu, pages instead of pop-ups, a kid wallet and a clear first launch with an example — details in versions 0.5.2–0.5.8 below',
      ],
      es: [
        'Versión 0.6: la app ahora se llama Little Big Deals y habla ruso, inglés y español',
        'Menú lateral, páginas en lugar de ventanas, monedero del niño y un primer inicio claro con un ejemplo: detalles en las versiones 0.5.2–0.5.8 más abajo',
      ],
    },
  },
  {
    version: '0.5.8',
    date: '2026-10-18',
    notes: {
      ru: ['На телефоне колонки детей на доске задач уже, и названия задач больше не ломаются по слову на строку'],
      en: ["On phones the kids' columns on the task board are narrower, so chore names no longer break one word per line"],
      es: ['En el móvil las columnas de los niños en el tablero son más estrechas y los nombres de las tareas ya no se parten palabra por palabra'],
    },
  },
  {
    version: '0.5.7',
    date: '2026-10-18',
    notes: {
      ru: [
        'Первый запуск: приложение сразу с примером — ребёнок, три задачи и три награды, всё можно поменять',
        'PIN родителя задаётся в окне поверх приложения, язык берётся с устройства',
        'Знакомство короче: четыре шага — дети, задачи, награды и меню',
        'На новом устройстве сразу включён бонус: +2 балла, если отмечены все задачи дня',
      ],
      en: [
        'First launch: the app opens with an example — a kid, three chores and three rewards, all of them editable',
        'The parent PIN is set in a window over the app; the language comes from the device',
        'A shorter intro tour: four steps — kids, chores, rewards and the menu',
        'A new device starts with the daily bonus on: +2 points when every chore of the day is ticked',
      ],
      es: [
        'Primer inicio: la app se abre con un ejemplo, un niño, tres tareas y tres premios, y todo se puede cambiar',
        'El PIN de padres se crea en una ventana sobre la app; el idioma se toma del dispositivo',
        'Un recorrido más corto: cuatro pasos, niños, tareas, premios y el menú',
        'En un dispositivo nuevo el bono diario ya está activado: +2 puntos si se marcan todas las tareas del día',
      ],
    },
  },
  {
    version: '0.5.6',
    date: '2026-10-18',
    notes: {
      ru: [
        'Приложение теперь называется Little Big Deals',
        'Три языка: русский, английский и испанский. Язык меняется внизу меню, у значка глобуса',
        'На новом устройстве язык выбирается по языку системы, у текущих установок остаётся русский',
        'Даты, календарь и «Что нового» — тоже на выбранном языке',
      ],
      en: [
        'The app is now called Little Big Deals',
        'Three languages: Russian, English and Spanish. Switch it at the bottom of the menu, by the globe icon',
        'A new device picks the system language; existing installs stay in Russian',
        "Dates, the calendar and What's new follow the chosen language too",
      ],
      es: [
        'La app ahora se llama Little Big Deals',
        'Tres idiomas: ruso, inglés y español. Se cambia abajo en el menú, junto al icono del globo',
        'En un dispositivo nuevo se usa el idioma del sistema; las instalaciones actuales siguen en ruso',
        'Las fechas, el calendario y las Novedades también siguen el idioma elegido',
      ],
    },
  },
  {
    version: '0.5.5',
    date: '2026-10-18',
    notes: {
      ru: [
        'Меню теперь — боковая панель слева: кнопка ☰ в шапке',
        'В меню появился пункт «Главная», текущая страница подсвечена',
        'Версия приложения — внизу меню, нажатие на неё открывает «Что нового»',
        'Рядом с меткой родительского режима — кнопка выхода; перед выходом приложение спрашивает подтверждение',
      ],
      en: [
        'The menu is now a side panel on the left: tap ☰ in the header',
        'The menu has a Home item, and the current page is highlighted',
        "The app version is at the bottom of the menu; tap it for What's new",
        'A leave button sits next to the parent mode badge, and leaving asks for confirmation',
      ],
      es: [
        'El menú ahora es un panel lateral a la izquierda: toca ☰ en la cabecera',
        'El menú tiene la opción «Inicio» y la página actual aparece resaltada',
        'La versión de la app está abajo en el menú; tócala para ver las Novedades',
        'Junto a la etiqueta del modo padres hay un botón para salir, y antes de salir se pide confirmación',
      ],
    },
  },
  {
    version: '0.5.4',
    date: '2026-10-18',
    notes: {
      ru: [
        'Тап по копилке открывает кошелёк ребёнка: баланс и все начисления и покупки по дням',
        'Серия ребёнка, история списаний, «Что нового» и «Как добавить на экран» открываются отдельными страницами вместо окон',
      ],
      en: [
        "Tapping the piggy bank opens the kid's wallet: the balance and every earning and purchase by day",
        "The kid's streak, spending history, “What's new” and “Add to Home Screen” open as pages instead of pop-ups",
      ],
      es: [
        'Al tocar la alcancía se abre el monedero del niño: el saldo y todo lo ganado y gastado por días',
        'La racha del niño, el historial de gastos, «Novedades» y «Añadir a la pantalla de inicio» se abren como páginas en lugar de ventanas',
      ],
    },
  },
  {
    version: '0.5.3',
    date: '2026-10-18',
    notes: {
      ru: [
        'Новое название на экране загрузки — Little Big Deals',
        'На iPad в горизонтальном положении экран загрузки больше не растянут. Чтобы увидеть, переустановите иконку на экран «Домой»',
        'Иконка во вкладке браузера видна и там, где браузер не понимает SVG-иконки',
      ],
      en: [
        'New name on the loading screen: Little Big Deals',
        'On iPad in landscape, the loading screen is no longer stretched. To see it, add the icon to your Home Screen again',
        "The browser tab icon now shows even in browsers that don't support SVG icons",
      ],
      es: [
        'Nuevo nombre en la pantalla de carga: Little Big Deals',
        'En el iPad en horizontal, la pantalla de carga ya no se ve estirada. Para verlo, vuelve a añadir el icono a la pantalla de inicio',
        'El icono de la pestaña del navegador se ve también en navegadores que no admiten iconos SVG',
      ],
    },
  },
  {
    version: '0.5.2',
    date: '2026-10-18',
    notes: {
      ru: [
        'Проверка для взрослых при сбросе PIN: примеры пяти видов вперемешку — умножение, сложение, вычитание, деление и в два действия',
      ],
      en: [
        'The grown-up check for resetting the PIN mixes five kinds of problems: multiplication, addition, subtraction, division and two-step',
      ],
      es: [
        'La comprobación para adultos al restablecer el PIN mezcla cinco tipos de operaciones: multiplicación, suma, resta, división y de dos pasos',
      ],
    },
  },
  {
    version: '0.5.1',
    date: '2026-10-07',
    notes: {
      ru: [
        'Фигурка на копилке: машинка, кораблик, самолётик, вертолётик или мяч — выбирается в карточке ребёнка',
        'Новая иконка — свинка-копилка на полосе прогресса',
        'Новый экран загрузки: фигурки едут к финишу, для вертикального и горизонтального экрана',
        'Иконка приложения и во вкладке браузера',
      ],
      en: [
        "A figure on the piggy bank: a truck, boat, plane, helicopter or ball — pick it on the kid's card",
        'New icon: a piggy bank on a progress bar',
        'New loading screen: figures racing to the finish line, in portrait and landscape',
        'The app icon now also shows in the browser tab',
      ],
      es: [
        'Una figura en la alcancía: camión, barco, avión, helicóptero o pelota; se elige en la ficha del niño',
        'Nuevo icono: una alcancía de cerdito sobre una barra de progreso',
        'Nueva pantalla de carga: figuras que corren hacia la meta, en vertical y en horizontal',
        'El icono de la app también aparece en la pestaña del navegador',
      ],
    },
  },
  {
    version: '0.5.0',
    date: '2026-10-07',
    notes: {
      ru: [
        'Квесты: разовое задание с баллами на срок — сегодня, до завтра, 3 дня, неделя или свои даты. Не успел — квест сгорает',
        'Кнопка «Добавить квест» на доске задач',
        'Задачу можно дать всем детям или только некоторым',
        'Цель ребёнка: награда, на которую он копит, своя полоса под копилкой и кнопка «Получить»',
        'Награду для цели можно создать прямо из карточки ребёнка — такая награда только для цели, в магазине её нет',
        'В родительском режиме под копилкой — «Добавить цель» и крестик, чтобы убрать цель',
        'Приз-сюрприз за серию: ребёнок видит «Сюрприз», а что это — узнаёт, когда получит',
        'Задача и ребёнок правятся на отдельных страницах, как награда',
        'Родительский режим сам закрывается после 5 минут без действий',
        'Забыли PIN — сброс через проверку для взрослых',
      ],
      en: [
        'Quests: a one-off task with points and a deadline — today, until tomorrow, 3 days, a week or your own dates. Miss it and the quest expires',
        'An “Add quest” button on the task board',
        'A task can go to all kids or just some of them',
        'Kid goals: a reward they save up for, with its own bar under the piggy bank and a “Get it” button',
        "You can create a goal reward right from the kid's card — it's only for the goal and doesn't show up in the shop",
        'In parent mode, the piggy bank has “Add goal” and a cross to remove the goal',
        'Surprise streak prize: the kid sees “Surprise” and finds out what it is when they get it',
        'Tasks and kids are edited on their own pages, like rewards',
        'Parent mode closes by itself after 5 minutes of inactivity',
        'Forgot your PIN? Reset it with a grown-up check',
      ],
      es: [
        'Misiones: una tarea única con puntos y plazo — hoy, hasta mañana, 3 días, una semana o tus propias fechas. Si no se cumple a tiempo, la misión caduca',
        'Botón «Añadir misión» en el tablero de tareas',
        'Una tarea puede ser para todos los niños o solo para algunos',
        'Meta del niño: un premio para el que ahorra, con su propia barra bajo la alcancía y un botón «Conseguir»',
        'Puedes crear el premio de una meta desde la ficha del niño: es solo para la meta y no aparece en la tienda',
        'En el modo padres, bajo la alcancía están «Añadir meta» y una cruz para quitarla',
        'Premio sorpresa por racha: el niño ve «Sorpresa» y descubre qué es al recibirlo',
        'Las tareas y los niños se editan en páginas propias, como los premios',
        'El modo padres se cierra solo tras 5 minutos sin actividad',
        '¿Olvidaste el PIN? Restablécelo con una comprobación para adultos',
      ],
    },
  },
  {
    version: '0.4.1',
    date: '2026-10-07',
    notes: {
      ru: [
        'Своя анимация на каждое событие: день закрыт — конфетти слева и справа, серия — огоньки снизу вверх, награда — салют по всему экрану',
        'Анимация за день одна, даже если день закрыли сразу несколько детей',
        'Праздник за день срабатывает, даже если бонус за все задачи выключен',
        'Огоньки серии видны поверх окна поздравления',
      ],
      en: [
        'Each event has its own animation: day done — confetti from the left and right, streak — sparks rising up, reward — fireworks across the screen',
        'One day-done animation, even when several kids finish the day at once',
        'The day-done celebration plays even when the all-tasks bonus is off',
        'Streak sparks show on top of the congratulations window',
      ],
      es: [
        'Cada evento tiene su propia animación: día completado, confeti a izquierda y derecha; racha, chispas que suben; premio, fuegos artificiales por toda la pantalla',
        'Una sola animación por día, aunque varios niños completen el día a la vez',
        'La celebración del día aparece aunque el bono por todas las tareas esté desactivado',
        'Las chispas de la racha se ven sobre la ventana de felicitación',
      ],
    },
  },
  {
    version: '0.4.0',
    date: '2026-09-30',
    notes: {
      ru: [
        'Серия из этапов: например, 7 дней — бабл-чай, 15 дней — набор Лего',
        'Приз за этап выдаётся один раз за серию, а не каждые N дней',
        'Этап можно назначить всем детям или только некоторым',
        'Настройки — отдельная страница: серия, бонус, смена PIN',
        'Награда с выбором: родитель добавляет варианты с фото, ребёнок выбирает',
        'Бейдж «Выбери подарок», если приз серии ждёт выбора',
        'Награды правятся на отдельной странице, варианты сортируются перетаскиванием',
        'Приз только за серию может быть без цены',
        'Своя анимация при получении награды',
        'Плавные переходы между страницами',
      ],
      en: [
        'Streaks with stages: for example, 7 days — bubble tea, 15 days — a LEGO set',
        'A stage prize is given once per streak, not every N days',
        'A stage can go to all kids or just some of them',
        'Settings are a separate page: streak, bonus, PIN change',
        'Rewards with choices: the parent adds options with photos, the kid picks one',
        'A “Pick a gift” badge when a streak prize is waiting for a choice',
        'Rewards are edited on their own page, and options can be reordered by dragging',
        'A streak-only prize can have no price',
        'A special animation when a reward is given',
        'Smooth transitions between pages',
      ],
      es: [
        'Rachas por etapas: por ejemplo, 7 días — un bubble tea, 15 días — un set de LEGO',
        'El premio de cada etapa se da una vez por racha, no cada N días',
        'Una etapa puede ser para todos los niños o solo para algunos',
        'Los ajustes están en su propia página: racha, bono y cambio de PIN',
        'Premios con opciones: los padres añaden opciones con fotos y el niño elige',
        'Insignia «Elige tu regalo» cuando un premio de racha espera elección',
        'Los premios se editan en su propia página y las opciones se ordenan arrastrándolas',
        'Un premio solo por racha puede no tener precio',
        'Animación propia al recibir un premio',
        'Transiciones suaves entre páginas',
      ],
    },
  },
  {
    version: '0.3.0',
    date: '2026-09-27',
    notes: {
      ru: [
        'Инструкция «Как добавить на экран» для iPhone и iPad в меню',
        'На стартовом экране — предупреждение, что данные хранятся только на устройстве',
      ],
      en: [
        'An “Add to Home Screen” guide for iPhone and iPad in the menu',
        'The welcome screen warns that data is stored only on this device',
      ],
      es: [
        'Guía «Añadir a la pantalla de inicio» para iPhone y iPad en el menú',
        'La pantalla de bienvenida avisa de que los datos se guardan solo en este dispositivo',
      ],
    },
  },
  {
    version: '0.2.8',
    date: '2026-09-27',
    notes: {
      ru: [
        'Дети, задачи и награды настраиваются прямо на главной в родительском режиме',
        'Фото ребёнка можно загрузить с устройства',
        'У награды одна настройка — где она: в магазине, только за серию или сюрприз',
        'Настройки: серия, бонус за все задачи дня и смена PIN',
        'Знакомство с приложением при первом запуске',
        'PIN вводится с цифровой клавиатуры',
        'История кошелька и списаний разбита по дням',
        'Огонёк серии появляется со второго дня подряд',
        'Новые и удалённые задачи больше не ломают прошлые серии',
        'Поздравление с серией не повторяется после правки истории',
        'Экран загрузки на iPad в любой ориентации',
      ],
      en: [
        'Kids, tasks and rewards are set up right on the home screen in parent mode',
        "A kid's photo can be uploaded from the device",
        'Rewards have one setting — where they live: in the shop, streak-only or surprise',
        "Settings: streak, bonus for all of the day's tasks, and PIN change",
        'An app tour on first launch',
        'The PIN is entered with a number pad',
        'Wallet and spending history are grouped by day',
        'The streak flame appears from the second day in a row',
        'New and deleted tasks no longer break past streaks',
        'The streak congratulations no longer repeat after editing history',
        'Loading screen on iPad in any orientation',
      ],
      es: [
        'Los niños, las tareas y los premios se configuran en la pantalla principal en el modo padres',
        'Puedes subir la foto del niño desde el dispositivo',
        'Los premios tienen un solo ajuste, dónde están: en la tienda, solo por racha o sorpresa',
        'Ajustes: racha, bono por todas las tareas del día y cambio de PIN',
        'Recorrido por la app en el primer inicio',
        'El PIN se introduce con un teclado numérico',
        'El historial del monedero y de gastos se agrupa por días',
        'La llama de la racha aparece a partir del segundo día seguido',
        'Las tareas nuevas y eliminadas ya no rompen las rachas pasadas',
        'La felicitación por la racha ya no se repite al editar el historial',
        'Pantalla de carga en el iPad en cualquier orientación',
      ],
    },
  },
  {
    version: '0.2.7',
    date: '2026-09-19',
    notes: {
      ru: ['Экран загрузки при запуске с домашнего экрана'],
      en: ['A loading screen when launching from the Home Screen'],
      es: ['Pantalla de carga al abrir la app desde la pantalla de inicio'],
    },
  },
  {
    version: '0.2.6',
    date: '2026-09-19',
    notes: {
      ru: ['Праздник за выполненный день теперь каждый раз разный', 'Особая анимация за достижение серии'],
      en: ['The day-done celebration is different every time', 'A special animation for reaching a streak'],
      es: ['La celebración por el día completado es diferente cada vez', 'Animación especial al lograr una racha'],
    },
  },
  {
    version: '0.2.5',
    date: '2026-09-19',
    notes: {
      ru: [
        'Серия: 🔥 за дни подряд со всеми задачами и награда за неделю',
        'Экран серии по клику на огонёк: прогресс до награды и рекорд',
        'Поздравление с наградой, когда серия достигнута',
        'Бабл Чай — приз за серию, в общем списке наград не показывается',
        'Вход в родительский режим теперь по 6-значному PIN-коду',
        'Экспорт всех данных одной кнопкой',
        'Подготовка к настройке детей, задач и наград',
      ],
      en: [
        'Streaks: 🔥 for days in a row with every task done, plus a reward for a full week',
        'Tap the flame for the streak screen: progress to the reward and the record',
        'Congratulations with a reward when the streak is reached',
        "Bubble tea is a streak prize and doesn't appear in the reward list",
        'Parent mode now opens with a 6-digit PIN',
        'Export all data with one button',
        'Groundwork for setting up kids, tasks and rewards',
      ],
      es: [
        'Rachas: 🔥 por días seguidos con todas las tareas hechas y un premio por una semana completa',
        'Toca la llama para ver la racha: el progreso hacia el premio y el récord',
        'Felicitación con premio al alcanzar la racha',
        'El bubble tea es un premio de racha y no aparece en la lista de premios',
        'El modo padres ahora se abre con un PIN de 6 dígitos',
        'Exporta todos los datos con un solo botón',
        'Preparativos para configurar niños, tareas y premios',
      ],
    },
  },
  {
    version: '0.2.0',
    date: '2026-09-19',
    notes: {
      ru: ['Внутренняя перестройка: фронт переведён на FSD и TypeScript'],
      en: ['Under the hood: the front end moved to FSD and TypeScript'],
      es: ['Cambios internos: el frontend pasó a FSD y TypeScript'],
    },
  },
  {
    version: '0.1.8',
    date: '2026-09-18',
    notes: {
      ru: ['Пополнен список наград'],
      en: ['More rewards in the list'],
      es: ['Más premios en la lista'],
    },
  },
  {
    version: '0.1.7',
    date: '2026-09-17',
    notes: {
      ru: ['Улучшения юзабилити'],
      en: ['Usability improvements'],
      es: ['Mejoras de usabilidad'],
    },
  },
  {
    version: '0.1.6',
    date: '2026-09-17',
    notes: {
      ru: ['Исправлено: отметки могли записаться на устаревшую дату (лишние баллы в копилке)'],
      en: ['Fixed: marks could be saved to an outdated date (extra points in the piggy bank)'],
      es: ['Corregido: las marcas podían guardarse con una fecha antigua (puntos de más en la alcancía)'],
    },
  },
  {
    version: '0.1.5',
    date: '2026-09-17',
    notes: {
      ru: [
        'Принятые отметки защищены от случайного снятия',
        'История кошелька по клику на копилку',
        'Автофокус на поле пароля',
      ],
      en: [
        'Accepted marks are protected from being cleared by accident',
        'Tap the piggy bank for the wallet history',
        'Autofocus on the password field',
      ],
      es: [
        'Las marcas aceptadas están protegidas contra borrados accidentales',
        'Toca la alcancía para ver el historial del monedero',
        'Enfoque automático en el campo de contraseña',
      ],
    },
  },
  {
    version: '0.1.4',
    date: '2026-09-17',
    notes: {
      ru: ['Экран «Что нового» и история изменений'],
      en: ["A “What's new” screen and change history"],
      es: ['Pantalla «Novedades» e historial de cambios'],
    },
  },
  {
    version: '0.1.3',
    date: '2026-09-17',
    notes: {
      ru: [
        'Копилка баллов и выдача наград',
        'Автобонус за все задачи дня + конфетти',
        'Версия в шапке, журнал версий, уведомления с крестиком',
      ],
      en: [
        'Points piggy bank and giving out rewards',
        "Automatic bonus for all of the day's tasks + confetti",
        'Version in the header, version log, notifications with a close button',
      ],
      es: [
        'Alcancía de puntos y entrega de premios',
        'Bono automático por todas las tareas del día + confeti',
        'Versión en la cabecera, registro de versiones y avisos con botón de cerrar',
      ],
    },
  },
  {
    version: '0.1.0',
    date: '2026-09-16',
    notes: {
      ru: ['Задачи для детей, гоалметр с машинками', 'Родительский режим, экспорт/импорт, установка как PWA'],
      en: ['Tasks for kids and a goal meter with little cars', 'Parent mode, export/import, install as a PWA'],
      es: ['Tareas para niños y un medidor de metas con cochecitos', 'Modo padres, exportar/importar e instalación como PWA'],
    },
  },
];
