import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: 'Acme Order Pipeline API',
  description: 'API documentation for the Acme Order Pipeline',
  version: 'v1.0',
  envName: 'local',
  url: process.env.SWAGGER_URL,
  tag: 'Acme Order Pipeline',
  path: 'api-docs',
}));
