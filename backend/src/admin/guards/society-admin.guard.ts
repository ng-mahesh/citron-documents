import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that requires a valid society JWT AND an admin-level role
 * (admin, super_admin, chairman, secretary, treasurer).
 */
@Injectable()
export class SocietyAdminGuard extends AuthGuard('society-jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First validate the JWT (throws UnauthorizedException if invalid)
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    if (!request.user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
