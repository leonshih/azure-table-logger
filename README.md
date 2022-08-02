## Usage

```js
import { createLogger } from './lib/pino'

const logger = await createLogger(__filename);

logger.info('info message');
logger.error(new Error('test error'));
```

It will present:
```js
[2022-08-02 03:20:51.552 +0000] INFO (app.ts): info message
[2022-08-02 03:20:51.555 +0000] ERROR (app.ts): test error
    err: {
      "type": "Error",
      "message": "test error",
      "stack":
          Error: test error
              at .../lib/app.ts:22:16
              at processTicksAndRejections (node:internal/process/task_queues:96:5)
    }
```

