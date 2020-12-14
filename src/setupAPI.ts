import { Express, Request, Response } from 'express';
import cors from 'cors';
import * as RestaurantHelper from './helpers/restaurant';
import * as DishHelper from './helpers/dish';
import * as ESHelper from './helpers/es';

const setupAPI = (app:Express):void => {
    app.get('/uploadAllRestaurants', cors(), uploadAllRestaurants);
    app.get('/uploadAllDishes', cors(), uploadAllDishes);
    app.post('/searchAllIndices', cors(), searchAllIndices);
};

const uploadAllRestaurants= async (req: Request, res: Response) => {
    try {
        const result = await RestaurantHelper.uploadAllRestaurantsToES(req);
        return res.send(result);
    } catch (e) {
        return res.status(400).json(e.toString());
    }
};

const uploadAllDishes= async (req: Request, res: Response) => {
    try {
        const result = await DishHelper.uploadAllDishesToES(req);
        return res.send(result);
    } catch (e) {
        return res.status(400).json(e.toString());
    }
};

const searchAllIndices = async (req:Request, res:Response) => {
    try{
        const result = await ESHelper.searchAllIndices(req);
        return res.send(result);
    }catch(e){
        return res.status(400).json(e.toString());
    }
}

export default setupAPI;
