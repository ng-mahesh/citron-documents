import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

/**
 * Seed script to create default admin user
 * Run with: npm run seed:admin
 */
async function seedAdmin() {
  console.log('Starting admin seed...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  try {
    // Create default admin user
    const defaultAdmin = await adminService.createAdmin(
      'chairman', // username
      'chairman@2611', // password - CHANGE THIS IN PRODUCTION!
      'chairman@citronsociety.in', // email
      'Chairman', // full name
    );

    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email:', defaultAdmin.email);
    console.log('👤 Username: chairman');
    console.log('🔑 Password: chairman@2611');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Admin user already exists. Skipping...');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await app.close();
  }
}

seedAdmin();
