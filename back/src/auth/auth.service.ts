import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
import { Tokens } from './types';
import { PaperProps, useRadioGroup } from '@mui/material';
import { use } from 'passport';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { connected } from 'process';
import { Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { SignInterface } from './interfaces';

//require('oauth2');

const JWT_TOKEN_EXPIRE_TIME = 900;
const GRANT_TYPE = 'authorization_code';
const DEFAULT_IMG = 'uploads/profileimages/default_profile_picture.png';
const REDIRECT_URI = 'http://localhost:3000/auth/signin/42login/callback';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async hashData(data: string): Promise<string> {
    const hash = await argon.hash(data);
    return hash;
  }

  async signup(dto: SignupDto): Promise<SignInterface> {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash: hash,
          profilePicture: DEFAULT_IMG,
          username: dto.username,
          stats: {
            create: {},
          },
        },
      });
      const tokens = await this.signToken(user.id, user.email);
      this.updateRtHash(user.id, tokens.refresh_token);
      return {
        tokens: tokens,
        isTfa: user.isTFA,
        userId: user.id,
        username: user.username,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
    //return (this.prismaService.)
  }

  async signin(dto: AuthDto): Promise<SignInterface> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const tokens = await this.signToken(user.id, user.email);
    this.updateRtHash(user.id, tokens.refresh_token);
    return {
      tokens: tokens,
      isTfa: user.isTFA,
      userId: user.id,
      username: user.username,
    };
    //      const user = await this.prismaService.user.findUnique({
    //          email,
    //          hash,
    //      })
  }

  signin42(res: Response) {
    const redirect_uri = this.config.get('OAUTH_REDIRECT_URI');
    res.redirect(redirect_uri);
  }

  /* async get42AT(code)
    {
        const client_id = this.config.get('OAUTH_CLIENT_UID');
        const client_secret = this.config.get('OAUTH_CLIENT_SECRET');
        const response: AxiosResponse = await axios.post('https://api.intra.42.fr/oauth/token', {grant_type: GRANT_TYPE,client_id: client_id, client_secret: client_secret, code: code, redirect_uri: REDIRECT_URI},);
        return response;
    }*/

  async callback42(code): Promise<SignInterface> {
    //TODO may change || "" by so;ething more accurate
    //const response : AxiosResponse = await this.get42AT(code);
    const client_id = this.config.get('OAUTH_CLIENT_UID');
    const client_secret = this.config.get('OAUTH_CLIENT_SECRET');
    const response: AxiosResponse = await axios.post(
      'https://api.intra.42.fr/oauth/token',
      {
        grant_type: GRANT_TYPE,
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        redirect_uri: REDIRECT_URI,
      },
    );
    //if(response.status !== 200)//TODO protect depending on response status

    const getprofile: AxiosResponse = await axios.get(
      'https://api.intra.42.fr/v2/me',
      {
        headers: { Authorization: 'Bearer ' + response.data['access_token'] },
      },
    );
    const id42 = JSON.stringify(getprofile.data['id']) || '';
    const pic42 = getprofile.data.image.versions.small;

    let user = await this.prismaService.user.findUnique({
      where: {
        id42: id42,
      },
    });
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email: getprofile.data['email'] || '',
          hash: '',
          profilePicture: getprofile.data.image.versions.small,
          id42: id42,
          username: getprofile.data['login'] || '',
          stats: {
          	create: {},
        },
        },
      });
    }
    const tokens = await this.signToken(user.id, user.email);
    this.updateRtHash(user.id, tokens.refresh_token);
    return {
      tokens: tokens,
      isTfa: user.isTFA,
      userId: user.id,
      username: user.username,
    };
    return response.data;
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const rthash = await argon.hash(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashRt: rthash,
      },
    });
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: JWT_TOKEN_EXPIRE_TIME,
      secret: secret,
    });
    const rtsecret = this.config.get('RT_SECRET');
    const rToken = await this.jwt.signAsync(payload, {
      expiresIn: '15d',
      secret: rtsecret,
    });
    return {
      access_token: token,
      refresh_token: rToken,
      crea_time: new Date(),
      expireIn: JWT_TOKEN_EXPIRE_TIME,
    };
  }

  async logout(userId: number) {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
      },
    });
  }

  async refreshToken(userId: number, rt: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashRt) {
      throw new ForbiddenException('Incorrect User');
    }
    const rtMatches = await argon.verify(user.hashRt, rt);
    if (!rtMatches) {
      throw new ForbiddenException('ACESS DENIED');
    }

    const tokens = await this.signToken(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  verify(token: string): boolean | undefined {
    try {
      const secret = this.config.get('JWT_SECRET');
      const jet = this.jwt.verify(token, { secret: secret });
      if (jet) return true;
      else return false;
    } catch (err: any) {
    }
  }

  async create2FA(userId: number) {
    const secret = speakeasy.generateSecret({
      name: 'transcendence',
    });
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        TFA: secret.base32,
      },
    });
    return qrcode.toDataURL(secret.otpauth_url, { type: 'image/jpeg' });
  }

  async verify2FA(userId: number, code: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    const verif = await speakeasy.totp.verify({
      secret: user.TFA,
      encoding: 'base32',
      token: code,
    });
    return verif;
  }

  async set2FA(userId: number) {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        isTFA: true,
      },
    });
    return user;
  }

  async unset2FA(userId: number) {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        isTFA: false,
        TFA: null,
      },
    });
    return user;
  }
}
