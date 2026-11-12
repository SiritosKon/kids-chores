import type { FamilyInvite, MeResponse, MetaResponse } from '@kids-chores/contracts';

export type ServerAuth = MetaResponse['auth'];

export type MeResult = { status: 'signedIn'; me: MeResponse } | { status: 'signedOut' } | { status: 'unreachable' };

export type InviteResult = { status: 'sent'; invite: FamilyInvite } | { status: 'member' } | { status: 'failed' };

export type JoinRequestResult = 'sent' | 'tooMany' | 'failed';
