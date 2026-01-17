import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const { emails, name, photos } = profile;
      console.log('Google Profile:', { emails, name, photos });
      
      let user = await this.prisma.user.findUnique({
        where: { email: emails[0].value },
      });

      if (!user) {
        console.log('Creating new user...');
        user = await this.prisma.user.create({
          data: {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            photo: photos[0]?.value,
            verificationEmail: true,
            password: '',
          },
        });
      }

      console.log('User found/created:', user.id);

      const tokens = await this.authService.generateTokensForOAuth(user.id, user.email);
      console.log('Tokens generated successfully');
      
      const { password: _, ...userResult } = user;
      done(null, { user: userResult, access_token: tokens.access_token, refresh_token: tokens.refresh_token });
    } catch (error) {
      console.error('Google Strategy Error:', error);
      done(error as Error, false);
    }
  }
}
