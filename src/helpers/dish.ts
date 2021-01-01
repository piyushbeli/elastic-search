import _ from 'lodash';
import Logger from '../logger';
import * as DbHelper from './db';
import * as ESHelper from './es';
import { ILoggerTypes } from '../types/logger';
import { Request } from 'express';
import moment from 'moment';
import { IDishESDoc } from '../types/dish';
import { DB_CLASSES, ES_INDEXES } from '../utils/constants';
import { ESSyncStat } from '../types/esSyncStats';

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
    const syncStartTime = moment().toDate();
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
    logger.info(`Total ${totalDocsFetched} uploaded for dishes.`);
    const syncEndTime = moment().toDate();
    await updateESSyncStat(syncStartTime, syncEndTime, error);
    return {
        error,
        totalDishes: totalDocsFetched,
    };
};

const getSanitizedDishes = (dishes: unknown[]): IDishESDoc[] => {
    return dishes.map((dish): IDishESDoc => {
        return {
            objectId: _.get(dish, '_id'),
            tags: _.get(dish, 'tags', ''),
            description: _.get(dish, 'description', ''),
            name: _.get(dish, 'name'),
            sourceImageURL: _.get(dish, 'sourceImageURL', ''),
        };
    });
};

const updateESSyncStat = async (syncStartTime: Date, syncEndTime: Date, error: string): Promise<void> => {
    const esSyncStatForDish: ESSyncStat = {
        indexType: ES_INDEXES.DISH,
        syncStats: {
            error: error,
            lastSyncEndTime: syncEndTime,
            lastSyncStartTime: syncStartTime,
        },
    };
    try {
        await DbHelper.updateESSyncStat(esSyncStatForDish);
        logger.info(`Updated ES Stats For Dishes.`);
    } catch (e) {
        logger.error(`Error occurred while Updating ES Stats For Dishes, error is ${e}`);
    }
};
