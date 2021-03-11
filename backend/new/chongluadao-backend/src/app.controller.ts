import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { BaseSessionDTO, InitSessionDTO, TokenDTO } from './dto/app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('initSession')
  async initSession(@Body() initSessionDTO: InitSessionDTO, @Res() res) {
    const rs = await this.appService.initSession(initSessionDTO);
    if (rs.constructor.name === 'InitSessionResSuccess') {
      res.status(HttpStatus.OK).send(rs);
    } else if (rs.constructor.name === 'InitSessionResErr') {
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
      }

      else res.json(err);
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
  postRate(): string {
    return this.appService.postRate();
  }

  @Get(':typelist')
  typelist(): string {
    return this.appService.typelist();
  }

  @Post('res/:resId')
  postResId(): string {
    return this.appService.postResId();
  }

  @Post('importFiles/:typelist')
  importFiles(): string {
    return this.appService.importFiles();
  }

  @Post('safecheck')
  safeCheck(): string {
    return this.appService.safeCheck();
  }

  @Post('safecheck/:type')
  safeCheckType(): string {
    return this.appService.safeCheckType();
  }
}
