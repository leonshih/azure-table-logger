import path from 'path';
import pinoms from 'pino-multi-stream';
import { createPinoStream } from './azureTable';

/**
 * create pino logger
 * @param fileName (e.g. __filename or 'app.js')
 * @description log level: trace debug info warn error fatal silent
 * @example
 const logger = createLogger(__filename);
  
 logger.info('info message');
 logger.error(new Error('test error'));
 * @returns 
 */
export function createLogger(fileName: string) {
  //  const logger = pinoms([{ name, level: process.env.LOG_LEVEL || 'info' }]);
  const name = path.basename(fileName);

  const streams: pinoms.LoggerOptions['streams'] =
    process.env.NODE_ENV !== 'production'
      ? [
          // for console output
          {
            level: 'info',
            stream: pinoms.prettyStream({
              prettyPrint: {
                translateTime: true,
                ignore: 'hostname,pid',
              },
            }),
          },
        ]
      : [];

  if (process.env.LOG_TO_AZURE_TABLE === 'true') {
    const azurePinoStream = createPinoStream();
    streams.push(azurePinoStream);
  }

  const logger = pinoms({
    name,
    streams,
  });

  return logger;
}
