import path from 'path';

export const getPath = (outputPath, filename) => path.join(outputPath, filename);

const prettifyFilename = (filepath) => filepath
  .replace(/\/$/, '')
  .replace(/\.html$/, '')
  .replace(/[^a-z\d]/gi, '-');

const mappingDataName = {
  page: (pathname) => `${prettifyFilename(pathname)}.html`,
  file: (pathname) => {
    const { dir, name, ext } = path.parse(pathname);
    return `${prettifyFilename(getPath(dir, name))}${ext}`;
  },
  folder: (pathname) => `${prettifyFilename(pathname)}_files`,
};

export const getDataName = (url, dataType) => {
  const { hostname, pathname } = new URL(url);
  const rawName = getPath(hostname, pathname);
  return mappingDataName[dataType](rawName);
};
