import { MongoClient, MongoClient as mongodb } from 'mongodb';
import Logger from '../logger';
import { ILoggerTypes } from '../types/logger';
let mongoDbClient: MongoClient;
const logger: ILoggerTypes = Logger.getInstance().getLogger();

export const initMongoDBClient = async (): Promise<MongoClient> => {
    const url = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uva_prod';
    try {
        mongoDbClient = await mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info('MongoDbService:: MongoDb connected successfully');
        return mongoDbClient;
    } catch (e) {
        logger.error(`MongoDbService:: MongoDb connected was unsuccessfully. ${e}`);
        throw e;
    }
};
// TODO: throw error here if client is undefined
const getMongoDbClient = (): MongoClient => mongoDbClient;
export default getMongoDbClient;
