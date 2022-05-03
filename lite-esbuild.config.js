require('esbuild').buildSync({
  entryPoints: ['lib/scrapeHTML.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'scrapeHTML',
  footer: {
    js: "scrapeHTML = scrapeHTML && Object.prototype.hasOwnProperty.call(scrapeHTML, 'default') ? scrapeHTML['default'] : scrapeHTML;",
  },
  outfile: 'dist/scrapeHTML-lite.global.js',
})