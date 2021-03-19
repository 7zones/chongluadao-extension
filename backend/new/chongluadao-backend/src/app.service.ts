import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  BaseSessionDTO,
  InitSessionDTO,
  RateDTO,
  TokenDTO,
} from './dto/app.dto';
import { getClients } from './shared/const';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';

const clients = getClients();
const accessTokenSecret = process.env.AUTH_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.AUTH_REFRESH_TOKEN_SECRET;
const authExpiration = process.env.AUTH_EXPIRATION;
const appVersion = process.env.APP_VERSION;

mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useCreateIndex: true },
);
//mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true, useCreateIndex: true })
const db = mongoose.connection;
@Injectable()
export class AppService {
  refreshTokens = [];
  constructor() {}

  async initSession(
    initSessionDTO: InitSessionDTO,
  ): Promise<BaseSessionDTO | BaseSessionDTO> {
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
      const res = new BaseSessionDTO();
      res.version = appVersion;
      res.requestedOn = new Date();
      res.token = accessToken;
      res.refresh = refreshToken;

      return res;
    } else {
      const res = new BaseSessionDTO();
      res.version = appVersion;
      res.requestedOn = new Date();
      res.message = `Client application credential incorrect. ${HttpStatus.UNAUTHORIZED}`;

      return res;
    }
  }

  async postToken(tokenDTO: TokenDTO): Promise<BaseSessionDTO> {
    const { token } = tokenDTO;

    if (!this.refreshTokens.includes(token)) {
      throw new ForbiddenException();
    }

    const jwtPromise = new Promise<BaseSessionDTO>((resolve, reject) => {
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

        const res: BaseSessionDTO = {
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

  closeSession(tokenDTO: TokenDTO): BaseSessionDTO {
    const { token } = tokenDTO;
    this.refreshTokens = this.refreshTokens.filter((t) => t !== token);

    const res: BaseSessionDTO = {
      status: HttpStatus.OK,
      version: appVersion,
      requestedOn: new Date(),
      message: 'Session closed',
    };
    return res;
  }

  getPing(): BaseSessionDTO {
    const res: BaseSessionDTO = {
      status: HttpStatus.OK,
      version: appVersion,
      requestedOn: new Date(),
    };
    return res;
  }

  async postRate(rateDTO: RateDTO, reqIp) {
    const params = { time: new Date(), ...rateDTO, ip: reqIp };
    const msg = this.validateSubmitting(params);
    if (msg.indexOf('ok') == -1) {
      throw new BadRequestException(msg);
    } else {
      if (params) {
        await db.collection('rating').insertOne(params);

        const rs: BaseSessionDTO = {
          status: HttpStatus.OK,
          version: appVersion,
          requestedOn: new Date(),
          message: 'ok',
        };
        return rs;
      }
    }
    return 'postRate';
  }

  async getTypelist(typelist: string) {
    let type = null;
    switch (typelist) {
      case 'blacklist':
        type = 'blacklist';
        break;
      case 'whitelist':
        type = 'whitelist';
        break;
      case 'pornlist':
        type = 'pornlist';
        break;
      default:
        throw new BadRequestException(
          typelist + ' is not a valid type of list',
        );
    }
    const rs = await db.collection(type).find().toArray();
    return rs;
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

  validateSubmitting(params) {
    const { rating, url } = params;
    const expUrl = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

    if (rating < 1 || rating > 5) {
      return 'Rating is out of range';
    } else if (!url.match(new RegExp(expUrl))) {
      return `Incorrect URL ${url}`;
    }
    return 'ok';
  }
}
