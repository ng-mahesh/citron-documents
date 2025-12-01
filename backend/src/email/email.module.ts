import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Module for Email service
 */
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
