import _ from 'lodash';
import { IRestaurantESDoc } from '../types/restaurant';
import Logger from '../logger';
import DbHelper from './db';
import ESHelper from './es';
import { ILoggerTypes } from '../types/logger';
import { Request } from 'express';
import moment from 'moment';


const logger = Logger.getInstance().getLogger();


export default class RestaurantHelper {
  private dbHelper:DbHelper;
  private logger : ILoggerTypes;
  private esHelper: ESHelper;

  constructor(){
      this.dbHelper= new DbHelper();
      this.logger = Logger.getInstance().getLogger();
      this.esHelper = new ESHelper();
  }

  public async uploadAllRestaurantsToES(req:Request) : Promise<string>{
      // TODO: takes date time or last N days and makes a query and then send to db
      const { startDate: queryStartDate,endDate: queryEndDate } = req.query;
      const startDate:string|undefined = _.isString(queryStartDate) ? queryStartDate: undefined;
      const endDate:string|undefined = _.isString(queryEndDate) ? queryEndDate: undefined;
      const query = {};
      if (startDate || endDate){
          const startDateCondition = startDate ? { $gte: moment(startDate).toDate() } : {};
          const endDateCondition = endDate ? { $lte: moment(endDate).toDate() }:{};
          query['_updated_at'] = {
              ...startDateCondition,
              ...endDateCondition,
          };
      }
      this.handleRestaurantUpload(query);
      return 'Restaurant upload started.';
  }

  private getSanitizedRestaurants(restaurants : unknown[]) : IRestaurantESDoc[]{
      const esRestaurantDocs:IRestaurantESDoc[]=[];
      for (const restaurant of restaurants){
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

  public async handleRestaurantUpload(query): Promise<{error: string;totalRestaurants: number;}>{
      let pageNo = 0;
      const pageSize = 50;
      let totalDocsFetched = 0;
      let error = '';
      while (true){
          const esRestaurantDocs:IRestaurantESDoc[] = [];
          const results:IRestaurantESDoc[] = await this.dbHelper.getRestaurants(pageNo,pageSize,query);
          esRestaurantDocs.push(...this.getSanitizedRestaurants(results));
          const result = await this.esHelper.bulkUpsertRestaurantsToES(esRestaurantDocs);
          if (result.type === 'error'){
              error += `${result.message}, `;
          }
          this.logger.info(`Page No : ${pageNo}, ${result.message}`);
          totalDocsFetched += esRestaurantDocs.length;
          if (esRestaurantDocs.length < pageSize){
              break;
          }
          pageNo++;
      }
      this.logger.info(`Total ${totalDocsFetched} uploaded.`);
      return {
          error,
          totalRestaurants: totalDocsFetched,
      };
  }
}









