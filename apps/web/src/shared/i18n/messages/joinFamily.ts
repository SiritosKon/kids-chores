import { defineMessages } from '../lib';

export const joinFamily = defineMessages({
  ru: {
    title: 'Подключиться к близким',
    intro:
      'Укажите почту или телефон, с которыми входит в приложение ваш близкий. Он увидит запрос в настройках и подтвердит его.',
    replaceAlone:
      'Когда запрос подтвердят, на этом устройстве появятся общие дети, задачи и награды, а то, что вы успели завести здесь сами, удалится.',
    replaceShared:
      'Когда запрос подтвердят, на этом устройстве появятся дети, задачи и награды той семьи. Нынешние данные останутся у остальных взрослых.',
    send: 'Отправить запрос',
    sentTitle: 'Запрос отправлен',
    sent: 'Если этот человек пользуется {app}, он увидит запрос. Как только он подтвердит его, данные появятся здесь.',
    tooMany: 'Слишком много запросов за сутки. Попробуйте завтра.',
    done: 'Хорошо',
    invite: '{name} зовёт вас в семью',
    inviteCaption: 'Приглашение действует до {date}',
    someone: 'Кто-то',
    accept: 'Принять',
    acceptAlone: 'На этом устройстве появятся общие дети, задачи и награды. То, что вы успели завести здесь сами, удалится.',
    acceptShared:
      'На этом устройстве появятся дети, задачи и награды этой семьи. Нынешние данные останутся у остальных взрослых.',
    joined: 'Готово! Данные появятся через пару секунд.',
    failed: 'Не получилось. Проверьте интернет и попробуйте ещё раз.',
    inviteTitle: 'Приглашение в семью',
    gone: 'Приглашение устарело или им уже воспользовались. Попросите новое у того, кто его прислал.',
    checkFailed: 'Не получилось проверить приглашение. Проверьте интернет.',
    retry: 'Ещё раз',
    alreadyIn: 'Вы уже в этой семье',
  },
  en: {
    title: 'Connect to family members',
    intro:
      'Enter the email or phone your family member signs in to the app with. They will see the request in the settings and confirm it.',
    replaceAlone:
      "Once the request is confirmed, this device shows the shared kids, chores and rewards, and anything you set up here on your own is deleted.",
    replaceShared:
      "Once the request is confirmed, this device shows that family's kids, chores and rewards. The current data stays with the other adults.",
    send: 'Send the request',
    sentTitle: 'Request sent',
    sent: 'If this person uses {app}, they will see the request. As soon as they confirm it, the data shows up here.',
    tooMany: 'Too many requests today. Try again tomorrow.',
    done: 'OK',
    invite: '{name} invites you to the family',
    inviteCaption: 'The invitation is valid until {date}',
    someone: 'Someone',
    accept: 'Accept',
    acceptAlone: 'This device will show the shared kids, chores and rewards. Anything you set up here on your own is deleted.',
    acceptShared: "This device will show this family's kids, chores and rewards. The current data stays with the other adults.",
    joined: 'Done! The data will show up in a few seconds.',
    failed: "That didn't work. Check the internet and try again.",
    inviteTitle: 'Invitation to a family',
    gone: 'The invitation has expired or was already used. Ask whoever sent it for a new one.',
    checkFailed: "Couldn't check the invitation. Check the internet.",
    retry: 'Try again',
    alreadyIn: "You're already in this family",
  },
  es: {
    title: 'Conectarse con familiares',
    intro:
      'Indica el correo o el teléfono con el que entra en la app tu familiar. Verá la solicitud en los ajustes y la confirmará.',
    replaceAlone:
      'Cuando confirmen la solicitud, este dispositivo mostrará los niños, las tareas y los premios compartidos, y lo que hayas creado aquí por tu cuenta se eliminará.',
    replaceShared:
      'Cuando confirmen la solicitud, este dispositivo mostrará los niños, las tareas y los premios de esa familia. Los datos actuales se quedan con los demás adultos.',
    send: 'Enviar la solicitud',
    sentTitle: 'Solicitud enviada',
    sent: 'Si esta persona usa {app}, verá la solicitud. En cuanto la confirme, los datos aparecerán aquí.',
    tooMany: 'Demasiadas solicitudes hoy. Inténtalo mañana.',
    done: 'Vale',
    invite: '{name} te invita a la familia',
    inviteCaption: 'La invitación es válida hasta el {date}',
    someone: 'Alguien',
    accept: 'Aceptar',
    acceptAlone:
      'Este dispositivo mostrará los niños, las tareas y los premios compartidos. Lo que hayas creado aquí por tu cuenta se eliminará.',
    acceptShared:
      'Este dispositivo mostrará los niños, las tareas y los premios de esta familia. Los datos actuales se quedan con los demás adultos.',
    joined: '¡Listo! Los datos aparecerán en unos segundos.',
    failed: 'No ha funcionado. Revisa internet e inténtalo de nuevo.',
    inviteTitle: 'Invitación a una familia',
    gone: 'La invitación ha caducado o ya se usó. Pide una nueva a quien te la envió.',
    checkFailed: 'No se pudo comprobar la invitación. Revisa internet.',
    retry: 'Reintentar',
    alreadyIn: 'Ya estás en esta familia',
  },
});
