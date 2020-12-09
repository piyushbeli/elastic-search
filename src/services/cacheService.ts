import Redis from 'ioredis';
import Logger from '../logger';

export default class CacheService {
  private static instance: CacheService = new CacheService();
  // @ts-ignore
  private redisClient: Redis.Redis;
  private initialized = false;
  private logger: any;

  constructor() {
    if (CacheService.instance) {
      throw new Error('Use getInstance() method instead of constructor to create the instance of CacheService');
    }
  }

  public static getInstance(): CacheService {
    return CacheService.instance;
  }

  public async init() {
    this.logger = Logger.getInstance().getLogger();
    this.redisClient = new Redis(process.env.REDISCLOUD_URL);
    return new Promise((resolve, reject) => {
      this.redisClient.on('ready', () => {
        this.logger.info('CacheService:: Redis connected successfully');
        this.initialized = true;
        resolve();
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.info('CacheService:: Error in Redis connection. Trying to reconnect');
      });

      this.redisClient.on('error', (error: any) => {
        this.logger.error(`CacheService:: Redis connected was unsuccessfully. ${error}`);
        reject(error);
      });
    });
  }

  // expire time is in seconds
  public set(key: string, value: any, expire: string= process.env.DEFAULT_CACHE_EXPIRY_TIME || '86400'): void {
    if (!this.initialized) {
      throw new Error('Redis client is not initialized yet');
    }
    this.redisClient.set(key, value, 'EX', Number.parseInt(expire));
  }

  public get(key: string): Promise<string | null> {
    if (!this.initialized) {
      throw new Error('Redis client is not initialized yet');
    }
    return this.redisClient.get(key);
  }
}
