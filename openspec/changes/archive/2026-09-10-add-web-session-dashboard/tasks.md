## 1. Monitor-Datenmodell und OpenCode-Adapter

- [x] 1.1 Den read-only OpenCode-Adapter um Agents, Tool-IDs, MCP, LSP, Formatter und Session-Children erweitern und jede Anfrage mit gemockten erfolgreichen und Fehlerantworten testen
- [x] 1.2 Zentralen Monitorzustand fuer Sessions, Status, Umgebung, Timeline-Puffer, Sessionbaum und beobachtete Laufzeitaktivitaet implementieren und die Event-getriebene Aktualisierung mit Unit-Tests verifizieren
- [x] 1.3 Die Session-Diff-Aktualisierung fuer sichtbare oder aktive Sessions im zentralen Zustand begrenzen und Dateiedits aus den Diffs durch Tests verifizieren

## 2. Lokaler Webserver und Browser-Einstieg

- [x] 2.1 Einen HTTP-Server implementieren, der ausschliesslich an `127.0.0.1` mit einem freien Port bindet, und das Binding in einem Integrationstest verifizieren
- [x] 2.2 Snapshot-, Sessiondetail- und Browser-SSE-Routen implementieren und mit HTTP-Tests fuer Status, Datenform und inkrementelle Updates verifizieren
- [x] 2.3 Den CLI-Einstieg auf Health-Pruefung, Serverstart, Ausgabe der lokalen URL und Browserstart umstellen; Browserstart-Ausfall muss die URL weiterhin ausgeben und wird durch Tests verifiziert
- [x] 2.4 Sicherstellen, dass lokale HTTP-Routen keine schreibenden OpenCode-Anfragen ausloesen, und dies durch einen HTTP-Interaktionstest verifizieren

## 3. Browser-Dashboard

- [x] 3.1 Statische, responsive Dashboard-Oberflaeche mit Sessionliste, Detail-/Timelinebereich, Umgebung und Hierarchiebereich erstellen und Desktop- sowie schmale Viewports mit Browser- oder DOM-Tests verifizieren
- [x] 3.2 Sessionauswahl und Live-Aktualisierung ueber Browser-SSE implementieren und das Wechseln der ausgewählten Session ohne Seitenreload testen
- [x] 3.3 Timeline fuer Reasoning, Toolstatus, Diffs, Todos, Berechtigungen und Fehler mit Kategorie und Zeitstempel implementieren und fremde Session-Ereignisse durch UI-Tests ausschliessen
- [x] 3.4 Agents, Tools, MCP, LSP und Formatter aus dem Umgebungs-Snapshot anzeigen; MCP klar labeln und nicht verfuegbare Pluginlisten nicht als vollstaendig darstellen; dies durch Rendering-Tests verifizieren
- [x] 3.5 Sessionbaum aus Child-Sessions und getrennte, sichtbar als best-effort markierte Laufzeitaktivitaet fuer beobachtete Agents/Subtasks implementieren und mit Hierarchiedaten testen

## 4. Dokumentation und Gesamtpruefung

- [x] 4.1 README auf den Browser-Standardstart, Loopback-Sicherheitsgrenze, CLI-Adressoptionen und den read-only Charakter aktualisieren und Beispiele gegen den gebauten CLI-Aufruf pruefen
- [x] 4.2 Gesamte Testsuite, Typscheck, Build, `npm pack --dry-run` und ein lokales Dashboard-Integrationstest-Szenario erfolgreich ausfuehren
