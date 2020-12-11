import { MongoClient as mongodb } from 'mongodb';
import Logger from '../logger';
import { ILoggerTypes } from 'types/logger';

export default class MongoDbService {
  private static instance: MongoDbService = new MongoDbService();
  private mongoDbClient?:mongodb;
  private logger?: ILoggerTypes;

  constructor() {
      if (MongoDbService.instance) {
          throw new Error('Use getInstance() method instead of constructor to create the instance of MongoDbService');
      }
  }

  public static getInstance(): MongoDbService {
      return MongoDbService.instance;
  }

  public async init():Promise<void> {
      this.logger = Logger.getInstance().getLogger();
      const url = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uva_prod';
      try {
          this.mongoDbClient = await mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
          this.logger!.info('MongoDbService:: MongoDb connected successfully');
      } catch (e) {
          this.logger!.error(`MongoDbService:: MongoDb connected was unsuccessfully. ${e}`);
      }
  }

  public getClient():mongodb {
      if (!this.mongoDbClient) {
          throw new Error('Mongo DB client has not been initialized yet');
      }
      return this.mongoDbClient;
  }

}
