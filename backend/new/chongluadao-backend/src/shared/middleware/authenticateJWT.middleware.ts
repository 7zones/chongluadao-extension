import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const accessTokenSecret = process.env.AUTH_ACCESS_TOKEN_SECRET;

@Injectable()
export class AuthenticateJWTMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        (req as any).user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  }
}
