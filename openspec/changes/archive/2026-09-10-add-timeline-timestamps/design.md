## Context

Der zentrale Monitorzustand speichert bereits fuer jeden Timeline-Eintrag einen Millisekunden-Zeitwert (`at`). Die Browseroberflaeche rendert bislang nur Kategorie und Text; eine neue Datenquelle oder ein API-Change ist nicht erforderlich.

## Goals / Non-Goals

**Goals:**

- Jeden sichtbaren Timeline-Eintrag mit einer lokal lesbaren Uhrzeit versehen.
- Den vorhandenen Eingangszeitpunkt fuer Ereignisse und Diff-Erkennungen konsistent verwenden.
- Die Uhrzeit in der kompakten Timeline lesbar halten.

**Non-Goals:**

- Zeitwerte zwischen Rechnern oder Zeitzonen synchronisieren.
- Historische OpenCode-Zeitstempel rekonstruieren oder die Timeline persistieren.
- Dauerberechnungen, Filter oder eine konfigurierbare Zeitformatierung einführen.

## Decisions

### Browserlokales Zeitformat

Die Browseransicht formatiert `TimelineEntry.at` mit der lokalen Browserzeitzone als `HH:MM:SS`. Damit entspricht die Darstellung der Uhr des Nutzers und es ist keine Zeitzonenlogik im lokalen Server erforderlich.

ISO-8601-Zeitwerte waeren eindeutiger, beanspruchen aber mehr horizontalen Platz und verschlechtern den Live-Scan. Relative Zeiten wie "vor 2 Sekunden" verdecken die absolute Reihenfolge beim spaeteren Lesen.

### Zeitstempel als eigene visuelle Spalte

Der Zeitstempel steht vor der Kategorie jeder Zeile und wird gedimmt dargestellt. Er wird fuer jeden Eintrag gerendert, einschliesslich `EDIT`-Eintraegen aus dem Diff-Polling. Die Textinhalte werden unveraendert escaped.

## Risks / Trade-offs

- [Browser- und OpenCode-Serveruhr weichen ab] -> Der Monitor kommuniziert transparent den lokalen Empfangs-/Erkennungszeitpunkt, nicht einen behaupteten Serverzeitpunkt.
- [Schmale Bildschirme] -> Das vorhandene responsive Layout behaelt eine kurze Zeitdarstellung bei und bricht nur die Spalten um.
