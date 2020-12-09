import MongoDbService from '../services/mongodbService';
import _ from 'lodash';
import { IRestaurantESDoc } from '../types/restaurant';
import { DB_CLASSES, ES_INDEXES, ES_TYPES } from '../utils/constants';
import ElasticSearch from '../services/elasticSearchService';
import { Client } from '@elastic/elasticsearch';
import Logger from '../logger';
import { ESSyncStat } from 'types/esSyncStats';
import { MongoClient } from 'mongodb';


export async function uploadAllRestaurantsToES() : Promise<string>{
  handleRestaurantUpload();
  return 'Restaurant upload started.';
}

async function handleRestaurantUpload(){
  const logger = Logger.getInstance().getLogger();
  let pageNo = 0;
  const pageSize = 50;
  let totalDocsFetched = 0;
  while(true){
    const restaurants:IRestaurantESDoc[] = await getAllRestaurants(pageNo,pageSize);
    const result = await bulkUpsertToES(restaurants);
    logger.info(`Page No : ${pageNo}, ${result}`);
    totalDocsFetched += restaurants.length;
    if(restaurants.length < pageSize){
      break;
    }
    pageNo++;
  }
  logger.info(`Total ${totalDocsFetched} uploaded.`);
}

async function getAllRestaurants(pageNo:number,pageSize:number,lastSyncStartTime ?: Date|null) : Promise<IRestaurantESDoc[]>{
  const mongoDbClient:MongoClient = MongoDbService.getInstance().getClient();
  const esRestaurantDocs:IRestaurantESDoc[] = [];
  let query = {};
  if(lastSyncStartTime){
    query = { '_updated_at': { $gt: lastSyncStartTime }};
  }
  const results = await mongoDbClient
    .db(_.get(mongoDbClient, 's.options.dbName'))
    .collection(DB_CLASSES.RESTAURANT)
    .find(query)
    .skip(pageSize * pageNo)
    .limit(pageSize)
    .toArray();
  esRestaurantDocs.push(...getSanitizedRestaurants(results));
  return esRestaurantDocs;
}

function getSanitizedRestaurants(restaurants : unknown[]) : IRestaurantESDoc[]{
  const esRestaurantDocs:IRestaurantESDoc[]=[];
  for(const restaurant of restaurants){
    const restaurant_name = _.get(restaurant,'restaurant_name') ||  _.get(restaurant,'name','');
    esRestaurantDocs.push(
      {
        contact_address: _.get(restaurant,'contact_address',''),
        image: _.get(restaurant,'image',''),
        objectId: _.get(restaurant,'_id'),
        restaurant_about_us: _.get(restaurant,'restaurant_about_us'),
        restaurant_logo: _.get(restaurant,'restaurant_logo',''),
        restaurant_name,
        type: _.get(restaurant,'type',''),
        tags: _.get(restaurant,'tags',[]).join(''),
      },
    );
  }
  return esRestaurantDocs;
}

async function bulkUpsertToES(esRestaurantDocs:IRestaurantESDoc[]):Promise<string>{
  if(!esRestaurantDocs.length){
    return 'Empty Restaurant Docs. Can\'t  move forward';
  }
  const esClient:Client  = ElasticSearch.getInstance().getClient();
  const rests = _.flatMap(esRestaurantDocs,(value,index)=>{
    return [{ index: { _index: ES_INDEXES.RESTAURANT, _id: value.objectId, _type: ES_TYPES.DOC }},value];
  });
  try{
    const result = await esClient.bulk({ refresh: true, body: rests });
    return result.statusCode === 200 ? `Successfully uploaded ${esRestaurantDocs.length} items in bulk` : 'Some error occurred.';
  }catch(e){
    return `Some error occurred. ${e}`;
  }
}

export async function updateESSyncStat(data:ESSyncStat): Promise<boolean>{
  const mongoDbClient:MongoClient = MongoDbService.getInstance().getClient();
  const indexType = data.indexType;
  const syncStats = data.syncStats;
  const result = await mongoDbClient
    .db(_.get(mongoDbClient, 's.options.dbName'))
    .collection(DB_CLASSES.ES_SYNC_STAT)
    .findOneAndUpdate({ indexType },{ $set: { syncStats }},{ upsert: true });
  return result.ok === 1;
}

export async function getESSyncStat(): Promise<any>{
  const mongoDbClient:MongoClient = MongoDbService.getInstance().getClient();
  const result = await mongoDbClient
    .db(_.get(mongoDbClient, 's.options.dbName'))
    .collection(DB_CLASSES.ES_SYNC_STAT)
    .findOne({ indexType: ES_INDEXES.RESTAURANT });
  return result;
}

export async function handleRestaurantUploadFromJob(lastSyncStartTime: Date|null): Promise<{error: string;totalRestaurants: number;}>{
  const logger = Logger.getInstance().getLogger();
  let pageNo = 0;
  const pageSize = 50;
  let totalDocsFetched = 0;
  const error = '';
  while(true){
    const restaurants:IRestaurantESDoc[] = await getAllRestaurants(pageNo,pageSize,lastSyncStartTime);
    const result = await bulkUpsertToES(restaurants);
    logger.info(`Page No : ${pageNo}, ${result}`);
    totalDocsFetched += restaurants.length;
    if(restaurants.length < pageSize){
      break;
    }
    pageNo++;
  }
  logger.info(`Total ${totalDocsFetched} uploaded.`);
  return {
    error,
    totalRestaurants: totalDocsFetched,
  };
}