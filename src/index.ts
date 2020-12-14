import path from 'path';
// Include .env file here before starting anything else
//eslint-disable-next-line
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import express from 'express';

const app = express();
const PORT = process.env.PORT || '3000';
app.set('port', PORT);

import Logger from './logger';
const logger = Logger.getInstance().init(app);

import { initElasticSearchClient } from './services/elasticSearchService';
import { initMongoDBClient } from './services/mongodbService';
import setupJobs from './setupJobs';
import setupAPI from './setupAPI';

(async () => {
    // Initialize all the external services first and then start the server and mount the middleware and routes
    logger.info('Start initializing services.');
    await Promise.all([
        initMongoDBClient(),
        initElasticSearchClient(),
    ]);
    logger.info('Services initialization completed.');

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
