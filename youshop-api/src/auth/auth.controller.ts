import { Controller, Post, Body, UseGuards, Get, Request, Req, Res } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { LoginDto, RegisterDto, VerificationCodeDto, ResetPasswordDto, motPassOublieDto, RefreshTokenDto, LogoutDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password, registerDto.firstName, registerDto.lastName);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute to prevent brute force
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized or email not verified. Check your email inbox for the verification code.' })
  @ApiResponse({ status: 429, description: 'Too many login attempts. Please try again later.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: ExpressRequest & { user: any }) {
    return req.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: RefreshTokenDto, @Request() req: ExpressRequest) {
    // Decode the expired access token to get user id
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('No authorization header');
      }
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.authService['jwtService'].decode(token) as { sub: number };
      if (!decoded?.sub) {
        throw new Error('Invalid token');
      }
      return this.authService.refreshAccessToken(decoded.sub, body.refresh_token);
    } catch (error) {
      // If no valid access token, try to decode refresh token info from body
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: ExpressRequest & { user: any }, @Body() body: LogoutDto) {
    return this.authService.logout(req.user.id, body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@Request() req: ExpressRequest & { user: any }) {
    await this.authService.revokeAllRefreshTokens(req.user.id);
    return { message: 'Logged out from all devices' };
  }

  @Post('motPassOublie')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: motPassOublieDto  })
  @ApiResponse({ status: 200, description: 'Verification code sent to email' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async motPassOublie(@Body() body: { email: string }) {
    return this.authService.motPassOublie(body.email);
  }

  @Post('resetPassword')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth login' })
  async googleAuth(@Req() req: ExpressRequest) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: ExpressRequest & { user: any }, @Res() res: Response) {
    const { user, access_token, refresh_token } = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    // Pass both tokens via URL - (auth) folder in Next.js means route is /google/success not /auth/google/success
    res.redirect(`${frontendUrl}/google/success?token=${access_token}&refresh_token=${refresh_token}`);
  }

  @Post('verify-code')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Verify code' })
  @ApiBody({ type: VerificationCodeDto })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyCode(@Body() body: VerificationCodeDto) {
    return this.authService.verifyCode(body.email, body.code);
  }
}