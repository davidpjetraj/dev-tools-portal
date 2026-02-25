import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import expressBasicAuth from 'express-basic-auth';
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
    .setTitle('Dev Tools Portal API')
    .setDescription('Dev Tools Portal API Documentation')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/api', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      filter: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(config.port, () => {
    console.log(`🚀 API ready at http://localhost:${config.port}/v1/graphql`);
    console.log(`❤️  Health check at http://localhost:${config.port}/v1/health`);
    console.log(`📚 Swagger at http://localhost:${config.port}/v1/api`);
  });
}

bootstrap();
