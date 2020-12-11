import { MongoClient, MongoClient as mongodb } from 'mongodb';
import Logger from '../logger';

let mongoDbClient: MongoClient;
const logger = Logger.getInstance().getLogger();


export const initMongoDBClient = async (): Promise<void> => {
    const url = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uva_prod';
    try {
        mongoDbClient = await mongodb.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info('MongoDbService:: MongoDb connected successfully');
    } catch (e) {
        logger.error(`MongoDbService:: MongoDb connected was unsuccessfully. ${e}`);
    }
};

export const getMongoDBClient = async (): Promise<MongoClient> => {
    if (!mongoDbClient) {
        await initMongoDBClient();
    }
    return mongoDbClient;
};
