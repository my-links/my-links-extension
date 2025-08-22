import { ENV, LOGGER_CONFIG, getConfig } from "../config/environment";

export type LogLevel = "error" | "warn" | "info" | "debug";

export class Logger {
  private static instance: Logger;
  private logLevel: number;

  private constructor() {
    const config = getConfig();
    this.logLevel =
      LOGGER_CONFIG.LEVELS[
        config.LOG_LEVEL.toUpperCase() as keyof typeof LOGGER_CONFIG.LEVELS
      ] || LOGGER_CONFIG.LEVELS.ERROR;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levelNumber =
      LOGGER_CONFIG.LEVELS[
        level.toUpperCase() as keyof typeof LOGGER_CONFIG.LEVELS
      ];
    return levelNumber <= this.logLevel;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : "";
    return `[${timestamp}] ${level.toUpperCase()}${contextStr}: ${message}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case "error":
        console.error(formattedMessage, data || "");
        break;
      case "warn":
        console.warn(formattedMessage, data || "");
        break;
      case "info":
        console.info(formattedMessage, data || "");
        break;
      case "debug":
        console.debug(formattedMessage, data || "");
        break;
    }

    // In development, also log to extension storage for debugging
    if (ENV.IS_DEV && level === "error") {
      this.logToStorage(level, message, context, data);
    }
  }

  private async logToStorage(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        data,
      };

      const existingLogs = await chrome.storage.local.get("extension_logs");
      const logs = existingLogs.extension_logs || [];

      // Keep only last 100 logs
      logs.push(logEntry);
      if (logs.length > 100) {
        logs.shift();
      }

      await chrome.storage.local.set({ extension_logs: logs });
    } catch (error) {
      console.error("Failed to log to storage:", error);
    }
  }

  error(message: string, context?: string, data?: any): void {
    this.log("error", message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log("warn", message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log("info", message, context, data);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log("debug", message, context, data);
  }

  // Convenience methods for common logging scenarios
  logApiCall(
    endpoint: string,
    method: string,
    success: boolean,
    duration?: number
  ): void {
    const message = `API ${method} ${endpoint} - ${
      success ? "SUCCESS" : "FAILED"
    }`;
    const context = "API";
    const data = { endpoint, method, success, duration };

    if (success) {
      this.info(message, context, data);
    } else {
      this.error(message, context, data);
    }
  }

  logStorageOperation(operation: string, success: boolean, key?: string): void {
    const message = `Storage ${operation} - ${success ? "SUCCESS" : "FAILED"}`;
    const context = "STORAGE";
    const data = { operation, success, key };

    if (success) {
      this.debug(message, context, data);
    } else {
      this.error(message, context, data);
    }
  }

  logUserAction(action: string, details?: any): void {
    const message = `User action: ${action}`;
    const context = "USER";
    this.info(message, context, details);
  }

  logError(error: unknown, context?: string): void {
    const message = error instanceof Error ? error.message : String(error);
    const data = error instanceof Error ? { stack: error.stack } : error;
    this.error(message, context, data);
  }

  // Method to get logs from storage (for debugging)
  static async getLogs(): Promise<any[]> {
    try {
      const result = await chrome.storage.local.get("extension_logs");
      return result.extension_logs || [];
    } catch (error) {
      console.error("Failed to get logs:", error);
      return [];
    }
  }

  // Method to clear logs
  static async clearLogs(): Promise<void> {
    try {
      await chrome.storage.local.remove("extension_logs");
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
