## MODIFIED Requirements

### Requirement: Live-Timeline einer Session
Das Dashboard SHALL fuer die gewaehlte Session eine zeitlich geordnete Live-Timeline anzeigen. Jede sichtbare Timeline-Aktivitaet MUST einen kompakten, lokal formatierten Zeitstempel enthalten. Die Timeline MUST sichtbares Reasoning, Tool-Aktivitaet, aus dem Sitzungs-Diff abgeleitete Dateiedits, Todos, Berechtigungsanfragen und Fehler erkennbar darstellen und Ereignisse anderer Sessions ausschliessen.

#### Scenario: Aktivitaet der gewaehlten Session
- **WHEN** ein zuordenbares OpenCode-Ereignis fuer die gewaehlte Session eintrifft
- **THEN** erscheint es in der Timeline mit lokal formatiertem Zeitstempel und Kategorie

#### Scenario: Dateiedit wird erkannt
- **WHEN** der Monitor eine Aenderung im Sitzungs-Diff der gewaehlten Session erkennt
- **THEN** erscheint der Dateiedit mit dem Zeitpunkt der Erkennung und der Kategorie `EDIT` in der Timeline

#### Scenario: Aktivitaet einer anderen Session
- **WHEN** ein OpenCode-Ereignis einer nicht gewaehlten Session eintrifft
- **THEN** erscheint es nicht in der Timeline der gewaehlten Session
