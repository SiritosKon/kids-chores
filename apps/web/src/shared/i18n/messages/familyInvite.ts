import { defineMessages } from '../lib';

export const familyInvite = defineMessages({
  ru: {
    title: 'Пригласить взрослого',
    intro:
      'Пусть взрослый, которого вы зовёте, наведёт камеру телефона на код или откроет ссылку и войдёт в {app}. После входа он сразу окажется в вашей семье.',
    qrLabel: 'QR-код приглашения в семью',
    warning:
      'Ссылка одноразовая и действует до {date}. Кто откроет её первым и войдёт, станет взрослым в вашей семье — отправляйте её только тому, кого зовёте.',
    copy: 'Скопировать',
    copied: 'Ссылка скопирована',
    share: 'Отправить',
    shareText: 'Присоединяйся к нашей семье в {app}:',
    failed: 'Не получилось создать приглашение. Проверьте интернет.',
    retry: 'Ещё раз',
    byEmail: 'Или отправим ссылку письмом',
    emailLabel: 'Почта взрослого',
    sendEmail: 'Отправить',
    emailSent: 'Письмо с отдельной ссылкой отправлено на {email}',
    emailFailed: 'Не получилось отправить письмо. Попробуйте позже.',
    tooMany: 'Сегодня отправлено уже много приглашений. Попробуйте завтра.',
  },
  en: {
    title: 'Invite an adult',
    intro:
      "Have the adult you're inviting point their phone camera at the code or open the link and sign in to {app}. Right after signing in they're in your family.",
    qrLabel: 'QR code that invites into the family',
    warning:
      'The link works once and is valid until {date}. Whoever opens it first and signs in becomes an adult in your family, so send it only to the person you invite.',
    copy: 'Copy',
    copied: 'Link copied',
    share: 'Send',
    shareText: 'Join our family in {app}:',
    failed: "Couldn't create the invitation. Check the internet.",
    retry: 'Try again',
    byEmail: "Or we'll email them a link",
    emailLabel: "Adult's email",
    sendEmail: 'Send',
    emailSent: 'An email with its own link went to {email}',
    emailFailed: "Couldn't send the email. Try again later.",
    tooMany: 'Many invitations were sent today already. Try again tomorrow.',
  },
  es: {
    title: 'Invitar a un adulto',
    intro:
      'Pide al adulto que invitas que apunte la cámara del teléfono al código o abra el enlace y entre en {app}. Justo después de entrar estará en tu familia.',
    qrLabel: 'Código QR que invita a la familia',
    warning:
      'El enlace sirve una sola vez y es válido hasta el {date}. Quien lo abra primero y entre será un adulto de tu familia, así que envíalo solo a la persona que invitas.',
    copy: 'Copiar',
    copied: 'Enlace copiado',
    share: 'Enviar',
    shareText: 'Únete a nuestra familia en {app}:',
    failed: 'No se pudo crear la invitación. Revisa internet.',
    retry: 'Reintentar',
    byEmail: 'O le enviamos el enlace por correo',
    emailLabel: 'Correo del adulto',
    sendEmail: 'Enviar',
    emailSent: 'Hemos enviado un correo con su propio enlace a {email}',
    emailFailed: 'No se pudo enviar el correo. Inténtalo más tarde.',
    tooMany: 'Hoy ya se enviaron muchas invitaciones. Inténtalo mañana.',
  },
});
