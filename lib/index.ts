import { createLogger as createPinoLogger } from './pino';
import { createLogger as createWinstonLogger } from './winston';


export const createLogger =process.env.LOGGER === 'pino' ? createPinoLogger : createWinstonLogger;
