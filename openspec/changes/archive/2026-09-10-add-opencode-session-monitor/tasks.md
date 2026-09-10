## 1. Projekt und CLI-Grundlage

- [x] 1.1 Node.js-/TypeScript-Paket mit dem npm-Binaereintrag `opencode-monitor`, Build- und Testskripten einrichten und mit dem gebauten CLI-Help-Aufruf verifizieren
- [x] 1.2 CLI-Optionen `--url`, `--host`, `--port` und `--session` implementieren, die Zieladresse normalisieren und die Ausschlussregel fuer `--url` gegen Host/Port durch CLI-Argumenttests verifizieren
- [x] 1.3 Den read-only OpenCode-Clientadapter mit Health-Pruefung implementieren und durch gemockte erfolgreiche, unerreichbare und nicht erfolgreiche Health-Antworten verifizieren

## 2. Sitzungsermittlung und Auswahl

- [x] 2.1 Session-Liste und Status-Mapping ueber den read-only Adapter abrufen und die darstellbaren Sitzungsdaten mit Unit-Tests verifizieren
- [x] 2.2 Interaktive Auswahl mit Titel, Kurz-ID und Status implementieren sowie leere Listen und ungueltige Eingaben durch Prompt-Tests verifizieren
- [x] 2.3 Direktauswahl mit `--session` implementieren, die Existenz pruefen und den Erfolg sowie den Fehler bei unbekannter ID durch Client- und CLI-Tests verifizieren

## 3. Event-Beobachtung und Darstellung

- [x] 3.1 SSE-Abonnement ueber den read-only Adapter implementieren und dessen Stream-Verarbeitung mit repräsentativen OpenCode-Event-Payloads verifizieren
- [x] 3.2 Sitzungs-ID aus den relevanten Eventformen extrahieren und fremde oder nicht sicher zuordenbare Events filtern; den Sitzungs-Diff periodisch abfragen und neue oder veraenderte Diff-Eintraege als Dateiedits erkennen; dies durch Event- und Diff-Filtertests mit mehreren Sitzungen verifizieren
- [x] 3.3 Zeitgestempelten Konsolenrenderer fuer Status, Reasoning, Tool-Status, aus dem Sitzungs-Diff abgeleitete Dateiedits, Todos, Berechtigungsanfragen und Fehler implementieren und jede Kategorie mit Snapshot- oder Unit-Tests verifizieren
- [x] 3.4 Reasoning-Deltas und Tool-Ausgaben begrenzen bzw. lesbar formatieren, ohne Reasoning zu unterdruecken, und dies mit mehrteiligen Stream-Ereignissen verifizieren
- [x] 3.5 Sicherstellen, dass der Monitor nur lesende Adaptermethoden verwendet und keine schreibenden OpenCode-Endpunkte anfragt; dies durch einen HTTP-Interaktionstest verifizieren

## 4. Paketqualitaet und Nutzung

- [x] 4.1 Das Verhalten mit einer lokalen OpenCode-Testinstanz oder einem dokumentierten API-Fixture-End-to-End pruefen: verbinden, Sitzung auswaehlen, passende Events anzeigen und fremde Events ausblenden
- [x] 4.2 README mit Voraussetzungen, `opencode --port 4096`, allen CLI-Optionen und der read-only Einschränkung erstellen und die Beispiele gegen den CLI-Help-Text pruefen
- [x] 4.3 Abhaengigkeiten, HTTP-401-Verhalten und npm-Pack-Inhalt pruefen; `npm pack --dry-run`, Typscheck und gesamte Testsuite erfolgreich ausfuehren
