import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { RegisterDto, TokenResponseDto, LoginDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;

    // Check if user already exists by email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name,
        password: hashedPassword,
        role: role || Role.VIEWER,
        isActive: true,
      },
    });

    // Return basic user info (without token initially)
    return {
      message: 'User signed up successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: Role[user.role],
      },
    };
  }

  async validateCredentials(email: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password); // bcrypt comparison

  console.log('isPasswordValid', isPasswordValid); // Debugging line

  if (!isPasswordValid) {
    return null;
  }

  return user;
}

  async login(params: { loginDto: LoginDto }) {

    const { loginDto } = params;

    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: Role[user.role] };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '24h',
    })
    
    return {
      access_token,
      expires_in: '24h',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: Role[user.role],
      },
    };
  }

  async refreshToken(userId: number): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account is deactivated');
    }

    const payload = { email: user.email, sub: user.id, role: Role[user.role] };
    
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '24h',
    })

    return {
      access_token,
      expires_in: '24h',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: Role[user.role],
      },
    };
  }
}