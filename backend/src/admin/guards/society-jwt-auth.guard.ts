import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Validates any society-management-app JWT (resident or admin).
 */
@Injectable()
export class SocietyJwtAuthGuard extends AuthGuard('society-jwt') {}
