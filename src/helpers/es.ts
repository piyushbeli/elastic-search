import Logger from '../logger';
import { IRestaurantESDoc } from '../types/restaurant';
import { ES_INDEXES, ES_TYPES, SEARCH_FIELD_NAMES } from '../utils/constants';
import _ from 'lodash';
import getESClient from '../services/elasticSearchService';
import { Request } from 'express';
import { IDishESDoc } from '../types/dish';
import { formatSearchItem, getRequiredFieldsForSearchAllQuery } from '../utils/utils';
import { ISearchIndicesParams, ISearchQuery } from '../types/search';

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

export const searchAllIndices = async (req: Request): Promise<{ results?: number; values: any[] }> => {
    const esClient = getESClient();
    const { from = 0, size = 10, searchTerm = '' } = req.body;
    const showRawData = !!req.query['raw'];
    const DISH_FIELDS = SEARCH_FIELD_NAMES.DISH;
    const RESTAURANT_FIELDS = SEARCH_FIELD_NAMES.RESTAURANT;
    const result = await esClient.search({
        index: '*', // search in all the indices
        body: {
            query: {
                bool: {
                    should: [
                        {
                            multi_match: {
                                query: searchTerm,
                                fields: getRequiredFieldsForSearchAllQuery([RESTAURANT_FIELDS.NAME]).nGramField,
                                type: 'bool_prefix',
                                boost: 5,
                            },
                        },
                        {
                            multi_match: {
                                query: searchTerm,
                                fields: getRequiredFieldsForSearchAllQuery([DISH_FIELDS.NAME]).nGramField,
                                type: 'bool_prefix',
                                boost: 3,
                            },
                        },
                        {
                            multi_match: {
                                query: searchTerm,
                                fuzziness: 'AUTO',
                                fields: [DISH_FIELDS.NAME, RESTAURANT_FIELDS.NAME],
                            },
                        },
                    ],
                },
            },
        },
        from,
        size,
    });
    const responseHits: any[] = _.get(result.body, 'hits', []);
    const results: number = _.get(responseHits, 'total.value', 0);
    const values: any[] = _.get(responseHits, 'hits', []);
    if (!showRawData) {
        return { values: values.map((value) => formatSearchItem(value)) };
    }
    return { results, values };
};

export const searchDishes = async (req: Request): Promise<{ results?: number; values: any[] }> => {
    const { from = 0, size = 10, searchTerm = '', filter = {}} = req.body;
    const showRawData = !!req.query['raw'];
    const { restaurantId = null, restaurantName = null } = filter;
    if (restaurantId || restaurantName) {
        return searchDishesFromRestaurant(req);
    }
    const DISH_FIELDS = SEARCH_FIELD_NAMES.DISH;
    const searchQueryBody: Record<string, any> = {
        query: {
            bool: {
                should: [
                    {
                        multi_match: {
                            query: searchTerm,
                            fields: getRequiredFieldsForSearchAllQuery([DISH_FIELDS.NAME]).nGramField,
                            type: 'bool_prefix',
                            boost: 5,
                        },
                    },
                    {
                        multi_match: {
                            query: searchTerm,
                            fuzziness: 'AUTO',
                            fields: [`${DISH_FIELDS.DESCRIPTION}^3`],
                            boost: 2,
                        },
                    },
                ],
            },
        },
    };
    const searchQuery: ISearchQuery = {
        index: ES_INDEXES.DISH,
        body: searchQueryBody,
        from,
        size,
    };
    const searchParams: ISearchIndicesParams = {
        showRawData,
        searchQuery,
    };
    return searchIndices(searchParams);
};

export const searchRestaurants = async (req: Request): Promise<{ results?: number; values: any[] }> => {
    const { from = 0, size = 10, searchTerm = '' } = req.body;
    const showRawData = !!req.query['raw'];
    const RESTAURANT_FIELDS = SEARCH_FIELD_NAMES.RESTAURANT;
    const searchQueryBody: Record<string, any> = {
        query: {
            bool: {
                should: [
                    {
                        multi_match: {
                            query: searchTerm,
                            fields: getRequiredFieldsForSearchAllQuery([RESTAURANT_FIELDS.NAME]).nGramField,
                            type: 'bool_prefix',
                        },
                    },
                ],
            },
        },
    };
    const searchQuery: ISearchQuery = {
        index: ES_INDEXES.RESTAURANT,
        body: searchQueryBody,
        from,
        size,
    };
    const searchParams: ISearchIndicesParams = {
        showRawData,
        searchQuery,
    };
    return searchIndices(searchParams);
};

const searchDishesFromRestaurant = async (req: Request) => {
    const { from = 0, size = 10, searchTerm = '', filter = {}} = req.body;
    const showRawData = !!req.query['raw'];
    const { restaurantId = null, restaurantName = null } = filter;
    const filters: Record<string, any>[] = [];
    if (restaurantId) {
        filters.push({ term: { restaurantId }});
    }
    if (restaurantName) {
        filters.push({ term: { restaurantName }});
    }
    let queryFilter: Record<string, any> = {};
    if (!_.isEmpty(filters)) {
        queryFilter = { filter: filters };
    }
    const minShouldMatchQuery: Record<string, any> = _.isEmpty(queryFilter) ? {} : { minimum_should_match: 1 };
    const DISH_FIELDS = SEARCH_FIELD_NAMES.DISH;
    const searchQueryBody: Record<string, any> = {
        query: {
            bool: {
                should: [
                    {
                        multi_match: {
                            query: searchTerm,
                            fields: getRequiredFieldsForSearchAllQuery([DISH_FIELDS.NAME]).nGramField,
                            type: 'bool_prefix',
                            boost: 5,
                        },
                    },
                ],
                ...queryFilter,
                ...minShouldMatchQuery,
            },
        },
    };
    const searchQuery: ISearchQuery = {
        index: ES_INDEXES.DISH,
        body: searchQueryBody,
        from,
        size,
    };
    const searchParams: ISearchIndicesParams = {
        showRawData,
        searchQuery,
    };
    return searchIndices(searchParams);
};

const searchIndices = async (searchParams: ISearchIndicesParams): Promise<{ results?: number; values: any[] }> => {
    const { searchQuery, showRawData } = searchParams;
    const esClient = getESClient();
    const result = await esClient.search(searchQuery);
    const responseHits: any[] = _.get(result.body, 'hits', []);
    const results: number = _.get(responseHits, 'total.value', 0);
    const values: any[] = _.get(responseHits, 'hits', []);
    if (!showRawData) {
        return { values: values.map((value) => formatSearchItem(value)) };
    }
    return { results, values };
};
