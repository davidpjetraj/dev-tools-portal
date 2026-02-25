import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import expressBasicAuth from 'express-basic-auth';
import * as requestIp from 'request-ip';
import { AllExceptionFilter } from './exception/all-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
  });
  app.use(helmet());

  app.useGlobalFilters(new AllExceptionFilter());
  app.use(requestIp.mw());

  app.setGlobalPrefix('v1');

  app.use(
    ['/v1/api', '/v1/api-json'],
    expressBasicAuth({
      challenge: true,
      users: {
        [config.swagger_user]: config.swagger_password,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.app_name)
    .setDescription(`${config.app_name} Documentation`)
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

  // Set up Swagger with custom options to hide schemas
  SwaggerModule.setup('v1/api', app, documentFactory, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // Hide the models section by default
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(config.port, async () => {
    const appUrl = await app.getUrl();
    console.log(
      `🚀 Application ${config.app_name} started on ${appUrl} port ${config.port}`,
      {
        app_name: config.app_name,
        url: appUrl,
        port: config.port,
        environment: config.environment || 'development',
      },
    );
    console.log(`❤️  Health check at ${appUrl}/v1/health`);
    console.log(`📚 Swagger at ${appUrl}/v1/api`);
  });
}

bootstrap();
