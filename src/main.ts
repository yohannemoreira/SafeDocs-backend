import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
      transform: true, // Transforma o payload para a instância do DTO
    }),
  );

  // CORS permissivo para desenvolvimento
  app.enableCors({
    origin: true, 
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
