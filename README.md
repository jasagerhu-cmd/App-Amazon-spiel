# Preis-Raten

Partyspiel für 1–8 Spieler an einem Gerät: Ein Produkt wird ohne Preis gezeigt, jeder tippt geheim den Preis ein, wer am nächsten dran ist, bekommt einen Punkt (Gleichstand: alle). Standard sind 10 Runden.

## Starten
`index.html` im Browser öffnen. Kein Server, keine Installation.

## Eigene Produkte mit Foto und Link
Im Setup unter „Eigene Produkte verwalten“: Produktbild auf Amazon kopieren und einfügen (Strg+V), hochladen oder hineinziehen, dann Link und Preis eintragen. Die Produkte werden nur im Browser dieses Geräts gespeichert.

## Ergebnisbild
Nach jeder Runde entsteht ein Bild (1080 × 1350) mit Produktfoto, echtem Preis, allen Tipps, Link und QR-Code zum Artikel. Es lässt sich speichern, kopieren oder (auf dem Handy) teilen. Am Ende stehen alle Bilder und Links in einer Übersicht.

## Standard-Produktliste
Die Produkte stehen als Liste `PRODUCTS` oben im `<script>` von `index.html` (Emoji, Kategorie, Name, Beschreibung, Preis in €).
Die Preise sind ungeprüfte Richtwerte. Deshalb kommt bei Produkten aus dieser Liste nach den Tipps ein Prüfschritt: Der Spielleiter schlägt den Preis nach und trägt ihn ein, erst dann wird gewertet. Korrigierte Preise merkt sich das Spiel auf dem Gerät.

## eBay-Live-Modus
Zufällige Produkte mit Foto, Preis und Link direkt von ebay.de (Neuware, Sofort-Kaufen). Braucht einen kostenlosen eBay-Entwicklerzugang und einen kleinen Cloudflare Worker, der die Schlüssel hält. Anleitung: [worker/README.md](worker/README.md).

Die Vorschau auf claude.ai kann diesen Modus nicht nutzen (die Plattform sperrt Verbindungen zu fremden Servern). Dafür das Spiel über GitHub Pages veröffentlichen.

## Warum nicht Amazon oder Idealo?
- Amazon: Die Product Advertising API wurde 2026 durch die Creators API ersetzt. Zugang nur mit Amazon-Partnerprogramm-Konto, das echte Verkäufe nachweisen muss. Scraping verstößt gegen die Nutzungsbedingungen.
- Idealo: keine öffentliche Schnittstelle zum Lesen von Preisen, nur Händler-Schnittstellen zum Hochladen.

## Grinse-Invasion (doom.html)

Schneller 3D-Shooter im Retro-Stil (Three.js). `doom.html` im Browser öffnen – Desktop (WASD + Maus) und Touch werden unterstützt.

## Pizza Wolke Arcade – Belag-Alarm (pizza.html)

Match-3-Spiel mit Pizza-Belägen für einen Arcade-Automaten im Laden. Look im Pizza-Wolke-CI: Wolken-Logo mit dicker Kontur, rosa Fliesenraum in 3D, Pizzakarton-Illustration, Belags-Blöcke mit Tiefe auf einem gekippten Holzbrett. Spielsteine sind Pizza-Karten mit eigener Randfarbe: Toni Peperoni (rot), Pastrami (orange), Cloudy (blau), MVP (grün), Pink Lady (rosa), Mr. Beef (lila). Liste `TYPES` im Skript. `pizza.html` im Browser öffnen, keine Installation, läuft offline (nur die Schriften kommen aus dem Netz, sonst Ersatzschrift).

**Ablauf:** Titelbildschirm mit Scoreboard (Heute / Allzeit) → Name eintragen (Pflicht, 2–12 Zeichen, Bildschirmtastatur oder echte Tastatur) → eine Runde à 60 Sekunden → Ergebnis mit Platzierung. Nach 45 Sekunden ohne Eingabe springt der Automat zurück zum Titel.

**Warum es so schwer ist:** 6 Pizzasorten auf 8×8 (wenige Treffer), falscher Tausch kostet 3 Sekunden, keine Tipps, der Ofen verbrennt laufend Stücke (zuerst alle 5,5 s, am Ende alle 1,8 s). Verbrannte Stücke blockieren und lassen sich nur durch einen Treffer direkt daneben oder ein Spezialteil entfernen. Gibt es keinen Zug mehr: neu mischen, −5 Sekunden. Spezialteile geben +1 bzw. +2 Sekunden. Alle Werte stehen oben im Skript in `CFG`.

**Spezialteile:** 4 in einer Reihe = Pizzaroller (räumt Zeile/Spalte), L- oder T-Form = Ofen (3×3), 5 in einer Reihe = Goldenes Blech (mit einem Belag tauschen räumt alle dieser Sorte).

**Musik:** Liegt eine `musik.mp3` neben `pizza.html`, läuft dieser Song in Dauerschleife (in den letzten 15 Sekunden leicht schneller). Fehlt sie, läuft ein eingebauter Boom-Bap-Beat. Die MP3 gehört nicht ins Repo (steht in `.gitignore`). Öffentliche Wiedergabe von fremder Musik im Restaurant braucht eine GEMA-Lizenz. Startet beim ersten Antippen (Browser-Vorgabe). Knopf „TON AN“ unten links.

**Logo:** Im Spiel ist die Wolke nachgezeichnet (wie das Schild im Laden). Das echte Logo als `pizzawolke-logo.png` neben `pizza.html` legen, dann wird es automatisch überall verwendet.

**Scoreboard:** wird nur auf diesem Gerät gespeichert (Browser-Speicher). Ein einfacher Namensfilter blockt gängige Beleidigungen. Verwalten: Logo auf dem Titelbildschirm 4 Sekunden gedrückt halten (oder Strg+Umschalt+A) – einzelne Einträge, heute oder alles löschen.

**Als Automat im Laden (Kiosk):** Tablet oder Mini-PC mit Touchscreen, Chrome im Kiosk-Modus starten, z. B.
`chrome --kiosk --autoplay-policy=no-user-gesture-required file:///pfad/zu/pizza.html`
Den Browser-Speicher nicht automatisch löschen lassen, sonst ist das Scoreboard weg.
