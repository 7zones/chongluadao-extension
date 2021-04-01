// import * as fs from 'fs';
// import * as path from 'path';

import { BadRequestException, Injectable, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Type
import { BlacklistLink } from '../../type/blacklist-link.type';
import { BlacklistDomain } from '../../type/blacklist-domain.type';
import { BlacklistFacebook } from '../../type/blacklist-facebook.type';
import { BlacklistYoutube } from '../../type/blacklist-youtube.type';
import { WhitelistLink } from '../../type/whitelist-link.type';
import { WhitelistDomain } from '../../type/whitelist-domain.type';
import { WhitelistFacebook } from '../../type/whitelist-facebook.type';
import { WhitelistYoutube } from '../../type/whitelist-youtube.type';

// DTO
import {
  BlacklistResDTO,
  SafeCheckResDTO,
} from '../../dto/typelist-module.dto';
import {
  preProcessLinkToDomainUrl,
  removeHttpFromLink,
} from '../../shared/utils';
import { RESOURCE_SAFE_CHECK } from '../../shared/const';

@Injectable()
export class TypelistService {
  constructor(
    @InjectModel('BlacklistLink')
    private blacklistLinkModel: Model<BlacklistLink>,
    @InjectModel('BlacklistDomain')
    private blacklistDomainModel: Model<BlacklistDomain>,
    @InjectModel('BlacklistFacebook')
    private blacklistFacebookModel: Model<BlacklistFacebook>,
    @InjectModel('BlacklistYoutube')
    private blacklistYoutubeModel: Model<BlacklistYoutube>,

    @InjectModel('WhitelistLink')
    private whitelistLinkModel: Model<WhitelistLink>,
    @InjectModel('WhitelistDomain')
    private whitelistDomainModel: Model<WhitelistDomain>,
    @InjectModel('WhitelistFacebook')
    private whitelistFacebookModel: Model<WhitelistFacebook>,
    @InjectModel('WhitelistYoutube')
    private whitelistYoutubeModel: Model<WhitelistYoutube>,

    private http: HttpService,
  ) {}

  async getTypelist(typelist: string) {
    let type = null;
    switch (typelist) {
      case 'blacklist':
        const blacklist = await this.getBlacklist();
        return blacklist;
      case 'whitelist':
        const whitelist = await this.getWhitelist();
        return whitelist;
      default:
        throw new BadRequestException(
          typelist + ' is not a valid type of list',
        );
    }
  }

  async getBlacklist() {
    const domainList = await this.blacklistDomainModel.find();
    const linkList = await this.blacklistLinkModel.find();
    const facebookList = await this.blacklistFacebookModel.find();
    const youtubeList = await this.blacklistYoutubeModel.find();
    const blacklistRes = [
      ...domainList,
      ...linkList,
      ...facebookList,
      ...youtubeList,
    ];
    return blacklistRes;
  }

  async getWhitelist() {
    const domainList = await this.whitelistDomainModel.find();
    const linkList = await this.whitelistLinkModel.find();
    const facebookList = await this.whitelistFacebookModel.find();
    const youtubeList = await this.whitelistYoutubeModel.find();
    const whitelistRes = [
      ...domainList,
      ...linkList,
      ...facebookList,
      ...youtubeList,
    ];
    return whitelistRes;
  }

  async safeCheck(url: string): Promise<SafeCheckResDTO> {
    // Proprocess url => domain
    const domain = preProcessLinkToDomainUrl(url);
    const linkWithoutHttp = removeHttpFromLink(url);
    // 2 steps
    // Check Whitelist (link, domain, facebook, youtube)
    // Check Blacklist (link, domain, facebook, youtube)

    switch (domain) {
      case 'facebook.com':
        return await this.handleSafeCheckLink(
          linkWithoutHttp,
          'facebook',
          domain,
        );
      case 'youtube.com':
        return await this.handleSafeCheckLink(
          linkWithoutHttp,
          'youtube',
          domain,
        );
      default:
        return await this.handleSafeCheckLink(linkWithoutHttp, '', domain);
    }
  }

  async handleSafeCheckLink(
    link: string,
    linkType: string,
    domain: string = '',
  ): Promise<SafeCheckResDTO> {
    const whiteListCheck = await this.checkExistedInWhiteList(
      link,
      linkType,
      domain,
    );

    if (whiteListCheck.length > 0) {
      return { type: 'safe ' };
    } else {
      const blackListCheck = await this.checkExistedInBlackList(
        link,
        linkType,
        domain,
      );
      if (blackListCheck.length > 0) {
        return { type: 'unsafe' };
      } else return { type: 'nodata' };
    }
  }

  async checkExistedInWhiteList(
    link: string,
    linkType: string,
    domain: string = '',
  ) {
    switch (linkType) {
      case 'facebook':
        const facebookCheckList = await this.whitelistFacebookModel.find({
          url: link,
        });
        return facebookCheckList;
      case 'youtube':
        const youtubeCheckList = await this.whitelistYoutubeModel.find({
          url: link,
        });
        return youtubeCheckList;
      default:
        const domainCheckListPromise = this.whitelistDomainModel.find({
          url: domain,
        });
        const linkCheckListPromise = this.whitelistLinkModel.find({
          url: link,
        });
        const whiteListRes = await Promise.all([
          domainCheckListPromise,
          linkCheckListPromise,
        ]);
        const whiteListFlatRes = [...whiteListRes[0], ...whiteListRes[1]];
        return whiteListFlatRes;
    }
  }

  async checkExistedInBlackList(
    link: string,
    linkType: string,
    domain: string = '',
  ) {
    switch (linkType) {
      case 'facebook':
        const facebookCheckList = await this.blacklistFacebookModel.find({
          url: link,
        });
        return facebookCheckList;
      case 'youtube':
        const youtubeCheckList = await this.blacklistYoutubeModel.find({
          url: link,
        });
        return youtubeCheckList;
      default:
        const domainCheckListPromise = this.blacklistDomainModel.find({
          url: domain,
        });
        const linkCheckListPromise = this.blacklistLinkModel.find({
          url: link,
        });
        const blackListRes = await Promise.all([
          domainCheckListPromise,
          linkCheckListPromise,
        ]);
        const blacklistFlatRes = [...blackListRes[0], ...blackListRes[1]];
        return blacklistFlatRes;
    }
  }

  async safeCheckType(url: string, type: string): Promise<SafeCheckResDTO> {
    let result: SafeCheckResDTO = {
      type: 'nodata',
    };
    switch (type) {
      case 'phishtank':
      case 'hellsh':
      case 'oisd':
      case 'energized':
      case 'segasec':
        result = await this.handleSafeCheckResourceGeneral(url, type);
        break;
      case 'matrix':
        result = await this.handleSafeCheckResourceMatrix(url);
        break;
      case 'google':
        result = await this.handleSafeCheckResourceGoogle(url);
        break;
      default:
        break;
    }

    return result;
  }

  async handleSafeCheckResourceGeneral(
    url: string,
    type: string,
  ): Promise<SafeCheckResDTO> {
    const domain = preProcessLinkToDomainUrl(url);
    let urlResource = '';
    switch (type) {
      case 'phishtank':
        urlResource = RESOURCE_SAFE_CHECK.PHISH_TANK;
        break;
      case 'hellsh':
        urlResource = RESOURCE_SAFE_CHECK.HELLSH;
        break;
      case 'oisd':
        urlResource = RESOURCE_SAFE_CHECK.OISD;
        break;
      case 'energized':
        urlResource = RESOURCE_SAFE_CHECK.ENERGIZED;
        break;
      case 'segasec':
        urlResource = RESOURCE_SAFE_CHECK.SEGASEC_DOMAIN;
        break;
      default:
        return { type: 'nodata' };
    }

    const result = await this.http.get(urlResource).toPromise();
    if (result && result.data) {
      if (type != 'energized') {
        if (result.data.split('\n').includes(domain)) {
          return { type: 'unsafe' };
        } else return { type: 'safe' };
      }
      // CASE ENERGIZED
      else if (type == 'energized') {
        const rawData = result.data.split('\n');
        if (rawData[59].split(',').includes(domain)) {
          return { type: 'unsafe' };
        } else {
          return { type: 'safe' };
        }
      } else if (type == 'segasec') {
        if (result.data.includes(domain)) {
          return { type: 'unsafe' };
        } else return { type: 'safe' };
      }
    } else return { type: 'nodata' };
  }

  async handleSafeCheckResourceMatrix(url: string): Promise<SafeCheckResDTO> {
    const domain = preProcessLinkToDomainUrl(url);

    const matrixPhishPromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_PHISHING)
      .toPromise();
    const matrixAdsPromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_ADWARE)
      .toPromise();
    const matrixSpywarePromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_SPYWARE)
      .toPromise();
    const matrixScammingPromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_SCAMMING)
      .toPromise();
    const matrixPornPromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_PORN)
      .toPromise();
    const matrixMaliciousPromise = this.http
      .get(RESOURCE_SAFE_CHECK.MATRIX_MALICIOUS)
      .toPromise();

    const result = await Promise.all([
      matrixPhishPromise,
      matrixAdsPromise,
      matrixSpywarePromise,
      matrixScammingPromise,
      matrixPornPromise,
      matrixMaliciousPromise,
    ]);
    if (
      result.every(
        (rs) => rs && rs.data && rs.data.split('\n').includes(domain),
      )
    )
      return { type: 'safe' };
    else return { type: 'unsafe' };
  }

  async handleSafeCheckResourceGoogle(url: string): Promise<SafeCheckResDTO> {
    const domain = preProcessLinkToDomainUrl(url);
    const gRes = await this.http
      .post(
        `${process.env.GCLOUD_SAFE_CHECK_URL}?key=${process.env.GCLOUD_KEY}`,
        {
          client: {
            clientId: 'chongluadao',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'MALICIOUS_BINARY',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: domain + '/' }],
          },
        },
      )
      .toPromise();
    if (
      gRes &&
      gRes.data &&
      gRes.data.matches &&
      gRes.data.matches.length > 0
    ) {
      return { type: 'unsafe' };
    } else return { type: 'nodata' };
  }

  // async importTxtFiles(fileName: string) {
  //   const rs = await fs.readFileSync(
  //     path.join(__dirname, `data/${fileName}.txt`),
  //   );
  //   const mapData = rs
  //     .toString()
  //     .split('\r\n')
  //     .map((value) => {
  //       return { url: value };
  //     });

  //   const resultData = await this.whitelistYoutubeModel.create(mapData);
  //   return resultData;
  // }
}
