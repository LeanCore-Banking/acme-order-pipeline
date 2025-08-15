import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  host: process.env.MONGODB_HOST,
  port: Number(process.env.MONGODB_PORT) || 27017,
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
  database: process.env.MONGODB_DATABASE,
}));
