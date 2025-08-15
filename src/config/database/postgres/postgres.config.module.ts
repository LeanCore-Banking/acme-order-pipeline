import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENVIRONMENT_PATH } from '@/common/constants';
import { getEnvironmentPath } from '@/common/helpers/environment.helper';
import postgresRegister from './postgres.register';
import { PostgresConfigService } from './postgres.config.service';

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [postgresRegister],
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().default(5432).required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, PostgresConfigService],
  exports: [ConfigService, PostgresConfigService],
})
export class PostgresConfigModule {}
