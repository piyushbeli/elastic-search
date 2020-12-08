import MongoDbService from '../mongodbService';
import * as _ from 'lodash';
import { IRestaurantAggregatedData, IRestaurantEsDoc } from 'types/restaurant';
import {  IEsDoc } from '../types/esDoc';
import { ES_INDEXES, ES_TYPES } from '../utils/constants';
import ElasticSearch from '../elasticSearch';


export async function uploadAllRestaurantsToES(){
  const esClient  = ElasticSearch.getInstance().getClient();
  const restaurants:IRestaurantAggregatedData[] = await getAllRestaurants();
  const sanitizedRestaurants :IRestaurantEsDoc[] = getSanitizedRestaurantsForEs(restaurants);
  try{
    await esClient.indices.create({ index : ES_INDEXES.RESTAURANT });
    //TODO: create schema too
  }catch(e){
    // TODO: log here
  }
  // TODO; error handling remains
  const erroredDocs:any[] = [];
  for(const sanitizedRestaurant of sanitizedRestaurants){
    const id = sanitizedRestaurant.restaurantId;
    delete sanitizedRestaurant.restaurantId;
    const esRestaurantDoc:IEsDoc<IRestaurantEsDoc> = {
      index : ES_INDEXES.RESTAURANT,
      type: ES_TYPES.DOC,
      id,
      body:sanitizedRestaurant,
    }; 
    try{
      await esClient.create(esRestaurantDoc);
    }catch(e){
      // TODO: log here
      erroredDocs.push(sanitizedRestaurant);
    }
  }
  const { body:count } = await esClient.count({ index : ES_INDEXES.RESTAURANT });
  return count;
}

async function getAllRestaurants() : Promise<IRestaurantAggregatedData[]>{
  const mongoDbClient = MongoDbService.getInstance().getClient();
  const results = await mongoDbClient.db(_.get(mongoDbClient, 's.options.dbName')).collection('Restaurant')
    .aggregate([{
      $project : {
        _id : 0,
        restaurantId : '$_id',
        restaurantName : '$restaurant_name',
        restaurantName2:'$name',
        restaurantContactEmail : '$contact_email',
        restaurantPhone:'$contact_phone',
        restaurantAddress :'$contact_address',
      },
    }]).toArray();
  return results;
}

function getSanitizedRestaurantsForEs(restaurants : IRestaurantAggregatedData[]) : IRestaurantEsDoc[]{
  const esRestaurantDocs:IRestaurantEsDoc[]=[];
  for(const restaurant of restaurants){
    esRestaurantDocs.push(
      {
        address : restaurant.restaurantAddress,
        email: restaurant.restaurantContactEmail,
        name:restaurant.restaurantName || restaurant.restaurantName2,
        phone: restaurant.restaurantPhone,
        restaurantId : restaurant.restaurantId,
      },
    );
  }
  return esRestaurantDocs;
}