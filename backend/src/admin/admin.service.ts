import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './schemas/admin.schema';
import { LoginDto } from './dto/login.dto';

/**
 * Service for admin authentication and management
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  /**
   * Create a new admin user (for initial setup)
   */
  async createAdmin(
    username: string,
    password: string,
    email: string,
    fullName: string,
  ): Promise<Admin> {
    // Check if admin already exists
    const existingAdmin = await this.adminModel.findOne({ username }).exec();
    if (existingAdmin) {
      throw new ConflictException('Admin with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new this.adminModel({
      username,
      password: hashedPassword,
      email,
      fullName,
    });

    return admin.save();
  }

  /**
   * Validate admin credentials
   */
  async validateAdmin(username: string, password: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ username, isActive: true }).exec();

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  /**
   * Login admin and generate JWT token
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; admin: any }> {
    const admin = await this.validateAdmin(loginDto.username, loginDto.password);

    // Update last login
    await this.adminModel.findByIdAndUpdate(admin._id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload = {
      sub: admin._id,
      username: admin.username,
      email: admin.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
      },
    };
  }

  /**
   * Get admin by ID
   */
  async findById(id: string): Promise<Admin> {
    return this.adminModel.findById(id).select('-password').exec();
  }
}
