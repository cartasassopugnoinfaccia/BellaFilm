# BellaFilm

Progetto universitario di Programmazione Web. Questa fase implementa soltanto il backend previsto in [specifiche/specifiche.md](specifiche/specifiche.md), conservato senza modifiche.

## Avvio

Occorrono Node.js 22 o successivo e npm. Dal terminale, nella cartella del repository:

```sh
npm ci
npm start
```

Aprire http://localhost:3000/api/titoli per vedere inizialmente `[]`. Per fermare il server: `Ctrl+C`. La porta predefinita è 3000; in PowerShell si può cambiarla con `$env:PORT = '3001'` prima dell'avvio.

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

I dati sono un array in memoria: si perdono al riavvio. Non sono presenti frontend, database, autenticazione, filtri, modifica o eliminazione. Il percorso `/` restituisce quindi 404. Il middleware statico è predisposto per `public/`, che contiene soltanto un segnaposto Git.

## Documentazione e verifiche

- [Spiegazione del backend ed esercizi per l'esame](docs/spiegazione-backend.md)
- [Risultati effettivi dei test](docs/verifica-backend.md)
- [Uso dell'AI in questa fase](docs/uso-ai.md)

L'unica dipendenza diretta è Express; i test usano strumenti inclusi in Node.js.
