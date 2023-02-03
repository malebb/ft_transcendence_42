import { Injectable } from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
    )
{
    constructor(
        config: ConfigService,
        private prisma: PrismaService,
        )
    {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: config.get('RT_SECRET'),
                passReqToCallback: true,
            }
        )
    }
    async validate(req: Request,payload: {
        sub: number;
        email: string;
    })
    {
        const refreshToken = req.get('authorization').replace('Bearer', '').trim();
        const user = await this.prisma.user.findUnique(
            {
                where: {
                    id: payload.sub,
                }
            }
        )
        delete user.hash;
        //return user;
        return {
            ...payload,
            refreshToken,
        };
    }
}