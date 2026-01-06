import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../products/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'token') },
        },
        {
          provide: REDIS_CLIENT,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    redis = module.get<Redis>(REDIS_CLIENT);
    mailService = module.get<MailService>(MailService);
  });

  describe('register', () => {
    it('should create a new user and send verification code', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashed', role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(), firstName: 'John', lastName: 'Doe', address: null, phone: null, dateNaissance: null, photo: null };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user as any);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');
      jest.spyOn(mailService, 'sendMail').mockResolvedValue(null);

      const result = await service.register('test@test.com', 'password', 'John', 'Doe');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(mailService.sendMail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      const user = { id: 1, email: 'test@test.com', password: hashedPassword, role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(), firstName: 'John', lastName: 'Doe', address: null, phone: null, dateNaissance: null, photo: null };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);

      const result = await service.login('test@test.com', 'password');

      expect(result).toHaveProperty('token');
    });

    it('should throw error for invalid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('motPassOublie', () => {
    it('should send verification code', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashed', role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(), firstName: 'John', lastName: 'Doe', address: null, phone: null, dateNaissance: null, photo: null };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(redis, 'set').mockResolvedValue('OK');
      jest.spyOn(mailService, 'sendMail').mockResolvedValue(null);

      const result = await service.motPassOublie('test@test.com');

      expect(result).toEqual({ message: 'Verification code sent to email' });
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.motPassOublie('test@test.com')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid code', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue('123456');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({} as any);
      jest.spyOn(redis, 'del').mockResolvedValue(1);

      const result = await service.resetPassword('test@test.com', '123456', 'NewPass123!');

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(redis.del).toHaveBeenCalled();
    });

    it('should throw error for invalid code', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue('999999');

      await expect(service.resetPassword('test@test.com', '123456', 'NewPass123!')).rejects.toThrow('Invalid code');
    });
  });

  describe('verifyCode', () => {
    it('should verify valid code', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue('123456');

      const result = await service.verifyCode('test@test.com', '123456');

      expect(result).toEqual({ message: 'Code verified successfully' });
    });

    it('should throw error for invalid code', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue('999999');

      await expect(service.verifyCode('test@test.com', '123456')).rejects.toThrow(UnauthorizedException);
    });
  });
});
