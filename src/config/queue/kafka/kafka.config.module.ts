import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import kafkaRegister from './kafka.register';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConfigService } from './kafka.config.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [kafkaRegister],
      validationSchema: Joi.object({
        KAFKA_BROKERS: Joi.string().required(),
        KAFKA_CLIENT_ID: Joi.string().required(),
        KAFKA_GROUP_ID: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, KafkaConfigService],
  exports: [ConfigService, KafkaConfigService],
})
export class KafkaConfigModule {}
