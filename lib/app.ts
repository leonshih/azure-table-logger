import dotenv from 'dotenv';

process.env.NODE_ENV === 'production'
  ? dotenv.config()
  : dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


import { createLogger } from './pino'

(async () => {
  const logger = await createLogger(__filename);

  process.on('uncaughtException', (error) => {
    logger.error(error);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(reason);
  });

  logger.debug('test');
  logger.info('info message');
  logger.error(new Error('test error'));

})();
