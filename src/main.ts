import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');


  app.enableCors({
    origin: process.env.ORIGIN || 'http://localhost:4200',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

    app.useGlobalPipes(
      new ValidationPipe({
      
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
   })
  )


  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  await app.listen(port);
  logger.log(`App running on port ${port}`);
}
bootstrap();

