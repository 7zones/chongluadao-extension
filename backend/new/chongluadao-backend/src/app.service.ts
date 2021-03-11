import {
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  CloseSessionSuccess,
  InitSessionDTO,
  InitSessionResErr,
  InitSessionResSuccess,
  TokenDTO,
  TokenResSuccess,
} from './dto/app.dto';
import { getClients } from './shared/const';
import * as jwt from 'jsonwebtoken';

const clients = getClients();
const accessTokenSecret = process.env.AUTH_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.AUTH_REFRESH_TOKEN_SECRET;
const authExpiration = process.env.AUTH_EXPIRATION;
const appVersion = process.env.APP_VERSION;

@Injectable()
export class AppService {
  refreshTokens = [];
  constructor() {}

  async initSession(
    initSessionDTO: InitSessionDTO,
  ): Promise<InitSessionResSuccess | InitSessionResErr> {
    const { app, secret } = initSessionDTO;
    const client = clients.find((u) => {
      return u.app === app && u.secret === secret;
    });
    if (client) {
      // generate access token: username, role, tokenSecret, expire time
      const accessToken = jwt.sign(
        {
          username: client.app,
          role: client.role,
        },
        accessTokenSecret,
        {
          expiresIn: authExpiration,
        },
      );

      // generate refreshTokenSecret: username, role, refreshTokenSecret
      const refreshToken = jwt.sign(
        {
          username: client.app,
          role: client.role,
        },
        refreshTokenSecret,
      );

      this.refreshTokens.push(refreshToken);
      const res = new InitSessionResSuccess();
      res.version = appVersion;
      res.requestedOn = new Date();
      res.token = accessToken;
      res.refresh = refreshToken;

      return res;
    } else {
      const res = new InitSessionResErr();
      res.version = appVersion;
      res.requestedOn = new Date();
      res.message = `Client application credential incorrect. ${HttpStatus.UNAUTHORIZED}`;

      return res;
    }
  }

  async postToken(tokenDTO: TokenDTO): Promise<TokenResSuccess> {
    const { token } = tokenDTO;

    if (!this.refreshTokens.includes(token)) {
      throw new ForbiddenException();
    }

    const jwtPromise = new Promise<TokenResSuccess>((resolve, reject) => {
      jwt.verify(token, refreshTokenSecret, (err, client) => {
        if (err) {
          throw new ForbiddenException();
        }

        const accessToken = jwt.sign(
          {
            username: client.app,
            role: client.role,
          },
          accessTokenSecret,
          {
            expiresIn: authExpiration,
          },
        );

        const res: TokenResSuccess = {
          status: HttpStatus.OK,
          version: appVersion,
          requestedOn: new Date(),
          token: accessToken,
        };

        resolve(res);
      });
    });

    return await jwtPromise;
  }

  closeSession(tokenDTO: TokenDTO): CloseSessionSuccess {
    const { token } = tokenDTO;
    this.refreshTokens = this.refreshTokens.filter(t => t !== token);

    const res: CloseSessionSuccess = {
      status: HttpStatus.OK,
      version: appVersion,
      requestedOn: new Date(),
      message: "Session closed",
    };
    return res;
  }

  getPing(): string {
    return 'getPing';
  }

  postRate(): string {
    return 'postRate';
  }

  typelist(): string {
    return 'typelist';
  }

  postResId(): string {
    return 'postResId';
  }

  importFiles(): string {
    return 'importFiles';
  }

  safeCheck(): string {
    return 'safeCheck';
  }

  safeCheckType(): string {
    return 'safeCheckType';
  }
}
