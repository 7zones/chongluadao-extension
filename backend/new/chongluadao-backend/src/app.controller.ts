import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  BaseSessionDTO,
  InitSessionDTO,
  RateDTO,
  TokenDTO,
  UrlDTO,
} from './dto/app.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('initSession')
  async initSession(@Body() initSessionDTO: InitSessionDTO, @Res() res) {
    const rs = await this.appService.initSession(initSessionDTO);
    if (rs.token) {
      res.status(HttpStatus.OK).send(rs);
    } else {
      res.status(HttpStatus.UNAUTHORIZED).send(rs);
    }
  }

  @Post('token')
  async postToken(@Body() tokenDTO: TokenDTO, @Res() res) {
    try {
      const { token } = tokenDTO;

      if (!token) {
        return res.sendStatus(401);
      }

      const rs = await this.appService.postToken(tokenDTO);

      res.status(HttpStatus.OK).send(rs);
    } catch (err) {
      if (err instanceof ForbiddenException) {
        res.sendStatus(HttpStatus.FORBIDDEN);
      } else res.json(err);
    }
  }

  @Post('closeSession')
  closeSession(@Body() tokenDTO: TokenDTO, @Res() res): BaseSessionDTO {
    const rs = this.appService.closeSession(tokenDTO);
    return res.status(HttpStatus.OK).send(rs);
  }

  @Get('ping')
  getPing(@Res() res): BaseSessionDTO {
    const rs = this.appService.getPing();
    return res.status(HttpStatus.OK).send(rs);
  }

  @Post('rate')
  async postRate(@Body() rateDTO: RateDTO, @Req() req, @Res() res) {
    try {
      const rs = await this.appService.postRate(rateDTO, req.ip);
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

  @Get(':typelist')
  async getTypelist(@Param('typelist') typelist: string, @Res() res) {
    try {
      const rs = await this.appService.getTypelist(typelist);
      return res.status(HttpStatus.OK).send(rs);
    } catch (err) {
      if (err instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(err.message);
      } else res.json(err);
    }
  }

  @Post('importFiles/:typelist')
  importFiles(): string {
    return this.appService.importFiles();
  }

  @Post('safecheck')
  async safeCheck(@Body() urlDTO: UrlDTO) {
    return await this.appService.safeCheck(urlDTO.url);
  }

  @Post('safecheck/:type')
  safeCheckType(): string {
    return this.appService.safeCheckType();
  }
}
