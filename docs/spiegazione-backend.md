# Capire il backend di BellaFilm

## Node.js ed Express

JavaScript è il linguaggio. Node.js è il programma che esegue JavaScript fuori dal browser, per esempio sul computer che ospita il server. Il paragone con Python è: `python programma.py` esegue Python, mentre `node server.js` esegue JavaScript. Node.js non è un database e non è un linguaggio diverso.

Express è una libreria per Node.js che semplifica la gestione delle richieste HTTP. Possiamo immaginare il server come una segreteria: arriva una richiesta, Express identifica lo sportello giusto (la rotta), il nostro codice controlla i dati e prepara la risposta. `npm` installa le librerie, in modo simile a `pip` per Python.

## I file del progetto

| File | Compito |
|---|---|
| `specifiche/specifiche.md` | Requisiti iniziali, rimasti invariati |
| `package.json` | Nome del progetto, comandi, versione Node richiesta e dipendenza Express |
| `package-lock.json` | Versioni esatte di tutte le dipendenze, incluse quelle usate da Express; permette installazioni ripetibili con `npm ci` |
| `.gitignore` | Esclude dipendenze installate, log e file `.env` da Git |
| `app.js` | Crea l'app Express, l'array, le rotte e la validazione |
| `server.js` | Crea l'app e la mette in ascolto su una porta |
| `errori.js` | Middleware comune per gli errori del parser e gli errori imprevisti |
| `public/.gitkeep` | File vuoto che permette a Git di conservare la cartella destinata ai futuri file statici; non è una pagina web |
| `test/backend.test.js` | Test automatici HTTP, con strumenti già inclusi in Node.js |
| `README.md` | Istruzioni rapide per usare il progetto |
| `docs/spiegazione-backend.md` | Questa guida |
| `docs/verifica-backend.md` | Verifiche realmente eseguite e limiti |
| `docs/uso-ai.md` | Traccia dell'assistenza AI in questa fase |

`node_modules/` viene creata da npm e contiene Express e le sue dipendenze. Non si modifica a mano e non viene pubblicata in Git. In questa fase non esistono pagine HTML, CSS o JavaScript per il browser.

## Dal programma alla richiesta

`require(...)` importa un modulo, con un ruolo simile a `import` in Python. `module.exports` rende disponibile una funzione agli altri file. `server.js` importa `creaApp`, la chiama e avvia l'ascolto con `listen`. La separazione permette ai test di creare app nuove senza occupare sempre la porta 3000.

Dentro `creaApp`, `const titoli = []` crea un array: è simile a una lista Python. Ogni titolo è un oggetto, simile a un dizionario. `const` impedisce di riassegnare la variabile, ma non impedisce di aggiungere elementi all'array con `push`. `let prossimoId = 1` contiene invece un numero che viene aggiornato a ogni inserimento riuscito.

Una funzione come `(req, res) => { ... }` è una funzione JavaScript scritta con la sintassi a freccia. Express la richiama quando arriva una richiesta corrispondente. `req` contiene la richiesta; `res` permette di rispondere. `return res.status(...).json(...)` invia la risposta e interrompe la funzione, evitando che continui con dati non validi.

Il flusso è: middleware JSON, middleware statico, rotte, risposta 404 se nessuna rotta corrisponde. Se si verifica un errore, Express passa al middleware degli errori.

## JSON e middleware

JSON è un formato testuale per scambiare dati. Somiglia alla scrittura di un dizionario Python, ma usa virgolette doppie, `null` invece di `None`, `true` e `false` minuscoli. Non ammette commenti. Un esempio:

```json
{"titolo":"Interstellar","tipo":"film","genere":"Fantascienza","anno":2014,"stato":"completato"}
```

L'header `Content-Type: application/json` dichiara il formato del corpo della richiesta. `express.json()` legge questo testo e lo trasforma in un oggetto disponibile in `req.body`. `res.json(...)` esegue il percorso inverso e imposta il tipo della risposta. Un JSON sintatticamente corretto può comunque contenere dati sbagliati: per questo serve anche la validazione.

Un middleware è una funzione eseguita durante il percorso di una richiesta. Può rispondere oppure passare il controllo al passo successivo. `express.static(...)` cerca file nella cartella `public/`; il percorso assoluto costruito con `path.join(__dirname, 'public')` funziona anche se si avvia Node da un'altra cartella. Non serve l'intero repository. Al momento non ci sono file di interfaccia da mostrare.

## Le tre rotte

### GET `/api/titoli`

GET significa chiedere una lettura. La rotta risponde con status 200 e l'intero array. All'avvio l'array è vuoto, perciò risponde `[]`. Nessun titolo viene aggiunto quando si esegue GET.

### GET `/api/titoli/:id`

`:id` è una parte variabile dell'indirizzo. In `/api/titoli/1`, `req.params.id` contiene la stringa `"1"`. Il codice la converte con `Number` e controlla che sia un intero positivo rappresentabile con precisione. Un ID malformato come `abc` produce 400. Un ID valido ma assente come `999` produce 404.

`find` cerca il primo elemento con l'ID richiesto. È simile a scorrere una lista Python con un ciclo `for` e fermarsi quando si trova il dizionario giusto. `===` confronta valore e tipo senza conversioni implicite. Se il titolo esiste, la risposta 200 contiene quell'oggetto.

### POST `/api/titoli`

POST invia dati per creare una risorsa. La rotta controlla il corpo e ogni campo. Alla prima violazione risponde 400 con un messaggio in italiano. Non modifica né l'array né il contatore se la richiesta è rifiutata.

| Campo | Controllo |
|---|---|
| `titolo` | Stringa, 2–120 caratteri dopo `trim()` |
| `tipo` | Esattamente `film` o `serie` |
| `genere` | Stringa, 2–40 caratteri dopo `trim()` |
| `anno` | Numero intero tra 1888 e 2100 inclusi; la stringa `"2014"` non è accettata |
| `stato` | Esattamente `da_vedere`, `in_corso` o `completato` |

`trim()` elimina gli spazi ai bordi, come `strip()` in Python. Il controllo del tipo viene prima, perché chiamare `trim()` su `null` o su un numero causerebbe un errore. `includes` verifica l'appartenenza a un array, un po' come `in` in Python.

Dopo i controlli si costruisce un nuovo oggetto usando solo i campi previsti. Un eventuale `id` inviato dal client e i campi extra sono ignorati. Il server assegna l'ID, aggiunge il titolo con `push`, incrementa il contatore e restituisce 201. L'header `Location` indica l'indirizzo dei dettagli del titolo creato.

## Status code ed errori

| Codice | Significato in questo progetto |
|---|---|
| 200 | Lettura riuscita |
| 201 | Titolo creato |
| 400 | Dati, JSON o ID non validi |
| 404 | Titolo o rotta inesistente |
| 413 | Corpo oltre il limite predefinito del parser JSON, circa 100 KB |
| 500 | Errore imprevisto nel server |

Gli errori sono oggetti come `{"errore":"Titolo non trovato."}`. Non basta scrivere la parola errore nel JSON: lo status HTTP comunica l'esito anche ai programmi che chiamano l'API.

`errori.js` riconosce il JSON malformato e restituisce 400. Conserva gli altri errori HTTP del parser, per esempio 413. Per un errore imprevisto scrive il dettaglio nella console del server e restituisce un messaggio generico 500. Il middleware ha quattro parametri `(errore, req, res, next)`: questa firma lo distingue dai middleware normali. Se gli header sono già partiti, delega a Express con `next(errore)`.

## Avviare e provare il server

Installare Node.js 22 o successivo con npm. Aprire un terminale nella cartella BellaFilm:

```sh
npm ci
npm start
```

`npm ci` installa le versioni registrate nel lockfile. `npm start` esegue `node server.js`. Lasciare aperto il terminale. Visitare http://localhost:3000/api/titoli nel browser esegue GET; la barra degli indirizzi non permette di inviare il nostro POST con corpo JSON.

In un secondo terminale PowerShell:

```powershell
# Catalogo iniziale
Invoke-RestMethod -Uri http://localhost:3000/api/titoli

# Inserimento di un film
$dati = @{
  titolo = 'Interstellar'
  tipo = 'film'
  genere = 'Fantascienza'
  anno = 2014
  stato = 'completato'
} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/titoli -Method Post -ContentType 'application/json' -Body $dati

# Dettagli (il primo ID di un nuovo avvio è 1)
Invoke-RestMethod -Uri http://localhost:3000/api/titoli/1

# Errori previsti: 404 e 400. PowerShell li segnala come errori HTTP.
Invoke-RestMethod -Uri http://localhost:3000/api/titoli/999
$nonValido = '{"titolo":"Interstellar","tipo":"film","genere":"Fantascienza","anno":1800,"stato":"completato"}'
Invoke-RestMethod -Uri http://localhost:3000/api/titoli -Method Post -ContentType 'application/json' -Body $nonValido
```

Per vedere status e header di una lettura si può usare `curl.exe -i http://localhost:3000/api/titoli`. Fermare il server con `Ctrl+C`. Riavviandolo, il catalogo torna vuoto: i dati vivevano nella memoria del processo, non in un file.

Per eseguire le verifiche automatiche:

```sh
npm test
```

I test usano `node:test`, `assert` e `fetch`, inclusi in Node. `await` attende il risultato di un'operazione asincrona: qui, per esempio, aspetta una risposta HTTP prima di controllarla. Ogni test parte da un'app nuova e chiude il server al termine. Il messaggio in console «Errore simulato per il test» è voluto: verifica il percorso 500 in un'app separata, senza aggiungere rotte di debug a BellaFilm.

## Possibili domande all'esame

1. **Qual è la differenza tra Node.js ed Express?** Node esegue JavaScript; Express è una libreria che gestisce rotte e middleware.
2. **Dove vengono conservati i titoli?** Nell'array in memoria dentro `creaApp`. Il riavvio li cancella.
3. **Che differenza c'è tra GET e POST?** GET legge; POST crea un titolo usando il corpo della richiesta.
4. **Che differenza c'è tra `req.params` e `req.body`?** Il primo contiene parametri nell'URL, il secondo i dati del corpo interpretati dal parser.
5. **Perché validare sul server anche quando esisterà un modulo?** Chiunque può inviare richieste direttamente senza passare dal modulo.
6. **Perché l'anno `"2014"` viene rifiutato?** È una stringa JSON, mentre il contratto richiede un numero intero.
7. **Chi assegna l'ID?** Il server con un contatore; l'ID del client è ignorato.
8. **Quando restituiamo 400 e quando 404?** 400 per una richiesta non valida, 404 per una risorsa che non esiste.
9. **Perché rispondere 201 dopo POST?** Comunica che una nuova risorsa è stata creata.
10. **Perché il middleware degli errori è alla fine?** Deve ricevere gli errori generati dai passaggi precedenti.
11. **Che cosa fa `return` dopo una risposta di errore?** Ferma la funzione, così non si inseriscono dati e non si tenta una seconda risposta.
12. **Che cosa provano i test?** Comportamenti HTTP e validazione del backend; non provano interfaccia, layout o messaggi nel browser.
13. **Perché non pubblichiamo `node_modules`?** npm può ricrearla dal manifest e dal lockfile.
14. **Che cosa manca per completare l'app?** Il frontend e le sue verifiche. Le estensioni delle specifiche non fanno parte di questa fase.

Per esercitarsi, seguire nel codice una richiesta valida e una con anno errato, spiegando in quale riga viene scelta la risposta.

## Riferimenti

- [Express: gestione degli errori](https://expressjs.com/en/5x/guide/error-handling/)
- [Express: file statici](https://expressjs.com/en/5x/starter/static-files/)
