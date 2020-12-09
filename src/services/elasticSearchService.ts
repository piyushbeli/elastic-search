import { Client } from '@elastic/elasticsearch';
import Logger from '../logger';
import { ES_INDEXES } from '../utils/constants';

export default class ElasticSearch {
    private client?:Client;
    private static instance: ElasticSearch = new ElasticSearch();
    private logger = Logger.getInstance().getLogger();

    public static getInstance() {
      return this.instance;
    }
    
    public async init(){
      if(!this.client) {
        const nodeUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
        this.client = new Client({ node: nodeUrl });
        await this.checkConnection();
        await this.createIndicesAndMappings();
      }
      return this.client;
    }

    public getClient() {
      if (!this.client) {
        throw new Error('Elastic search client has not been initialized yet');
      }
      return this.client;
    }

    private async checkConnection():Promise<void>{
      if(!this.client){
        throw new Error('Elastic search client has not been initialized yet');
      }
      try{
        const pingResult = await this.client.ping();
        if(pingResult.statusCode !== 200){
          throw 'Cannot connect to Elastic Search server.';
        }else{
          this.logger.info('Elastic Search server connection established successfully.');
        }
      }catch(e){
        this.logger.error('An error occurred while establishing connection to Elastic Search server.');
        throw e;
      }
    }

    private async createIndicesAndMappings(){
      if(!this.client){
        throw new Error('Elastic search client has not been initialized yet');
      }
      for(const key in ES_INDEXES){
        try{
          const result= await this.client.indices.exists({ index: ES_INDEXES[key] });
          if(!result.body){
            const indexCreateResult = await this.client.indices.create({ index: ES_INDEXES.RESTAURANT });
            if(indexCreateResult.body){
              this.logger.info(`Index created for ${key}`);
            }
          }
        }catch(e){
          throw e;
        }
      } 
    }
}



