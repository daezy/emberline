import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config';
import { AppLogger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(await app.resolve(AppLogger));

  app.enableShutdownHooks();

  const { port } = app.get(AppConfigService);
  await app.listen(port);
  new Logger('Bootstrap').log(`API listening on port ${port}`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').fatal('Application failed to start', error);
  process.exit(1);
});
