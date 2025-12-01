import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NominationController } from './nomination.controller';
import { NominationService } from './nomination.service';
import { Nomination, NominationSchema } from './schemas/nomination.schema';
import { EmailModule } from '../email/email.module';

/**
 * Module for Nomination feature
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nomination.name, schema: NominationSchema }]),
    EmailModule,
  ],
  controllers: [NominationController],
  providers: [NominationService],
  exports: [NominationService],
})
export class NominationModule {}
