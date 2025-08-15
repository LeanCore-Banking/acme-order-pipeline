import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/modules/app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { AppConfigService } from '@/config/app/app.config.service';
import { SwaggerConfigService } from '@/config/openapi/swagger/swagger.config.service';
import { SwaggerConfigModule } from '@/config/openapi/swagger/swagger.config.module';

import { HttpExceptionFilter } from '@/common/exceptions/http.exception';
import { MicroserviceOptions } from '@nestjs/microservices';
import { KafkaConfigService } from '@/config/queue/kafka/kafka.config.service';
import { kafkaConfigObject } from '@/config/queue/kafka/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      context: 'Main',
      timestamp: true,
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
    }),
  });
  app.enableCors();
  const appConfig: AppConfigService = app.get(AppConfigService);
  const swaggerConfig: SwaggerConfigService = app.get(SwaggerConfigService);
  const kafkaConfig: KafkaConfigService = app.get(KafkaConfigService);

  if (['local', 'development'].includes(appConfig.env)) {
    const swagger: SwaggerConfigModule = new SwaggerConfigModule(swaggerConfig);
    swagger.setup(app);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.connectMicroservice<MicroserviceOptions>(kafkaConfigObject(kafkaConfig));

  await app.startAllMicroservices();
  await app.listen(appConfig.port ?? 3000);
}
bootstrap()
  .then(() => {
    const { APP_PORT } = process.env;
    Logger.log(`Server running on port ${APP_PORT}`);
  })
  .catch((error) => {
    Logger.error('Error starting server', error);
  });
