import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { HealthErrorResponseDto, HealthSuccessResponseDto } from './dto/health.dto';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private context: string;
  constructor(
    private health: HealthCheckService,
    private mongo: TypeOrmHealthIndicator,
    private postgres: TypeOrmHealthIndicator,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
    private readonly logger: LoggerProviderService,
  ) {
    this.context = HealthController.name;
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check passed',
    type: HealthSuccessResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed',
    type: HealthErrorResponseDto,
  })
  async check() {
    const report = await this.health.check([
      async () => this.mongo.pingCheck('mongodb'),
      async () => this.postgres.pingCheck('postgres'),
      async () => {
        try {
          const admin = this.kafkaClient.createClient().admin();
          await admin.connect();
          await admin.fetchTopicMetadata({ topics: [] });
          await admin.disconnect();
          return { kafka: { status: 'up' } };
        } catch (error: unknown) {
          this.logger.warn(this.context, JSON.stringify(error));
          return {
            kafka: {
              status: 'down',
              message: 'Kafka connection failed',
            },
          };
        }
      },
    ]);

    const isHealthy = report.status === 'ok';

    if (isHealthy) {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      status: 'error',
      info: report.info,
      error: report.error,
      details: report.details,
    };
  }
}
