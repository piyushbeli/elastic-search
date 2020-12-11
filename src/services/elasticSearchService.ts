import { Client } from '@elastic/elasticsearch';
import Logger from '../logger';
import { ES_INDEXES } from '../utils/constants';
import { ILoggerTypes } from 'types/logger';
import _ from 'lodash';
import { getRestaurantIndexMappings } from '../utils/utils';

export default class ElasticSearch {
    private client?:Client;
    private static instance: ElasticSearch = new ElasticSearch();
    private logger?:ILoggerTypes;

    public static getInstance():ElasticSearch {
        return this.instance;
    }
    
    public async init():Promise<Client> {
        this.logger = Logger.getInstance().getLogger();
        if (!this.client) {
            const nodeUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
            this.client = new Client({ node: nodeUrl });
            await this.checkConnection();
            await this.createIndicesAndMappings();
        }
        return this.client;
    }

    public getClient():Client {
        if (!this.client) {
            throw new Error('Elastic search client has not been initialized yet');
        }
        return this.client;
    }

    private async checkConnection():Promise<void> {
        if (!this.client) {
            throw new Error('Elastic search client has not been initialized yet');
        }
        try {
            const pingResult = await this.client.ping();
            if (pingResult.statusCode !== 200) {
                throw `Cannot connect to Elastic Search server. ${JSON.stringify(pingResult.body)}`;
            } else {
                this.logger?.info('Elastic Search server connection established successfully.');
            }
        } catch (e) {
            this.logger?.error(`${JSON.stringify(e)}`);
            throw e;
        }
    }

    private async createIndicesAndMappings() : Promise<void> {
        if (!this.client) {
            throw new Error('Elastic search client has not been initialized yet');
        }
        // unable to access 'this' inside an inner function
        // either we can bind it or we use closure to send 'this'
        const esClient = this.client;
        const logger = this.logger;
        _.forOwn(ES_INDEXES, async function (value, key) {
            try {
                const result= await esClient.indices.exists({ index: value });
                if (!result.body) {
                    const indexCreateResult = await esClient.indices.create({ index: value });
                    if (indexCreateResult.statusCode === 200) {
                        logger?.info(`Index created for ${key}`);
                    } else {
                        logger?.error(`Error occurred while creating Index for ${key}, ${JSON.stringify(indexCreateResult.body)} `);
                    }
                    const mappingCreateResult = await esClient.indices.putMapping({
                        index: value,
                        body: {
                            properties: getRestaurantIndexMappings(),
                        },
                    });
                    if (mappingCreateResult.statusCode === 200) {
                        logger?.info(`Mappings created for ${key}`);
                    } else {
                        logger?.error(`Error occurred while created mappings for ${key}. ${JSON.stringify(mappingCreateResult.body)}`);
                    }
                }
            } catch (e) {
                logger?.error(`An error occurred while creating index and mapping for ${key}`);
                throw e;
            }
        });
    }
}



