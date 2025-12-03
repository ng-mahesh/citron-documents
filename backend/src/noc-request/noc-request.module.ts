import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NocRequestController } from './noc-request.controller';
import { NocRequestService } from './noc-request.service';
import { NocRequestPdfService } from './noc-request-pdf.service';
import { NocRequest, NocRequestSchema } from './schemas/noc-request.schema';
import { EmailModule } from '../email/email.module';

/**
 * Module for NOC Request feature
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: NocRequest.name, schema: NocRequestSchema }]),
    EmailModule,
  ],
  controllers: [NocRequestController],
  providers: [NocRequestService, NocRequestPdfService],
  exports: [NocRequestService],
})
export class NocRequestModule {}
