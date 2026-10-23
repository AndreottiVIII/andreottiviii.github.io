# davidecaniatti.com

Sito di Davide Caniatti. Generato con [Eleventy](https://www.11ty.dev/), pubblicato su GitHub Pages dall'azione `.github/workflows/pages.yml` a ogni modifica del ramo `main`.

## Dove sta cosa

| Cosa | Dove |
|---|---|
| Articoli | `src/posts/*.md` (Markdown + frontmatter) |
| Gallerie del portfolio | `src/galleries/*.md` (la lista `gallery:` nel frontmatter) |
| Home, About me, Index | `src/pages/` |
| Foto (2500 px di lato lungo) | `src/img/` (le versioni piccole si generano da sole alla pubblicazione) |
| Impostazioni (menu, social, **modalità prova**) | `src/_data/site.json` |
| Grafica | `src/assets/css/site.css`, `src/assets/js/site.js`, `src/_includes/` |
| Pannello per scrivere | `.pages.yml` ([Pages CMS](https://pagescms.org)) |

Gli indirizzi sono decisi dal campo `permalink` di ogni file: GitHub Pages serve `percorso/nome.html` all'indirizzo `/percorso/nome`, senza `.html`. Gli indirizzi già pubblicati non si cambiano.

## Modalità prova

`src/_data/site.json` contiene `"mockup": true`. Con l'interruttore acceso tutte le pagine hanno `noindex, nofollow` e Google Analytics non parte mai. Con `"mockup": false` Analytics parte solo dopo che il visitatore preme "Accetta" nel banner.

## In locale

```
npm ci
npm start      # http://localhost:8080
```

In un articolo, una **galleria** è un elenco puntato di sole immagini; una **didascalia** è una riga in corsivo subito sotto un'immagine.

## Rete di sicurezza

Dopo la build, il workflow lancia `node scripts/check-urls.mjs`. Lo script ha dentro l'elenco fisso dei 142 indirizzi della sitemap di Squarespace, più `/work` e la home, e verifica che in `_site` esista il file che GitHub Pages servirà per ognuno. Controlla anche che `<title>` e meta description non siano vuoti (la description può mancare solo dove mancava già sul vecchio sito: tag, categorie e 4 articoli). Se manca anche un solo indirizzo il lavoro fallisce **prima** del deploy e il sito online resta com'era.

In locale, dopo `npx eleventy`: `node scripts/check-urls.mjs`. Su Windows segnala `/post/tag/Medium+format`, perché lì i due tag che differiscono solo per le maiuscole si sovrappongono: su GitHub Actions (Linux) non succede e fa fede quello.

Gli indirizzi vecchi non si tolgono né si rinominano. Se un giorno uno deve sparire davvero, si toglie dall'elenco nello script, di proposito e in un commit a parte.
