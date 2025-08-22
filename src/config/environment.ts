// Environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
} as const;

// Development configuration
export const DEV_CONFIG = {
  LOG_LEVEL: "debug",
  API_TIMEOUT: 10000, // 10 seconds for faster development
  ENABLE_DEBUG_MODE: true,
  SHOW_DEBUG_INFO: true,
} as const;

// Production configuration
export const PROD_CONFIG = {
  LOG_LEVEL: "error",
  API_TIMEOUT: 30000, // 30 seconds
  ENABLE_DEBUG_MODE: false,
  SHOW_DEBUG_INFO: false,
} as const;

// Get current configuration based on environment
export function getConfig() {
  return ENV.IS_DEV ? DEV_CONFIG : PROD_CONFIG;
}

// Logger configuration
export const LOGGER_CONFIG = {
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },
  COLORS: {
    ERROR: "#ff0000",
    WARN: "#ffa500",
    INFO: "#0000ff",
    DEBUG: "#808080",
  },
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: ENV.IS_PROD,
  ENABLE_ERROR_REPORTING: ENV.IS_PROD,
  ENABLE_DEBUG_MODE: ENV.IS_DEV,
  ENABLE_PERFORMANCE_MONITORING: ENV.IS_PROD,
} as const;
