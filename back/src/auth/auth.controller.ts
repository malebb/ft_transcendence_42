import { Body, Headers, Controller, HttpCode, HttpStatus, Post, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: AuthDto, @Headers() headers)
    {
        console.log(headers);
        console.log(dto);
        return this.authService.signup(dto);
    }
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto, @Headers() headers)
    {
        console.log(headers);
        return this.authService.signin(dto);
    }

    @Post('logout')
    logout()
    {
        return this.authService.logout();
    }

    @Post('refresh')
    refreshToken()
    {
        return this.authService.refreshToken();
    }

    @Get('verify')
    verify(@Headers() headers)
    {
        console.log((headers.authorization).split(" ")[1]);
        return this.authService.verify((headers.authorization).split(" ")[1]);
    }
}
