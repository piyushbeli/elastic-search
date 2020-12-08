import * as expressLogger from 'express-logger-unique-req-id';

//TODO: express-logger-unique-req-id is not working so need to find a different solution or use winston exclusively
export default class Logger {
    private logger: any;
    private static instance: Logger = new Logger();

    public static getInstance() {
      return this.instance;
    }

    public init(app: any) {
      if (this.logger) {

      } else {
        expressLogger.initializeLogger(app);
        this.logger = expressLogger.getLogger();
      }
      return this.logger;
    }

    public getLogger() {
      if (!this.logger) {
        throw new Error('Logger has not been initialized yet');
      }
      return this.logger;
    }
}



