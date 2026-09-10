## Context

Der Monitor verarbeitet bereits die aktuellen OpenCode-Ereignisse `session.next.tool.called` und `session.next.shell.started`, verwirft aber deren `input` beziehungsweise `command`. Die Timeline ist der einzige Ort, an dem Toolaktivitaet sichtbar wird.

## Goals / Non-Goals

**Goals:**

- Den ausgeloesten Shell-Befehl direkt in der Timeline lesbar machen.
- Andere Tool-Eingaben aus dem Event in kompakter Form anzeigen.
- Bestehende Laengenbegrenzungen und Sessionfilterung beibehalten.

**Non-Goals:**

- Vollstaendige Toolausgaben oder neue historische Details laden.
- Toolparameter editierbar machen oder Tool-Aufrufe wiederholen.
- Eine automatische Geheimniserkennung als Sicherheitsversprechen einfuehren.

## Decisions

### Ereignisspezifische Kurzbeschreibungen

`session.next.shell.started` verwendet den gelieferten `command` direkt. `session.next.tool.called` verwendet Toolname und eine kompakt serialisierte `input`-Struktur. Bei Fortschritts-, Erfolgs- oder Fehlerereignissen bleibt der bekannte Call-ID-Status erhalten, weil diese Eventformen keine vollstaendige Eingabe garantieren.

Eine allgemeine JSON-Ausgabe fuer alle Ereignisse waere technisch einfach, aber zu laut und schlechter lesbar. Die Behandlung der zwei konkreten Start-Eventformen deckt den Nutzerfall ab und bleibt kompatibel mit den dokumentierten OpenCode-Payloads.

### Bestehende Begrenzung verwenden

Die vorhandene Textkuerzung begrenzt auch Befehle und serialisierte Eingaben. Der Monitor zeigt nur vom OpenCode-Event bereitgestellte Werte; er liest keine weiteren Dateien oder Ausgaben nach.

## Risks / Trade-offs

- [Befehle enthalten Geheimnisse] -> Der Monitor zeigt dieselben Eingaben, die OpenCode fuer den Toolaufruf liefert; Nutzer sollen den Loopback-Monitor nur in vertrauenswuerdigen lokalen Browsern nutzen.
- [Komplexe Eingaben sind schwer lesbar] -> Strukturierte Werte werden kompakt serialisiert und sichtbar gekuerzt.
