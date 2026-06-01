const redis = require('redis');
const logger = require('../utils/logger');

let client = null;

// Initialize Redis client
const initializeRedis = async () => {
  try {
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED === 'false') {
      logger.info('Redis is disabled');
      return null;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    client = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection attempts exceeded');
            return new Error('Redis max retries exceeded');
          }
          return retries * 50;
        },
      },
    });

    client.on('error', (err) => {
      logger.error(`Redis client error: ${err.message}`);
    });

    client.on('connect', () => {
      logger.info('Redis connected');
    });

    client.on('ready', () => {
      logger.info('Redis ready');
    });

    client.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    client.on('end', () => {
      logger.warn('Redis connection closed');
    });

    await client.connect();
    logger.info('Redis client initialized successfully');

    return client;
  } catch (error) {
    logger.error(`Failed to initialize Redis: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Critical in production
    }
    return null; // Graceful degrade in development
  }
};

// Get Redis client (singleton)
const getRedis = () => {
  return client;
};

// Disconnect Redis
const disconnectRedis = async () => {
  if (client) {
    try {
      await client.quit();
      logger.info('Redis disconnected');
      client = null;
    } catch (error) {
      logger.error(`Failed to disconnect Redis: ${error.message}`);
    }
  }
};

// Helper: Set key with TTL
const setWithTTL = async (key, value, ttl = 3600) => {
  try {
    if (!client) return false;
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Redis setWithTTL error: ${error.message}`);
    return false;
  }
};

// Helper: Get key
const getValue = async (key) => {
  try {
    if (!client) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error(`Redis getValue error: ${error.message}`);
    return null;
  }
};

// Helper: Delete key
const deleteKey = async (key) => {
  try {
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis deleteKey error: ${error.message}`);
    return false;
  }
};

// Helper: Check if key exists
const exists = async (key) => {
  try {
    if (!client) return false;
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(`Redis exists error: ${error.message}`);
    return false;
  }
};

// Helper: Delete keys by pattern
const deleteKeysByPattern = async (pattern) => {
  try {
    if (!client) return false;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Redis deleteKeysByPattern error: ${error.message}`);
    return false;
  }
};

module.exports = {
  initializeRedis,
  getRedis,
  disconnectRedis,
  setWithTTL,
  getValue,
  deleteKey,
  exists,
  deleteKeysByPattern,
};
