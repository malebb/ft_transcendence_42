import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { RefreshInterface, SignInterface } from './interfaces';
import { CallbackDto } from './dto/callback.dto';

//require('oauth2');

const JWT_TOKEN_EXPIRE_TIME = 900;
const GRANT_TYPE = 'authorization_code';
const DEFAULT_IMG = 'uploads/profileimages/default_profile_picture.png';
const REDIRECT_URI = 'http://localhost:3000/auth/signin/42login/callback';
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*^()-_=]).{8,24}$/;

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
    if (
      !EMAIL_REGEX.test(dto.email) ||
      !PWD_REGEX.test(dto.password) ||
      !USER_REGEX.test(dto.username)
    )
      throw new ForbiddenException('Invalid Input');
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
      if (error.code == 'P2002') {
        throw new ForbiddenException(error.meta.target + ' Already Taken');
      }
      throw new BadRequestException('Error signing up');
    }
    //return (this.prismaService.)
  }

  async signin(dto: AuthDto): Promise<SignInterface> {
    if (!EMAIL_REGEX.test(dto.email) || !PWD_REGEX.test(dto.password))
      throw new ForbiddenException('Invalid Input');
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

  // TODO SECURE
  async callback42(code: CallbackDto): Promise<SignInterface> {
    try {
      const client_id = this.config.get('OAUTH_CLIENT_UID');
      const client_secret = this.config.get('OAUTH_CLIENT_SECRET');
      const response: AxiosResponse = await axios.post(
        `https://api.intra.42.fr/oauth/token?grant_type=${GRANT_TYPE}&client_id=${client_id}&client_secret=${client_secret}&code=${code.code}&redirect_uri=${REDIRECT_URI};`,
        // {
        //   grant_type: GRANT_TYPE,
        //   client_id: client_id,
        //   client_secret: client_secret,
        //   code: code.code,
        //   redirect_uri: REDIRECT_URI,
        // },
      );

      console.log('access_token' + response.data.access_token);
      const getprofile: AxiosResponse = await axios.get(
        'https://api.intra.42.fr/v2/me',
        {
          headers: { Authorization: 'Bearer ' + response.data['access_token'] },
        },
      );
      const id42 = JSON.stringify(getprofile.data['id']);

      let user = await this.prismaService.user.findUnique({
        where: {
          id42: id42,
        },
      });
      let already_use;
      let login = getprofile.data['login'];
      let user_inc = 1;
      do {
        already_use = await this.prismaService.user.findUnique({
          where: {
            username: login,
          },
        });
        console.log(already_use);
        if (already_use) {
          user_inc++;
          login = getprofile.data['login'] + user_inc.toString();
        }
      } while (already_use);
      // login = getprofile + user_inc.toString();
      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email: getprofile.data['email'],
            hash: '',
            profilePicture: getprofile.data.image.versions.small,
            id42: id42,
            username: login,
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
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002' && error.meta.target[0] === 'email') {
        throw new ForbiddenException('42 Email already taken');
      }
      throw new InternalServerErrorException('Error connecting 42 api');
    }
  }

  async updateRtHash(userId: number, refreshToken: string) {
    try {
      const rthash = await argon.hash(refreshToken);
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          hashRt: { push: rthash },
        },
      });
    } catch (error) {
      throw new BadRequestException('Trouble updating database');
    }
  }

  async signToken(userId: number, email: string) {
    try {
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
    } catch (err) {
      throw err;
    }
  }
  async signTokenRefresh(userId: number, email: string) {
    try {
      const payload = {
        sub: userId,
        email,
      };
      const secret = this.config.get('JWT_SECRET');
      const token = await this.jwt.signAsync(payload, {
        expiresIn: JWT_TOKEN_EXPIRE_TIME,
        secret: secret,
      });
      return {
        access_token: token,
        crea_time: new Date(),
        expireIn: JWT_TOKEN_EXPIRE_TIME,
      };
    } catch (err) {
      throw err;
    }
  }

  async logout(userId: number, rt: string) {
    const { hashRt } = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        hashRt: true,
      },
    });

    if (rt) {
      const to_del = hashRt.filter((id) => {
        argon.verify(id, rt);
      });

      if (to_del[0]) {
        await this.prismaService.user.update({
          where: {
            id: userId,
          },
          data: {
            hashRt: {
              set: hashRt.filter((id) => id !== to_del[0]),
            },
          },
        });
      }
    }
  }

  async refreshToken(userId: number, rt: string): Promise<RefreshInterface> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashRt) {
      throw new ForbiddenException('Incorrect User');
    }
    const rtMatches =
      user.hashRt.filter(function (val) {
        return argon.verify(val, rt);
      }).length > 0;
    if (!rtMatches) {
      throw new ForbiddenException('ACESS DENIED');
    }

    const tokens = await this.signTokenRefresh(user.id, user.email);
    // await this.updateRtHash(user.id, tokens.refresh_token);
    // return tokens;
    return {
      tokens: tokens,
      isTfa: user.isTFA,
      userId: user.id,
      username: user.username,
    };
  }

  verify(token: string): boolean | undefined {
    try {
      const secret = this.config.get('JWT_SECRET');
      const jet = this.jwt.verify(token, { secret: secret });
      if (jet) return true;
      else return false;
    } catch (err: any) {
      throw err;
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
