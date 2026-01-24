import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global pipes
    app.useGlobalPipes(new ValidationPipe());

    // Get port from environment
    const port = process.env.PORT || 3000;

    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
