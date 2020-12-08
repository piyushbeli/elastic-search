import path from 'path';

// Include .env file here before starting anything else
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';

import Logger from './logger';
import setupAPI from './setupAPI';
import ElasticSearch from './elasticSearch';
import MongoDbService from './mongodbService';

const app = express();
const logger = Logger.getInstance().init(app);
ElasticSearch.getInstance().init();

app.set('port', process.env.PORT || '3000');

(async () => {
  // Initialize all the external services first and then start the server and mount the middleware and routes
  logger.info('Start initializing the DB service');
  await Promise.all([MongoDbService.getInstance().init()]);
  logger.info('DB service is initialized successfully');

  const server = http.createServer(app);
  const PORT = process.env.PORT || '3000';
  server.listen(PORT);

  server.on('error', (err) => {
    logger.error({ error: err }, 'Error occurred while starting the server');
    throw err;
  });

  server.on('listening', () => {
    logger.info(`Server started on ${PORT} port`);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    setupAPI(app);
  });
})();

// TODO:   "module": "commonjs" changed from module:"esnext"
