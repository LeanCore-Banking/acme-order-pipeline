// @/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PostgresProviderModule } from '@/providers/database/postgres/postgres.provider.module';
import { MongoProviderModule } from '@/providers/database/mongodb/mongo.provider.module';

import { KafkaProviderModule } from '@/providers/queue/kafka/kafka.provider.module';
import { LoggerProviderModule } from '@/providers/logger/logger.provider.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PostgresProviderModule,
    MongoProviderModule,
    KafkaProviderModule,
    LoggerProviderModule
  ],
  controllers: [HealthController],
})
export class HealthModule {}
