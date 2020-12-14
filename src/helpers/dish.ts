import _ from 'lodash';
import Logger from '../logger';
import * as DbHelper from './db';
import * as ESHelper from './es';
import { ILoggerTypes } from '../types/logger';
import { Request } from 'express';
import moment from 'moment';
import { IDishESDoc } from '../types/dish';
import { DB_CLASSES } from '../utils/constants';

const logger: ILoggerTypes = Logger.getInstance().getLogger();

export const uploadAllDishesToES = async (req: Request): Promise<string> => {
    const { startDate: queryStartDate, endDate: queryEndDate } = req.query;
    const startDate: string | undefined = _.isString(queryStartDate) ? queryStartDate : undefined;
    const endDate: string | undefined = _.isString(queryEndDate) ? queryEndDate : undefined;
    const query = {};
    if (startDate || endDate) {
        const startDateCondition = startDate ? { $gte: moment(startDate).toDate() } : {};
        const endDateCondition = endDate ? { $lte: moment(endDate).toDate() } : {};
        query['_updated_at'] = {
            ...startDateCondition,
            ...endDateCondition,
        };
    }
    handleDishUpload(query);
    return 'Dish upload started.';
};

export const handleDishUpload = async (query): Promise<{ error: string; totalDishes: number }> => {
    let pageNo = 0;
    const pageSize = 200;
    let totalDocsFetched = 0;
    let error = '';
    while (true) {
        const esDishDocs: IDishESDoc[] = [];
        const results: IDishESDoc[] = await DbHelper.getDocs(pageNo, pageSize, query, DB_CLASSES.DISH);
        esDishDocs.push(...getSanitizedDishes(results));
        const result = await ESHelper.bulkUpsertDishesToES(esDishDocs);
        if (result.type === 'error') {
            error += `${result.message}, `;
        }
        logger.info(`Page No : ${pageNo}, ${result.message}`);
        totalDocsFetched += esDishDocs.length;
        if (esDishDocs.length < pageSize) {
            break;
        }
        pageNo++;
    }
    logger.info(`Total ${totalDocsFetched} uploaded.`);
    return {
        error,
        totalDishes: totalDocsFetched,
    };
};

const getSanitizedDishes = (dishes: unknown[]): IDishESDoc[] => {
    return dishes.map((dish) => {
        return {
            objectId: _.get(dish, '_id'),
            category: _.get(dish, 'category', ''),
            description: _.get(dish, 'description', ''),
            name: _.get(dish, 'name'),
            price: _.get(dish, 'price'),
            sourceImageURL: _.get(dish, 'sourceImageURL', ''),
        };
    });
};
