import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`← ${method} ${url} - ${responseTime}ms`);
      }),
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString()
      })),
      catchError(error => {
        const responseTime = Date.now() - now;
        this.logger.error(`✗ ${method} ${url} - ${responseTime}ms - Error: ${error.message}`);
        return throwError(() => error);
      })
    );
  }
}
