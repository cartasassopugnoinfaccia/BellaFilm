# BellaFilm

Progetto universitario di Programmazione Web: catalogo personale di film e serie TV con backend Express e frontend HTML, CSS e JavaScript vanilla. Le [specifiche iniziali](specifiche/specifiche.md) sono conservate senza modifiche.

## Avvio

Occorrono Node.js 22 o successivo e npm. Dal terminale, nella cartella del repository:

```sh
npm ci
npm start
```

Aprire http://localhost:3000 per utilizzare il catalogo. Per fermare il server: `Ctrl+C`. La porta predefinita è 3000; in PowerShell si può cambiarla con `$env:PORT = '3001'` prima dell'avvio. Non aprire direttamente `index.html`: il server deve servire sia la pagina sia le API.

```sh
npm test
```

I test avviano server temporanei su porte libere e li chiudono automaticamente. Non occorre avviare prima `npm start`.

## API disponibili

| Metodo | Percorso | Risposta |
|---|---|---|
| GET | `/api/titoli` | 200, array di titoli |
| GET | `/api/titoli/:id` | 200, titolo; 400, ID non valido; 404, titolo assente |
| POST | `/api/titoli` | 201, titolo creato; 400, dati non validi |

POST richiede `Content-Type: application/json` e i campi `titolo`, `tipo`, `genere`, `anno`, `stato`. L'ID è assegnato dal server. Gli errori hanno forma `{ "errore": "messaggio" }`.

Il frontend permette di inserire film e serie, consultare le schede e caricare i dettagli. Il modulo controlla i campi durante la digitazione e all'invio. Caricamento, successo, errori e catalogo vuoto hanno messaggi visibili. Il layout si adatta agli schermi stretti.

I dati sono un array in memoria: si perdono al riavvio. Non sono presenti database, autenticazione, ricerca, filtri, modifica o eliminazione. Non ci sono dipendenze frontend né risorse grafiche esterne.

## Documentazione e verifiche

- [Spiegazione del backend ed esercizi per l'esame](docs/spiegazione-backend.md)
- [Spiegazione del frontend ed esercizi per l'esame](docs/spiegazione-frontend.md)
- [Verifiche del frontend e integrazione](docs/verifica-frontend.md)
- [Risultati effettivi dei test](docs/verifica-backend.md)
- [Uso dell'AI in questa fase](docs/uso-ai.md)

L'unica dipendenza diretta è Express; i test usano strumenti inclusi in Node.js.
