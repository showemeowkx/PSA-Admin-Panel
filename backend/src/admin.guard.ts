import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from './auth/entities/user.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

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
        'Access denied: Admin privileges required',
      );
    }

    return true;
  }
}
