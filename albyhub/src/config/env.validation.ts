import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsNotEmpty()
  PORT: number = 3000;

  // AWS Secrets Manager configuration
  @IsOptional()
  @IsString()
  SECRETS_MANAGER_NAME?: string = 'albyhub/secrets';

  @IsOptional()
  @IsString()
  AWS_REGION?: string = 'us-east-1';

  // LNURL configuration
  @IsOptional()
  @IsNumber()
  MIN_SENDABLE?: number = 1000; // 1 sat in millisats

  @IsOptional()
  @IsNumber()
  MAX_SENDABLE?: number = 100000000; // 1M sats in millisats

  @IsOptional()
  @IsNumber()
  COMMENT_ALLOWED?: number = 280;

  @IsOptional()
  @IsString()
  LNURL_CALLBACK_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = error.constraints || {};
      return `${error.property}: ${Object.values(constraints).join(', ')}`;
    });

    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return validatedConfig;
}
