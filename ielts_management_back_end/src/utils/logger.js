const { NODE_ENV } = require('../config/constants');

const logger = {
  info: (message, data = '') => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },

  error: (message, error = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },

  warn: (message, data = '') => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },

  debug: (message, data = '') => {
    if (NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  },
};

module.exports = logger;
