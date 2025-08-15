import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('mongodb.host', { infer: true }) ?? 'localhost';
  }
  get port(): number {
    return Number(this.configService.get<number>('mongodb.port', { infer: true })) || 27017;
  }
  get username(): string {
    return this.configService.get<string>('mongodb.username', { infer: true }) ?? '';
  }
  get password(): string {
    return this.configService.get<string>('mongodb.password', { infer: true }) ?? '';
  }
  get database(): string {
    return this.configService.get<string>('mongodb.database', { infer: true }) ?? '';
  }
}
