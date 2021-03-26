import { BadRequestException, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { TypelistService } from './typelist.service';

@Controller()
export class TypelistController {

  constructor(private readonly typeListService: TypelistService) {}
  
  @Get(':typelist')
  async getTypelist(@Param('typelist') typelist: string, @Res() res) {
    try {
      const rs = await this.typeListService.getTypelist(typelist);
      return res.status(HttpStatus.OK).send(rs);
    } catch (err) {
      if (err instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(err.message);
      } else res.json(err);
    }
  }

  // @Post('/importTxtFiles/:fileName')
  // async importTxtFiles(@Param('fileName') fileName: string) {
  //   return await this.typeListService.importTxtFiles(fileName);
  // }
}
