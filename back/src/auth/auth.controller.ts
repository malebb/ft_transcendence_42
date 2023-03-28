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
import { SignInterface } from './interfaces';
import { parse, stringify } from 'flatted';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, config: ConfigService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto, @Headers() headers): Promise<SignInterface> {
    console.log(headers);
    console.log(dto);
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto, @Headers() headers): Promise<SignInterface> {
    console.log(headers);
    return this.authService.signin(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('signin/42login')
  signin42(@Res({ passthrough: true }) res: Response) {
    /* let origin;
        if (req.headers.origin)
        {
            origin = req.headers.origin;
            console.log("origin = " + origin);
            res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3333');
        }*/
    return this.authService.signin42(res);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin/42login/callback')
  async callback42(
    @Body() dto: CallbackDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    /*let origin;
        if (req.headers.origin)
        {
            origin = req.headers.origin;
            console.log("origin = " + origin);
            res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3333');
            //res.setHeader("Access-Control-Allow-Origin", '*');
        }*/
    try {
      const token: SignInterface = await this.authService.callback42(dto.code);
      res.cookie('rt_token', token.tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      // res.header('Access-Control-Allow-Credentials', 'true');
      // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      return res.send(token);
    } catch (err) {
      console.log('callback err = ' + err);
      throw new HttpException(
        'Error Connecting wih 42 api',
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
    // res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.clearCookie('rt_token');
    return res.send(ret);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  //refreshToken(@GetUser() user: User, @Req() req: Request)
  async refreshToken(
    @GetUser('id') userId: number,
    @Req() req: Request, //refreshToken(@Req() req: Request)
    @Res({ passthrough: true }) res: Response,
  ) {
    /*console.log(req);
        let rToken;
        console.log(user.id);
        if (req.get('authorization') && user.id)
        {
            rToken = req.get('authorization').replace('Bearer', '').trim();*/
    console.log(
      'REF TOK = ' +
        stringify(req.user) +
        '=============================================================================================================',
    );
    console.log('userid = ' + userId);
    const ret_token: SignInterface = await this.authService.refreshToken(
      userId,
      req.cookies['rt_token'],
    );
    res.cookie('rt_token', ret_token.tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    // res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    return res.send(ret_token);
    /*}
        console.log("aieeee");
        return ;*/
  }

  @Get('verify')
  verify(@Req() req: Request): boolean | undefined {
    const token = req.get('authorization').replace('Bearer', '').trim();
    return this.authService.verify(token);
  }

  @Get('create2FA')
  create2FA(@GetUser() user) {
    console.log(user);
    return this.authService.create2FA(user.id);
  }
  @Public()
  @Post('verify2FA')
  verify2FA(@Body() dto: TFADto): Promise<boolean> {
    return this.authService.verify2FA(dto.userId, dto.code);
  }

  @Get('set2FA')
  set2FA(@GetUser() user) {
    console.log(this.authService.set2FA(user.id));
  }
  @Get('unset2FA')
  unset2FA(@GetUser() user) {
    console.log(this.authService.unset2FA(user.id));
  }
}
