import axios from 'axios';
import fsp from 'fs/promises';
import { cwd } from 'process';
import path from 'path';
import debug from 'debug';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';
import { getDataName, getPath } from './pathUtils.js';
import { getResourcesLinks, localizeLinks, normalizeHtml } from './pageProcessors.js';

const log = debug('page-loader');

const handleError = (e) => {
  if (e.isAxiosError) {
    if (e.response) {
      throw new Error(`'${e.config.url}' request failed with status code ${e.response.status}`);
    }
    throw new Error(`The request was made at ${e.config.url} but no response was received`);
  }
  throw e;
};

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

const loadHtmlPage = (url, outputPath) => axios.get(url)
  .then(({ data }) => fsp.writeFile(outputPath, `${data}`))
  .catch((e) => handleError(e));

const loadResources = (resourcesLinks, resourcesPath, pageUrl) => {
  const resourcesToLocalize = [];
  const resourcesDirname = path.basename(resourcesPath);
  const tasks = new Listr(
    resourcesLinks
      .map((link) => {
        const newLink = new URL(link, pageUrl).href;
        const filename = getDataName(newLink, 'file');
        const relativePath = getPath(resourcesDirname, filename);
        const filepath = getPath(resourcesPath, filename);
        const task = axios({
          method: 'get',
          url: newLink,
          responseType: 'arraybuffer',
        })
          .then(({ data }) => {
            log(`Saving file to ${filepath}`);
            return fsp.writeFile(filepath, data);
          })
          .catch((e) => handleError(e));

        resourcesToLocalize.push([link, relativePath]);
        return { title: newLink, task: () => task };
      }),
  );

  return tasks.run()
    .then(() => resourcesToLocalize);
};

const adaptHtmlPage = (htmlPagePath, resourcesToLocalize) => fsp.readFile(htmlPagePath, 'utf-8')
  .then((content) => {
    const localized = localizeLinks(content, resourcesToLocalize);
    return normalizeHtml(localized);
  })
  .then((newContent) => fsp.writeFile(htmlPagePath, `${newContent}`));

const loadPage = (pageUrl, outputDirname = cwd()) => {
  const htmlPageName = getDataName(pageUrl, 'page');
  const htmlPagePath = getPath(outputDirname, htmlPageName);
  const resourcesDirname = getDataName(pageUrl, 'folder');
  const resourcesPath = getPath(outputDirname, resourcesDirname);
  return loadHtmlPage(pageUrl, htmlPagePath)
    .then(() => {
      log(`Saved the page to ${htmlPagePath}`);
      return fsp.mkdir(resourcesPath, { recursive: true });
    })
    .then(() => fsp.readFile(htmlPagePath, 'utf8'))
    .then((content) => {
      const resourcesLinks = getResourcesLinks(content, pageUrl);
      return loadResources(resourcesLinks, resourcesPath, pageUrl);
    })
    .then((resourcesToLocalize) => {
      log(`Saved files to ${resourcesPath}`);
      return adaptHtmlPage(htmlPagePath, resourcesToLocalize);
    })
    .then(() => `${htmlPagePath}`)
    .catch((e) => handleError(e));
};

export default loadPage;
