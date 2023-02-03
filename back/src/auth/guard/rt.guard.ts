import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class RtGuard extends AuthGuard('jwt-refresh')
{
    constructor()
    {
        super();
    }

}