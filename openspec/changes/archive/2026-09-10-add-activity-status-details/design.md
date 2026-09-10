## Context

Der Renderer verarbeitet Tool-Events getrennt und zeigt bei Fortschritt, Erfolg und Fehler oft nur eine Call-ID. OpenCode liefert bei Tool-Start die Eingabe und bei Message-Part-Updates den vollstaendigen Tool-State; aktuelle Events liefern ausserdem Shell-Befehl, strukturierte Eingabe, Fortschritt und Fehlerdaten. Der Store besitzt bereits den sessionbezogenen Timeline-Puffer.

## Goals / Non-Goals

**Goals:**

- Toolcalls ueber ihre `callID` korrelieren, damit Statusaenderungen aussagekraeftig bleiben.
- Alle in einem Ereignis vorhandenen Details verwenden und kompakt begrenzen.
- Statusdetails aus OpenCode sichtbar machen, ohne Aktivitaet zu erfinden.

**Non-Goals:**

- Toolausgaben vollstaendig speichern oder nachladen.
- Fehlende Tooldetails aus Text oder anderen Sessions ableiten.
- Neue Steueraktionen im Dashboard anbieten.

## Decisions

### Call-ID-gebundener Toolkontext

Der Store haelt pro Session einen begrenzten Index aus `callID` zu Toolname und Start-Eingabe. Start- und Part-Events aktualisieren ihn; danach können Pending-, Progress-, Success- und Failed-Ereignisse denselben Kontext anzeigen. Unbekannte Call-IDs zeigen nur die Ereignisdaten und kennzeichnen keinen erfundenen Toolnamen.

### Ereignisspezifische Details

Shell-Start zeigt `command`; Tool-Start zeigt die serialisierte `input`; Tool-Part-States zeigen `input`, `title`, `output` oder `error`; Fortschrittsereignisse verwenden ihr strukturiertes Payload oder Content, wenn textuell darstellbar. Session `retry` zeigt Nachricht und geplanten Zeitpunkt, `busy` und `idle` zeigen nur ihren tatsächlich gelieferten Zustand.

### Kompakte, sichere Anzeige

Vorhandene Laengenbegrenzung gilt pro Detailwert. Beschriftete Segmente wie `input=`, `progress=` und `error=` halten mehrere Felder unterscheidbar. Keine neue Geheimniserkennung wird versprochen; Daten stammen ausschließlich aus der bereits von OpenCode gelieferten Timeline.

## Risks / Trade-offs

- [Mehrere Events je Toolcall machen die Timeline lauter] -> Jeder Eintrag bleibt begrenzt und liefert bei Zustandswechsel einen spezifischen Wert.
- [Unterschiedliche OpenCode-Versionen liefern andere Felder] -> Optionale Felder defensiv lesen und bei fehlenden Details den vorhandenen Status rendern.
- [Detailwerte enthalten sensible Befehlsargumente] -> Daten bleiben im bestehenden localhost-gebundenen Dashboard und werden nicht zusätzlich nachgeladen.
