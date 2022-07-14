import axios from 'axios';
import fsp from 'fs/promises';
import path from 'path';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import { getDataName, getPath } from './pathUtils.js';
import { getResourcesLinks, localizeLinks, normalizeHtml } from './pageProcessors.js';

const log = debug('page-loader');

function handleError(e) {
  if (e.response) {
    throw new Error(`'${e.config.url}' request failed with status code ${e.response.status}`);
  }
  throw e;
}

axiosDebug({
  request(httpDebug, config) {
    httpDebug(`Request ${config.url}`);
  },
  response(httpDebug, response) {
    httpDebug(
      `Response with ${response.headers['content-type']}`,
      `from ${response.config.url}`,
    );
  },
});

function loadHtmlPage(url, outputPath) {
  return axios.get(url)
    .then(({ data }) => fsp.writeFile(outputPath, `${data}`))
    .catch((e) => handleError(e));
}

function loadResources(resourcesLinks, resourcesPath, pageUrl) {
  const resourcesToLocalize = [];
  const resourcesDirname = path.basename(resourcesPath);
  const promises = resourcesLinks.map((link) => {
    const newLink = new URL(link, pageUrl).href;
    const filename = getDataName(newLink, 'file');
    const relativePath = getPath(resourcesDirname, filename);
    const filepath = getPath(resourcesPath, filename);
    return axios.get(newLink, { responseType: 'arraybuffer' })
      .then(({ data }) => fsp.writeFile(filepath, data))
      .catch((e) => handleError(e))
      .then(() => resourcesToLocalize.push([link, relativePath]));
  });
  return Promise.all(promises)
    .then(() => resourcesToLocalize);
}

function adaptHtmlPage(htmlPagePath, resourcesToLocalize) {
  return fsp.readFile(htmlPagePath, 'utf-8')
    .then((content) => localizeLinks(content, resourcesToLocalize))
    .then((localized) => normalizeHtml(localized))
    .then((normalized) => fsp.writeFile(htmlPagePath, `${normalized}`));
}

function loadPage(pageUrl, outputDirname) {
  const htmlPageName = getDataName(pageUrl, 'page');
  const htmlPagePath = getPath(outputDirname, htmlPageName);
  const resourcesDirname = getDataName(pageUrl, 'folder');
  const resourcesPath = getPath(outputDirname, resourcesDirname);
  return loadHtmlPage(pageUrl, htmlPagePath)
    .then(() => log(`Saved the page to ${htmlPagePath}`))
    .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => fsp.readFile(htmlPagePath, 'utf8'))
    .then((content) => getResourcesLinks(content, pageUrl))
    .then((resourcesLinks) => loadResources(resourcesLinks, resourcesPath, pageUrl))
    .then((resourcesToLocalize) => {
      log(`Saved files to ${resourcesPath}`);
      return resourcesToLocalize;
    })
    .then((resourcesToLocalize) => adaptHtmlPage(htmlPagePath, resourcesToLocalize))
    .then(() => `${htmlPagePath}`)
    .catch((e) => handleError(e));
}

export default loadPage;
