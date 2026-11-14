# Preis-Raten

Partyspiel für 1–8 Spieler an einem Gerät: Ein Produkt wird ohne Preis gezeigt, jeder tippt geheim den Preis ein, wer am nächsten dran ist, bekommt einen Punkt (Gleichstand: alle). Standard sind 10 Runden.

## Starten
`index.html` im Browser öffnen. Kein Server, keine Installation.

## Produkte
Die Produkte stehen als Liste `PRODUCTS` oben im `<script>` von `index.html` (Emoji, Kategorie, Name, Beschreibung, Preis in €).
Die Preise sind Richtwerte und veralten. Nach jeder Runde gibt es einen Link, um den aktuellen Preis auf amazon.de nachzuschlagen.

## Warum keine echten Live-Daten von Amazon?
Amazon bietet keine offene Schnittstelle für „zufällige Produkte mit Preis“.
- Scraping verstößt gegen die Nutzungsbedingungen und wird schnell per Captcha geblockt.
- Die offizielle Product Advertising API setzt ein Partnerprogramm-Konto mit regelmäßigen Verkäufen voraus und läuft über einen Server (Schlüssel dürfen nicht in den Browser).
Wer das Konto hat, kann die `PRODUCTS`-Liste über einen kleinen Backend-Dienst befüllen.
