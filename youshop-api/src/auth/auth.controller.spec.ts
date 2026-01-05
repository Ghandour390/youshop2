import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            motPassOublie: jest.fn(),
            resetPassword: jest.fn(),
            verifyCode: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@test.com', password: 'Pass123!', firstName: 'John', lastName: 'Doe' };
      const result = { user: { id: 1, email: 'test@test.com' }, token: 'token' };
      jest.spyOn(authService, 'register').mockResolvedValue(result as any);

      expect(await controller.register(dto)).toBe(result);
      expect(authService.register).toHaveBeenCalledWith('test@test.com', 'Pass123!', 'John', 'Doe');
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const dto = { email: 'test@test.com', password: 'Pass123!' };
      const result = { user: { id: 1, email: 'test@test.com' }, token: 'token' };
      jest.spyOn(authService, 'login').mockResolvedValue(result as any);

      expect(await controller.login(dto)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'Pass123!');
    });
  });

  describe('motPassOublie', () => {
    it('should send verification code', async () => {
      const result = { message: 'Verification code sent' };
      jest.spyOn(authService, 'motPassOublie').mockResolvedValue(result);

      expect(await controller.motPassOublie({ email: 'test@test.com' })).toBe(result);
      expect(authService.motPassOublie).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const dto = { email: 'test@test.com', code: '123456', newPassword: 'NewPass123!' };
      const result = { message: 'Password reset successfully' };
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(result);

      expect(await controller.resetPassword(dto)).toBe(result);
      expect(authService.resetPassword).toHaveBeenCalledWith('test@test.com', '123456', 'NewPass123!');
    });
  });

  describe('verifyCode', () => {
    it('should verify code', async () => {
      const dto = { email: 'test@test.com', code: '123456' };
      const result = { message: 'Code verified successfully' };
      jest.spyOn(authService, 'verifyCode').mockResolvedValue(result);

      expect(await controller.verifyCode(dto)).toBe(result);
      expect(authService.verifyCode).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const req = { user: { id: 1, email: 'test@test.com' } };
      expect(controller.getProfile(req)).toBe(req.user);
    });
  });
});
