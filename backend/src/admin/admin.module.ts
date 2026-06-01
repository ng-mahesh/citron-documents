import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { ShareCertificateModule } from '../share-certificate/share-certificate.module';
import { NominationModule } from '../nomination/nomination.module';
import { NocRequestModule } from '../noc-request/noc-request.module';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';
import { SharedAuthModule } from '../shared-auth/shared-auth.module';

@Module({
  imports: [
    SharedAuthModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    ShareCertificateModule,
    NominationModule,
    NocRequestModule,
    EmailModule,
    UploadModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
