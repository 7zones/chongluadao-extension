import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingSchema } from '../../model/rating.model';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Rating', schema: RatingSchema },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
