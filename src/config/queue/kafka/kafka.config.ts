import { KafkaOptions, Transport } from '@nestjs/microservices';
import { KafkaConfigService } from './kafka.config.service';

export const kafkaConfigObject = (kafkaConfig: KafkaConfigService) =>
  ({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaConfig.clientId,
        brokers: Array.isArray(kafkaConfig.brokers) ? kafkaConfig.brokers : [kafkaConfig.brokers],
      },
      consumer: {
        groupId: kafkaConfig.groupId,
        heartbeatInterval: 3000,
        sessionTimeout: 30000,
        fromBeginning: true,
      },
      deserialize: (data: object) => data,
    },
  }) as KafkaOptions;
