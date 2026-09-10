## Why

Laufende und wartende Aktivitaeten erscheinen im Dashboard oft nur als Toolname und Status. Nutzer brauchen die jeweils bekannten Details auch vor Abschluss, um den Engineering-Loop verfolgen zu koennen.

## What Changes

- Tool-Statuszeilen fuer `pending`, `running`, `completed` und `error` mit den jeweils verfuegbaren Eingabe-, Titel-, Fortschritts- oder Ergebnisdetails anreichern.
- Sessionstatus `busy`, `retry` und `idle` mit allen von OpenCode gelieferten Statusdetails darstellen, sofern vorhanden.
- Den zuletzt bekannten Toolnamen und die Eingabe ueber Statusereignisse derselben Tool-Call-ID hinweg behalten.

## Capabilities

### New Capabilities

- Keine.

### Modified Capabilities

- `web-session-dashboard`: Die Timeline stellt fuer Tool- und Sessionstatus die jeweils verfuegbaren Aktivitaetsdetails dar.

## Impact

- Eventnormalisierung, zustandsbehaftete Tool-Call-Korrelation und Timeline-Rendering.
- Ausschliesslich bereits empfangene read-only OpenCode-Ereignisdaten; keine neuen API-Schreibzugriffe.
