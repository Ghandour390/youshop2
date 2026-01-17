import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Wrap Fastify response to be compatible with Passport's Express expectations
    if (!response.setHeader && response.header) {
      response.setHeader = response.header.bind(response);
    }
    if (!response.end && response.send) {
      response.end = response.send.bind(response);
    }
    
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
