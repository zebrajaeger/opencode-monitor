## MODIFIED Requirements

### Requirement: Live-Timeline einer Session
Das Dashboard SHALL fuer die gewaehlte Session eine zeitlich geordnete Live-Timeline anzeigen. Jede sichtbare Timeline-Aktivitaet MUST einen kompakten, lokal formatierten Zeitstempel enthalten. Die Timeline MUST sichtbares Reasoning, Tool-Aktivitaet, aus dem Sitzungs-Diff abgeleitete Dateiedits, Todos, Berechtigungsanfragen und Fehler erkennbar darstellen und Ereignisse anderer Sessions ausschliessen. Tool-Aktivitaeten MUST den Toolnamen, Status und eine lesbare, begrenzte Beschreibung der von OpenCode gelieferten Eingabe zeigen.

#### Scenario: Aktivitaet der gewaehlten Session
- **WHEN** ein zuordenbares OpenCode-Ereignis fuer die gewaehlte Session eintrifft
- **THEN** erscheint es in der Timeline mit lokal formatiertem Zeitstempel und Kategorie

#### Scenario: Dateiedit wird erkannt
- **WHEN** der Monitor eine Aenderung im Sitzungs-Diff der gewaehlten Session erkennt
- **THEN** erscheint der Dateiedit mit dem Zeitpunkt der Erkennung und der Kategorie `EDIT` in der Timeline

#### Scenario: Shell-Befehl startet
- **WHEN** OpenCode einen Shell-Befehl fuer die gewaehlte Session startet
- **THEN** zeigt die Timeline den konkreten Befehl mit Kategorie `TOOL` und Status `running` an

#### Scenario: Strukturiertes Tool startet
- **WHEN** OpenCode ein Tool mit strukturierter Eingabe fuer die gewaehlte Session startet
- **THEN** zeigt die Timeline Toolname, Status und eine begrenzte lesbare Eingabebeschreibung an

#### Scenario: Lange Tool-Eingabe
- **WHEN** eine Tool-Eingabe die festgelegte Darstellungslaenge ueberschreitet
- **THEN** kuerzt das Dashboard die sichtbare Eingabebeschreibung eindeutig

#### Scenario: Aktivitaet einer anderen Session
- **WHEN** ein OpenCode-Ereignis einer nicht gewaehlten Session eintrifft
- **THEN** erscheint es nicht in der Timeline der gewaehlten Session
