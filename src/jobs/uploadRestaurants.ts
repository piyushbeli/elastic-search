import { CronJob } from 'cron';
import Logger from '../logger';
import _ from 'lodash';
import moment from 'moment';
import { generateObjectId } from '../utils/utils';
import { DEFAULT_TIME_ZONE, ES_INDEXES } from '../utils/constants';
import CacheService from '../services/cacheService';
import { ESSyncStat } from '../types/esSyncStats';
import * as RestaurantHelper  from '../helpers/restaurant';
let logger: any;
let cache: any;

const JOB_NAME = 'uploadRestaurants';
const lockId = generateObjectId();

async function start() {
  const cachedLockId = await cache.get(getJobLockKey());
  if (cachedLockId !== lockId) {
    logger.info(
      `${JOB_NAME}: This cluster does not have the lock for this job. Lets exit`,
    );
    return;
  } else {
    logger.info(
      `${JOB_NAME}: Lock key matched. Lets proceed to execute the job`,
    );
  }
  logger.info(`Starting job: ${JOB_NAME}`);
  await uploadRestaurantToES();
}

async function uploadRestaurantToES() {
  logger.info(`${JOB_NAME}: Staring cron job`);
  try {
    const syncStartTime = moment().toDate();
    const esSyncStats = await RestaurantHelper.getESSyncStat();
    const lastSyncStartTime:Date|null = getLastSyncStartTime(esSyncStats);
    const result = await RestaurantHelper.handleRestaurantUploadFromJob(lastSyncStartTime);
    const syncEndTime = moment().toDate();
    const esSyncStatForRestaurant: ESSyncStat = {
      indexType: ES_INDEXES.RESTAURANT,
      syncStats: {
        error: result.error,
        lastSyncEndTime: syncEndTime,
        lastSyncStartTime: syncStartTime,
      },
    };
    const updateESSyncStatResult = await RestaurantHelper.updateESSyncStat(esSyncStatForRestaurant);
    if(updateESSyncStatResult){
      logger.info(`${JOB_NAME}: Updated ES Stats For Restaurants.`);
    }else{
      throw `${JOB_NAME}: Error occurred while Updating ES Stats For Restaurants.`;
    }
    logger.info(`${JOB_NAME}: Uploaded Restaurants to ES.`);
  } catch (e) {
    logger.error(`${JOB_NAME} : Error occured in ${JOB_NAME} ${e}`);
  }
}

function getLastSyncStartTime(esSyncStats:ESSyncStat):Date|null{
  const lastSyncStartTime = _.get(esSyncStats,'syncStats.lastSyncStartTime',null);
  return lastSyncStartTime;
}

export async function setup() {
  logger = Logger.getInstance().getLogger();
  cache = await CacheService.getInstance();
  cache.set(getJobLockKey(), lockId, '2400000000');
  const jobTime = '0 11 * * * * ';
  logger.info(
    `${JOB_NAME}: Job is scheduled at: ${jobTime}. Current time is: ${moment().toLocaleString()}`,
  );
  const job = new CronJob(jobTime, start, null, true, DEFAULT_TIME_ZONE);
  job.start();
}

function getJobLockKey() {
  return JOB_NAME;
}
