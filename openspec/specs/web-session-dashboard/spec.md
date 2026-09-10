# web-session-dashboard Specification

## Purpose

Stellt eine lokale Browseroberflaeche bereit, um OpenCode-Sitzungen, ihre Live-Aktivitaet und ihre Ausfuehrungsumgebung sicher zu beobachten.

## Requirements

### Requirement: Lokales Dashboard und Session-Auswahl
Der Monitor SHALL ein Browser-Dashboard auf einem lokalen Loopback-Webserver bereitstellen. Die Oberflaeche MUST alle verfuegbaren Sessions mit Titel und aktuellem Status anzeigen und dem Nutzer erlauben, genau eine Session auszuwaehlen. Der Webserver MUST standardmaessig ausschliesslich an `127.0.0.1` gebunden sein. Wenn OpenCode fuer einen Sessionstatus weitere Informationen liefert, MUST das Dashboard diese zusammen mit dem Status lesbar darstellen.

#### Scenario: Dashboard wird lokal aufgerufen
- **WHEN** der Nutzer den Monitor startet
- **THEN** ist das Dashboard ueber eine `127.0.0.1`-Adresse erreichbar und keine Netzwerkadresse ausserhalb von Loopback wird als Listener verwendet

#### Scenario: Session wird ausgewaehlt
- **WHEN** der Nutzer eine Session aus der Liste waehlt
- **THEN** zeigt das Dashboard deren Titel, Status und Detailansicht an

#### Scenario: Sessionstatus aendert sich
- **WHEN** OpenCode einen neuen Status fuer eine sichtbare Session meldet
- **THEN** aktualisiert das Dashboard den Status der entsprechenden Session ohne eine Browseraktualisierung

#### Scenario: Retry-Status enthaelt Details
- **WHEN** OpenCode einen Retry-Status mit Nachricht oder naechstem Versuchstermin meldet
- **THEN** zeigt das Dashboard diese Details zusammen mit dem Status an

### Requirement: Live-Timeline einer Session
Das Dashboard SHALL fuer die gewaehlte Session eine zeitlich geordnete Live-Timeline anzeigen. Jede sichtbare Timeline-Aktivitaet MUST einen kompakten, lokal formatierten Zeitstempel enthalten. Die Timeline MUST sichtbares Reasoning, Tool-Aktivitaet, aus dem Sitzungs-Diff abgeleitete Dateiedits, Todos, Berechtigungsanfragen und Fehler erkennbar darstellen und Ereignisse anderer Sessions ausschliessen. Tool-Aktivitaeten MUST den Toolnamen, Status und eine lesbare, begrenzte Beschreibung der von OpenCode gelieferten Eingabe zeigen. Fuer `pending`, `running`, `completed` und `error` MUST die Timeline alle jeweils verfuegbaren Details zum Tool-Call anzeigen, einschliesslich der zuvor bekannten Eingabe, eines Fortschrittstitels oder der Fehlermeldung.

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

#### Scenario: Laufender Tool-Call liefert Fortschritt
- **WHEN** OpenCode fuer einen bekannten Tool-Call einen `pending`- oder `running`-Status mit Titel, Fortschritt oder Call-ID liefert
- **THEN** zeigt die Timeline den Toolnamen, den Status sowie alle verfuegbaren Details einschliesslich der zuvor bekannten Eingabe

#### Scenario: Abgeschlossener oder fehlgeschlagener Tool-Call
- **WHEN** OpenCode einen `completed`- oder `error`-Status fuer einen bekannten Tool-Call liefert
- **THEN** zeigt die Timeline den Toolnamen, Status und die verfuegbare Ausgabe oder Fehlermeldung zusammen mit der zuvor bekannten Eingabe

#### Scenario: Lange Tool-Eingabe
- **WHEN** eine Tool-Eingabe die festgelegte Darstellungslaenge ueberschreitet
- **THEN** kuerzt das Dashboard die sichtbare Eingabebeschreibung eindeutig

#### Scenario: Aktivitaet einer anderen Session
- **WHEN** ein OpenCode-Ereignis einer nicht gewaehlten Session eintrifft
- **THEN** erscheint es nicht in der Timeline der gewaehlten Session

### Requirement: Sichtbare OpenCode-Umgebung
Das Dashboard SHALL die durch OpenCode lesend gemeldete Ausfuehrungsumgebung anzeigen. Dazu MUST es verfuegbare Agents und Tools sowie den Status von MCP-Servern, LSP-Servern und Formatters anzeigen. Nicht durch eine lesende OpenCode-API ermittelbare Plugin-Informationen MUST nicht als vollstaendig oder aktiv behauptet werden.

#### Scenario: Verbundener MCP-Server
- **WHEN** OpenCode einen MCP-Server als verbunden meldet
- **THEN** zeigt das Dashboard dessen Namen und den Status `connected` an

#### Scenario: Plugin-Information ist nicht verfuegbar
- **WHEN** OpenCode keine lesende Pluginliste liefert
- **THEN** zeigt das Dashboard keine vermeintlich vollstaendige Liste aktiver Plugins an

### Requirement: Session- und beobachtete Agentenhierarchie
Das Dashboard SHALL eine Hierarchie aus den von OpenCode gelieferten Eltern-/Kind-Sessions darstellen. Es MUST ausserdem beobachtete Agenten und Subtasks aus laufenden Ereignissen als best-effort Laufzeitansicht kennzeichnen, statt deren Vollstaendigkeit zu behaupten.

#### Scenario: Child-Session ist vorhanden
- **WHEN** OpenCode fuer eine Session untergeordnete Sessions liefert
- **THEN** zeigt das Dashboard diese unter der Eltern-Session im Session-Baum an

#### Scenario: Beobachteter Subagent
- **WHEN** ein Agent- oder Subtask-Ereignis fuer die gewaehlte Session eintrifft
- **THEN** zeigt das Dashboard den Agenten oder Subtask als beobachtete Laufzeitaktivitaet an

### Requirement: Read-only Webbeobachtung
Das Dashboard und sein lokaler Webserver MUST OpenCode ausschliesslich ueber lesende Endpunkte beobachten. Das Dashboard MUST keine OpenCode-Sitzungen, Nachrichten, Dateien, Berechtigungen oder Konfigurationen veraendern.

#### Scenario: Browseransicht beobachten
- **WHEN** der Nutzer eine Session im Dashboard betrachtet
- **THEN** sendet der Monitor keine schreibende Anfrage an den OpenCode-Server
