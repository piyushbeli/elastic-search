import Logger from '../logger';
import { IRestaurantESDoc } from '../types/restaurant';
import { ES_INDEXES, ES_TYPES } from '../utils/constants';
import _ from 'lodash';
import getESClient from '../services/elasticSearchService';

const logger = Logger.getInstance().getLogger();

export const bulkUpsertRestaurantsToES = async(esRestaurantDocs:IRestaurantESDoc[]):Promise<{type:string, message:string}> => {
    const esClient = getESClient();
    if (!esRestaurantDocs.length) {
	  return { type: 'error', message: 'Empty Restaurant Docs. Can\'t  move forward' };
    }
    // eslint-disable-next-line
	const restaurants = _.flatMap(esRestaurantDocs,(value,i)=>{
	  return [{ index: { _index: ES_INDEXES.RESTAURANT, _id: value.objectId, _type: ES_TYPES.DOC }}, value];
    });
    try {
	  const result = await esClient.bulk({ refresh: true, body: restaurants });
	  if (result.statusCode === 200) {
		  return { type: 'success', message: `Successfully uploaded ${esRestaurantDocs.length} items in bulk` };
	  } else {
		  logger.error(JSON.stringify(result.body));
		  throw 'Some error occured';
	  }
    } catch (e) {
        logger.error(e);
        return { type: 'error', message: `Some error occurred. ${e}` };
    }
};