import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { BaseSessionDTO, RateDTO } from '../../dto/app.dto';
import { RatingService } from './rating.service';

@Controller('rate')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async postRate(@Body() rateDTO: RateDTO, @Req() req, @Res() res) {
    try {
      const rs = await this.ratingService.postRate(rateDTO, req.ip);
      return res.status(HttpStatus.OK).send(rs);
    } catch (err) {
      if (err instanceof BadRequestException) {
        const rs: BaseSessionDTO = {
          status: HttpStatus.BAD_REQUEST,
          version: process.env.APP_VERSION,
          requestedOn: new Date(),
          message: err.message,
        };
        res.status(HttpStatus.BAD_REQUEST).send(rs);
      } else res.json(err);
    }
  }
}
