import { Module } from '@nestjs/common';
import { LoggerProviderService } from './logger.provider.service';

@Module({
  providers: [LoggerProviderService],
  exports: [LoggerProviderService],
})
export class LoggerProviderModule {}
