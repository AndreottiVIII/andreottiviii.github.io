// Indirizzi vecchi che Google e i lettori conoscono ancora (Google Analytics 2019-2026, pagine di arrivo e pagine viste):
// il primo blog del 2020 (/tags/x, /categories/x, /pages/..., /page/N) e gli articoli con il punto nel nome
// che Squarespace aveva poi cambiato. Ognuno rimanda alla pagina di oggi che gli corrisponde.
// Si scrivono sia "x.html" sia "x/index.html": cosi' funzionano con e senza barra finale.
// Aggiunto il 26/11/2026 (controllo indicizzazione, tools/controllo_indicizzazione.py).
const T = (n) => "/post/tag/" + n;
const map = {
  "/post/contax-g1-silver-label-conversion-in-green-label": "/post/contax-g1-silver-label-conversion-to-green-label",
  "/post/konica-hexanon-40mm-1.8-a-lens-of-true-value": "/post/konica-hexanon-40mm-18-a-lens-of-true-value",
  "/post/sigma-18-35mm-f1.8-f-ing-amazing": "/post/sigma-18-35mm-f18-f-ing-amazing",
  "/post/helios-44-bokeh-lens-and-nothing-else": "/post/post/helios-44-bokeh-lens-and-nothing-else",
  "/post/milan-lockdown": "/post/post/milan-lockdown",
  "/post/rawdigger-a-useful-tool-for-taking-better-photos-part-1": T("RawDigger"),
  "/post/anish-kapoor-in-venice-a-missed-opportunity": T("venice"),
  "/pages": "/",
  "/pages/about": "/contact-davidecaniatti",
  "/pages/theindex": "/blog-index",
  "/search": "/post",
  "/categories/cameras": "/post/category/Cameras",
  "/categories/lenses": "/post/category/Lenses",
  "/categories/foveon": "/post/category/Foveon",
  "/tags/contax-g": T("Contax+G"), "/tags/contax": T("Contax"), "/tags/contax-645": T("Contax+645"),
  "/tags/6x7": T("6x7"), "/tags/foveon": T("Foveon"), "/tags/paper": T("Paper"),
  "/tags/point-and-shoot": T("Point+and+shoot"), "/tags/point-shoot": T("Point+%26+shoot"),
  "/tags/sigma": T("Sigma"), "/tags/sigma-quattro": T("SD+Quattro+H"), "/tags/sd-quattro-h": T("SD+Quattro+H"),
  "/tags/planar-80mm-f2": T("Planr+80mm+f2"), "/tags/80mm-planar-f2": T("Planr+80mm+f2"), "/tags/planar": T("Planar"),
  "/tags/green-label": T("Green+label"), "/tags/silver-label": T("Silver+label"), "/tags/fomapan": T("Fomapan"),
  "/tags/pentax": T("Pentax"), "/tags/hexanon": T("Hexanon"), "/tags/konica": T("Konica"), "/tags/tlr": T("Tlr"),
  "/tags/ilford": T("Ilford"), "/tags/infrared": T("Infrared"), "/tags/review": T("Review"), "/tags/120": T("120"),
  "/tags/40mm": T("40mm"), "/tags/645": T("645"), "/tags/analog-photography": T("Analog+Photography"),
  "/tags/art": T("Art"), "/tags/book": T("Book"), "/tags/fujifilm": T("Fujifilm"), "/tags/fujifilm-gfx": T("Fujifilm"),
  "/tags/kodak": T("Kodak"), "/tags/tvs-digital": T("Contax+TVS+digital"), "/tags/tvs": T("Contax+TVS"),
  "/tags/venice": T("venice"), "/tags/zine": T("Zine"), "/tags/update": T("Upgrade"),
  // etichette senza un equivalente oggi: il registro di tutti gli articoli
  "/tags/nikonos": "/post", "/tags/voigtlander": "/post", "/tags/fringer-adapter": "/post", "/tags/ccd": "/post",
  "/tags/summicron": "/post", "/tags/andrea-emo": "/post", "/tags/hologon": "/post",
};
// pagine 2, 3... delle vecchie liste: alla prima pagina della lista di oggi
for (const [k, v] of Object.entries({ "/categories/cameras": 3, "/categories/lenses": 2, "/tags/contax": 2, "/tags/art": 2 }))
  for (let i = 2; i <= v; i++) map[`${k}/page/${i}`] = map[k];
for (let i = 2; i <= 8; i++) map[`/page/${i}`] = "/post";

const out = [];
for (const [from, to] of Object.entries(map)) {
  out.push({ file: from + ".html", from, to });
  out.push({ file: from + "/index.html", from, to });
}
// /index (senza barra) e' gia' la home; /index/ no: solo la cartella
out.push({ file: "/index/index.html", from: "/index/", to: "/" });
module.exports = out;
