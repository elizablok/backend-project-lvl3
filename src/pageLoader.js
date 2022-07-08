import axios from 'axios';
import fs from 'fs.promises';
import { getFilename, getPath } from './pathUtils.js';

function loadPage(url, outputDirname) {
  const outputFilename = getFilename(url);
  const outputPath = getPath(outputDirname, outputFilename);
  return axios.get(url)
    .then((response) => fs.writeFile(outputPath, `${response.data}`))
    .then(() => `${outputPath}`);
}

export default loadPage;
