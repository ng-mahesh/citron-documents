import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const ADMIN_ROLES = ['admin', 'super_admin', 'chairman', 'secretary', 'treasurer'];

/**
 * JWT strategy that validates society-management-app tokens.
 * Both backends share the same JWT_SECRET, so no DB round-trip is needed.
 * Accepts regular society access tokens and sso_exchange tokens (issued by /sso/exchange).
 */
@Injectable()
export class SocietyJwtStrategy extends PassportStrategy(Strategy, 'society-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: Record<string, any>) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Citron-native admin tokens have a `username` field but no `role`
    const isCitronAdmin = !!payload.username && !payload.role;

    const allRoles: string[] = [payload.role, ...(payload.additional_roles || [])].filter(Boolean);

    const isAdmin = isCitronAdmin || allRoles.some((r) => ADMIN_ROLES.includes(r));

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      additional_roles: payload.additional_roles || [],
      accountType: payload.accountType || 'user',
      isAdmin,
      fullName: payload.fullName ?? null,
      phone: payload.phone ?? null,
      wing: payload.wing ?? null,
      unitNumber: payload.unitNumber ?? null,
    };
  }
}
