// Valori di base per tutte le gallerie. Una galleria nuova creata dal pannello (Pages CMS)
// non ha bisogno di "permalink": l'indirizzo e' /<nome-del-file>, come le cinque vecchie.
module.exports = {
  layout: "layouts/gallery.njk",
  floor: "photography",
  bodyClass: "dark-room",
  eleventyComputed: {
    permalink: (data) => data.permalink || `/${data.page.fileSlug}.html`,
  },
};
