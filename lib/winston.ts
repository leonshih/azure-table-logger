import winston from 'winston';
import path from 'path';

import { createWinstonTransport as createAzureTransport } from './azureTable';

/** create winston logger */
export async function createLogger(fileName: string) {
  const _fileName = path.basename(fileName);

  const { createLogger, format } = winston;
  const { colorize, combine, timestamp, label, printf, errors, json } =
    winston.format;

  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    exitOnError: true,
  });

  const customPrintf = printf((info) => {
    if (info instanceof Error)
      return `${info.timestamp} ${info.level} [${info.label}]: ${info.stack}`;
    return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
  });

  const enumerateErrorFormat = format((info) => {
    if (info.message instanceof Error) {
      info.message = Object.assign(
        {
          message: info.message.message,
          stack: info.message.stack,
        },
        info.message
      );
    }

    if (info instanceof Error) {
      return Object.assign(
        {
          message: info.message,
          stack: info.stack,
        },
        info
      );
    }

    return info;
  });

  if (process.env.NODE_ENV !== 'production') {
    // add console transport
    logger.add(
      new winston.transports.Console({
        format: combine(
          errors({ stack: true }),
          enumerateErrorFormat(),
          json(),
          label({ label: _fileName }),
          colorize(),
          timestamp(),
          customPrintf
        ),
      })
    );
  }

  // add Azure data table transport
  const azureWinstonTransport = await createAzureTransport({
    format: combine(label({ label: _fileName }), timestamp(), customPrintf),
  });

  logger.add(azureWinstonTransport);

  return logger;
}
