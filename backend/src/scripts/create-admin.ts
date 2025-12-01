import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

/**
 * Script to create the first admin user
 * Run: npx ts-node src/scripts/create-admin.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  try {
    const admin = await adminService.createAdmin(
      'admin',
      'Admin@123',
      'admin@housingsociety.com',
      'System Administrator',
    );

    console.log('Admin user created successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }

  await app.close();
}

bootstrap();
