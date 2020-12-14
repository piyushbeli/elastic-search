import { CronJob } from 'cron';
import Logger from '../logger';
import _ from 'lodash';
import moment from 'moment';
import { DEFAULT_TIME_ZONE, ES_INDEXES } from '../utils/constants';
import { ESSyncStat } from '../types/esSyncStats';
import * as DishHelper from '../helpers/dish';
import * as DbHelper from '../helpers/db';
import { ILoggerTypes } from '../types/logger';

const JOB_NAME = 'uploadDishes';
const logger: ILoggerTypes = Logger.getInstance().getLogger();

const start = async (): Promise<void> => {
    logger.info(`Starting job: ${JOB_NAME}`);
    await uploadDishToES();
};

const uploadDishToES = async (): Promise<void> => {
    logger.info(`${JOB_NAME}: Staring cron job`);
    try {
        const esSyncStats = await DbHelper.getESSyncStat(ES_INDEXES.DISH);
        const lastSyncStartTime: Date | null = getLastSyncStartTime(esSyncStats);
        const query = lastSyncStartTime ? { _updated_at: { $gte: lastSyncStartTime }} : {};
        const result = await DishHelper.handleDishUpload(query);
        const error = result.error ? 'Error is ' + result.error : '';
        logger.info(`${JOB_NAME}: Uploaded ${result.totalDishes} Dishes to ES. ${error}`);
    } catch (e) {
        logger.error(`${JOB_NAME} : Error occurred in ${JOB_NAME} ${e}`);
    }
};

const getLastSyncStartTime = (esSyncStats: ESSyncStat): Date | null => {
    return _.get(esSyncStats, 'syncStats.lastSyncStartTime', null);
};

const setupDishesJob = async (): Promise<void> => {
    const jobTime = '0 11 * * * * ';
    logger.info(`${JOB_NAME}: Job is scheduled at: ${jobTime}. Current time is: ${moment().toLocaleString()}`);
    const job = new CronJob(jobTime, start, null, true, DEFAULT_TIME_ZONE);
    job.start();
};

export default setupDishesJob;
