import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/config/app/app.config.module';
import { SwaggerConfigModule } from '@/config/openapi/swagger/swagger.config.module';

import { KafkaProviderModule } from '@/providers/queue/kafka/kafka.provider.module';
import { ApiModule } from './api.module';
import { DatabaseProviderModule } from '@/providers/database/database.provider.module';
import { ProtobufModule } from '@/providers/proto/protobuf.provider.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseProviderModule,
    SwaggerConfigModule,
    KafkaProviderModule,
    ProtobufModule,
    ApiModule,
  ],
})
export class AppModule {}
