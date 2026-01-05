import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, RegisterDto, VerificationCodeDto, ResetPasswordDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password, registerDto.firstName, registerDto.lastName);
    // return {registerDto}
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('motPassOublie')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Verification code sent to email' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async motPassOublie(@Body() body: { email: string }) {
    return this.authService.motPassOublie(body.email);
  }

  @Post('resetPassword')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @Post('verifyCode')
  @ApiOperation({ summary: 'Verify code' })
  @ApiBody({ type: VerificationCodeDto })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyCode(@Body() body: VerificationCodeDto) {
    return this.authService.verifyCode(body.email, body.code);
  }
}