import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

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
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashed', role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(), firstName: 'John', lastName: 'Doe', address: null, phone: null, dateNaissance: null, photo: null };
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user as any);

      const result = await service.register('test@test.com', 'password', 'John', 'Doe');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
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

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow();
    });
  });
});
