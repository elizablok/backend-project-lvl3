import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import { getDataName, getPath } from './pathUtils.js';

const mappingResType = {
  png: 'arraybuffer',
  jpg: 'arraybuffer',
};

const tags = ['img'];
const mappingTagAttr = {
  img: ['src', 'href'],
};

export function getAbsoluteUrl(fullUrl, relatedUrl) {
  const isAbsolute = (aUrl) => url.parse(aUrl).protocol !== null;
  return isAbsolute(relatedUrl) ? relatedUrl : url.resolve(fullUrl, relatedUrl);
}

export function getDataType(aUrl) {
  const extension = path.extname(aUrl).split('.').join('');
  return mappingResType[extension];
}

export function localizeLinks(content, mainUrl) {
  const dirname = getDataName(mainUrl, 'folder');
  const $ = cheerio.load(content);
  tags.forEach((tag) => {
    $(tag).each(function () {
      const tagAttr = mappingTagAttr[tag].filter((el) => $(this).attr(el)).join('');
      const urlAttr = $(this).attr(tagAttr);
      const newUrlAttr = getAbsoluteUrl(mainUrl, urlAttr);
      const filename = getDataName(newUrlAttr, 'file');
      const filepath = getPath(dirname, filename);
      $(this).attr(tagAttr, filepath);
    });
  });
  return $.html();
}

export function getResourcesLinks(content) {
  const $ = cheerio.load(content);
  return tags.reduce((acc, tag) => {
    const tagLinks = $(tag).map(function () {
      const tagAttr = mappingTagAttr[tag].filter((el) => $(this).attr(el)).join('');
      return $(this).attr(tagAttr);
    }).toArray();
    acc.push(...tagLinks);
    return acc;
  }, []);
}

export function normalizeHtml(content) {
  return content
    .replace(/\s\s\s\s\n<\/body><\/html>/g, '    <\/body>\n<\/html>')
    .replace(/<head>/g, '\n    <head>');
}
