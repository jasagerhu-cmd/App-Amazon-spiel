# eBay-Live-Modus einrichten

Damit das Spiel zufällige Produkte mit Foto, Preis und Link direkt von ebay.de zieht, braucht es drei Dinge. Alles ist kostenlos, Dauer etwa 30 Minuten plus Wartezeit auf die eBay-Freischaltung.

```
Browser (GitHub Pages)  ──►  Cloudflare Worker (hält die eBay-Schlüssel)  ──►  eBay Browse API
```

## 1. eBay-Entwicklerkonto und Schlüssel

1. Auf <https://developer.ebay.com> mit „Register“ ein Entwicklerkonto anlegen. Die Freischaltung kann bis zu einen Werktag dauern.
2. Unter **Application Keys** ein **Production**-Keyset erstellen (nicht „Sandbox“, die enthält nur Testdaten).
3. eBay verlangt vor der Aktivierung eine Angabe zu „Marketplace Account Deletion“. Wähle die Ausnahme (**exempted**), Begründung: Die App speichert keine eBay-Nutzerdaten. Das stimmt, der Worker speichert nichts.
4. Notiere **App ID (Client ID)** und **Cert ID (Client Secret)**. Diese beiden Werte nie in `index.html` oder sonst öffentlich ablegen.

## 2. Cloudflare Worker anlegen

1. Kostenloses Konto auf <https://dash.cloudflare.com> anlegen.
2. **Workers & Pages → Create → Worker** → Namen vergeben, z. B. `preis-raten-ebay` → **Deploy**.
3. **Edit code**: den gesamten Inhalt von `worker/worker.js` hineinkopieren → **Deploy**.
4. **Settings → Variables and Secrets** → zwei Einträge vom Typ **Secret** anlegen:
   - `EBAY_CLIENT_ID` = App ID
   - `EBAY_CLIENT_SECRET` = Cert ID
5. Testen im Browser:
   - `https://preis-raten-ebay.<dein-name>.workers.dev/health` → muss `"keys":true` zeigen
   - `https://preis-raten-ebay.<dein-name>.workers.dev/random?count=3` → drei Produkte als JSON

Alternativ per Kommandozeile im Ordner `worker/`: `npx wrangler deploy`, danach `npx wrangler secret put EBAY_CLIENT_ID` und `npx wrangler secret put EBAY_CLIENT_SECRET`.

## 3. Spiel auf GitHub Pages veröffentlichen

1. Im Repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
2. Branch auswählen (z. B. `main` nach dem Mergen), Ordner `/ (root)` → **Save**.
3. Nach ein bis zwei Minuten läuft das Spiel unter `https://<github-name>.github.io/<repo-name>/`.

Hinweis: GitHub Pages für **private** Repositories gibt es nur mit einem bezahlten GitHub-Tarif. Bei einem öffentlichen Repository ist es kostenlos.

## 4. Verbinden

- Im Spiel unter „Zufällige Produkte von eBay“ die Worker-Adresse eintragen. Sie wird im Browser gespeichert.
- Oder fest eintragen: in `index.html` die Zeile `const EBAY_ENDPOINT = "";` mit der Worker-Adresse füllen.
- Optional, gegen Fremdnutzung: Im Worker die Variable `ALLOWED_ORIGIN` auf `https://<github-name>.github.io` setzen.

## Was der Worker tut

- Zieht pro Runde einen zufälligen Suchbegriff aus `KEYWORDS` (rund 120 Begriffe, frei erweiterbar) und daraus ein zufälliges Angebot aus den ersten 200 Treffern.
- Filter: nur Neuware, nur Sofort-Kaufen, Artikelstandort Deutschland, 5–1.500 €.
- Wirft Titel mit typischen Zubehör-Wörtern raus (Hülle, Kabel, Ersatzteil …), siehe `BLOCKLIST`.
- Leitet die Produktbilder durch, damit das Spiel sie ins Ergebnisbild zeichnen darf.

## Grenzen

- Der Preis ist der Angebotspreis eines einzelnen Händlers **ohne Versand**, kein Marktpreis.
- Die Zubehör-Filterliste ist eine Heuristik. Einzelne Ramsch-Treffer kommen trotzdem durch.
- eBay begrenzt die Zahl der Abrufe pro Tag. Ein Spiel mit 10 Runden braucht etwa 10–30 Suchanfragen.
