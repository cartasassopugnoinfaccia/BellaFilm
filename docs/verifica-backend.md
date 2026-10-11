# Verifiche della fase backend

Verifiche eseguite l'11 ottobre 2026 su Windows, con Node.js v24.19.0. Sono stati eseguiti i controlli sintattici `node --check` sui tre file del backend e `npm test`: **15 test superati, 0 falliti, 0 saltati**.

È stato inoltre avviato realmente `server.js` in un processo Node separato, con una porta temporanea impostata tramite `PORT`: GET `/api/titoli` ha restituito 200 e `[]`. Il processo è stato chiuso dopo la verifica. Le specifiche non presentano differenze rispetto al primo commit.

## Copertura effettiva

1. Catalogo inizialmente vuoto: GET 200 e array vuoto.
2. Inserimento di film e serie: POST 201; ID progressivi assegnati dal server, campi estranei ignorati, spazi esterni rimossi, header Location, elenco e dettagli coerenti.
3. Limiti inclusivi di titolo, genere e anno; stato `da_vedere` accettato.
4. Titolo mancante, nullo, non testuale, vuoto, troppo corto o lungo: 400.
5. Tipo mancante o non appartenente ai valori previsti: 400.
6. Genere mancante, nullo, non testuale, vuoto, troppo corto o lungo: 400.
7. Anno mancante, nullo, stringa, decimale, booleano o fuori intervallo: 400.
8. Stato mancante o non appartenente ai valori previsti: 400.
9. Corpi JSON inadatti, malformati o assenti e Content-Type errato: 400; catalogo invariato.
10. ID assente: 404; ID non numerico, misto, decimale, non positivo o oltre gli interi sicuri: 400.
11. Rotte assenti, PUT e DELETE: 404 in formato JSON.
12. Corpo troppo grande: 413 in formato JSON.
13. File statico temporaneo servito correttamente, poi rimosso; manifest e specifiche non esposti via HTTP.
14. Una nuova istanza dell'app riparte con il catalogo vuoto.
15. Errore imprevisto simulato in un'app di test separata: 500 con messaggio generico, senza dettagli interni nella risposta.

I test dei cinque campi controllano anche che gli inserimenti rifiutati non modifichino l'array né consumino ID. Un singolo test può contenere più richieste e più asserzioni.

## Rapporto con le specifiche

T05 è verificato per la risposta del backend all'anno non valido. Per T02, T03, T06 e T07 sono verificate le operazioni API; schede, messaggi dell'interfaccia e pannello Network del browser non sono stati verificati. T01, T04, T08 e T09 richiedono il frontend e non sono dichiarati superati. T10–T12 sono estensioni escluse da questa fase.

Il test del nuovo avvio dimostra la perdita attesa dei dati in memoria: non è il test T12 della persistenza su file. La prima versione completa dell'applicazione non è ancora realizzata.
