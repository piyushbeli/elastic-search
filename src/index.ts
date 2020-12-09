import path from 'path';
// Include .env file here before starting anything else
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import express from 'express';
import Logger from './logger';
const app = express();

const PORT = process.env.PORT || '3000';
app.set('port', PORT);
const logger = Logger.getInstance().init(app);

import setupAPI from './setupAPI';
import ElasticSearch from './services/elasticSearchService';
import MongoDbService from './services/mongodbService';
import CacheService from './services/cacheService';
import setupJobs from './setupJobs';

(async () => {
  // Initialize all the external services first and then start the server and mount the middleware and routes
  logger.info('Start initializing services.');
  await Promise.all([
    MongoDbService.getInstance().init(), 
    ElasticSearch.getInstance().init(),
    CacheService.getInstance().init(),
  ]);
  logger.info('Services initialzation completed.');

  const server = http.createServer(app);
  server.listen(PORT);

  server.on('error', (err) => {
    logger.error({ error: err }, 'Error occurred while starting the server');
    throw err;
  });

  server.on('listening', () => {
    logger.info(`Server started on ${PORT} port`);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    setupAPI(app);
    setupJobs();
  });
})();