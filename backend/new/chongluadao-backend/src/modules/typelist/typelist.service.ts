import * as fs from 'fs';
import * as path from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
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
import { BlacklistResDTO } from '../../dto/typelist-module.dto';

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
    const blacklistRes = [...domainList, ...linkList, ...facebookList, ...youtubeList];
    return blacklistRes;
  }

  async getWhitelist() {
    const domainList = await this.whitelistDomainModel.find();
    const linkList = await this.whitelistLinkModel.find();
    const facebookList = await this.whitelistFacebookModel.find();
    const youtubeList = await this.whitelistYoutubeModel.find();
    const whitelistRes = [...domainList, ...linkList, ...facebookList, ...youtubeList];
    return whitelistRes;
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