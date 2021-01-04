import { Test, TestingModule } from '@nestjs/testing';
import { TypelistController } from './typelist.controller';

describe('TypelistController', () => {
  let controller: TypelistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypelistController],
    }).compile();

    controller = module.get<TypelistController>(TypelistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
