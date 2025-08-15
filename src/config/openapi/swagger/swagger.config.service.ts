import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SwaggerConfigService {
  constructor(private configService: ConfigService) {}

  get title(): string {
    return this.configService.get<string>('swagger.title') ?? '';
  }
  get description(): string {
    return this.configService.get<string>('swagger.description') ?? '';
  }
  get version(): string {
    return this.configService.get<string>('swagger.version') ?? '';
  }
  get name(): string {
    return this.configService.get<string>('swagger.envname') ?? '';
  }
  get url(): string {
    return this.configService.get<string>('swagger.url') ?? '';
  }

  get tag(): string {
    return this.configService.get<string>('swagger.tag') ?? '';
  }
  get path(): string {
    return this.configService.get<string>('swagger.path') ?? '';
  }
}
