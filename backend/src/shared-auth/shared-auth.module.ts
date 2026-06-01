import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocietyJwtStrategy } from '../admin/strategies/society-jwt.strategy';
import { SocietyAdminGuard } from '../admin/guards/society-admin.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SocietyJwtStrategy, SocietyAdminGuard],
  exports: [SocietyJwtStrategy, SocietyAdminGuard, PassportModule, JwtModule],
})
export class SharedAuthModule {}
