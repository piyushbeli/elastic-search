import { Express, Request, Response } from 'express';
import cors from 'cors';
import { uploadAllRestaurantsToES } from './helpers/restaurant';


export default async function setupAPI(app: Express) {
  app.get('/', cors(), uploadAllRestaurants);
}

async function uploadAllRestaurants(req: Request, res: Response){
  try {
    const result = await uploadAllRestaurantsToES();
    return res.send(result);
  } catch (e) {
    return res.status(400).json(e.toString());
  }
}
