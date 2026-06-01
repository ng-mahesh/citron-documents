import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface ExchangeDto {
  bridgeToken: string;
}

const ADMIN_ROLES = ['admin', 'super_admin', 'chairman', 'secretary', 'treasurer'];

/**
 * SSO controller for citron-documents ↔ society-management integration.
 * Exchanges a short-lived bridge token (from the society backend) for a
 * session-length citron access token signed with the same JWT_SECRET.
 */
@Controller('sso')
export class SsoController {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Exchange a 5-minute bridge token for a 24-hour citron session token.
   * POST /api/sso/exchange
   */
  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  exchange(@Body() dto: ExchangeDto) {
    let payload: Record<string, unknown>;

    try {
      payload = this.jwtService.verify(dto.bridgeToken) as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Invalid or expired bridge token');
    }

    if (payload.type !== 'sso_bridge') {
      throw new UnauthorizedException('Invalid token type');
    }

    const allRoles: string[] = [
      payload.role as string,
      ...((payload.additional_roles as string[]) || []),
    ].filter(Boolean);

    const isAdmin = allRoles.some((r) => ADMIN_ROLES.includes(r));

    // Issue a session-length token so the resident isn't logged out in 5 min
    const sessionPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      additional_roles: payload.additional_roles || [],
      accountType: payload.accountType || 'user',
      fullName: payload.fullName ?? null,
      phone: payload.phone ?? null,
      wing: payload.wing ?? null,
      unitNumber: payload.unitNumber ?? null,
    };

    const accessToken = this.jwtService.sign(sessionPayload, {
      expiresIn: '24h',
    });

    return {
      success: true,
      data: {
        accessToken,
        expiresIn: 86400,
        user: {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          fullName: payload.fullName ?? null,
          wing: payload.wing ?? null,
          unitNumber: payload.unitNumber ?? null,
          isAdmin,
        },
      },
    };
  }
}
