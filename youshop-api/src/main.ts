import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { winstonLogger } from './logger/winston.config';
import LoggerInterceptor from './common/interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true , logger: winstonLogger });
  
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalInterceptors(new LoggerInterceptor());
  const config = new DocumentBuilder()
    .setTitle('YouShop API')
    .setDescription('API documentation for YouShop')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000, () => console.log(`Server is running on port ${process.env.PORT ?? 3000}`));
}
bootstrap();
