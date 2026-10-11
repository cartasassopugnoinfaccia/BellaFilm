# Il frontend di BellaFilm, passo per passo

## Le tre parti di una pagina

HTML descrive il contenuto e la sua struttura: titoli, paragrafi, modulo e pulsanti. CSS decide l'aspetto: colori, spazi, colonne e dimensioni. JavaScript reagisce alle azioni dell'utente e comunica con il server. Si può pensare a una casa: HTML è la struttura, CSS l'arredamento, JavaScript gli impianti che rispondono agli interruttori.

Il frontend viene eseguito nel browser. Il backend viene eseguito da Node.js. Il browser non legge direttamente l'array del server: chiede i dati tramite HTTP.

## I file

| File | Responsabilità |
|---|---|
| `public/index.html` | Struttura semantica, modulo, catalogo, dettagli, messaggi |
| `public/style.css` | Colori, tipografia, Grid, Flexbox e regole per schermi stretti |
| `public/app.js` | Eventi, validazione, richieste HTTP e aggiornamento della pagina |
| `app.js` nella radice | Backend Express, distinto dal file omonimo in `public/` |
| `test/backend.test.js` | Test automatici delle API e del servizio dei file statici |

Il tag `<link>` carica il CSS. `<script src="app.js" defer>` carica il JavaScript e lo esegue dopo che il browser ha letto l'HTML. Non servono compilazione o librerie frontend.

## HTML semantico e accessibilità

`header` contiene l'intestazione; `main` il contenuto principale; `section` raggruppa contenuti con un titolo; ogni scheda è un `article`; `footer` chiude la pagina. Questi elementi descrivono il significato del contenuto.

Ogni campo ha una `label` collegata tramite `for` e `id`. Per esempio:

```html
<label for="titolo">Titolo</label>
<input id="titolo" name="titolo" type="text" required>
```

`id` identifica l'elemento nella pagina. `name` permette di recuperarlo da `modulo.elements`. `required` dichiara il campo obbligatorio. Il modulo usa `novalidate` perché JavaScript gestisce messaggi coerenti in italiano invece delle finestre di validazione native del browser.

Gli errori hanno un testo vicino al campo, collegato con `aria-describedby`; `aria-invalid` segnala se il valore è errato. L'area messaggi usa `role="status"` e `aria-live="polite"`: le tecnologie assistive possono annunciare gli aggiornamenti. `aria-busy` indica una sezione in caricamento. I pulsanti sono raggiungibili con Tab e hanno un contorno di focus visibile. Dopo il caricamento dei dettagli il focus passa al titolo della sezione.

## CSS e pagina responsive

Le variabili in `:root` raccolgono i colori. Un selettore come `.scheda` applica regole a tutti gli elementi con quella classe; `#messaggio` seleziona un solo ID. `padding` è lo spazio interno, `margin` quello esterno, `border` il bordo.

Grid crea le colonne: modulo a sinistra e catalogo a destra. Le schede hanno una griglia interna. Flexbox allinea piccoli gruppi, come logo e intestazione. Le media query cambiano il layout quando lo spazio diminuisce:

```css
@media (max-width: 650px) {
  .layout { grid-template-columns: 1fr; }
}
```

Su smartphone il contenuto passa a una sola colonna. `minmax(0, 1fr)` permette alle colonne di restringersi; `overflow-wrap: anywhere` spezza testi lunghi. Il meta tag viewport evita che il telefono mostri una pagina desktop rimpicciolita. Le decorazioni sono CSS e simboli testuali, senza immagini esterne.

## DOM: l'HTML visto da JavaScript

Il DOM è la rappresentazione della pagina in memoria, organizzata come un albero di oggetti. `document.querySelector('#titolo')` recupera il campo titolo. Cambiare `textContent` aggiorna il testo visualizzato.

```js
const messaggio = document.querySelector('#messaggio');
messaggio.textContent = 'Catalogo caricato';
```

Un oggetto JavaScript è simile a un dizionario Python; un array è simile a una lista. Ma qui gli oggetti DOM rappresentano anche elementi visibili. `createElement` crea un elemento, `append` lo aggiunge e `replaceChildren` sostituisce i figli di un contenitore.

`creaScheda` costruisce ogni scheda con questi metodi. Il titolo inserito dall'utente viene assegnato con `textContent`, non interpretato come HTML. Anche un testo simile a `<img ...>` rimane testo, senza diventare un elemento attivo.

## Eventi e validazione

Un evento è qualcosa che accade nella pagina: digitazione (`input`), clic (`click`) o invio del modulo (`submit`). `addEventListener` collega una funzione all'evento:

```js
modulo.elements.titolo.addEventListener('input', () => validaCampo('titolo'));
```

La funzione viene eseguita quando l'evento accade, non quando viene registrata. È simile a fornire una funzione Python da chiamare più tardi.

`validaCampo` controlla titolo e genere dopo `trim()`, simile a `strip()` in Python. Verifica i limiti 2–120 e 2–40 caratteri, l'anno intero 1888–2100 e i valori ammessi per tipo e stato. Il campo numero fornisce comunque una stringa nella proprietà `value`: `Number(...)` la converte prima dell'invio.

Durante `submit`, `preventDefault()` evita l'invio HTML tradizionale che ricaricherebbe la pagina. Si controllano tutti i campi; se ce ne sono di errati si mostra il messaggio e si porta il focus sul primo. Non parte alcun POST. Il backend mantiene comunque la sua validazione: un client può aggirare il JavaScript della pagina.

## fetch, Promise e async/await

`fetch` avvia una richiesta HTTP e restituisce una Promise: un risultato che arriverà in futuro o fallirà. `async` dichiara una funzione che restituisce una Promise. `await` sospende il proseguimento di quella funzione fino al risultato, lasciando il browser libero di aggiornare la pagina.

```js
const risposta = await fetch('/api/titoli');
const dati = await risposta.json();
```

Il primo `await` aspetta la risposta HTTP; il secondo aspetta la lettura e conversione del corpo JSON. JSON è testo strutturato usato per scambiare dati, non un riferimento diretto all'array del server.

`richiedi` raccoglie questo codice comune. Se manca la connessione, `fetch` rifiuta la Promise e si entra in `catch`. Una risposta 404 o 500 invece arriva regolarmente: bisogna controllare `risposta.ok` e trasformarla in un errore con `throw new Error(...)`. `try/catch` svolge un ruolo simile a `try/except` in Python; `finally` viene eseguito sia in caso di successo sia in caso di errore.

## I tre flussi

**Avvio:** `avvia` disabilita momentaneamente il modulo, poi `caricaCatalogo` esegue GET `/api/titoli`. Per ogni oggetto crea una scheda; se l'array è vuoto mostra «Nessun titolo presente». Un fallimento di rete mostra un errore distinto: non significa che il catalogo sia vuoto.

**Inserimento:** il submit valida i campi, crea l'oggetto e invia POST `/api/titoli` con `Content-Type: application/json` e `JSON.stringify(dati)`. Quest'ultimo converte l'oggetto in testo JSON. Durante l'attesa il fieldset è disabilitato e il pulsante mostra «Salvataggio…». Alla risposta 201 si azzera il modulo e si rilegge il catalogo. Se il salvataggio riesce ma la rilettura fallisce, il messaggio distingue i due esiti. Se il POST fallisce, i valori digitati restano disponibili.

**Dettagli:** il clic su una scheda chiama GET `/api/titoli/:id`. Il pannello viene riempito con titolo, ID, tipo, genere, anno e stato. Non si riusano soltanto i dati della scheda: si verifica realmente l'API dei dettagli. Durante l'attesa i pulsanti dei dettagli sono disabilitati; dopo un errore tornano utilizzabili.

Tutte le richieste usano percorsi relativi perché frontend e backend hanno la stessa origine. Non occorre configurare CORS. L'ID viene sempre scelto dal server.

## Avvio e prove manuali

1. Nella cartella BellaFilm eseguire `npm ci`, poi `npm start`.
2. Aprire http://localhost:3000, non il file HTML direttamente.
3. A server appena avviato verificare il messaggio di catalogo vuoto.
4. Inviare un modulo vuoto: verificare errori e focus. Digitare un titolo di un carattere, poi correggerlo. Provare gli anni 1887 e 2014.5.
5. Inserire Interstellar, Film, Fantascienza, 2014, Completato. Poi una serie. Verificare le nuove schede e aprire i dettagli.
6. Negli strumenti sviluppatore aprire Network: controllare GET, POST, status 201, Content-Type, payload e corpo della risposta. Nei dettagli cercare GET `/api/titoli/1`.
7. Lasciare aperta la pagina, arrestare il server con Ctrl+C e tentare un inserimento valido. Il messaggio deve segnalare la connessione fallita e conservare i campi. Se invece si ricarica l'intera pagina a server spento, il browser non può nemmeno scaricare l'HTML e mostra il proprio errore di connessione.
8. Provare una finestra stretta e la navigazione con Tab. Per le API eseguire anche `npm test`.

In DevTools, Elements mostra HTML e CSS; Console mostra errori JavaScript; Network mostra le richieste; Sources permette di mettere un breakpoint nel submit e seguire il valore di `dati`. Questi sono esercizi consigliati: il rapporto di verifica distingue le prove realmente eseguite.

## Domande possibili all'esame

- **HTML e DOM sono la stessa cosa?** HTML è il documento, il DOM è la sua rappresentazione manipolabile nel browser.
- **Perché separare i tre file?** Per distinguere struttura, aspetto e comportamento.
- **Che cosa fa `defer`?** Rimanda l'esecuzione dello script fino alla lettura del documento.
- **Perché usare `preventDefault`?** Per gestire il submit con fetch senza ricaricare tutta la pagina.
- **Perché validare due volte?** Il browser aiuta l'utente; il server protegge la correttezza dei dati anche da richieste dirette.
- **Che cosa restituisce fetch?** Una Promise con una Response, non direttamente l'array dei titoli.
- **Una risposta 404 entra automaticamente in catch?** No: controlliamo `ok` e generiamo un errore.
- **Perché usare finally?** Per ripristinare i controlli dopo ogni esito.
- **Perché usare textContent?** Per mostrare i dati come testo, senza interpretarli come HTML.
- **Come funziona il responsive?** Griglie flessibili e media query cambiano le colonne.
- **Dove sono salvati i titoli?** Nell'array del backend; si perdono riavviando Node, non semplicemente ricaricando la pagina.
- **Sono state aggiunte ricerca o modifica?** No: sono estensioni escluse da questa fase.
