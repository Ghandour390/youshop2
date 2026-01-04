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
      const method = request.method;
      const url = request.url;
      const body = request.body;
      const userAgent = request.get('user-agent') || '';
      const ip = request.ip || request.connection.remoteAddress;
      const now = Date.now();
        
      this.logger.log(
        `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)} - User-Agent: ${userAgent} - IP: ${ip}`,
      );
      
      return next.handle().pipe( 
        tap(() => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - IP: ${ip} - Response Time: ${responseTime}ms`,
          );
        }),
      );
    }
  }
  
  export default LoggerInterceptor;
  
