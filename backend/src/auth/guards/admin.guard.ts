import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../entities/user.entity';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user || user.isAdmin !== true) {
      throw new UnauthorizedException(
        'Доступ заборонено. Необхідні права адміністратора.',
      );
    }

    return true;
  }
}
