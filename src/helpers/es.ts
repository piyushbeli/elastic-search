import Logger from '../logger';
import { IRestaurantESDoc } from '../types/restaurant';
import { ES_INDEXES, ES_TYPES } from '../utils/constants';
import _ from 'lodash';
import getESClient from '../services/elasticSearchService';
import { Request } from 'express';
import { IDishESDoc } from '../types/dish';

const logger = Logger.getInstance().getLogger();

export const bulkUpsertRestaurantsToES = async (esRestaurantDocs: IRestaurantESDoc[]): Promise<{ type: string; message: string }> => {
    const esClient = getESClient();
    if (esRestaurantDocs.length) {
        const restaurants = _.flatMap(esRestaurantDocs, (value) => {
            return [{ index: { _index: ES_INDEXES.RESTAURANT, _id: value.objectId, _type: ES_TYPES.DOC }}, value];
        });
        try {
            const result = await esClient.bulk({ refresh: true, body: restaurants });
            if (result.statusCode === 200) {
                return { type: 'success', message: `Successfully uploaded ${esRestaurantDocs.length} restaurants to ES` };
            } else {
                throw result.body;
            }
        } catch (e) {
            logger.error(e);
            return { type: 'error', message: `Some error occurred. ${e}` };
        }
    } else {
        return { type: 'success', message: 'No documents to upload' };
    }
};
// TODO: merge bulk upload helper for both restaurant and dishes i.e make it generic
export const bulkUpsertDishesToES = async (esDishDocs: IDishESDoc[]): Promise<{ type: string; message: string }> => {
    const esClient = getESClient();
    if (esDishDocs.length) {
        const dishes = _.flatMap(esDishDocs, (value) => {
            return [{ index: { _index: ES_INDEXES.DISH, _id: value.objectId, _type: ES_TYPES.DOC }}, value];
        });
        try {
            const result = await esClient.bulk({ refresh: true, body: dishes });
            if (result.statusCode === 200) {
                return { type: 'success', message: `Successfully uploaded ${esDishDocs.length} dishes to ES` };
            } else {
                throw result.body;
            }
        } catch (e) {
            logger.error(e);
            return { type: 'error', message: `Some error occurred. ${e}` };
        }
    } else {
        return { type: 'success', message: 'No documents to upload' };
    }
};

export const searchDishes = async (req: Request): Promise<{ results: number; values: any[] }> => {
    const { from = 0, size = 10, searchTerm = '' } = req.body;
    return await searchIndices(from, size, ES_INDEXES.DISH, searchTerm);
};

export const searchRestaurants = async (req: Request): Promise<{ results: number; values: any[] }> => {
    const { from = 0, size = 10, searchTerm = '' } = req.body;
    return await searchIndices(from, size, ES_INDEXES.RESTAURANT, searchTerm);
};

export const searchAllIndices = async (req: Request): Promise<{ results: number; values: any[] }> => {
    const esClient = getESClient();
    const { from = 0, size = 10, searchTerm = '' } = req.body;
    const result = await esClient.search({
        index: '*', // search in all the indices
        body: {
            query: {
                multi_match: {
                    // match all the indexable fields
                    query: searchTerm,
                    fuzziness: 'AUTO', // can be 0,1 or 2. These are values for edit distance
                },
            },
        },
        from,
        size,
    });
    const responseHits: any[] = _.get(result.body, 'hits', []);
    const results: number = _.get(responseHits, 'total.value', 0);
    const values: any[] = _.get(responseHits, 'hits', []);
    return { results, values };
};

const searchIndices = async (from: number, size: number, indexType: string, searchTerm: string): Promise<{ results: number; values: any[] }> => {
    const esClient = getESClient();
    const result = await esClient.search({
        index: indexType,
        body: {
            query: {
                multi_match: {
                    query: searchTerm,
                    fuzziness: 'AUTO',
                },
            },
        },
        from,
        size,
    });
    const responseHits: any[] = _.get(result.body, 'hits', []);
    const results: number = _.get(responseHits, 'total.value', 0);
    const values: any[] = _.get(responseHits, 'hits', []);
    return { results, values };
};
