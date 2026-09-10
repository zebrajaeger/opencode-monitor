## Context

Das Repository besitzt noch keine Anwendungsimplementierung. OpenCode stellt fuer bestehende Instanzen eine HTTP-API bereit: Health- und Session-Abfragen liefern den Startzustand, der SSE-Endpunkt `/event` liefert die laufenden Ereignisse. Das Datenmodell ordnet die meisten Ereignisse einer `sessionID` zu; Tool-, Reasoning- und andere Message-Parts enthalten die Sitzungs-ID direkt. Siehe `proposal.md` und die Delta-Spezifikation fuer den Produktumfang.

## Goals / Non-Goals

**Goals:**

- Ein npm-faehiges TypeScript-CLI aufbauen, das als `npx opencode-monitor` gestartet werden kann.
- Nur lesende API-Aufrufe nutzen und die Ereignisse einer explizit ausgewaehlten Sitzung filtern.
- Die Konsole bei vielen Teilereignissen verstaendlich halten, ohne Reasoning zu verbergen.
- Fehler bei Adresse, Authentifizierung, Serververbindung und Session-Auswahl konkret ausweisen.

**Non-Goals:**

- OpenCode starten, steuern oder eine Berechtigungsentscheidung abgeben.
- Sitzungen, Nachrichten, Dateien oder Konfiguration speichern oder veraendern.
- Mehrere Sitzungen gleichzeitig, eine TUI, Web-Oberflaeche, Persistenz oder serveruebergreifende Discovery anbieten.
- Die Vollstaendigkeit einer historischen Sitzung rekonstruieren; der MVP zeigt den Stream ab dem Verbindungszeitpunkt.

## Decisions

### OpenCode ueber read-only HTTP und SSE anbinden

Der Monitor verwendet einen kleinen read-only HTTP-Adapter gegen eine bereits laufende Basis-URL. Er prueft die Verbindung mit dem Health-Endpunkt, ruft Sitzungen, Status und Sitzungs-Diffs ab und konsumiert anschliessend den SSE-Stream `/event`.

Die aktuell verfuegbare SDK-Version exponiert den dokumentierten Health-Endpunkt nicht einheitlich und umfasst parallele API-Generationen. Direkte `fetch`-Aufrufe vermeiden diese Versionskopplung und halten die erlaubte read-only Oberflaeche explizit. Ein Plugin bietet tiefere Integration, wuerde jedoch die zu beobachtende OpenCode-Instanz konfigurieren und widerspricht dem Ziel eines separaten, passiven Clients.

### Adressoptionen eindeutig aufloesen

Das CLI akzeptiert `--url` als vollstaendige Basis-URL oder `--host` und `--port` als Komponenten. `--url` darf nicht mit `--host` oder `--port` kombiniert werden. Fehlen alle Optionen, wird `http://127.0.0.1:4096` verwendet. Die Eingaben werden vor jedem Netzwerkzugriff zu einer normalisierten Basis-URL aufgeloest.

Eine automatische Port-Erkennung wird nicht umgesetzt: OpenCode waehlt bei einer TUI ohne `--port` einen zufaelligen Port, und die API garantiert kein lokales Discovery-Protokoll. Nutzer erhalten deshalb eine konkrete Startanleitung.

### Sitzung vor Stream-Verbindung bestimmen

Zunaechst liest der Monitor Session-Liste und Status-Mapping. Ohne `--session` waehlt der Nutzer in einem terminalkompatiblen Prompt aus einer Liste mit Titel, gekuerzter ID, Status und letzter Aktualisierung. Mit `--session` wird die Existenz zuerst verifiziert. Danach startet genau ein Event-Stream.

Diese Reihenfolge verhindert, dass der Monitor Ereignisse waehrend einer Auswahl in den Terminalprompt schreibt. Sie ist einfacher als eine laufend aktualisierte Auswahlansicht und deckt den MVP ab.

### Normalisierte Ereignisse mit sessionID filtern und Sitzungs-Diff beobachten

Eine kleine Ereignisnormalisierung extrahiert die `sessionID` aus den verschiedenen Event-Formen. Nur passende Events gehen an den Renderer. Sitzungsuebergreifende Ereignisse ohne Session-Bezug werden ignoriert.

`file.edited` ist ein globales Ereignis ohne Sitzungs-ID und kann daher nicht sicher gefiltert werden. Der Monitor ignoriert es und fragt waehrend der Beobachtung in einem begrenzten Intervall den read-only Endpoint `/session/:id/diff` fuer die ausgewaehlte Sitzung ab. Er merkt sich den zuletzt bekannten Diff je Datei und rendert nur neue oder veraenderte Diff-Eintraege als `EDIT`. Dies weist Aenderungen verlässlich der beobachteten Sitzung zu, ohne eine globale Aktivitaet zu erraten.

Der Renderer unterscheidet Kategorien wie `STATUS`, `THINK`, `TOOL`, `EDIT`, `TODO`, `PERMISSION` und `ERROR`. Reasoning-Deltas werden mit `THINK` ausgegeben. Tool-States werden als Zustandswechsel dargestellt und Ausgaben gekuerzt, damit umfangreiche Shell-Ausgaben den Live-Stream nicht unlesbar machen. Das genaue Zeilenlayout bleibt eine austauschbare Renderentscheidung, die normativen Inhalte stehen in der Spezifikation.

### Keine schreibenden Clientmethoden exponieren

Die Anwendungslogik kapselt den SDK-Client hinter einem schmalen read-only Adapter. Dieser Adapter umfasst nur Health, Session-Liste, Session-Status, einzelne Session-Verifikation und Event-Abonnement. Schreibende SDK-Fluent-APIs werden in den Monitorablauf nicht importiert oder aufgerufen.

## Risks / Trade-offs

- [OpenCode-API- oder Eventtypen aendern sich] -> Adapter/Renderer gegen repräsentative Event-Payloads testen und den kleinen HTTP-Adapter an die dokumentierte API anpassen.
- [SSE-Verbindung wird getrennt] -> Verbindungsabbruch klar ausgeben; automatisches Reconnect bleibt fuer den MVP bewusst ausgeschlossen, damit keine Ereignisluecken verdeckt werden.
- [Reasoning-Streaming erzeugt viele Deltas] -> Deltas formatieren und pro Zeile begrenzen; nach realer Nutzung koennen ein Kompaktmodus oder Filteroptionen folgen.
- [Passwortgeschuetzter Server] -> Die HTTP-Authentifizierung des SDK-Clients gezielt untersuchen und bei fehlenden Zugangsdaten eine klare Fehlermeldung ausgeben; Credential-Management ist nicht Teil des MVP.
- [Einige API-Ereignisse sind nicht eindeutig einer Sitzung zuordenbar] -> Nur Ereignisse mit sicherem Sitzungsbezug darstellen; Dateiedits aus dem Sitzungs-Diff ableiten statt globale Events falsch zuzuordnen.

## Migration Plan

1. Das Paket mit `bin`-Eintrag als `opencode-monitor` veroeffentlichen.
2. Nutzungsdokumentation mit `opencode --port 4096` und den Monitor-Optionen bereitstellen.
3. Kein Daten- oder Konfigurations-Migrationsschritt ist erforderlich, da das CLI im MVP keinen Zustand persistiert.
4. Bei Problemen kann die Paketversion zurueckgezogen oder auf die vorherige Version gesetzt werden; OpenCode selbst bleibt unveraendert.

Ein passwortgeschuetzter Server antwortet ohne Zugangsdaten mit HTTP 401; der Monitor gibt diese Antwort mit der Serveradresse aus. Die Eingabe oder Speicherung von Zugangsdaten bleibt ausserhalb des MVP.
