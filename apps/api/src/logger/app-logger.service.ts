import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

import { AppConfigService } from '../config';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  constructor(config: AppConfigService) {
    super({
      logLevels: config.logLevels,
      json: config.logJson,
      timestamp: !config.logJson,
    });
  }
}
