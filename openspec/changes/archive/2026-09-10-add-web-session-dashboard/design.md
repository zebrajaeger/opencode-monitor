## Context

Der aktuelle Monitor ist ein Node.js-CLI mit einem kleinen read-only OpenCode-HTTP-Adapter, SSE-Verarbeitung und Konsolenrenderer. Er kennt bereits Sessions, Status, Session-Diffs und Event-Filterung. Die neue Oberflaeche muss dieselbe OpenCode-Verbindung mehreren Browserbereichen bereitstellen, ohne dass der Browser direkt mit OpenCode verbunden wird.

## Goals / Non-Goals

**Goals:**

- `npx opencode-monitor` als lokalen Browsermonitor bereitstellen.
- Sessionliste, Timeline, Umgebung und Hierarchie aus einer zentralen read-only Verbindung versorgen.
- OpenCode-Reasoning und Projektdaten nur ueber Loopback an den Browser ausliefern.
- Session-Hierarchie und beobachtete Agentenaktivitaet semantisch unterscheiden.

**Non-Goals:**

- OpenCode fernsteuern, Berechtigungen beantworten oder Nachrichten senden.
- Eine externe, mehrbenutzerfaehige oder authentifizierte Webanwendung bereitstellen.
- Historische Ereignisse vollstaendig rekonstruieren oder eine Pluginliste erfinden, falls OpenCode diese nicht lesend anbietet.
- Einen vollwertigen Ersatz der OpenCode-Weboberflaeche bauen.

## Decisions

### Lokaler Node-Webserver als BFF

Das CLI startet einen kleinen HTTP-Server auf `127.0.0.1` mit einem freien Port und oeffnet dessen URL im Standardbrowser. Der Server liefert statische Web-Assets und eine eigene Snapshot-API plus SSE-Stream fuer den Browser. Nur der Node-Prozess kommuniziert mit OpenCode.

Ein Browser, der OpenCode direkt abfragt, waere kleiner, muss aber OpenCode-CORS und spaetere Basic-Auth im Browser behandeln. Der lokale Vermittler behaelt Zugangsdaten und Projektdaten auf dem Rechner, vereinheitlicht den Eventstream und verhindert mehrere gleichartige OpenCode-SSE-Verbindungen.

### Ein Monitorzustand fuer Snapshots und Browser-SSE

Ein `MonitorStore` fuehrt Sessionliste, Status, Environment-Snapshot, Sessionbaum, Timeline-Puffer und beobachtete Agentenaktivitaet. Beim Start laedt er die lesenden Listenendpunkte; anschliessend aktualisiert der eine OpenCode-SSE-Stream den Zustand. Aenderungen werden als Browser-SSE gesendet. Session-Diffs werden weiterhin nur fuer sichtbare oder aktive Sessions in einem begrenzten Intervall abgefragt, damit `file.edited` nicht falsch zugeordnet wird.

Polling allein waere einfacher, verzoegert aber Reasoning und Toolfortschritt sichtbar. Eine direkte SSE-Verbindung je Browserfenster vervielfacht Last und die Zuordnungslogik. Der zentrale Store deckt mehrere Browserclients konsistent ab.

### API-Aufteilung

Der lokale Server bietet:

- `GET /` fuer die Web-App.
- `GET /api/snapshot` fuer Sessions, Umgebung und ggf. gecachte Details.
- `GET /api/events` als Browser-SSE fuer inkrementelle Updates.
- `GET /api/sessions/:id` fuer Sessiondetails, Timeline, Diff und Hierarchie.

Alle Routen bleiben localhost-exklusiv und ohne schreibende HTTP-Methoden. Der Server validiert Session-IDs gegen den bekannten Zustand oder durch lesendes Nachladen.

### Dashboard ohne schweres UI-Framework

Der MVP verwendet statische HTML-, CSS- und browserseitige JavaScript-Assets, die der Node-Server ausliefert. Die Oberflaeche nutzt ein responsives Drei-Bereiche-Layout: Sessionliste, Sessiondetails/Timeline und Umgebung/Hiearchie. Plain DOM-Rendering reicht fuer den kleinen, live aktualisierten Datenbestand und vermeidet einen Frontend-Build-Stack sowie ein zusaetzliches Runtime-Framework.

### Hierarchien ehrlich modellieren

Der Sessionbaum kommt ausschliesslich von `/session/:id/children`. Das Modell kann deswegen Parent-/Child-Relationen stabil darstellen. Eine getrennte Sektion `Observed runtime activity` entsteht aus Agenten-, Subtask- und Toolereignissen und zeigt Quelle, Aktivitaet und beobachteten Status. Sie wird im UI sichtbar als best-effort gekennzeichnet.

### Umgebung aus dokumentierten Endpunkten

Der Adapter ergaenzt lesende Methoden fuer Agents, Tool-IDs, MCP, LSP und Formatter. Das UI zeigt nur Daten, die der Server liefert. Da keine dedizierte Pluginliste vorliegt, wird kein eigenstaendiger Pluginbereich als vollstaendig bezeichnet; MCP-Server sind als solche gelabelt.

## Risks / Trade-offs

- [Lokaler Port ist belegt] -> Auf Port `0` binden und die vom Betriebssystem gewaehlte Adresse ausgeben/oeffnen.
- [Browserstart wird vom Betriebssystem blockiert] -> Die Loopback-URL in der Konsole ausgeben.
- [Viele Reasoning-Deltas vergroessern Speicher und Browserlast] -> Timeline pro Session begrenzen und die vorhandene Textkuerzung anwenden.
- [OpenCode-Eventformen variieren je Version] -> Eventnormalisierung tolerant halten und mit repräsentativen Payloads testen.
- [Session-Diff-Polling erzeugt unnoetige Last] -> Nur ausgewaehlte/aktive Sessions pollen und Intervalle zentral steuern.
- [Agentenaktivitaet nicht vollstaendig beobachtbar] -> Die Laufzeitansicht explizit als best-effort kennzeichnen und nicht mit dem Sessionbaum vermischen.

## Migration Plan

1. Bestehende CLI-Adressoptionen und read-only Adapter beibehalten.
2. Den Standard-Einstieg von Konsolenauswahl auf lokalen Server und Browserstart umstellen.
3. Ein optionaler Konsolenmodus wird nicht im Rahmen dieser Aenderung garantiert.
4. Bei einem Problem kann eine Version vor dem Browser-Dashboard verwendet werden; OpenCode bleibt unveraendert.
