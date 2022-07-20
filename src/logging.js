import fs from 'fs/promises';
import { cwd } from 'process';
import path from 'path';
import debug from 'debug';

const loggerPath = path.join(cwd(), 'logger.log');

const recordLog = (data) => {
  const logRecord = `${new Date().toUTCString()} ${data}\n\n`;
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

  const fullMessage = `${message}. Open ${loggerPath} for details`;
  return recordLog(record)
    .then(() => mappingNamespace[namespace](fullMessage));
};

export default log;
