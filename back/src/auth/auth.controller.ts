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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto, TFADto } from './dto';
import { Tokens } from './types';
import { Request } from 'express';
import { JwtGuard, RtGuard } from './guard';
import { GetUser, Public } from './decorator';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CallbackDto } from './dto/callback.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, config: ConfigService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: AuthDto, @Headers() headers): Promise<Object> {
    console.log(headers);
    console.log(dto);
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto, @Headers() headers): Promise<Object> {
    console.log(headers);
    return this.authService.signin(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('signin/42login')
  signin42(@Res() res: Response) {
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
  callback42(@Body() dto: CallbackDto): Promise<Object> {
    /*let origin;
        if (req.headers.origin)
        {
            origin = req.headers.origin;
            console.log("origin = " + origin);
            res.setHeader("Access-Control-Allow-Origin", 'http://localhost:3333');
            //res.setHeader("Access-Control-Allow-Origin", '*');
        }*/
    console.log('code from dto = ' + dto.code);
    return this.authService.callback42(dto.code);
  }

  @Post('logout')
  logout(@GetUser('sub') userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  //refreshToken(@GetUser() user: User, @Req() req: Request)
  refreshToken(
    @GetUser('sub') userId: number,
    @GetUser('refreshToken') token,
  ) //refreshToken(@Req() req: Request)
  {
    /*console.log(req);
        let rToken;
        console.log(user.id);
        if (req.get('authorization') && user.id)
        {
            rToken = req.get('authorization').replace('Bearer', '').trim();*/
    return this.authService.refreshToken(userId, token);
    /*}
        console.log("aieeee");
        return ;*/
  }

  @Get('verify')
  verify(@Req() req: Request) {
    const token = req.get('authorization').replace('Bearer', '').trim();
    return this.authService.verify(token);
  }

  @Get('create2FA')
  create2FA(@GetUser() user) {
    console.log(user);
    return this.authService.create2FA(user.id);
  }
  @Post('verify2FA')
  verify2FA(@GetUser() user, @Body() dto: TFADto): Promise<boolean> {
    return this.authService.verify2FA(user.id, dto.code);
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
