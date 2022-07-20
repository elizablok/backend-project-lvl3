import nock from 'nock';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fsp from 'fs/promises';
import loadPage from '../src/pageLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
const readFile = (dir, file) => fsp.readFile(path.join(dir, file));
const getPath = (dirname, filename) => path.join(dirname, filename);

const { href, origin, pathname } = new URL('https://ru.hexlet.io/courses');
const resourceDirname = 'ru-hexlet-io-courses_files';
const resourcePaths = {
  css: getPath(resourceDirname, 'ru-hexlet-io-assets-application.css'),
  html: getPath(resourceDirname, 'ru-hexlet-io-courses.html'),
  png: getPath(resourceDirname, 'ru-hexlet-io-assets-professions-nodejs.png'),
  js: getPath(resourceDirname, 'ru-hexlet-io-packs-js-runtime.js'),
};
const pageFilename = 'ru-hexlet-io-courses.html';
const noResourcesPageFilename = 'no-resources-ru-hexlet-io-courses.html';
const someResourcesMissingPageFilename = 'some-resources-missing-ru-hexlet-io-courses.html';

let expectedPage;
let expectedResources;
let expectedNoResourcesPage;
let expectedSomeResourcesMissingPage;
beforeAll(async () => {
  expectedPage = await fsp.readFile(getFixturePath(pageFilename));
  expectedNoResourcesPage = await fsp.readFile(getFixturePath(noResourcesPageFilename));
  expectedSomeResourcesMissingPage = await fsp.readFile(
    getFixturePath(someResourcesMissingPageFilename),
  );
  expectedResources = {
    css: await fsp.readFile(getFixturePath(resourcePaths.css)),
    html: await fsp.readFile(getFixturePath(resourcePaths.html)),
    png: await fsp.readFile(getFixturePath(resourcePaths.png)),
    js: await fsp.readFile(getFixturePath(resourcePaths.js)),
  };
});

let receivedDirname;
beforeEach(async () => {
  receivedDirname = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('Loaded content', async () => {
  nock(origin)
    .get(pathname)
    .reply(200, expectedResources.html)
    .get('/assets/application.css')
    .reply(200, expectedResources.css)
    .get(pathname)
    .reply(200, expectedResources.html)
    .get('/assets/professions/nodejs.png')
    .reply(200, expectedResources.png)
    .get('/packs/js/runtime.js')
    .reply(200, expectedResources.js);
  await loadPage(href, receivedDirname);
  const receivedPage = await readFile(receivedDirname, pageFilename);
  const receivedCss = await readFile(receivedDirname, resourcePaths.css);
  const receivedHtml = await readFile(receivedDirname, resourcePaths.html);
  const receivedPng = await readFile(receivedDirname, resourcePaths.png);
  const receivedJs = await readFile(receivedDirname, resourcePaths.js);
  expect(receivedPage).toEqual(expectedPage);
  expect(receivedCss).toEqual(expectedResources.css);
  expect(receivedHtml).toEqual(expectedResources.html);
  expect(receivedPng).toEqual(expectedResources.png);
  expect(receivedJs).toEqual(expectedResources.js);
});

describe('Throwed exceptions', () => {
  test('Http errors', async () => {
    nock('https://foo.bar.baz')
      .get(/no-response/)
      .replyWithError('getaddrinfo ENOTFOUND foo.bar.baz')
      .get(/404/)
      .reply(404)
      .get(/500/)
      .reply(500);

    await expect(loadPage('https://foo.bar.baz/no-response', receivedDirname)).rejects.toThrow('getaddrinfo ENOTFOUND foo.bar.baz');
    await expect(loadPage('https://foo.bar.baz/404', receivedDirname)).rejects.toThrow('Request failed with status code 404');
    await expect(loadPage('https://foo.bar.baz/500', receivedDirname)).rejects.toThrow('Request failed with status code 500');
  });

  test('Fs errors', async () => {
    nock(/example.com/)
      .get('/')
      .twice()
      .reply(200);

    await expect(loadPage('https://example.com', '/sys')).rejects.toThrow('EACCES: permission denied, open \'/sys/example-com.html\'');
    await expect(loadPage('https://example.com', '/notExistingFolder')).rejects.toThrow('ENOENT: no such file or directory, open \'/notExistingFolder/example-com.html\'');
  });
});

describe('Not throwed', () => {
  test('Some resources were not loaded', async () => {
    nock(origin)
      .get(pathname)
      .reply(200, expectedResources.html)
      .get('/assets/application.css')
      .reply(200, expectedResources.css)
      .get(pathname)
      .reply(200, expectedResources.html)
      .get('/assets/professions/nodejs.png')
      .reply(400)
      .get('/packs/js/runtime.js')
      .reply(500);

    await loadPage(href, receivedDirname);
    const receivedPage = await readFile(receivedDirname, pageFilename);
    expect(receivedPage).toEqual(expectedSomeResourcesMissingPage);
    const receivedResourceDirnameContent = await fsp.readdir(
      path.join(receivedDirname, resourceDirname),
    );
    const expectedResourceDirnameContent = [
      path.basename(resourcePaths.css), path.basename(resourcePaths.html),
    ];
    expect(receivedResourceDirnameContent).toEqual(expectedResourceDirnameContent);
  });

  test('No resources to load', async () => {
    nock(origin)
      .get(pathname)
      .reply(200, expectedNoResourcesPage);

    await loadPage(href, receivedDirname);
    const receivedPage = await readFile(receivedDirname, pageFilename);
    expect(receivedPage).toEqual(expectedNoResourcesPage);
    const resourceDirnameContent = await fsp.readdir(path.join(receivedDirname, resourceDirname));
    expect(resourceDirnameContent).toEqual([]);
  });
});
