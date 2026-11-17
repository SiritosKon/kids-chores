import type { LoggedRequest, LoggedResponse } from './types';

export const requestSummary = (req: LoggedRequest): LoggedRequest => ({
  id: req.id,
  method: req.method,
  url: req.url,
});

export const responseSummary = (res: LoggedResponse): LoggedResponse => ({ statusCode: res.statusCode });
