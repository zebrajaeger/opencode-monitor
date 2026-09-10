## MODIFIED Requirements

### Requirement: Konfigurierbare Serververbindung
Das CLI SHALL eine bestehende OpenCode-Serverinstanz als reinen Lese-Client verbinden. Es MUST eine vollstaendige Server-URL oder alternativ Host und Port akzeptieren; widerspruechliche Adressoptionen MUST mit einer erklaerenden Fehlermeldung abgewiesen werden. Ohne Adressoptionen MUST es `http://127.0.0.1:4096` verwenden, vor dem Start des Dashboards die Erreichbarkeit pruefen und anschliessend einen lokalen Browserzugriff auf den Monitor starten.

#### Scenario: Verbindung ueber Standardadresse
- **WHEN** der Nutzer das CLI ohne Adressoption startet und ein OpenCode-Server unter `http://127.0.0.1:4096` erreichbar ist
- **THEN** das CLI verbindet sich mit diesem Server und startet das lokale Browser-Dashboard

#### Scenario: Verbindung ueber explizite URL
- **WHEN** der Nutzer eine vollstaendige Server-URL angibt
- **THEN** das CLI verwendet diese URL fuer alle lesenden Anfragen an den OpenCode-Server

#### Scenario: Widerspruechliche Adressoptionen
- **WHEN** der Nutzer eine Server-URL zusammen mit Host oder Port angibt
- **THEN** das CLI beendet sich ohne Beobachtung mit einer erklaerenden Fehlermeldung

#### Scenario: Unerreichbarer Server
- **WHEN** die konfigurierte Serveradresse nicht erreichbar ist oder keine erfolgreiche Health-Antwort liefert
- **THEN** das CLI beendet sich ohne Beobachtung mit der Adresse und einem Hinweis zum Starten oder Pruefen von OpenCode
