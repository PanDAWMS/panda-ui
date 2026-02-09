import { inject, Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4,
}

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private readonly currentLevel: LogLevel;
  private config = inject(AppConfigService);

  constructor() {
    const levelStr = ((this.config.get('logLevel') as string) ?? 'OFF').toUpperCase();
    this.currentLevel = LogLevel[levelStr as keyof typeof LogLevel] ?? LogLevel.OFF;
  }

  forContext(context: string): ContextLogger {
    return new ContextLogger(context, this);
  }

  /** Internal log method */
  _log(level: LogLevel, label: string, context: string, message: string, ...optional: unknown[]): void {
    if (this.currentLevel <= level) {
      const prefix = `[${label}] [${context}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, ...optional);
          break;
        case LogLevel.INFO:
          console.info(prefix, message, ...optional);
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, ...optional);
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, ...optional);
          break;
      }
    }
  }
}

export class ContextLogger {
  constructor(
    private context: string,
    private root: LoggingService,
  ) {}

  debug(msg: string, ...opt: unknown[]) {
    this.root._log(LogLevel.DEBUG, 'DEBUG', this.context, msg, ...opt);
  }

  info(msg: string, ...opt: unknown[]) {
    this.root._log(LogLevel.INFO, 'INFO', this.context, msg, ...opt);
  }

  warn(msg: string, ...opt: unknown[]) {
    this.root._log(LogLevel.WARN, 'WARN', this.context, msg, ...opt);
  }

  error(msg: string, ...opt: unknown[]) {
    this.root._log(LogLevel.ERROR, 'ERROR', this.context, msg, ...opt);
  }
}
