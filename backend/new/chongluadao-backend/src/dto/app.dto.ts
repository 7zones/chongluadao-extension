export class InitSessionDTO {
  app: string;

  secret: string;
}

export class TokenDTO {
  token: string;
}
export class BaseSessionDTO {
  version: string;

  requestedOn: Date;

  token?: string;

  refresh?: string;

  message?: string;

  status?: number;
}

export class RateDTO {
  rating: number;

  url: string;
}

export class UrlDTO {
  url: string;
}