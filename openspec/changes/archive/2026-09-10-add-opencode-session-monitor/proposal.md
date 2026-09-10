## Why

OpenCode zeigt den Fortschritt einer Engineering-Sitzung in seiner eigenen Oberflaeche, aber es gibt keinen separaten, leicht startbaren Beobachter. Ein Konsolenmonitor soll die Aktivitaet einer laufenden Konversation nachvollziehbar machen, ohne OpenCode zu steuern oder dessen Ausgabe zu parsen.

## What Changes

- Ein als npm-Paket veroeffentlichbares CLI `opencode-monitor` bereitstellen, das eine bestehende OpenCode-Serverinstanz beobachtet.
- Die Zieladresse per vollstaendiger URL oder per Host und Port konfigurierbar machen.
- Verfuegbare OpenCode-Sitzungen mit ihrem Status anzeigen und interaktiv eine zu beobachtende Konversation waehlen lassen.
- Eine Sitzung mit `--session <id>` ohne interaktive Auswahl beobachten.
- Ereignisse der gewaehlten Sitzung in einer lesbaren, zeitgestempelten Konsolenausgabe darstellen, einschliesslich Status, Reasoning, Tool-Aufrufen, Dateiedits, Todos, Berechtigungsanfragen und Fehlern.
- Die Echtzeitverbindung ausschliesslich lesend ueber die OpenCode-HTTP- und SSE-API herstellen.

## Capabilities

### New Capabilities
- `opencode-session-monitor`: Verbindung zu einem OpenCode-Server herstellen, eine Sitzung auswaehlen und deren Engineering-Ereignisse in Echtzeit in der Konsole anzeigen.

### Modified Capabilities

- Keine.

## Impact

- Neues Node.js-/TypeScript-CLI-Paket mit einer ausfuehrbaren npm-Binariausgabe.
- Abhaengigkeit von der oeffentlichen OpenCode-Server-API, insbesondere Health-, Session-, Status-, Diff- und SSE-Endpunkten; der Monitor verwendet einen kleinen read-only HTTP-Adapter, damit er auch API-Endpunkte abdeckt, die die SDK-Version nicht exponiert.
- Nutzer starten OpenCode mit einer bekannten Serveradresse, beispielsweise `opencode --port 4096`, bevor sie den Monitor verbinden.
