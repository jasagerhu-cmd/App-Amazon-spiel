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

---

# Keine Ahnung!

Zweites Spiel im selben Repo: eine Quizshow mit skurrilen, wahren Fakten aus aller Welt und einem bissigen Kommentator („Kalle aus dem Off“). Für 1–4 Spieler an einem Gerät.

## Starten
`quiz.html` im Browser öffnen. Kein Server, keine Installation.

## Spielmodi
- **Die große Show**: 10 Fragen mit vier Antworten, steigende Einsätze, falsche Antworten kosten Punkte.
- **Wahr oder Quatsch**: 12 Behauptungen im Schnelldurchlauf.
- **Schätz-Duell**: 6 Zahlenfragen, jeder tippt geheim, der nächste Tipp gewinnt.
- **Bis einer heult**: drei Leben, gemischte Fragen, bis nur noch einer steht. Allein mit Bestwert.

Bei mehreren Spielern wird gebuzzert: Tasten Q, P, X, M oder den eigenen Buzzer antippen. Antworten per Klick oder mit den Tasten 1–4.

## Kommentator
Die Bühne ist eine 3D-Szene (three.js r128 von cdnjs, Leuchteffekt-Skripte von jsDelivr): Kalle auf dem Podest, spiegelnder Boden, Lichtwand, Scheinwerferkegel, Konfetti und Kamerafahrten. Schafft ein Gerät die Bildrate nicht, senkt das Spiel erst die Auflösung und schaltet dann den Leuchteffekt ab. Ohne Internet oder ohne WebGL erscheint stattdessen die gezeichnete Figur.

Der Text steht in der Sprechblase. Die Stimme kommt aus der Sprachausgabe des Geräts und lässt sich oben abschalten. Das Spiel wählt automatisch eine deutsche Männerstimme, wenn das Gerät eine hat; im Menü unter „Kalles Stimme“ lässt sich eine andere wählen und probehören.

## Fragen ergänzen
Die Fragen stehen oben im `<script>` von `quiz.html` in drei Listen: `MC` (richtige Antwort immer an erster Stelle, gemischt wird beim Spielen), `TF` (wahr/Quatsch) und `EST` (Schätzfragen mit Zielwert und Toleranz). Jede Frage hat eine Auflösung `f`, die der Kommentator vorliest.

Die Fakten sind aus dem Gedächtnis zusammengestellt und nicht einzeln gegen Quellen geprüft.
