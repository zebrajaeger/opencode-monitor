## Why

Die Konsolenausgabe macht die Live-Aktivitaet einer einzelnen OpenCode-Sitzung sichtbar, ist aber ungeeignet, um Sessions zu vergleichen, Aktivitaet zu durchsuchen oder die laufende Agentenstruktur zu erfassen. Ein lokales Browser-Dashboard soll diese Informationen ohne schreibenden Zugriff auf OpenCode zusammenfuehren.

## What Changes

- **BREAKING** `npx opencode-monitor` startet standardmaessig einen lokalen Webserver und oeffnet das Dashboard im Browser statt einen interaktiven Konsolenmonitor zu starten.
- Sessions mit Live-Status in einer auswählbaren Browserliste darstellen.
- Eine gewaehlte Sitzung als Live-Timeline mit Reasoning, Tool-Aktivitaet, Diffs, Todos, Berechtigungsanfragen und Fehlern darstellen.
- OpenCode-Umgebung mit verfuegbaren Agents, Tools sowie MCP-, LSP- und Formatter-Status anzeigen.
- Einen stabilen Session-Baum und eine klar als best-effort gekennzeichnete Laufzeitansicht beobachteter Agents und Subtasks anzeigen.
- Den lokalen Monitor-Webserver standardmaessig ausschliesslich an `127.0.0.1` binden und OpenCode weiterhin nur lesend abfragen.

## Capabilities

### New Capabilities
- `web-session-dashboard`: Lokales Browser-Dashboard zum Auswaehlen und Beobachten von OpenCode-Sitzungen sowie zur Anzeige der OpenCode-Umgebung und Agentenaktivitaet.

### Modified Capabilities
- `opencode-session-monitor`: Der Standardstart wechselt von der Konsolenauswahl zur lokalen Browseroberflaeche, ohne die read-only Beobachtungsgarantie zu aendern.

## Impact

- Das bestehende TypeScript-CLI wird um einen lokalen HTTP-Server, Browserstart und Web-Assets erweitert.
- Zusaetzliche lesende OpenCode-Endpunkte: Agents, Tool-IDs, MCP, LSP, Formatter, Session-Children und Nachrichten-/Eventdaten.
- Keine externe Bereitstellung: Reasoning, Tooldaten und Dateidiffs bleiben auf der lokalen Loopback-Adresse.
