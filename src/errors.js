import log from './logging.js';
import NetworkError from './NetworkError.js';
import SystemError from './SystemError.js';

const getSystemMessage = (e) => {
  switch (e.code) {
    case 'ENOENT':
      return `No file or directory '${e.path}' exists`;
    case 'EACCES':
      return `You dont't have permission to access the file '${e.path}'`;
    default:
      return `${e.message}`;
  }
};

const getNetworkMessage = (e) => {
  const { url } = e.config;
  if (!e.response) {
    return `The request was made at '${e.config.url}', but no response was received`;
  }
  switch (e.response.status) {
    case 400:
      return `The address '${url}' is not correct`;
    case 401:
      return `The resource '${url}' you're trying to access requires authorization`;
    case 403:
      return `You don't have access rights to the content of '${url}'`;
    case 404:
      return `The resource '${url}' was not found on the host '${e.request.host}'`;
    case 500:
      return `The request '${url}' can not be processed for some reason related to the server`;
    case 502:
      return `The server did not receive a valid response to '${url}' from its backend servers`;
    case 503:
      return `The server can not handle the request '${url}' right now`;
    case 504:
      return `The server was receiving a response to '${url}' from its backend servers for too long`;
    default:
      return `The request ${url} failed with code ${e.response.status} and state ${e.response.statusText}`;
  }
};

const getSystemLogRecord = (e, message) => `${message}: ${e}`;
const getNetworkLogRecord = (e, message) => {
  const requestBody = `${e.config.method} ${e.config.url} / HTTP/1.1
  Host: ${e.request.host}
  User-Agent: ${e.config.headers['User-Agent']}
  Accept: ${e.config.headers.Accept}
  Accept-Language: en-US,en;q=0.5`;

  if (!e.response) {
    const noResponseHttpMessage = `${requestBody}\nReceived no http response`;
    return `${message}: ${noResponseHttpMessage}`;
  }

  const responseBody = `HTTP/1.1 ${e.response.status} ${e.response.statustext}
  Date: ${e.response.headers.date}
  Server: ${e.response.headers.server}
  Connection: close
  Transfer-Encoding: ${e.response.headers['transfer-encoding']}
  Content-Type: ${e.response.headers['content-type']}`;

  const httpMessage = `${requestBody}\n${responseBody}`;
  return `${message}: ${httpMessage}`;
};

const systemErrorHandler = (e, namespace) => {
  const message = getSystemMessage(e);
  const record = getSystemLogRecord(e, message);
  return log(namespace, message, record)
    .then(() => {
      if (namespace === 'severeError') {
        throw new SystemError(e.message);
      }
    });
};

const networkErrorHandler = (e, namespace) => {
  const message = getNetworkMessage(e);
  const record = getNetworkLogRecord(e, message);
  return log(namespace, message, record)
    .then(() => {
      if (namespace === 'severeError') {
        throw new NetworkError(e.message);
      }
    });
};

const handleError = (e, namespace) => {
  const processed = (e.isAxiosError)
    ? networkErrorHandler(e, namespace) : systemErrorHandler(e, namespace);
  return processed;
};

export default handleError;
