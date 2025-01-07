import NodeCache from 'node-cache';

// Default cache instance
const cache = new NodeCache({ checkperiod: 120 }); // No default TTL; use per-key TTL

export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T, ttlInSeconds: number): void => {
  cache.set(key, value, ttlInSeconds);
};

export const clearCache = (key: string): void => {
  cache.del(key);
};

export const clearAllCache = (): void => {
  cache.flushAll();
};
