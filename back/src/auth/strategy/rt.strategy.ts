import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log(request?.cookies?.rt_token);
          return request?.cookies?.rt_token;
        },
      ]),
      secretOrKey: config.get('RT_SECRET'),
      //secretOrKey: process.env.RT_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(payload: any) {
    console.log(payload);
    if (payload === null) {
      throw new UnauthorizedException();
    }
    return {
      payload,
    };
  }
}
