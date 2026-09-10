# opencode-session-monitor Specification

## Purpose

Ermoeglicht das Beobachten laufender OpenCode-Konversationen in einem lokalen, lesbaren Browser-Dashboard.

## Requirements

### Requirement: Konfigurierbare Serververbindung
Das CLI SHALL eine bestehende OpenCode-Serverinstanz als reinen Lese-Client verbinden. Es MUST eine vollstaendige Server-URL oder alternativ Host und Port akzeptieren; widerspruechliche Adressoptionen MUST mit einer erklaerenden Fehlermeldung abgewiesen werden. Ohne Adressoptionen MUST es `http://127.0.0.1:4096` verwenden, vor dem Start des Dashboards die Erreichbarkeit pruefen und anschliessend einen lokalen Browserzugriff auf den Monitor starten.

#### Scenario: Verbindung ueber Standardadresse
- **WHEN** der Nutzer das CLI ohne Adressoption startet und ein OpenCode-Server unter `http://127.0.0.1:4096` erreichbar ist
- **THEN** das CLI verbindet sich mit diesem Server und startet das lokale Browser-Dashboard

#### Scenario: Verbindung ueber explizite URL
- **WHEN** der Nutzer eine vollstaendige Server-URL angibt
- **THEN** das CLI verwendet diese URL fuer alle lesenden Anfragen an den OpenCode-Server

#### Scenario: Widerspruechliche Adressoptionen
- **WHEN** der Nutzer eine Server-URL zusammen mit Host oder Port angibt
- **THEN** das CLI beendet sich ohne Beobachtung mit einer erklaerenden Fehlermeldung

#### Scenario: Unerreichbarer Server
- **WHEN** die konfigurierte Serveradresse nicht erreichbar ist oder keine erfolgreiche Health-Antwort liefert
- **THEN** das CLI beendet sich ohne Beobachtung mit der Adresse und einem Hinweis zum Starten oder Pruefen von OpenCode

### Requirement: Auswahl einer Konversation
Das CLI SHALL die auf dem verbundenen Server verfuegbaren OpenCode-Sitzungen und deren aktuellen Status anzeigen, wenn keine Sitzungs-ID angegeben wurde. Der Nutzer MUST interaktiv genau eine Sitzung zur Beobachtung auswaehlen koennen. Mit `--session <id>` MUST das CLI die angegebene Sitzung ohne interaktive Auswahl verwenden und bei einer unbekannten Sitzung mit einer Fehlermeldung abbrechen.

#### Scenario: Interaktive Sitzungsauswahl
- **WHEN** der Nutzer keine Sitzungs-ID angibt und der Server Sitzungen bereitstellt
- **THEN** das CLI zeigt je Sitzung mindestens Titel, Kurz-ID und aktuellen Status und fordert zur Auswahl auf

#### Scenario: Direkte Sitzungsauswahl
- **WHEN** der Nutzer eine existierende Sitzungs-ID mit `--session` angibt
- **THEN** das CLI beginnt die Beobachtung dieser Sitzung ohne eine Auswahlliste anzuzeigen

#### Scenario: Keine verfuegbaren Sitzungen
- **WHEN** der Server keine Sitzungen zurueckgibt
- **THEN** das CLI informiert den Nutzer und beendet sich ohne eine Beobachtung zu starten

### Requirement: Echtzeitdarstellung der gewaehlten Sitzung
Das CLI SHALL einen Echtzeit-Ereignisstream des OpenCode-Servers konsumieren und nur Ereignisse der gewaehlten Sitzung ausgeben. Die Konsolenausgabe MUST zeitgestempelt und lesbar sein und Statusaenderungen, Reasoning-Inhalte, Tool-Aufrufe mit Fortschritts- oder Endstatus, Dateiedits, Todo-Aktualisierungen, Berechtigungsanfragen und Fehler erkennbar machen. Da globale Dateiedit-Ereignisse keine Sitzungs-ID enthalten, MUST das CLI Dateiedits ausschliesslich aus dem lesenden Sitzungs-Diff der gewaehlten Sitzung ableiten. Ereignisse anderer Sitzungen MUST nicht in der beobachteten Ausgabe erscheinen.

#### Scenario: Tool-Ausfuehrung in der gewaehlten Sitzung
- **WHEN** ein Tool-Aufruf in der gewaehlten Sitzung startet oder seinen Status aendert
- **THEN** das CLI gibt den Tool-Namen und den aktuellen Status mit Zeitstempel aus

#### Scenario: Sichtbares Reasoning
- **WHEN** ein Reasoning-Teil fuer die gewaehlte Sitzung ueber den Ereignisstream eintrifft
- **THEN** das CLI gibt dessen Inhalt als Reasoning-Ausgabe mit Zeitstempel aus

#### Scenario: Ereignis einer anderen Sitzung
- **WHEN** der Server ein Ereignis mit einer anderen Sitzungs-ID sendet
- **THEN** das CLI gibt dieses Ereignis nicht im Stream der gewaehlten Sitzung aus

#### Scenario: Berechtigungsanfrage
- **WHEN** OpenCode eine Berechtigungsanfrage fuer die gewaehlte Sitzung erzeugt
- **THEN** das CLI macht den wartenden Zustand und den von OpenCode gelieferten Titel der Anfrage sichtbar

#### Scenario: Dateiedit der gewaehlten Sitzung
- **WHEN** sich der lesend abgefragte Sitzungs-Diff der gewaehlten Sitzung um eine Datei erweitert oder fuer eine Datei aendert
- **THEN** das CLI gibt diese Datei als Dateiedit mit Zeitstempel aus

### Requirement: Lesen ohne Steuerung
Das CLI MUST fuer das Beobachten keine OpenCode-Sitzung, Nachricht, Datei, Berechtigung oder Konfiguration veraendern. Es MUST keine Eingaben an die beobachtete OpenCode-TUI senden.

#### Scenario: Beobachtung einer aktiven Sitzung
- **WHEN** ein Nutzer eine laufende Sitzung beobachtet
- **THEN** verwendet das CLI nur lesende Endpunkte und der Zustand der OpenCode-Sitzung bleibt durch den Monitor unveraendert
