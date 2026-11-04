import type { MeResponse, MetaResponse } from '@kids-chores/contracts';

export type ServerAuth = MetaResponse['auth'];

export type MeResult = { status: 'signedIn'; me: MeResponse } | { status: 'signedOut' } | { status: 'unreachable' };
