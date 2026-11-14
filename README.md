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
