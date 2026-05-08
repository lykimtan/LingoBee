const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

// Helper function to create store (Redis if available, memory if not)
const createStore = () => {
  const redisClient = getRedis();

  if (redisClient) {
    logger.info('Rate limiter using Redis store');
    return new RedisStore({
      client: redisClient,
      prefix: `${process.env.REDIS_PREFIX || 'ielts:'}rl:`,
    });
  }

  logger.warn('Redis not available, using memory store for rate limiting');
  return undefined; // Use memory store by default
};

// Login rate limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () =>
    process.env.NODE_ENV !== 'production' || (process.env.REDIS_ENABLED === 'false' && !getRedis()),
});

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.REDIS_ENABLED === 'false' && !getRedis(),
});

// Strict rate limiter for payment - 10 requests per 10 minutes
const paymentLimiter = rateLimit({
  store: createStore(),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.REDIS_ENABLED === 'false' && !getRedis(),
});

module.exports = {
  loginLimiter,
  apiLimiter,
  paymentLimiter,
};
