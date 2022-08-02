import { EventEmitter } from 'stream';
import { createLogger } from '../lib/pino'

describe('pino logger', () => {
  it('should create a pino logger', async () => {
    const logger = await createLogger(__filename);

    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
    expect(logger instanceof EventEmitter).toBeTruthy();
  });
});
