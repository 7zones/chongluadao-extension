import { Test, TestingModule } from '@nestjs/testing';
import { TypelistService } from './typelist.service';

describe('TypelistService', () => {
  let service: TypelistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypelistService],
    }).compile();

    service = module.get<TypelistService>(TypelistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
