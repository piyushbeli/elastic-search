import path from 'path';
// Include .env file here before starting anything else
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import express from 'express';
import Logger from './logger';
import ElasticSearch from './services/elasticSearchService';
import { initMongoDBClient } from './services/mongodbService';
import setupJobs from './setupJobs';
import SetupAPI from './setupAPI';

const app = express();

const PORT = process.env.PORT || '3000';
app.set('port', PORT);
const logger = Logger.getInstance().init(app);

(async () => {
    // Initialize all the external services first and then start the server and mount the middleware and routes
    logger.info('Start initializing services');
    await Promise.all([
        initMongoDBClient(),
        ElasticSearch.getInstance().init(),
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
        new SetupAPI().setupAPI(app);
        setupJobs();
    });
})();
