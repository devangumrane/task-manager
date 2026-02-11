import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'backend_error_debug.log');

export const debugLog = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};

export const logError = (context, err) => {
    const timestamp = new Date().toISOString();
    const stack = err?.stack || err;
    fs.appendFileSync(logFile, `[${timestamp}] [ERROR] [${context}] ${err.message}\n${stack}\n`);
}
