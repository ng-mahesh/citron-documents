import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareCertificateController } from './share-certificate.controller';
import { ShareCertificateService } from './share-certificate.service';
import { ShareCertificate, ShareCertificateSchema } from './schemas/share-certificate.schema';
import { EmailModule } from '../email/email.module';

/**
 * Module for Share Certificate feature
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShareCertificate.name, schema: ShareCertificateSchema }]),
    EmailModule,
  ],
  controllers: [ShareCertificateController],
  providers: [ShareCertificateService],
  exports: [ShareCertificateService],
})
export class ShareCertificateModule {}
