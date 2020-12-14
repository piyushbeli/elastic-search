import { Express, Request, Response } from 'express';
import cors from 'cors';
import * as RestaurantHelper from './helpers/restaurant';

const setupAPI = (app:Express):void => {
    app.get('/', cors(), uploadAllRestaurants);
};

const uploadAllRestaurants= async (req: Request, res: Response) => {
    try {
        const result = await RestaurantHelper.uploadAllRestaurantsToES(req);
        return res.send(result);
    } catch (e) {
        return res.status(400).json(e.toString());
    }
}; 

export default setupAPI;
