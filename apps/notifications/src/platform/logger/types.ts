export interface LoggedRequest {
  id: unknown;
  method?: string;
  url?: string;
}

export interface LoggedResponse {
  statusCode: number;
}
