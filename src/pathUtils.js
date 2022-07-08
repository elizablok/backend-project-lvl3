import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getLoadingDirname(dir) {
  const newDir = dir.split('/');
  const dirname = newDir.filter((el) => !['.', '/', ''].includes(el));
  return dirname.join('/');
}

export function getLoadingFilename(url) {
  const baseUrl = new URL(url);
  const { hostname, pathname } = baseUrl;
  const newHostname = hostname.split('.').join('-');
  const pathParts = pathname.split('/').filter((el) => !['.', '/', ''].includes(el));
  const newPathname = pathParts.length === 0 ? pathParts.join('') : `-${pathParts.join('-')}`;
  return `${newHostname}${newPathname}.html`;
}

export function getLoadingPath(dirname, filename = '') {
  return path.join(__dirname, '..', dirname, filename);
}
