/*import { Injectable, NestMiddleware, HttpStatus, HttpException } from "@nestjs/common";
import { Request, Response } from "@nestjs/common";
import { JwtAuthGuard } from '@nestjs/jwt';
import { NextFunction } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
       const guard = new JwtAuthGuard();
       guard.canActivate(req).then(user => {

       })
    }
}*/