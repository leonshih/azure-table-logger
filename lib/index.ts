import { createLogger as createPinoLogger } from './pino';
import { createLogger as createWinstonLogger } from './winston';
import { createTable } from './azureTable';

export const createLogger =
  process.env.LOGGER === 'winston' ? createWinstonLogger : createPinoLogger;
export const createAzureDataTable = createTable;
