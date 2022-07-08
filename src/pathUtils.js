import path from 'path';

export const getPath = (outputPath, filename) => path.join(outputPath, filename);

const prettifyFilename = (filepath) => filepath
  .replace(/\/$/, '')
  .replace(/\.html$/, '')
  .replace(/[^a-z\d]/gi, '-');

export const getFilename = (url) => {
  const baseUrl = new URL(url);
  const { hostname, pathname } = baseUrl;
  const rawFilename = path.join(hostname, pathname);
  return `${prettifyFilename(rawFilename)}.html`;
}
