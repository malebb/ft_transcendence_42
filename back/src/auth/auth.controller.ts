import {
  Body,
  Headers,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Get,
  UseGuards,
  Res,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto, TFADto, SignupDto } from './dto';
import { Tokens } from './types';
import { Request, Response } from 'express';
import { JwtGuard, RtGuard } from './guard';
import { GetUser, Public } from './decorator';
import { ConfigService } from '@nestjs/config';
import { CallbackDto } from './dto/callback.dto';
import { User } from '@prisma/client';
import { RefreshInterface, SignInterface } from './interfaces';
import { parse, stringify } from 'flatted';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, config: ConfigService) {}

  @Public()
  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token: SignInterface = await this.authService.signup(dto);
    res.cookie('rt_token', token.tokens.refresh_token, {
      httpOnly: true,
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'none',
    });
    return token;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token: SignInterface = await this.authService.signin(dto);
    res.cookie('rt_token', token.tokens.refresh_token, {
      httpOnly: true,
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'none',
    });
    return token;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('signin/42login')
  signin42(@Res({ passthrough: true }) res: Response) {
    return this.authService.signin42(res);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin/42login/callback')
  async callback42(
    @Body() dto: CallbackDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const token: SignInterface = await this.authService.callback42(dto);
      res.cookie('rt_token', token.tokens.refresh_token, {
        httpOnly: true,
        path: '/',
        maxAge: 14 * 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'none',
      });
      return token;
    } catch (err) {
      throw new HttpException(
        'Error Connecting with 42 api',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('logout')
  logout(
    @GetUser('sub') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ret = this.authService.logout(userId);
    res.clearCookie('rt_token');
    return ret;
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshToken(
    @GetUser('id') userId: number,
    @Req() req: Request, //refreshToken(@Req() req: Request)
  ) {
    return await this.authService.refreshToken(userId, req.cookies['rt_token']);
  }

  @Get('verify')
  verify(@Req() req: Request): boolean | undefined {
    const token = req.get('authorization').replace('Bearer', '').trim();
    return this.authService.verify(token);
  }

  @Get('create2FA')
  create2FA(@GetUser('id') userId: number) {
    return this.authService.create2FA(userId);
  }
  @Public()
  @Post('verify2FA')
  verify2FA(@Body() dto: TFADto): Promise<boolean> {
    return this.authService.verify2FA(dto.userId, dto.code);
  }

  @Get('set2FA')
  set2FA(@GetUser('id') userId: number) {
    this.authService.set2FA(userId);
  }
  @Get('unset2FA')
  unset2FA(@GetUser('id') userId: number) {
    this.authService.unset2FA(userId);
  }
}
