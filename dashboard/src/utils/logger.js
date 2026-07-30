const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const currentLevel = LOG_LEVELS[process.env.REACT_APP_LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

function log(level, levelName, message, data = null) {
  if (LOG_LEVELS[levelName] < currentLevel) return;

  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level: levelName, message, ...(data ? { data } : {}) };

  switch (levelName) {
    case 'ERROR':
    case 'FATAL':
      console.error(`[${timestamp}] [${levelName}] ${message}`, data || '');
      break;
    case 'WARN':
      console.warn(`[${timestamp}] [${levelName}] ${message}`, data || '');
      break;
    default:
      console.log(`[${timestamp}] [${levelName}] ${message}`, data || '');
  }

  if (levelName === 'ERROR' || levelName === 'FATAL') {
    try {
      const existing = JSON.parse(localStorage.getItem('safedrive_errors') || '[]');
      existing.push(logEntry);
      if (existing.length > 100) existing.splice(0, existing.length - 100);
      localStorage.setItem('safedrive_errors', JSON.stringify(existing));
    } catch (e) {
      // localStorage may not be available
    }
  }
}

const logger = {
  debug: (msg, data) => log(LOG_LEVELS.DEBUG, 'DEBUG', msg, data),
  info: (msg, data) => log(LOG_LEVELS.INFO, 'INFO', msg, data),
  warn: (msg, data) => log(LOG_LEVELS.WARN, 'WARN', msg, data),
  error: (msg, data) => log(LOG_LEVELS.ERROR, 'ERROR', msg, data),
  fatal: (msg, data) => log(LOG_LEVELS.FATAL, 'FATAL', msg, data),
  getErrors: () => {
    try {
      return JSON.parse(localStorage.getItem('safedrive_errors') || '[]');
    } catch {
      return [];
    }
  },
  clearErrors: () => {
    localStorage.removeItem('safedrive_errors');
  },
};

export default logger;