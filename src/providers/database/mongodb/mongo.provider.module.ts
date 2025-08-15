import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MONGO_DB_TYPE_ORM_NAME } from '@/common/constants';
import { MongoConfigModule } from '@/config/database/mongodb/mongo.config.module';
import { MongoConfigService } from '@/config/database/mongodb/mongo.config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: MONGO_DB_TYPE_ORM_NAME,
      imports: [MongoConfigModule],
      inject: [MongoConfigService],
      useFactory: async (configService: MongoConfigService) => ({
        type: 'mongodb',
        host: configService.host,
        username: configService.username,
        password: configService.password,
        port: configService.port,
        synchronize: false,
        database: configService.database,
        authSource: 'admin',
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class MongoProviderModule {}
