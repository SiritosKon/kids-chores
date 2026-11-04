import { defineMessages } from '../lib';

export const installApp = defineMessages({
  ru: {
    step: 'Шаг {current} из {total}',
    gotIt: 'Понятно',
    shareTitle: 'Нажмите «Поделиться»',
    shareText:
      'В Safari это квадрат со стрелкой вверх: на iPad — справа от адресной строки, на iPhone — внизу экрана. Если значка не видно, он спрятан в меню «•••».',
    addTitle: 'Выберите «На экран „Домой“»',
    addText: 'Пункт находится в списке действий под контактами и приложениями. Если его не видно, пролистайте список вниз.',
    confirmTitle: 'Нажмите «Добавить»',
    confirmText:
      'На экране «Домой» появится иконка с копилкой. Открывайте приложение с неё: оно запускается на весь экран и работает без интернета.',
    moveTitle: 'Перенесите данные',
    moveText:
      'У приложения на экране «Домой» своё хранилище: отметки из этой вкладки туда не попадут. Сделайте здесь «Экспорт данных» в родительском режиме, а в приложении — «Импорт». И не удаляйте иконку без экспорта — данные удалятся вместе с ней.',
  },
  en: {
    step: 'Step {current} of {total}',
    gotIt: 'Got it',
    shareTitle: 'Tap “Share”',
    shareText:
      'In Safari it is the square with an arrow pointing up: on iPad to the right of the address bar, on iPhone at the bottom of the screen. If you can’t see it, it is hidden in the “•••” menu.',
    addTitle: 'Choose “Add to Home Screen”',
    addText: 'It is in the list of actions below your contacts and apps. If you can’t see it, scroll the list down.',
    confirmTitle: 'Tap “Add”',
    confirmText:
      'A piggy bank icon appears on your Home Screen. Open the app from it: it runs full screen and works offline.',
    moveTitle: 'Move your data',
    moveText:
      'The Home Screen app keeps its own storage, so marks from this tab won’t show up there. Use “Export data” here in parent mode and “Import data” in the app. Don’t delete the icon without exporting first: your data goes with it.',
  },
  es: {
    step: 'Paso {current} de {total}',
    gotIt: 'Entendido',
    shareTitle: 'Toca «Compartir»',
    shareText:
      'En Safari es el cuadrado con una flecha hacia arriba: en el iPad, a la derecha de la barra de direcciones; en el iPhone, abajo. Si no lo ves, está en el menú «•••».',
    addTitle: 'Elige «Añadir a pantalla de inicio»',
    addText: 'Está en la lista de acciones, debajo de los contactos y las apps. Si no lo ves, desliza la lista hacia abajo.',
    confirmTitle: 'Toca «Añadir»',
    confirmText:
      'Aparecerá un icono con una alcancía en la pantalla de inicio. Abre la app desde ahí: ocupa toda la pantalla y funciona sin internet.',
    moveTitle: 'Pasa tus datos',
    moveText:
      'La app de la pantalla de inicio tiene su propio almacenamiento: las marcas de esta pestaña no pasan a ella. Usa «Exportar datos» aquí en el modo padres e «Importar datos» en la app. No borres el icono sin exportar antes: los datos se borran con él.',
  },
});
