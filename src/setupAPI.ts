import { Express, Request, Response } from 'express';
import cors from 'cors';
import RestaurantHelper from './helpers/restaurant';

export default class SetupAPI{
  private restaurantHelper:RestaurantHelper;
  constructor(){
    this.restaurantHelper =  new RestaurantHelper();
  }

  public setupAPI = (app:Express) => {
    app.get('/', cors(), this.uploadAllRestaurants);
  }

  private uploadAllRestaurants= async (req: Request, res: Response) => {
    try {
      const result = await this.restaurantHelper.uploadAllRestaurantsToES(req);
      return res.send(result);
    } catch (e) {
      return res.status(400).json(e.toString());
    }
  } 
}