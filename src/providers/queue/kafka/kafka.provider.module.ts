import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { KafkaConfigModule } from '@/config/queue/kafka/kafka.config.module';
import { KafkaConfigService } from '@/config/queue/kafka/kafka.config.service';
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [KafkaConfigModule],
        name: 'KAFKA_SERVICE',
        inject: [KafkaConfigService],
        useFactory: async (kafkaConfigService: KafkaConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: kafkaConfigService.clientId,
              brokers: Array.isArray(kafkaConfigService.brokers)
                ? kafkaConfigService.brokers
                : [kafkaConfigService.brokers],
            },
            consumer: {
              groupId: kafkaConfigService.groupId,
              sessionTimeout: 30000,
              heartbeatInterval: 3000,
            },

            deserialize: (data: object) => data,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaProviderModule {}
