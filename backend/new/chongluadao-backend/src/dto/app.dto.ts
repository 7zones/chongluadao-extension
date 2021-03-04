export class InitSessionDTO {
  app: string;

  secret: string;
}

export class InitSessionResSuccess {
  version: string;

  requestedOn: Date;

  token: string;

  refresh: string;
}

export class InitSessionResErr {
  version: string;

  requestedOn: Date;

  message: string;
}

export class TokenDTO {
  token: string;
}

export class TokenResSuccess {
  status: number;

  version: string;

  requestedOn: Date;

  token: string;
}
