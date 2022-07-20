import axios from 'axios';
import fsp from 'fs/promises';
import { cwd } from 'process';
import path from 'path';
import axiosDebug from 'axios-debug-log';
import Listr from 'listr';
import { getDataName, getPath } from './pathUtils.js';
import { getResourcesLinks, localizeLinks, normalizeHtml } from './pageProcessors.js';
import handleError from './errors.js';
import log from './logging.js';

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
  .catch((e) => handleError(e, 'severeError'));

const loadResources = (resourcesLinks, resourcesPath, pageUrl) => {
  const hasNoResources = resourcesLinks.length === 0;
  if (hasNoResources) {
    return log('error', 'Page has no resources to download')
      .then(() => []);
  }
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
          .then(({ data }) => fsp.writeFile(filepath, data))
          .then(() => log('info', `Saving file to ${filepath}`))
          .then(() => resourcesToLocalize.push([link, relativePath]))
          .catch((e) => handleError(e, 'error'));

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
    .then(() => log('info', `Saved the page ${pageUrl} to ${htmlPagePath}`))
    .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => fsp.readFile(htmlPagePath, 'utf8'))
    .then((content) => {
      const resourcesLinks = getResourcesLinks(content, pageUrl);
      return loadResources(resourcesLinks, resourcesPath, pageUrl);
    })
    .then((resourcesToLocalize) => adaptHtmlPage(htmlPagePath, resourcesToLocalize))
    .then(() => log('info', `Saved files to ${resourcesPath}`))
    .then(() => `${htmlPagePath}`);
};

export default loadPage;
