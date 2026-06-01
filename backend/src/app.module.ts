import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedAuthModule } from './shared-auth/shared-auth.module';
import { ShareCertificateModule } from './share-certificate/share-certificate.module';
import { NominationModule } from './nomination/nomination.module';
import { NocRequestModule } from './noc-request/noc-request.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { SsoModule } from './sso/sso.module';

/**
 * Root application module
 * Configures MongoDB connection, environment variables, and imports feature modules
 */
@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configure MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // SharedAuthModule first — registers SocietyJwtStrategy with Passport before any controller loads
    SharedAuthModule,

    // Feature modules
    ShareCertificateModule,
    NominationModule,
    NocRequestModule,
    AdminModule,
    UploadModule,
    EmailModule,
    SsoModule,
  ],
})
export class AppModule {}
