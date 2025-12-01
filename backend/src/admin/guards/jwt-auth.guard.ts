import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard to protect routes
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
