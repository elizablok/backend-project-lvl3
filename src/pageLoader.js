import axios from 'axios';
import fs from 'fs.promises';
import { getLoadingDirname, getLoadingFilename, getLoadingPath } from './pathUtils.js';

function loadPage(url, outputDir) {
  const loadingDirname = getLoadingDirname(outputDir);
  const loadingFilename = getLoadingFilename(url);
  const loadingPath = getLoadingPath(loadingDirname, loadingFilename);
  return axios.get(url)
    .then((response) => fs.mkdir(loadingDirname).then(() => response.data))
    .then((data) => fs.writeFile(loadingPath, `${data}`))
    .then(() => `${loadingPath}`);
}

export default loadPage;
