import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

// Check for valid api key in headers request
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['api-key'];

    if (
      !apiKey ||
      apiKey !== (this.configService.get<string>('API_KEY') as string)
    ) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
