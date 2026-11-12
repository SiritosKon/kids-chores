import type { InvitePreview, MeResponse, MetaResponse } from '@kids-chores/contracts';

export type ServerAuth = MetaResponse['auth'];

export type MeResult = { status: 'signedIn'; me: MeResponse } | { status: 'signedOut' } | { status: 'unreachable' };

export type InvitePreviewResult = { status: 'ready'; preview: InvitePreview } | { status: 'gone' } | { status: 'failed' };

export type JoinRequestResult = 'sent' | 'tooMany' | 'failed';
