export type ResetStep = 'email' | 'code' | 'next' | 'repeat';

export type PinDialogMode = 'login' | 'reset';

export type PinCodeReply = 'ok' | 'wrong' | 'noEmail' | 'expired' | 'tooSoon' | 'offline' | 'failed';

export type PinCodeFailure = Exclude<PinCodeReply, 'ok'>;
