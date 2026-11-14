import type { CreatedInvite, InvitePreview, MeResponse, MetaResponse } from '@kids-chores/contracts';

export type ServerAuth = MetaResponse['auth'];

export type MeResult = { status: 'signedIn'; me: MeResponse } | { status: 'signedOut' } | { status: 'unreachable' };

export type InvitePreviewResult = { status: 'ready'; preview: InvitePreview } | { status: 'gone' } | { status: 'failed' };

export type JoinRequestResult = 'sent' | 'tooMany' | 'failed';

export type CreateInviteResult = { status: 'created'; invite: CreatedInvite } | { status: 'tooMany' } | { status: 'failed' };

export type PinCodeSendResult = 'sent' | 'mismatch' | 'tooMany' | 'offline' | 'failed';

export type PinCodeCheckResult = 'ok' | 'wrong' | 'gone' | 'offline' | 'failed';

export type PinSaveResult = 'ok' | 'denied' | 'offline' | 'failed';

export type PinConfirmResult = 'ok' | 'wrong' | 'tooMany' | 'offline' | 'failed';

export type EmailLinkResult = 'ok' | 'wrong' | 'gone' | 'taken' | 'offline' | 'failed';
