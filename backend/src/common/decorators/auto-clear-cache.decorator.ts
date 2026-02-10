/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

export function AutoClearCache(cacheKey: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;

    descriptor.value = async function (...args: any[]) {
      const logger = new Logger(target.constructor.name);

      const result = (await originalMethod.apply(this, args)) as Promise<any>;

      logger.debug(`Clearing cache... {cacheKey: ${cacheKey}}`);

      const cacheManager = (this as { cacheManager?: Cache }).cacheManager;

      if (cacheManager) {
        try {
          await cacheManager.del(cacheKey);
        } catch (error) {
          logger.error(`Failed to clear cache: ${error}`);
        }
      } else {
        logger.warn(
          `@AutoClearCache failed: 'cacheManager' property not found in ${target.constructor.name}`,
        );
      }

      return result;
    };

    return descriptor;
  };
}
