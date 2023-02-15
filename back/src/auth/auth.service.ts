import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {JwtService} from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
import { Tokens } from './types';
import { PaperProps, useRadioGroup } from '@mui/material';
import { use } from 'passport';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { connected } from 'process';
import { Response } from 'express';

const DEFAULT_IMG='uploads/profileimages/default_profile_picture.png'

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwt: JwtService,
        private config: ConfigService)
    {}

    async hashData(data: string): Promise<string>
    {
        const hash = await argon.hash(data);
        return hash;
    }
    
    async signup(dto: AuthDto) : Promise<Tokens>
    {
        const hash = await argon.hash(dto.password);
        try{
            const user = await this.prismaService.user.create({
                data:{
                    email: dto.email,
                    hash: hash,
                    profilePicture: DEFAULT_IMG,
                }
            })
            const tokens = await this.signToken(user.id, user.email);
            this.updateRtHash(user.id, tokens.refresh_token)
            console.log(tokens)
            return tokens;
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

    async signin(dto: AuthDto) : Promise<Object>
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
        const tokens = await this.signToken(user.id, user.email);
        this.updateRtHash(user.id, tokens.refresh_token)
        return {tokens: tokens, isTfa: user.isTFA};
  //      const user = await this.prismaService.user.findUnique({
  //          email,
  //          hash,
  //      })
    }

    
    signin42(res: Response)
    {
        const redirect_uri = this.config.get('OAUTH_REDIRECT_URI');
        res.redirect(redirect_uri);
    }


    async updateRtHash(userId: number, refreshToken: string)
    {
        const rthash = await argon.hash(refreshToken);
        await this.prismaService.user.update({
            where:{
                id: userId
            },
            data: {
                hashRt: rthash,
            },
        })
    }

    async signToken(userId: number, email: string)
    {
        const payload ={
            sub: userId,
            email,
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '20d',
            secret: secret,
        })
        const rtsecret = this.config.get('RT_SECRET')
        const rToken = await this.jwt.signAsync(payload, {
            expiresIn: '15d',
            secret: rtsecret,
        });
        return {
            access_token: token, 
            refresh_token: rToken,
        };
    }

    async logout(userId: number)
    {
        await this.prismaService.user.updateMany({
            where: {
                id : userId,
                hashRt: {
                    not: null
                }
            },
            data: {
                hashRt: null
            },
        })
    }

    async refreshToken(userId: number, rt: string)
    {
        const user = await this.prismaService.user.findUnique({
            where: {
                id : userId,
            }
        });
        if (!user || !user.hashRt)
        {
            console.log('!user');
            throw new ForbiddenException('Incorrect User',);
        }
        const rtMatches = await argon.verify(user.hashRt, rt);
        if (!rtMatches)
        {
            console.log('!user');
            throw new ForbiddenException('ACESS DENIED',);
        }
        
        const tokens = await this.signToken(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;

    }

    verify(token: string)
    {
        try{
        const secret = this.config.get('JWT_SECRET');
        const jet = this.jwt.verify(token, {secret : secret});
        //console.log(jet);
        if (jet)
            return true;
        }catch(err: any)
        {
            console.log(err);
        }
    }
    async create2FA(userId: number)
    {
    
        const secret = speakeasy.generateSecret({
            name: 'transcendence',
        });
        console.log(secret);
        console.log(secret.base32);
        console.log(userId);
        const user = await this.prismaService.user.update({
            where: {
                id : userId,
            },
            data:
            {
               TFA: secret.base32, 
            } 
        }
        );
        console.log(JSON.stringify(user)); 
        return qrcode.toDataURL(secret.otpauth_url, {type: "image/jpeg"});
    }

    async verify2FA(userId: number, code : string) : Promise<boolean>
    {
        const user = await this.prismaService.user.findUnique({
            where: {
                id : userId,
            },
        });
        const verif = await speakeasy.totp.verify({
            secret: user.TFA,
            encoding: 'base32',
            token : code,
        })
        return verif;
    }

    async set2FA(userId: number)
    {
        const user = await this.prismaService.user.update({
            where: {
                id : userId,
            },
            data:
            {
               isTFA: true, 
            } 
        }
        );
        return user;
    }


    async unset2FA(userId: number)
    {
        const user = await this.prismaService.user.update({
            where: {
                id : userId,
            },
            data:
            {
               isTFA: false, 
               TFA: null,
            } 
        }
        );
        return user;
    }
}
