import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * MongoDB schema for Admin users
 */
@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // Hashed password

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLoginAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
