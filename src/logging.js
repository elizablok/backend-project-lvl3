import fs from 'fs/promises';
import { cwd } from 'process';
import path from 'path';
import debug from 'debug';

const recordLog = (data) => {
  const loggerPath = path.join(cwd(), 'logger.log');
  const logRecord = `${data}\n\n`;
  return fs.appendFile(loggerPath, logRecord);
};

const mappingNamespace = {
  info: (message) => debug('page-loader: info')(message),
  severeError: (message) => debug('page-loader: severeError')(message),
};

const log = (namespace, message, record = message) => {
  if (namespace === 'error') {
    return recordLog(record);
  }
  return recordLog(record)
    .then(() => mappingNamespace[namespace](message));
};

export default log;
