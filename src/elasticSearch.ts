import { Client } from '@elastic/elasticsearch';

export default class ElasticSearch {
    private client: any;
    private static instance: ElasticSearch = new ElasticSearch();

    public static getInstance() {
      return this.instance;
    }
    
    public init() {
      if (this.client) {

      } else {
        const nodeUrl = process.env.ELASTIC_SEARCH_NODE_URL || 'http://localhost:9200';
        this.client = new Client({ node : nodeUrl });
      }
      return this.client;
    }

    public getClient() {
      if (!this.client) {
        throw new Error('Elastic search client has not been initialized yet');
      }
      return this.client;
    }
}



