import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {JwtService} from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
import { Tokens } from './types';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwt: JwtService,
        private config: ConfigService)
    {}
    async signup(dto: AuthDto)
    {
        const hash = await argon.hash(dto.password);
        try{
            const user = await this.prismaService.user.create({
                data:{
                    email: dto.email,
                    hash: hash,
                }
            })
            return this.signToken(user.id, user.email);
        }
        catch(error)
        {
            if(error instanceof PrismaClientKnownRequestError)
            {
                if(error.code == 'P2002')
                {
                    throw new ForbiddenException('Credentials taken',);
                }
            }
            throw error;
        }
        //return (this.prismaService.)
    }

    async signin(dto: AuthDto)
    {
        console.log('sigin');
        const user = await this.prismaService.user.findUnique({
            where:{
                email: dto.email,
            },
        });
        if(!user)
        {
            console.log('!user');
            throw new ForbiddenException('Credentials incorrect',);
        }
        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
            );
        if(!pwMatches)
        {
            console.log('!pwmatch');
            throw new ForbiddenException('Credentials incorrect',);
        }
        return this.signToken(user.id, user.email);
  //      const user = await this.prismaService.user.findUnique({
  //          email,
  //          hash,
  //      })
        return {msg : 'I am signin'};
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }>
    {
        const payload ={
            sub: userId,
            email,
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '20m',
            secret: secret,
        })
        return {
            access_token: token,
        };
    }

    logout()
    {}

    refreshToken()
    {}

    verify(token: string)
    {
        try{
        const secret = this.config.get('JWT_SECRET');
        const jet = this.jwt.verify(token, {secret : secret});
        console.log(jet);
        }catch(err: any)
        {
            console.log(err);
        }
        return;
    }
}
