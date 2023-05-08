import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/role.enum';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useBodyParser('json', { limit: '5mb' });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalGuards(new JwtAuthGuard(new Reflector()));
  app.useGlobalGuards(new RolesGuard(new Reflector()));

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      // Auto typecast income data to DTO Type whereever possible
      transform: true,
    }),
  );

  // const config = new DocumentBuilder()
  //   .setTitle('WebWhiz example')
  //   .setVersion('1.0')
  //   .addTag('webwhiz')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, document);

  const host = process.env.HOST || '127.0.0.1';
  const appPort = Number.parseInt(process.env.PORT || '3000', 10);

  await app.listen(appPort, host);
}
bootstrap();
