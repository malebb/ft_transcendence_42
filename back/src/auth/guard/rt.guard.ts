import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor(private config: ConfigService) {
    super();
  }
}
