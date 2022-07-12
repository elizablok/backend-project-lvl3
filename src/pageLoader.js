import axios from 'axios';
import fsp from 'fs/promises';
import { getDataName, getPath } from './pathUtils.js';
import {
  getAbsoluteUrl, getDataType, getResourcesLinks, localizeLinks, normalizeHtml,
} from './pageProcessors.js';

function loadHtmlPage(url, outputPath) {
  return axios.get(url)
    .then((response) => fsp.writeFile(outputPath, `${response.data}`));
}

function loadResources(resourcesLinks, resourcesPath, mainUrl) {
  return resourcesLinks.forEach((link) => {
    const newLink = getAbsoluteUrl(mainUrl, link);
    const dataType = getDataType(newLink);
    const filename = getDataName(newLink, 'file');
    const filepath = getPath(resourcesPath, filename);
    return axios.get(newLink, { responseType: dataType })
      .then((response) => fsp.writeFile(filepath, response.data));
  });
}

function adaptHtmlPage(htmlPagePath, mainUrl) {
  return fsp.readFile(htmlPagePath, 'utf-8')
    .then((content) => localizeLinks(content, mainUrl))
    .then((localized) => normalizeHtml(localized))
    .then((normalized) => fsp.writeFile(htmlPagePath, `${normalized}`));
}

function loadPage(pageUrl, outputDirname) {
  const htmlPageName = getDataName(pageUrl, 'page');
  const htmlPagePath = getPath(outputDirname, htmlPageName);
  const resourcesDirname = getDataName(pageUrl, 'folder');
  const resourcesPath = getPath(outputDirname, resourcesDirname);
  return loadHtmlPage(pageUrl, htmlPagePath)
    .then(() => fsp.mkdir(resourcesPath, { recursive: true }))
    .then(() => fsp.readFile(htmlPagePath, 'utf8'))
    .then((content) => getResourcesLinks(content))
    .then((resourcesLinks) => loadResources(resourcesLinks, resourcesPath, pageUrl))
    .then(() => adaptHtmlPage(htmlPagePath, pageUrl))
    .then(() => `${htmlPagePath}`);
}

export default loadPage;
