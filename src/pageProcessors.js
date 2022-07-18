import cheerio from 'cheerio';

const tags = ['img', 'link', 'script'];
const tagAttrs = ['src', 'href'];

function hasSameDomain(url, newUrl) {
  return new URL(url).hostname === new URL(newUrl).hostname;
}

export function localizeLinks(content, resourcesToLocalize) {
  const $ = cheerio.load(content);
  tags.forEach((tag) => {
    $(tag).each(function a() {
      resourcesToLocalize.forEach(([link, filepath]) => {
        const tagAttr = tagAttrs.filter((el) => $(this).attr(el)).join('');
        if ($(this).attr(tagAttr) === link) {
          $(this).attr(tagAttr, filepath);
        }
      });
    });
  });
  return $.html();
}

export function getResourcesLinks(content, url) {
  const $ = cheerio.load(content);
  const res = tags.reduce((acc, tag) => {
    const tagLinks = $(tag).map(function a() {
      const tagAttr = tagAttrs.filter((el) => $(this).attr(el)).join('');
      if (tagAttr === '') {
        return;
      }
      // eslint-disable-next-line consistent-return
      return $(this).attr(tagAttr);
    }).toArray().filter((el) => hasSameDomain(url, new URL(el, url).href));
    acc.push(...tagLinks);
    return acc;
  }, []);
  return res;
}

export function normalizeHtml(content) {
  return content
    // eslint-disable-next-line consistent-return
    .replace(/\s{0,5}\n<\/body><\/html>/g, '\n  </body>\n</html>')
    .replace(/<head>/g, '\n  <head>');
}
