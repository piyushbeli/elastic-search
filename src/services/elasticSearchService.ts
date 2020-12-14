import { Client } from '@elastic/elasticsearch';
import Logger from '../logger';
import { ES_INDEXES } from '../utils/constants';
import { ILoggerTypes } from 'types/logger';
import _ from 'lodash';
import { getMappings } from '../utils/utils';

let client: Client;
const logger: ILoggerTypes = Logger.getInstance().getLogger();

export const initElasticSearchClient = async (): Promise<Client> => {
    if (!client) {
        const nodeUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
        client = new Client({ node: nodeUrl });
        await checkConnection();
        await createIndicesAndMappings();
    }
    return client;
};

const checkConnection = async (): Promise<void> => {
    if (!client) {
        throw new Error('Elastic search client has not been initialized yet');
    }
    try {
        const pingResult = await client.ping();
        if (pingResult.statusCode !== 200) {
            throw `Cannot connect to Elastic Search server. ${JSON.stringify(pingResult.body)}`;
        } else {
            logger.info('Elastic Search server connection established successfully.');
        }
    } catch (e) {
        logger.error(`${JSON.stringify(e)}`);
        throw e;
    }
};

const createIndicesAndMappings = async (): Promise<void> => {
    if (!client) {
        throw new Error('Elastic search client has not been initialized yet');
    }
    _.forOwn(ES_INDEXES, async function (value, key) {
        try {
            const result = await client.indices.exists({ index: value });
            if (!result.body) {
                const indexCreateResult = await client.indices.create({ index: value });
                if (indexCreateResult.statusCode === 200) {
                    logger.info(`Index created for ${key}`);
                } else {
                    logger.error(`Error occurred while creating Index for ${key}, ${JSON.stringify(indexCreateResult.body)} `);
                }
                const mappingCreateResult = await client.indices.putMapping({
                    index: value,
                    body: {
                        properties: getMappings(value),
                    },
                });
                if (mappingCreateResult.statusCode === 200) {
                    logger.info(`Mappings created for ${key}`);
                } else {
                    logger.error(`Error occurred while created mappings for ${key}. ${JSON.stringify(mappingCreateResult.body)}`);
                }
            }
        } catch (e) {
            logger.error(`An error occurred while creating index and mapping for ${key}`);
            throw e;
        }
    });
};
// TODO: throw error here if client is undefined
const getESClient = (): Client => client;

export default getESClient;
