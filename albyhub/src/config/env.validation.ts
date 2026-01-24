import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  ALBY_HUB_URL!: string;

  @IsString()
  @IsNotEmpty()
  ALBY_HUB_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  ALBY_HUB_CLIENT_SECRET!: string;
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
