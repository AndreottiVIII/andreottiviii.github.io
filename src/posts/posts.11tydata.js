// Valori di base per tutti gli articoli. Un articolo nuovo creato dal pannello (Pages CMS)
// non ha bisogno di "permalink": l'indirizzo e' /post/<nome-del-file>.
module.exports = {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => data.permalink || `/post/${data.page.fileSlug}.html`,
  },
};
