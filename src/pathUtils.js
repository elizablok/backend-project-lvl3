import path from 'path';

export const getPath = (outputPath, filename) => path.join(outputPath, filename);

const prettifyName = (filepath) => filepath
  .replace(/\/$/, '')
  .replace(/\.html$/, '')
  .replace(/[^a-z\d]/gi, '-');

const mappingDataName = {
  page: (pathname) => `${prettifyName(pathname)}.html`,
  file: (pathname) => {
    const { dir, name, ext } = path.parse(pathname);
    const newExt = ext === '' ? '.html' : ext;
    return `${prettifyName(getPath(dir, name))}${newExt}`;
  },
  folder: (pathname) => `${prettifyName(pathname)}_files`,
};

export const getDataName = (url, dataType) => {
  const { hostname, pathname } = new URL(url);
  const rawName = getPath(hostname, pathname);
  return mappingDataName[dataType](rawName);
};
