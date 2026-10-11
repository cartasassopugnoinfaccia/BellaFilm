# Verifiche frontend — 11 ottobre 2026

Ambiente: Windows, Node.js v24.19.0, Chrome in modalità headless controllato con Playwright esterno al progetto. Nessuna dipendenza di test browser è stata aggiunta al manifest. Le immagini desktop e smartphone sono state anche ispezionate visivamente.

Prima delle modifiche: Git pulito, quattro commit preesistenti, fetch da GitHub e 15 test backend superati. Dopo l'integrazione: gli stessi 15 test superati e controllo sintattico di `public/app.js` riuscito. L'aspettativa di 404 su `/` è stata sostituita con la verifica 200 HTML, perché ora esiste la pagina iniziale. Le tre API e il codice del backend non sono stati modificati.

## Prove realmente eseguite

| Prova | Risultato |
|---|---|
| Catalogo vuoto, T01 | Messaggio visibile, nessuna scheda |
| Modulo vuoto e titolo di un carattere, T04 | Errori vicino ai campi; nessun POST emesso |
| Correzione durante input | Messaggio del titolo rimosso dopo un valore valido |
| Anni 1887, 2101 e 2014.5 nel modulo | Invio bloccato; nessun POST |
| Film valido, T02 | POST, nuova scheda, successo, modulo azzerato |
| POST rallentato artificialmente | Messaggio di salvataggio e pulsante disabilitato osservati |
| Serie valida, T03 | Nuova scheda classificata Serie TV |
| Dettagli, T06 | Informazioni corrette e GET per ID registrato dal browser |
| ID inesistente, T07 | Richiesta dei dettagli reindirizzata dal test a ID 999: risposta reale 404 del backend, messaggio visibile |
| Testo simile a HTML | Mostrato come testo; nessun elemento img creato |
| Desktop 1440 px e mobile 390/320 px, T09 | Schermate leggibili; larghezza del documento non superiore alla viewport |
| Browser offline | POST e dettagli falliscono con messaggio; campi conservati e controlli riabilitati |
| GET iniziale interrotto dal test | Errore visibile distinto da catalogo vuoto |
| Ripristino rete e ricaricamento | Catalogo nuovamente visibile |
| Server realmente arrestato, T08 | Tentativo POST dalla pagina già aperta: errore visibile, dati conservati, modulo utilizzabile |
| Eccezioni JavaScript non gestite | Nessuna rilevata nella sequenza browser completata |
| Anno non valido lato server, T05 | Coperto dalla suite backend ripetuta: risposta 400 JSON |

Una prima esecuzione dello script esterno di verifica si è fermata per un errore nello script stesso (accesso a una stringa URL come funzione). Corretto il verificatore, il server è stato riavviato per ripartire da un array vuoto e l'intera sequenza è passata. Non è stato necessario modificare l'applicazione per questo errore.

## Limiti delle verifiche

Le viewport smartphone sono simulate: non sono stati usati dispositivi fisici né Safari/Firefox. Le richieste sono state osservate con gli eventi del browser automatizzato; non è stata effettuata un'ispezione manuale completa dei pannelli DevTools o una sessione con breakpoint. Non è stato eseguito un audit con screen reader. Le risposte di errore POST del backend sono verificate dalla suite API; nel browser è stato verificato il fallimento di rete del POST.

Ricerca, modifica, eliminazione e persistenza (T10–T12) restano escluse. I dati di prova sono temporanei in memoria e vengono eliminati arrestando il server. Per ripetere i percorsi manualmente, seguire `spiegazione-frontend.md`.
