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

  async safeCheck(url: string) {

    // if(!url || url.length > process.env.MAX_LENGTH_URL) {
    //     return res.sendStatus(status.BAD_REQUEST);
    // }
    // db.collection('blacklist').find().toArray().then(result => {
    //     // Check if current url exist in our Blacklist :
    //     for(let blacksite of result) {
    //         let site = blacksite.url.replace('https://', '').replace('http://', '').replace('www.', '')
    //         let appendix = "[/]?(?:index\.[a-z0-9]+)?[/]?$";
    //         let trail = site.substr(site.length - 2);
    //         let match = false

    //         if (trail == "/*") {
    //             site = site.substr(0, site.length - 2);
    //             appendix = "(?:$|/.*$)";
    //             site = "^(?:[a-z0-9\\-_]+:\/\/)?(?:www\\.)?" + site + appendix;

    //             let regex = new RegExp(site, "i");
    //             match = url.match(regex)
    //             match = match ? (match.length > 0) : false
    //         } else {
    //             match = encodeURIComponent(site) == encodeURIComponent(url.replace('https://', '').replace('http://', '').replace('www.', ''))
    //         }

    //         // Check if the URL has suffix or not, for ex: https://www.facebook.com/profile.php?id=100060251539767
    //         let suffix = false
    //         if (blacksite.url.match(/(?:id=)(\d+)/) && url.match(/(?:id=)(\d+)/))
    //             suffix = (blacksite.url.match(/(?:id=)(\d+)/)[1] == url.match(/(?:id=)(\d+)/)[1])

    //         if(match || suffix)
    //             return res.status(status.OK).send({type: "unsafe"});
    //     }

    //     // If doesn't exists in our DB, check other APIs :

    //     // Google API Promise
    //     let googleSafeCheckPromise = new Promise((resolve, reject) => {
    //         axios({
    //             method: 'post',
    //             url: `${config.get("gcloud.safecheckUrl")}?key=${config.get("gcloud.key")}`,
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             data:  {
    //                 client: {
    //                   clientId: "chongluadao",
    //                   clientVersion: "1.0.0"
    //                 },
    //                 threatInfo: {
    //                   threatTypes: [ "MALWARE",
    //                                  "SOCIAL_ENGINEERING",
    //                                  "UNWANTED_SOFTWARE",
    //                                  "MALICIOUS_BINARY",
    //                                  "POTENTIALLY_HARMFUL_APPLICATION"],
    //                   platformTypes: ["ANY_PLATFORM"],
    //                   threatEntryTypes: ["URL"],
    //                   threatEntries: [
    //                     { url: url + "/" }
    //                   ]
    //                 }
    //             }
    //         }).then((gRes) => {
    //           if(gRes && gRes.data && gRes.data.matches && gRes.data.matches.length > 0) {
    //             resolve(false);
    //           } else {
    //             resolve(true);
    //           }
    //         });
    //     })

    //     Promise.all([
    //             googleSafeCheckPromise,
    //         ]).then((result) => {
    //         if(result.every(val => val == true)) {
    //             db.collection('whitelist').find({url: {'$regex': url, '$options': 'i'}}).toArray().then(result => {
    //                 if(result.length > 0) {
    //                     res.status(status.OK).send({type: "safe"});
    //                 } else {
    //                     res.status(status.OK).send({type: "nodata"});
    //                 }
    //             })
    //         } else {
    //             res.status(status.OK).send({type: "unsafe"});
    //         }
    //     });

    // })
  }

  safeCheckType(): string {
    return 'safeCheckType';
  }
}
