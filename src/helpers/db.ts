import { MongoClient } from 'mongodb';
import MongoDbService from '../services/mongodbService';
import _ from 'lodash';
import { DB_CLASSES } from '../utils/constants';
import { ESSyncStat } from '../types/esSyncStats';

export default class DbHelper {
	private mongoDbClient:MongoClient;

	constructor() {
	    this.mongoDbClient = MongoDbService.getInstance().getClient();
	}
	// eslint-disable-next-line
	public async getRestaurants(pageNo:number,pageSize:number,query = {}) : Promise<any[]>{
	    const results = await this.mongoDbClient
		  .db(_.get(this.mongoDbClient, 's.options.dbName'))
		  .collection(DB_CLASSES.RESTAURANT)
		  .find(query)
		  .skip(pageSize * pageNo)
		  .limit(pageSize)
		  .toArray();
	    return results;
	}

	public async updateESSyncStat(data:ESSyncStat): Promise<boolean> {
	    const indexType = data.indexType;
	    const syncStats = data.syncStats;
	    const result = await this.mongoDbClient
		  .db(_.get(this.mongoDbClient, 's.options.dbName'))
		  .collection(DB_CLASSES.ES_SYNC_STAT)
		  .findOneAndUpdate({ indexType }, { $set: { syncStats }}, { upsert: true });
	    return result.ok === 1;
	}

	// eslint-disable-next-line
	public async getESSyncStat(indexType : string): Promise<any>{
	    const result = await this.mongoDbClient
	        .db(_.get(this.mongoDbClient, 's.options.dbName'))
	        .collection(DB_CLASSES.ES_SYNC_STAT)
	        .findOne({ indexType: indexType });
	    return result;
	}
}