import { Body, Headers, Controller, HttpCode, HttpStatus, Post, Req, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto, TFADto} from './dto';
import { Tokens } from './types';
import { Request } from 'express';
import { JwtGuard , RtGuard} from './guard';
import { GetUser, Public } from './decorator';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('signup')
    signup(@Body() dto: AuthDto, @Headers() headers) : Promise<Tokens>
    {
        console.log(headers);
        console.log(dto);
        return this.authService.signup(dto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto, @Headers() headers) : Promise<Object>
    {
        console.log(headers);
        return this.authService.signin(dto);
    }

    @Post('logout')
    logout(@GetUser('sub') userId: number)
    {
        return this.authService.logout(userId);
    }

    @Public()
    @UseGuards(RtGuard)
    @Post('refresh')
    refreshToken(@GetUser('sub') userId: number, @GetUser('refreshToken') rToken : string)
    {
        return this.authService.refreshToken(userId, rToken);
    }

    @Get('verify')
    verify(@Req() req: Request)
    {
        const token = req.get('authorization').replace('Bearer', '').trim();
        return this.authService.verify(token);
    }

    @Get('create2FA')
    create2FA(@GetUser() user)
    {
        console.log(user);
        return this.authService.create2FA(user.id);
    }
    @Post('verify2FA')
    verify2FA(@GetUser() user, @Body() dto: TFADto) : Promise<boolean>
    {
        return this.authService.verify2FA(user.id, dto.code);
    }

    @Get('set2FA')
    set2FA(@GetUser() user)
    {
        console.log(this.authService.set2FA(user.id));
        
    }
    @Get('unset2FA')
    unset2FA(@GetUser() user)
    {
        console.log(this.authService.unset2FA(user.id));
        
    }
}
