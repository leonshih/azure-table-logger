import Transport from 'winston-transport';
import pino from 'pino';
import os from 'os';
import _ from 'lodash';

/* eslint-disable @typescript-eslint/no-var-requires */
const split2 = require('split2');
const fastJsonParse = require('fast-json-parse');
const pump = require('pump');
const through2 = require('through2');

import {
  TableServiceClient,
  AzureNamedKeyCredential,
  TableClient,
} from '@azure/data-tables';

const tableName = `${_.camelCase(process.env.npm_package_name)}Log`;

/** Azure access config */
const azureStorageAccount = process.env.AZURE_STORAGE_ACCOUNT ?? '';
const azureStorageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY ?? '';
const azureTableUrl = `https://${azureStorageAccount}.table.core.windows.net`;

export function createPinoStream() {
  if (!azureStorageAccount || !azureStorageAccountKey) {
    throw new Error('Azure storage account or key is not set');
  }

  const credential = new AzureNamedKeyCredential(
    azureStorageAccount,
    azureStorageAccountKey
  );

  const parseJsonStream = split2((str: string) => {
    const result = fastJsonParse(str);
    if (result.err) return null;
    return result.value;
  });

  const transport = through2.obj((chunk: any, enc: any, cb: any) => {
    const { name, level, msg, time, hostname } = JSON.parse(chunk);

    const entity = createTableEntity({
      filename: name,
      message: msg,
      level: pino.levels.labels[level],
      time: time.toString(),
      hostname,
    });

    const tableClient = new TableClient(azureTableUrl, tableName, credential);

    tableClient.createEntity(entity).then(() => {
      cb();
    });
  });

  //  batch2.obj({ size });

  return pump(process.stdin, parseJsonStream, transport);
}

/**
 * create winston transport of azure data table
 * @param options winston logger option
 * @returns
 */
export function createWinstonTransport(options: object) {
  if (!azureStorageAccount || !azureStorageAccountKey) {
    throw new Error('Azure storage account or key is not set');
  }

  const credential = new AzureNamedKeyCredential(
    azureStorageAccount,
    azureStorageAccountKey
  );

  const transport = new AzureWinstonTransport(
    options,
    azureTableUrl,
    credential,
    tableName
  );

  return transport;
}

/** custom winston transport of azure data table */
class AzureWinstonTransport extends Transport {
  tableClient: TableClient | undefined;

  /**
   *
   * @param options winston logger option
   * @param azureTableUrl azure data table url
   * @param credential azure access credential
   * @param tableName azure data table name
   */
  constructor(
    options: object,
    azureTableUrl: string,
    credential: AzureNamedKeyCredential,
    tableName: string
  ) {
    super(options);

    this.tableClient = new TableClient(azureTableUrl, tableName, credential);
  }

  /**
   * logging
   * @param info logging info
   * @param callback function after handling logging process
   */
  async log(
    info: { message: string; level: string; label: string; timestamp: string },
    callback: () => void
  ) {
    const { message, level, label, timestamp } = info;

    const entity = createTableEntity({
      filename: label,
      message,
      level,
      time: timestamp,
      hostname: os.hostname(),
    });

    if (this.tableClient) await this.tableClient.createEntity(entity);

    callback();
  }
}

/** create Azure data table */
export async function createTable() {
  if (!azureStorageAccount || !azureStorageAccountKey) {
    throw new Error('Azure storage account or key is not set');
  }

  const credential = new AzureNamedKeyCredential(
    azureStorageAccount,
    azureStorageAccountKey
  );

  const serviceClient = new TableServiceClient(azureTableUrl, credential);

  await serviceClient.createTable(tableName);
}

/**
 * create Azure data table entity
 * @param info logging info
 * @returns
 */
const createTableEntity = (info: {
  filename: string;
  message: string;
  level: string;
  time: string;
  hostname: string;
}) => {
  const { filename, level, message, time, hostname } = info;

  return {
    partitionKey: filename,
    rowKey: time,
    level,
    message,
    hostname,
  };
};
