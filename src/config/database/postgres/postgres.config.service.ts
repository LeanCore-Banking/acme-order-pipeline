import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgresConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('postgres.host', { infer: true }) ?? 'localhost';
  }

  get port(): number {
    return Number(this.configService.get<number>('postgres.port', { infer: true })) || 5432;
  }

  get username(): string {
    return this.configService.get<string>('postgres.username', { infer: true }) ?? '';
  }

  get password(): string {
    return this.configService.get<string>('postgres.password', { infer: true }) ?? '';
  }

  get database(): string {
    return this.configService.get<string>('postgres.database', { infer: true }) ?? '';
  }
}
