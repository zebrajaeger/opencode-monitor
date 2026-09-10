## Why

Die Timeline reduziert Tool-Aktivitaet aktuell auf Name und Status, wodurch zentrale Engineering-Schritte wie ausgefuehrte Shell-Befehle nicht nachvollziehbar sind. Der Monitor soll die von OpenCode gelieferten Tool-Eingaben lesbar anzeigen.

## What Changes

- Tool-Timelineeintraege um eine sichere Kurzbeschreibung ihres Eingabeinhalts erweitern.
- Shell-Events als den konkreten Befehl statt nur als `Bash running` darstellen.
- Strukturierte Tool-Eingaben lesbar und begrenzt anzeigen, ohne Tool-Ausgaben oder geheime Daten zusaetzlich zu erfassen.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `web-session-dashboard`: Tool-Aktivitaet in der Session-Timeline zeigt die von OpenCode gelieferte Eingabe als Detail an.

## Impact

- OpenCode-Eventnormalisierung, Timeline-Rendering und Tests.
- Keine neuen Endpunkte oder schreibenden OpenCode-Zugriffe.
