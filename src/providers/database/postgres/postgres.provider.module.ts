import { Module } from '@nestjs/common';

import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { PostgresConfigModule } from '@/config/database/postgres/postgres.config.module';
import { PostgresConfigService } from '@/config/database/postgres/postgres.config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [PostgresConfigModule],
      useFactory: async (configService: PostgresConfigService) => ({
        type: 'postgres',
        host: configService.host,
        port: configService.port,
        username: configService.username,
        password: configService.password,
        database: configService.database,
        autoLoadEntities: true,
        synchronize: false,
        logging: process.env.APP_ENV !== 'production',
      }),
      inject: [PostgresConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresProviderModule {}
