import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { MailService } from '../mail/mail.service';
import { REDIS_CLIENT } from '../products/redis.module';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_TTL = '15m';  // 15 minutes
  private readonly REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(MailService) private readonly mailService: MailService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Generate access token (short-lived)
  private generateAccessToken(userId: number, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { expiresIn: this.ACCESS_TOKEN_TTL }
    );
  }

  // Generate refresh token (long-lived, stored in Redis)
  private async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken = uuidv4();
    const key = `refresh_token:${userId}:${refreshToken}`;
    await this.redis.set(key, 'valid', 'EX', this.REFRESH_TOKEN_TTL);
    return refreshToken;
  }

  // Validate refresh token
  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    const result = await this.redis.get(key);
    return result === 'valid';
  }

  // Revoke refresh token (logout)
  async revokeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    await this.redis.del(key);
  }

  // Revoke all refresh tokens for a user (logout from all devices)
  async revokeAllRefreshTokens(userId: number): Promise<void> {
    const pattern = `refresh_token:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(userId: number, refreshToken: string) {
    const isValid = await this.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = this.generateAccessToken(user.id, user.email);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Revoke old refresh token (rotation)
    await this.revokeRefreshToken(userId, refreshToken);

    const { password: _, ...userResult } = user;
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user: userResult,
    };
  }

  // Generate tokens for OAuth (Google, etc.)
  async generateTokensForOAuth(userId: number, email: string) {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = await this.generateRefreshToken(userId);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async generateVerificationCode(email: string, sujet: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`verification_code:${email}`, code, 'EX', 10 * 60);
    this.mailService.sendMail(
      email,
      sujet,
      `Your verification code is: ${code} le code est valide pour 10 minutes.`,
    ).catch(err => console.error('Email error:', err));
    return true;
  }

  async validationCode(email: string, code: string) {
    const storedCode = await this.redis.get(`verification_code:${email}`);
    if (storedCode === code) {
      await this.prisma.user.update({
        where: { email },
        data: { verificationEmail: true },
      });
      await this.redis.del(`verification_code:${email}`);
      return true;
    }
    return false;
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
    await this.generateVerificationCode(email, "Verification Email");
    const { password: _, ...result } = user;
    return {
      user: result,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.verificationEmail === false) {
      await this.generateVerificationCode(email, "Verification Email");
      throw new UnauthorizedException('email not verified voir votre boite email pour le code de verification');
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    const { password: _, ...result } = user;
    return {
      user: result,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      await this.revokeRefreshToken(userId, refreshToken);
    } else {
      await this.revokeAllRefreshTokens(userId);
    }
    return { message: 'Logged out successfully' };
  }

  async motPassOublie(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.generateVerificationCode(email, "Reset Password");
    return { message: 'Verification code sent to email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const isValidCode = await this.validationCode(email, code);
    if (!isValidCode) {
      throw new UnauthorizedException('Invalid code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  async verifyCode(email: string, code: string) {
    const storedCode = await this.redis.get(`verification_code:${email}`);
    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    await this.prisma.user.update({
      where: { email },
      data: { verificationEmail: true },
    });
    await this.redis.del(`verification_code:${email}`);
    return { message: 'Code verified successfully' };
  }

}