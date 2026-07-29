import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { MessageBufferService } from './message-buffer.service';
import { LoggingService } from './logging.service';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  // Use Injector to lazily retrieve MessageBufferService and avoid DI cycle during startup
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    const messageBuffer = this.injector.get(MessageBufferService);
    const loggingService = this.injector.get(LoggingService);
    const log = loggingService.forContext('GlobalErrorHandler');
    const errorMsg = this.extractErrorMessage(error);

    // Chunk / Network Deployment Errors
    if (errorMsg.includes('ChunkLoadError') || errorMsg.includes('Loading chunk failed')) {
      log.warn('Chunk load error detected (deployment update mismatch):', error);
      messageBuffer.add('A new version is available. Please refresh your browser to load updates.', 'Refresh', {
        duration: 10000,
      });
      return;
    }

    // Routing Errors (NG04002)
    if (errorMsg.includes('NG04002') || errorMsg.includes('Cannot match any routes')) {
      const segmentMatch = errorMsg.match(/URL Segment:\s*'([^']+)'/);
      const targetPath = segmentMatch ? `/${segmentMatch[1]}` : window.location.pathname;

      log.warn(`Navigation error - Unmatched route '${targetPath}':`, errorMsg);
      messageBuffer.add(`The requested path '${targetPath}' does not exist.`, 'Close', { duration: 5000 });
      return;
    }

    // Dev-only warnings (Ignore UI toast, log to console)
    if (errorMsg.includes('NG0100')) {
      log.warn('Dev Warning (ExpressionChanged):', error);
      return;
    }

    // Default Catch-All for Uncaught JS / Runtime Errors
    log.error('Unhandled Application Error:', error);
    messageBuffer.add('An unexpected error occurred. If the problem persists, please try refreshing.', 'Dismiss', {
      duration: 5000,
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message || error.stack || '';
    }
    return String(error ?? '');
  }
}
