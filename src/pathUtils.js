import path from 'path';

export const getPath = (outputPath, filename) => path.join(outputPath, filename);

const prettifyName = (filepath) => filepath
  .replace(/\/$/, '')
  .replace(/\.html$/, '')
  .replace(/[^a-z\d]/gi, '-');

const mappingDataName = {
  page: (filepath) => `${prettifyName(filepath)}.html`,
  file: (filepath) => {
    const { dir, name, ext } = path.parse(filepath);
    const newExt = ext === '' ? '.html' : ext;
    return `${prettifyName(getPath(dir, name))}${newExt}`;
  },
  folder: (filepath) => `${prettifyName(filepath)}_files`,
};

export const getDataName = (url, dataType) => {
  const { hostname, pathname } = new URL(url);
  const rawName = getPath(hostname, pathname);
  return mappingDataName[dataType](rawName);
};
