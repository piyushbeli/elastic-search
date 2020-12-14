import _ from 'lodash';
import { DB_CLASSES } from '../utils/constants';
import { ESSyncStat } from '../types/esSyncStats';
import getMongoDbClient from '../services/mongodbService';

export const getDocs = async (pageNo: number, pageSize: number, query = {}, className: string): Promise<any[]> => {
    const client = getMongoDbClient();
    const results = await client
        .db(_.get(client, 's.options.dbName'))
        .collection(className)
        .find(query)
        .skip(pageSize * pageNo)
        .limit(pageSize)
        .toArray();
    return results!;
};

export const updateESSyncStat = async (data: ESSyncStat): Promise<boolean> => {
    const indexType = data.indexType;
    const syncStats = data.syncStats;
    const client = getMongoDbClient();
    const result = await client
        .db(_.get(client, 's.options.dbName'))
        .collection(DB_CLASSES.ES_SYNC_STAT)
        .findOneAndUpdate({ indexType }, { $set: { syncStats }}, { upsert: true });
    return result.ok === 1;
};

export const getESSyncStat = async (indexType: string): Promise<any> => {
    const client = getMongoDbClient();
    const result = await client.db(_.get(client, 's.options.dbName')).collection(DB_CLASSES.ES_SYNC_STAT).findOne({ indexType: indexType });
    return result;
};
