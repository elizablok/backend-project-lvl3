import cheerio from 'cheerio';

const tags = ['img', 'link', 'script'];
const tagAttrs = ['src', 'href'];

const hasSameDomain = (url, newUrl) => new URL(url).hostname
  === new URL(newUrl).hostname;

export const localizeLinks = (content, resourcesToLocalize) => {
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
};

export const getResourcesLinks = (content, url) => {
  const $ = cheerio.load(content);
  return tags.reduce((acc, tag) => {
    const tagLinks = $(tag).map(function a() {
      const tagAttr = tagAttrs.filter((el) => $(this).attr(el)).join('');
      if (tagAttr === '') {
        return;
      }
      // eslint-disable-next-line consistent-return
      return $(this).attr(tagAttr);
    }).toArray().filter((el) => hasSameDomain(url, new URL(el, url).href));
    return [...acc, ...tagLinks];
  }, []);
};

export const normalizeHtml = (content) => content
  // eslint-disable-next-line consistent-return
  .replace(/\s{0,5}\n<\/body><\/html>/g, '\n  </body>\n</html>')
  .replace(/<head>/g, '\n  <head>');
