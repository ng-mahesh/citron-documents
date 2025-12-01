import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareCertificateModule } from './share-certificate/share-certificate.module';
import { NominationModule } from './nomination/nomination.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';

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

    // Feature modules
    ShareCertificateModule,
    NominationModule,
    AdminModule,
    UploadModule,
    EmailModule,
  ],
})
export class AppModule {}
