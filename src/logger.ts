import * as expressLogger from 'express-logger-unique-req-id';
import { ILoggerTypes } from './types/logger';

export default class Logger {
    private logger: any;
    private static instance: Logger = new Logger();

    public static getInstance() {
      return this.instance;
    }

    public init(app: any) {
      if(!this.logger) {
        expressLogger.initializeLogger(app);
        this.logger = expressLogger.getLogger();
      }
      return this.logger;
    }

    public getLogger():ILoggerTypes {
      if (!this.logger) {
        throw new Error('Logger has not been initialized yet');
      }
      return this.logger;
    }
}



