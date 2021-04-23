import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticateJWTMiddleware } from './shared/middleware/authenticateJWT.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { TypelistModule } from './modules/typelist/typelist.module';
import { RatingModule } from './modules/rating/rating.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}`,
    ),
    TypelistModule,
    RatingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateJWTMiddleware)
      .forRoutes({ path: 'rate', method: RequestMethod.POST });
  }
}
