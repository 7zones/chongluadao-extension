import { HttpModule, Module } from '@nestjs/common';
import { TypelistController } from './typelist.controller';
import { TypelistService } from './typelist.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlacklistLinkSchema } from '../../model/blacklist-link.model';
import { BlacklistDomainSchema } from '../../model/blacklist-domain.model';
import { BlacklistFacebookSchema } from '../../model/blacklist-facebook.model';
import { BlacklistYoutubeSchema } from '../../model/blacklist-youtube.model';
import { WhitelistLinkSchema } from '../../model/whitelist-link.model';
import { WhitelistDomainSchema } from '../../model/whitelist-domain.model';
import { WhitelistFacebookSchema } from '../../model/whitelist-facebook.model';
import { WhitelistYoutubeSchema } from '../../model/whitelist-youtube.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BlacklistLink', schema: BlacklistLinkSchema },
      { name: 'BlacklistDomain', schema: BlacklistDomainSchema },
      { name: 'BlacklistFacebook', schema: BlacklistFacebookSchema },
      { name: 'BlacklistYoutube', schema: BlacklistYoutubeSchema },
      { name: 'WhitelistLink', schema: WhitelistLinkSchema },
      { name: 'WhitelistDomain', schema: WhitelistDomainSchema },
      { name: 'WhitelistFacebook', schema: WhitelistFacebookSchema },
      { name: 'WhitelistYoutube', schema: WhitelistYoutubeSchema },
    ]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [TypelistController],
  providers: [TypelistService],
})
export class TypelistModule {}
