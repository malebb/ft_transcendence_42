import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import jwt_decode from "jwt-decode";
import { verify }  from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtDecoded =
{
	sub: number;
}

@Injectable()
export class WsGuard implements CanActivate {

    constructor(private readonly config: ConfigService,
			   private readonly prisma: PrismaService) {}

    canActivate(
        context: any
    ): boolean {
			if (!Object.keys(context.args[0].handshake.auth).length || context.args[0].handshake.auth.token === undefined)
				return (false);
			verify(context.args[0].handshake.auth.token, this.config.get('JWT_SECRET'));
			const decoded: JwtDecoded = jwt_decode(context.args[0].handshake.auth.token);
			const id = decoded.sub;
			const user = this.prisma.user.findUnique({
				where: {
					id: id
				}
			});
			if (user)
				return (true);
			return (false);
    }
}
