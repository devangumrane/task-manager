import { logger } from '../core/utils/logger.js';

/*
 * Wraps the Winston logger to maintain backward compatibility with existing code.
 * Replaces synchronous fs.appendFileSync with async Winston logging.
 */

export const debugLog = (msg) => {
    // Treat debug logs as 'info' or 'debug' level
    logger.info(`[DEBUG] ${msg}`);
};

export const logError = (context, err) => {
    // Pass the error object correctly to Winston so stack traces are captured
    logger.error(`[${context}] ${err.message}`, { stack: err.stack });
}
