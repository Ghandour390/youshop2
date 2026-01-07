import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { MailService } from '../mail/mail.service';
import { REDIS_CLIENT } from '../products/redis.module';


@Injectable()
export class AuthService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(MailService) private readonly mailService: MailService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
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
    const { password: _, ...result } = user;
    return {
      user: result,
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
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