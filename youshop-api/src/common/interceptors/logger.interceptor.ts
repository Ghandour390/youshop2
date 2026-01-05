import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';


  @Injectable()
  export class LoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggerInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url, body, ip } = request;
      const now = Date.now();
        
      this.logger.log(`${method} ${url} - IP: ${ip}`);
      
      return next.handle().pipe( 
        tap(() => {
          const responseTime = Date.now() - now;
          this.logger.log(`${method} ${url} - ${responseTime}ms`);
        }),
      );
    }
  }
  
  export default LoggerInterceptor;
  
