import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class HealthServiceStatusDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: 'up' | 'down';

  @ApiPropertyOptional({ example: 'Connection provider not found in application context' })
  message?: string;
}

export class HealthSuccessResponseDto {
  @ApiProperty({ example: 'healthy', description: 'Estado general de la aplicación' })
  status: string;

  @ApiProperty({
    example: '2025-08-14T22:18:05.514Z',
    description: 'Marca de tiempo en que se realizó el chequeo de salud',
    type: String,
  })
  timestamp: string;
}

export class HealthErrorResponseDto {
  @ApiProperty({ example: 'error' })
  status: 'error';

  @ApiProperty({
    description: 'Servicios que están funcionando',
    type: Object,
    example: {
      postgres: { status: 'up' },
      kafka: { status: 'up' },
    },
  })
  info: Record<string, HealthServiceStatusDto>;

  @ApiProperty({
    description: 'Servicios que fallaron',
    type: Object,
    example: {
      mongodb: {
        status: 'down',
        message: 'Connection provider not found in application context',
      },
    },
  })
  error: Record<string, HealthServiceStatusDto>;

  @ApiProperty({
    description: 'Resumen de todos los servicios',
    type: Object,
    example: {
      postgres: { status: 'up' },
      kafka: { status: 'up' },
      mongodb: {
        status: 'down',
        message: 'Connection provider not found in application context',
      },
    },
  })
  details: Record<string, HealthServiceStatusDto>;
}