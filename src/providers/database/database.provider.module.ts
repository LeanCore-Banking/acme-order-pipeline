import { Module } from '@nestjs/common';
import { PostgresProviderModule } from './postgres/postgres.provider.module';
import { MongoProviderModule } from './mongodb/mongo.provider.module';

@Module({ imports: [PostgresProviderModule, MongoProviderModule] })
export class DatabaseProviderModule {}
