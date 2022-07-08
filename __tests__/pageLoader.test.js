import nock from 'nock';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs.promises';
import loadPage from '../src/pageLoader.js';
import { getFilename } from '../src/pathUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
const readFile = (filepath) => fs.readFile(filepath, 'utf-8');
const getLoadingPath = (dirname, filename) => path.join(dirname, filename);

const receivedLink = 'https://ru.hexlet.io/courses';
const receivedUrl = new URL(receivedLink);
const receivedUrlOrigin = receivedUrl.origin;
const receivedUrlPath = receivedUrl.pathname;

const expectedPageFilename = 'index.html';
const expectedPagePath = getFixturePath(expectedPageFilename);

let expectedPageContent;
beforeAll(async () => {
  expectedPageContent = await readFile(expectedPagePath).then((data) => data.trim());
});

let receivedPageDirname;
beforeEach(async () => {
  receivedPageDirname = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('loaded content correctly', async () => {
  const receivedPageFilename = getFilename(receivedLink);
  const receivedPagePath = getLoadingPath(receivedPageDirname, receivedPageFilename);
  nock(receivedUrlOrigin).get(receivedUrlPath).reply(200, expectedPageContent);
  await loadPage(receivedLink, receivedPageDirname);
  const receivedPageContent = await readFile(receivedPagePath).then((data) => data.trim());
  expect(receivedPageContent).toEqual(expectedPageContent);
});
