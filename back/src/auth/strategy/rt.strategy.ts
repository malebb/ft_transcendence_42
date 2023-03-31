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
import { JwtStrategy } from './jwt.strategy';
import { stringify } from 'flatted';
import { Payload } from '@prisma/client/runtime';
import { rTokenInterface } from '../interfaces';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // RtStrategy.extractJWTFromCookie,
        (request: Request) => {
          return request?.cookies?.rt_token;
        },
      ]),
      secretOrKey: config.get('RT_SECRET'),
      //secretOrKey: process.env.RT_SECRET,
      // passReqToCallback: true,
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    //console.log(req);
    if (req.cookies && req.cookies.rt_token) {
      console.log('COOKIES ===== ' + req.cookies.rt_token);
      return req.cookies.rt_token;
    }
    console.log('no cookie');
    return null;
  }
  async validate(payload: rTokenInterface) {
    if (payload === null) {
      console.log('error: validate failed payload == NULL');
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hash;
    return user;
  }
}
