/**
 * Preis-Raten – eBay-Dienst (Cloudflare Worker)
 *
 * Holt zufällige Neuware-Sofortkauf-Angebote von ebay.de über die offizielle
 * eBay Browse API und gibt sie dem Spiel als JSON zurück. Die eBay-Schlüssel
 * bleiben hier auf dem Server und gelangen nie in den Browser.
 *
 * Routen:
 *   GET /random?count=10   -> { items: [ { id, n, p, u, img, c, d } ] }
 *   GET /img?u=<eBay-Bild-URL>  -> Bild mit CORS-Header (damit das Spiel es ins Ergebnisbild zeichnen darf)
 *   GET /health            -> Status, ob die Schlüssel gesetzt sind
 *
 * Umgebungsvariablen (im Cloudflare-Dashboard unter Settings → Variables and Secrets):
 *   EBAY_CLIENT_ID      (Secret)  App ID / Client ID aus dem eBay-Entwicklerkonto (Production)
 *   EBAY_CLIENT_SECRET  (Secret)  Cert ID / Client Secret (Production)
 *   ALLOWED_ORIGIN      (optional) z. B. https://deinname.github.io  – Standard: *
 */

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const SCOPE = "https://api.ebay.com/oauth/api_scope";

/* Suchbegriffe, aus denen zufällig gezogen wird. Beliebig erweiterbar. */
export const KEYWORDS = [
  "Kaffeevollautomat", "Siebträgermaschine", "Wasserkocher", "Toaster", "Standmixer", "Heißluftfritteuse",
  "Küchenmaschine", "Pfannenset", "Messerblock", "Gusseisen Bräter", "Espressokocher", "Waffeleisen",
  "Akkuschrauber", "Bohrhammer", "Winkelschleifer", "Werkzeugkoffer", "Wasserwaage", "Kreissäge",
  "Rasenmäher", "Hochdruckreiniger", "Gartenschlauch", "Gasgrill", "Holzkohlegrill", "Gartenstuhl",
  "Bluetooth Kopfhörer", "Bluetooth Lautsprecher", "Soundbar", "Smartwatch", "E-Reader", "Tablet",
  "Spielkonsole", "Gaming Maus", "Mechanische Tastatur", "Webcam", "Powerbank", "Drohne", "Actioncam",
  "Lego", "Playmobil", "Puzzle 1000 Teile", "Brettspiel", "Kartenspiel", "Modelleisenbahn", "Plüschtier",
  "Ferngesteuertes Auto", "Zauberwürfel", "Puppenhaus", "Kinderfahrrad", "Laufrad",
  "Sneaker", "Sonnenbrille", "Armbanduhr", "Rucksack", "Regenjacke", "Wanderschuhe", "Handtasche",
  "Parfum", "Elektrische Zahnbürste", "Haartrockner", "Rasierer", "Glätteisen", "Massagepistole",
  "Yogamatte", "Kettlebell", "Hantelset", "Springseil", "Fahrradhelm", "Fahrradschloss", "Zelt",
  "Schlafsack", "Thermoskanne", "Trinkflasche", "Campingstuhl", "Taschenlampe", "Taschenmesser",
  "Bürostuhl", "Schreibtischlampe", "Wanduhr", "Bettwäsche", "Kopfkissen", "Teppich", "Duftkerze",
  "Vase", "Bilderrahmen", "Weihnachtsdeko", "Lichterkette", "Staubsauger", "Saugroboter", "Bügeleisen",
  "Ventilator", "Luftreiniger", "Wecker", "Regenschirm", "Koffer", "Notizbuch", "Füller", "Globus",
  "Teleskop", "Mikroskop", "Gitarre", "Ukulele", "Keyboard Klavier", "Kopfhörerverstärker",
  "Hundebett", "Katzenbaum", "Aquarium", "Vogelhaus", "Futterautomat",
  "Kochbuch", "Whisky Gläser", "Weinkühler", "Cocktail Set", "Fondue Set", "Raclette",
  "Kostüm", "Partyspiel", "Scherzartikel", "Lavalampe", "Kaugummiautomat"
];

/* Titel mit diesen Wörtern sind meist Zubehör, Ersatzteile oder Ramsch und fliegen raus. */
const BLOCKLIST = /(hülle|schutzhülle|case\b|cover\b|schutzfolie|panzerglas|ersatzteil|ersatz-|defekt|bastler|ladekabel|\bkabel\b|adapter|aufkleber|sticker|halterung|nur karton|leerkarton|anleitung|kompatibel|passend für|\bfür\s+(iphone|samsung|ipad|apple|dyson|thermomix))/i;

const DEFAULT_MIN = 5;
const DEFAULT_MAX = 1500;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* ---------- eBay-Anmeldung (Application Token, ca. 2 h gültig) ---------- */
let cachedToken = null;
let tokenExpires = 0;
let pendingToken = null; // laufende Anmeldung, damit parallele Suchen sie teilen

function getToken(env, force = false) {
  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
    return Promise.reject(new HttpError(500, "EBAY_CLIENT_ID oder EBAY_CLIENT_SECRET ist im Worker nicht gesetzt."));
  }
  if (!force && cachedToken && Date.now() < tokenExpires - 60_000) return Promise.resolve(cachedToken);
  if (!pendingToken) pendingToken = requestToken(env).finally(() => { pendingToken = null; });
  return pendingToken;
}

async function requestToken(env) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials&scope=" + encodeURIComponent(SCOPE)
  });
  if (!res.ok) {
    throw new HttpError(502, `eBay-Anmeldung fehlgeschlagen (HTTP ${res.status}). Production-Client-ID und -Secret prüfen.`);
  }
  const json = await res.json();
  cachedToken = json.access_token;
  tokenExpires = Date.now() + (json.expires_in || 7200) * 1000;
  return cachedToken;
}

/* eBay liefert oft kleine Vorschaubilder (s-l225). Größere Variante anfordern. */
export function biggerImage(url) {
  return String(url || "").replace(/\/s-l\d+\.(jpg|jpeg|png|webp)/i, "/s-l500.$1");
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Ein zufälliges passendes Angebot zu einem Suchbegriff holen (oder null). */
async function pickOne(env, keyword, seen, opts) {
  const offset = Math.floor(Math.random() * 4) * 50; // aus den ersten 200 Treffern
  const params = new URLSearchParams({
    q: keyword,
    limit: "50",
    offset: String(offset),
    filter: [
      "buyingOptions:{FIXED_PRICE}",
      "conditionIds:{1000}",
      `price:[${opts.min}..${opts.max}]`,
      "priceCurrency:EUR",
      "itemLocationCountry:DE"
    ].join(",")
  });

  const call = async (token) => fetch(`${SEARCH_URL}?${params}`, {
    headers: {
      Authorization: "Bearer " + token,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_DE",
      "Accept-Language": "de-DE"
    }
  });

  let res = await call(await getToken(env));
  if (res.status === 401) res = await call(await getToken(env, true));
  if (res.status === 429) throw new HttpError(429, "eBay-Tageslimit erreicht. Morgen wieder versuchen.");
  if (!res.ok) return null;

  const json = await res.json();
  const candidates = (json.itemSummaries || []).filter((it) =>
    it.price && it.price.currency === "EUR" &&
    parseFloat(it.price.value) > 0 &&
    it.image && it.image.imageUrl &&
    it.itemWebUrl &&
    !BLOCKLIST.test(it.title || "") &&
    !seen.has(it.itemId)
  );
  if (!candidates.length) return null;

  const it = candidates[Math.floor(Math.random() * candidates.length)];
  seen.add(it.itemId);
  return {
    id: it.itemId,
    n: it.title,
    p: Math.round(parseFloat(it.price.value) * 100) / 100,
    u: it.itemWebUrl,
    img: biggerImage(it.image.imageUrl),
    c: (it.categories && it.categories[0] && it.categories[0].categoryName) || keyword,
    d: "Neu · Sofort-Kaufen auf eBay · Preis ohne Versand"
  };
}

async function randomItems(env, count, opts) {
  const seen = new Set();
  const items = [];
  const keywords = shuffle(KEYWORDS);
  let k = 0;
  // In Runden parallel abfragen, bis genug Produkte da sind (max. 3 Versuche pro Produkt)
  for (let attempt = 0; attempt < 3 && items.length < count && k < keywords.length; attempt++) {
    const need = count - items.length;
    const batch = keywords.slice(k, k + need);
    k += need;
    const results = await Promise.all(batch.map((kw) => pickOne(env, kw, seen, opts).catch((e) => {
      if (e instanceof HttpError) throw e;
      return null;
    })));
    for (const r of results) if (r) items.push(r);
  }
  return items;
}

/* ---------- HTTP ---------- */
function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(env) }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(env) });
    if (request.method !== "GET") return json(env, 405, { error: "Nur GET erlaubt." });

    try {
      if (url.pathname === "/health") {
        return json(env, 200, { ok: true, keys: Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET) });
      }

      if (url.pathname === "/random") {
        const count = Math.min(20, Math.max(1, parseInt(url.searchParams.get("count") || "10", 10) || 10));
        const min = Math.max(1, parseFloat(url.searchParams.get("min")) || DEFAULT_MIN);
        const max = Math.max(min + 1, parseFloat(url.searchParams.get("max")) || DEFAULT_MAX);
        const items = await randomItems(env, count, { min, max });
        if (!items.length) return json(env, 502, { error: "eBay hat keine passenden Produkte geliefert. Bitte nochmal versuchen." });
        const imgBase = `${url.origin}/img?u=`;
        return json(env, 200, { items: items.map((it) => ({ ...it, img: imgBase + encodeURIComponent(it.img) })) });
      }

      if (url.pathname === "/img") {
        const target = url.searchParams.get("u") || "";
        let host = "";
        try { host = new URL(target).hostname; } catch {}
        if (!(host === "i.ebayimg.com" || host.endsWith(".ebayimg.com"))) {
          return json(env, 400, { error: "Nur eBay-Bilder sind erlaubt." });
        }
        const res = await fetch(target, { cf: { cacheTtl: 86400, cacheEverything: true } });
        if (!res.ok) return json(env, 502, { error: `Bild nicht abrufbar (HTTP ${res.status}).` });
        return new Response(res.body, {
          status: 200,
          headers: {
            "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            ...corsHeaders(env)
          }
        });
      }

      return json(env, 404, { error: "Unbekannte Route. Erlaubt: /random, /img, /health" });
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      return json(env, status, { error: e.message || "Unbekannter Fehler" });
    }
  }
};
