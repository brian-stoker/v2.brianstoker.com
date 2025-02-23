// Valid languages to server-side render in production
const LANGUAGES = ['en'];

// Server side rendered languages
const LANGUAGES_SSR = ['en'];

// Work in progress
const LANGUAGES_IN_PROGRESS = LANGUAGES.slice();

const LANGUAGES_IGNORE_PAGES = (pathname) => {
  // We don't have the bandwidth like Qt to translate our .plan posts
  // https://www.qt.io/zh-cn/plan
  if (pathname === '/bstoked.plan' || pathname.startsWith('/.plan/')) {
   return true;
  }

  if (pathname === '/size-snapshot/') {
    return true;
  }

  return false;
};

module.exports = {
  LANGUAGES,
  LANGUAGES_IN_PROGRESS,
  LANGUAGES_SSR,
  LANGUAGES_IGNORE_PAGES,
};
