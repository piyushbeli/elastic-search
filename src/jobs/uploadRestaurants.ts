import { CronJob } from 'cron';
import Logger from '../logger';
import _ from 'lodash';
import moment from 'moment';
import { DEFAULT_TIME_ZONE, ES_INDEXES } from '../utils/constants';
import { ESSyncStat } from '../types/esSyncStats';
import * as RestaurantHelper  from '../helpers/restaurant';
import * as DbHelper from '../helpers/db';
import { ILoggerTypes } from 'types/logger';

const JOB_NAME = 'uploadRestaurants';

export default class RestaurantUploadJob {

  private logger: ILoggerTypes;

  constructor() {
      this.logger = Logger.getInstance().getLogger();
  }

  private async start():Promise<void> {
      this.logger.info(`Starting job: ${JOB_NAME}`);
      await this.uploadRestaurantToES();
  }

  private async uploadRestaurantToES():Promise<void> {
      this.logger.info(`${JOB_NAME}: Staring cron job`);
      try {
          const syncStartTime = moment().toDate();
          const esSyncStats = await DbHelper.getESSyncStat(ES_INDEXES.RESTAURANT);
          const lastSyncStartTime:Date|null = this.getLastSyncStartTime(esSyncStats);
          const query = lastSyncStartTime ? { '_updated_at': { $gte: lastSyncStartTime }} : {};
          const result = await RestaurantHelper.handleRestaurantUpload(query);
          const syncEndTime = moment().toDate();
          const esSyncStatForRestaurant: ESSyncStat = {
              indexType: ES_INDEXES.RESTAURANT,
              syncStats: {
                  error: result.error,
                  lastSyncEndTime: syncEndTime,
                  lastSyncStartTime: syncStartTime,
              },
          };
          const updateESSyncStatResult = await DbHelper.updateESSyncStat(esSyncStatForRestaurant);
          if (updateESSyncStatResult) {
              this.logger.info(`${JOB_NAME}: Updated ES Stats For Restaurants.`);
          } else {
              throw `${JOB_NAME}: Error occurred while Updating ES Stats For Restaurants.`;
          }
          this.logger.info(`${JOB_NAME}: Uploaded Restaurants to ES.`);
      } catch (e) {
          this.logger.error(`${JOB_NAME} : Error occured in ${JOB_NAME} ${e}`);
      }
  }

  private getLastSyncStartTime(esSyncStats:ESSyncStat):Date|null{
      const lastSyncStartTime = _.get(esSyncStats, 'syncStats.lastSyncStartTime', null);
      return lastSyncStartTime;
  }

  public async setup():Promise<void> {
      const jobTime = '0 11 * * * * ';
      this.logger.info(
          `${JOB_NAME}: Job is scheduled at: ${jobTime}. Current time is: ${moment().toLocaleString()}`,
      );
      const job = new CronJob(jobTime, this.start.bind(this), null, true, DEFAULT_TIME_ZONE);
      job.start();
  }
}







