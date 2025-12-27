import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Admin } from '../admin/schemas/admin.schema';
import * as bcrypt from 'bcrypt';

/**
 * Script to reset admin password
 * Run with: ts-node -r tsconfig-paths/register src/scripts/reset-admin-password.ts
 */
async function resetPassword() {
  console.log('Starting password reset...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const adminModel = app.get<Model<Admin>>('AdminModel');

  try {
    const username = 'chairman';
    const newPassword = 'chairman@2611';

    const admin = await adminModel.findOne({ username });

    if (!admin) {
      console.log('❌ Admin user not found:', username);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and ensure user is active
    await adminModel.findByIdAndUpdate(admin._id, {
      password: hashedPassword,
      isActive: true,
    });

    console.log('✅ Password reset successfully!');
    console.log('👤 Username:', username);
    console.log('🔑 New Password:', newPassword);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await app.close();
  }
}

resetPassword();
