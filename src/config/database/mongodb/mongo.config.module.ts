import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENVIRONMENT_PATH } from '@/common/constants';
import { getEnvironmentPath } from '@/common/helpers/environment.helper';
import { MongoConfigService } from './mongo.config.service';
import mongoRegister from './mongo.register';
const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [mongoRegister],
      validationSchema: Joi.object({
        MONGODB_HOST: Joi.string().required(),
        MONGODB_PORT: Joi.number().default(27017).required(),
        MONGODB_USERNAME: Joi.string().required(),
        MONGODB_PASSWORD: Joi.string().required(),
        MONGODB_DATABASE: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, MongoConfigService],
  exports: [ConfigService, MongoConfigService],
})
export class MongoConfigModule {}
