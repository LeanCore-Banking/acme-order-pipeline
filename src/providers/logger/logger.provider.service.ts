import { ConsoleLogger, Logger } from '@nestjs/common';

export class LoggerProviderService extends Logger {
  private readonly logger: ConsoleLogger;
  constructor() {
    super();
    this.logger = new ConsoleLogger();
  }

  log(context: string, message: string, method?: string | null, data?: object) {
    const msg: string = data
      ? `${method ? 'method: ' + method : ''} : ${message} : ${JSON.stringify(data)}`
      : `${method ? 'method: ' + method : ''} : ${message}`;
    this.logger.log(msg, context);
  }

  error(context: string, message: string, trace?: string) {
    this.logger.error(message, trace, context);
  }

  warn(context: string, message: string) {
    this.logger.warn(message, context);
  }

  debug(context: string, message: string, method?: string | null, data?: object) {
    const msg: string = data
      ? `${method ? 'method: ' + method : ''} : ${message} : ${JSON.stringify(data)}`
      : `${method ? 'method: ' + method : ''} : ${message}`;
    this.logger.debug(msg, context);
  }
}
