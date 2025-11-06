import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { appConfig } from 'src/appConfig';

export class RedisCacheConfigService implements CacheOptionsFactory {
  async createCacheOptions(): Promise<CacheModuleOptions> {
    const client = createClient({
      socket: {
        host: appConfig.redis.host,
        port: appConfig.redis.port,
      },
      username: 'default',
      password: appConfig.redis.password,
    });

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    return {
      store: {
        create: () => client,
      },
      ttl: 3600
    };
  }
}
