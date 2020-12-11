import * as expressLogger from 'express-logger-unique-req-id';
import { ILoggerTypes } from './types/logger';
import { Express } from 'express';

export default class Logger {
    private logger;
    private static instance: Logger = new Logger();

    public static getInstance(): Logger {
        return this.instance;
    }

    public init(app: Express.Application): ILoggerTypes {
        if (!this.logger) {
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



