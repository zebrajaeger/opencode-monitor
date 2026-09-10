## Why

Die Dashboard-Timeline zeigt Kategorie und Inhalt, aber nicht, wann eine Aktivitaet stattgefunden hat. Zeitstempel machen die Reihenfolge, Dauer und Leerlaufphasen einer OpenCode-Sitzung nachvollziehbar.

## What Changes

- Jede Timeline-Zeile im Browser-Dashboard um einen lokal formatierten Zeitstempel ergaenzen.
- Den Zeitpunkt beim Eingang des zugeordneten OpenCode-Ereignisses oder beim Erkennen eines Sitzungs-Diff verwenden.
- Die Zeitdarstellung kompakt und fuer alle Timeline-Kategorien einheitlich halten.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `web-session-dashboard`: Die Live-Timeline stellt zu jeder sichtbaren Aktivitaet einen Zeitstempel dar.

## Impact

- Browserseitige Timeline-Darstellung und deren Tests.
- Der bestehende Zeitwert der Timeline-Eintraege wird als Anzeigegrundlage verwendet; keine neue OpenCode-Anfrage oder Persistenz ist erforderlich.
