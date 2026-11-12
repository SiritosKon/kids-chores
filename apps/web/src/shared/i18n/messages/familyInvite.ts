import { defineMessages } from '../lib';

export const familyInvite = defineMessages({
  ru: {
    title: 'Пригласить взрослого',
    intro:
      'Укажите почту или телефон, с которыми человек входит в {app}. Мы ничего ему не отправляем и не храним адрес — только его зашифрованный отпечаток, чтобы узнать человека при входе.',
    send: 'Пригласить',
    member: 'Этот человек уже в вашей семье',
    sentTitle: 'Приглашение готово',
    sent: 'Приглашение для {hint} действует 7 дней.',
    howEmail: 'Попросите человека установить {app} и войти через Google с этой почтой — приглашение появится сразу после входа.',
    howPhone: 'Попросите человека установить {app} и войти через Telegram с этим номером — приглашение появится сразу после входа.',
    share: 'Отправить ссылку',
    copy: 'Скопировать ссылку',
    copied: 'Ссылка скопирована',
    shareText: 'Присоединяйся к нашей семье в {app}: войди с адресом, на который я тебя пригласил(а).',
    done: 'Готово',
  },
  en: {
    title: 'Invite an adult',
    intro:
      "Enter the email or phone this person signs in to {app} with. We don't send them anything and don't keep the address — only an encrypted fingerprint to recognize them when they sign in.",
    send: 'Invite',
    member: 'This person is already in your family',
    sentTitle: 'The invitation is ready',
    sent: 'The invitation for {hint} is valid for 7 days.',
    howEmail: 'Ask them to install {app} and sign in with Google using this email — the invitation shows up right after they sign in.',
    howPhone: 'Ask them to install {app} and sign in with Telegram using this number — the invitation shows up right after they sign in.',
    share: 'Send the link',
    copy: 'Copy the link',
    copied: 'Link copied',
    shareText: 'Join our family in {app}: sign in with the address I invited you with.',
    done: 'Done',
  },
  es: {
    title: 'Invitar a un adulto',
    intro:
      'Indica el correo o el teléfono con el que esta persona entra en {app}. No le enviamos nada ni guardamos la dirección, solo una huella cifrada para reconocerla al entrar.',
    send: 'Invitar',
    member: 'Esta persona ya está en tu familia',
    sentTitle: 'La invitación está lista',
    sent: 'La invitación para {hint} es válida 7 días.',
    howEmail: 'Pídele que instale {app} y entre con Google usando este correo: la invitación aparecerá justo después de entrar.',
    howPhone: 'Pídele que instale {app} y entre con Telegram usando este número: la invitación aparecerá justo después de entrar.',
    share: 'Enviar el enlace',
    copy: 'Copiar el enlace',
    copied: 'Enlace copiado',
    shareText: 'Únete a nuestra familia en {app}: entra con la dirección con la que te invité.',
    done: 'Listo',
  },
});
