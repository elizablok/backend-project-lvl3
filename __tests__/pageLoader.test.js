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

const receivedLink = 'https://ru.hexlet.io/courses';
const receivedPageFilename = 'ru-hexlet-io-courses.html';
const receivedFilesDirname = 'ru-hexlet-io-courses_files';
const receivedPictureFilename = 'ru-hexlet-io-assets-professions-nodejs.png';

let expectedPageBefore;
let expectedPageAfter;
let expectedFiles;
beforeAll(async () => {
  expectedPageBefore = await fsp.readFile(getFixturePath('before.html'));
  expectedPageAfter = await fsp.readFile(getFixturePath('after.html'));
  expectedFiles = {
    picture: await fsp.readFile(getFixturePath('picture.png')),
  };
});

let receivedPageDirname;
beforeEach(async () => {
  receivedPageDirname = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('loaded picture', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectedPageBefore)
    .get('/assets/professions/nodejs.png')
    .reply(200, expectedFiles.picture);
  await loadPage(receivedLink, receivedPageDirname);
  const receivedPage = await readFile(receivedPageDirname, receivedPageFilename);
  const receivedPictirePath = getPath(receivedFilesDirname, receivedPictureFilename);
  const receivedPicture = await readFile(receivedPageDirname, receivedPictirePath);
  expect(receivedPage).toEqual(expectedPageAfter);
  expect(receivedPicture).toEqual(expectedFiles.picture);
});
