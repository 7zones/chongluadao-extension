import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseSessionDTO, RateDTO } from '../../dto/app.dto';

import { Rating } from '../../type/rating.type';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel('Rating')
    private ratingModel: Model<Rating>,
  ) {}

  async postRate(rateDTO: RateDTO, reqIp) {
    const params = { time: new Date(), ...rateDTO, ip: reqIp };
    const msg = this.validateSubmitting(params);
    if (msg.indexOf('ok') == -1) {
      throw new BadRequestException(msg);
    } else {
      if (params) {
        await this.ratingModel.create(params);
        const rs: BaseSessionDTO = {
          status: HttpStatus.OK,
          version: process.env.APP_VERSION,
          requestedOn: new Date(),
          message: 'ok',
        };
        return rs;
      }
    }
    return 'postRate';
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
