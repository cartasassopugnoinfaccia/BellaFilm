# BellaFilm — Specifiche iniziali del progetto

**Corso:** Programmazione Web — A.A. 2025/2026  
**Versione:** 1.0 — documento iniziale, da caricare **prima** dello sviluppo  
**Tipologia:** applicazione web frontend + backend

## 1. Obiettivo dell'applicazione

BellaFilm è un catalogo personale per organizzare **film e serie TV** che una persona desidera vedere, sta guardando oppure ha già completato. L'applicazione permette di avere una lista ordinata dei propri titoli senza dover ricorrere ad appunti sparsi.

**Destinatari:** utenti che desiderano gestire in modo semplice la propria lista di film e serie TV.  
**Ambito della prima versione:** un catalogo locale per un solo utilizzatore; non sono previsti account, login o dati di servizi esterni.

## 2. Cosa può fare l'utente

### Funzionalità fondamentali (prima versione)

1. **Consultare il catalogo:** vedere un elenco di film e serie TV già registrati, con titolo, tipo, genere, anno e stato di visione.
2. **Vedere i dettagli:** selezionare una scheda e visualizzare le informazioni complete del titolo.
3. **Aggiungere un titolo:** compilare un modulo con titolo, tipo (film/serie TV), genere, anno e stato di visione.
4. **Ricevere feedback:** capire se una richiesta è in corso, se è riuscita o se si è verificato un errore; visualizzare un messaggio dedicato se il catalogo è vuoto.
5. **Correggere dati prima dell'invio:** ricevere messaggi chiari durante la digitazione (`input`) e al tentativo di invio quando un campo obbligatorio è mancante o non valido.

### Funzionalità aggiuntive pianificate (da realizzare dopo la versione fondamentale)

6. **Cercare o filtrare** titoli per testo, tipo e stato senza ricaricare la pagina.
7. **Modificare** le informazioni di un titolo già presente.
8. **Eliminare** un titolo dopo conferma.
9. **Ritrovare i dati dopo il riavvio del server**, salvandoli in un file JSON locale.

Le funzionalità 6–9 sono estensioni: saranno considerate realizzate soltanto dopo implementazione e verifica. Non sono necessarie per dichiarare completa la prima versione.

## 3. Struttura del frontend

L'interfaccia sarà una **pagina singola** HTML, adattabile a desktop e smartphone, suddivisa in sezioni:

- **Intestazione:** nome BellaFilm e breve descrizione.
- **Modulo «Aggiungi titolo»:** campi e pulsante di invio; errori di validazione vicini ai campi.
- **Catalogo:** schede leggibili con le informazioni principali e un pulsante «Dettagli».
- **Pannello dei dettagli:** contenuti caricati selezionando una scheda.
- **Area messaggi di stato:** avvisi per caricamento, salvataggio riuscito, errori e catalogo vuoto.
- **Zona ricerca/filtri (estensione):** ricerca per testo e filtri per tipo/stato.

Saranno usati HTML semantico (es. `header`, `main`, `section`, `form`, `article`), CSS con Flexbox/Grid e JavaScript in file separato. I messaggi importanti saranno leggibili anche con tecnologie assistive tramite un'area `aria-live`.

## 4. Mockup minimale (wireframe)

### Vista desktop

```text
+------------------------------------------------------------------+
| BellaFilm                         Il mio catalogo film e serie TV |
+-----------------------------+------------------------------------+
| AGGIUNGI TITOLO             | CATALOGO                           |
| Titolo: [_______________]   | [Cerca... / filtri]*               |
| Tipo:   [Film       v]      |                                    |
| Genere: [_______________]   | +--------------+  +--------------+|
| Anno:   [____]              | | Titolo       |  | Titolo       ||
| Stato:  [Da vedere  v]      | | Film • 2021  |  | Serie • 2024 ||
| [Aggiungi al catalogo]      | | [Dettagli]   |  | [Dettagli]   ||
|                             | +--------------+  +--------------+|
+-----------------------------+------------------------------------+
| MESSAGGI: caricamento / successo / errore / lista vuota           |
+------------------------------------------------------------------+
| DETTAGLI DEL TITOLO SELEZIONATO                                   |
+------------------------------------------------------------------+
```

`*` Ricerca e filtri sono funzionalità aggiuntive.

### Vista smartphone

```text
+------------------------+
| BellaFilm              |
| Film e serie TV        |
+------------------------+
| AGGIUNGI TITOLO        |
| [Campi del modulo]     |
| [Aggiungi]             |
+------------------------+
| CATALOGO               |
| [Scheda titolo]        |
| [Scheda titolo]        |
+------------------------+
| DETTAGLI / MESSAGGI    |
+------------------------+
```

## 5. Dati principali

Ogni elemento del catalogo avrà:

| Campo | Descrizione | Regola prevista |
|---|---|---|
| `id` | Identificatore univoco | Assegnato dal server, non dall'utente |
| `titolo` | Nome del film o serie | Testo obbligatorio, 2–120 caratteri dopo la rimozione degli spazi esterni |
| `tipo` | Tipologia | `film` oppure `serie` |
| `genere` | Genere | Testo obbligatorio, 2–40 caratteri |
| `anno` | Anno di uscita / prima distribuzione | Numero intero tra 1888 e 2100 |
| `stato` | Stato di visione | `da_vedere`, `in_corso` oppure `completato` |

**Esempio di elemento:**

```json
{
  "id": 1,
  "titolo": "Interstellar",
  "tipo": "film",
  "genere": "Fantascienza",
  "anno": 2014,
  "stato": "completato"
}
```

La stessa validazione sarà applicata nel browser e nel backend. Il server non considererà affidabili i dati provenienti dal browser.

## 6. Comunicazione con il backend

Il frontend effettuerà richieste HTTP con `fetch` e `async/await` a un server **Node.js + Express**. La struttura REST prevista è:

| Metodo | Percorso | Funzione | Esito tipico |
|---|---|---|---|
| GET | `/api/titoli` | Elencare tutti i titoli | `200` con array JSON |
| GET | `/api/titoli/:id` | Visualizzare i dettagli di un titolo | `200` con oggetto JSON; `404` se assente |
| POST | `/api/titoli` | Inserire un nuovo titolo | `201` con oggetto creato; `400` con errore di validazione |
| PUT (extra) | `/api/titoli/:id` | Modificare un titolo | `200`; `400`/`404` se necessario |
| DELETE (extra) | `/api/titoli/:id` | Eliminare un titolo | `204`; `404` se assente |

Per gli errori, le risposte JSON useranno una forma coerente, ad esempio `{ "errore": "Titolo obbligatorio" }`. Il server gestirà le condizioni `400`, `404` e `500`, oltre a servire i file statici dell'interfaccia e a leggere i corpi JSON delle richieste. Frontend e backend saranno serviti dalla **stessa origine**, evitando di richiedere una configurazione CORS per l'uso locale.

## 7. Scenari di test previsti

> Questi sono **test da eseguire**, non risultati già verificati.

| ID | Situazione e azione | Risultato atteso |
|---|---|---|
| T01 | Aprire il sito con catalogo vuoto | Messaggio «Nessun titolo presente»; nessuna scheda |
| T02 | Inserire un film con dati validi | Nuova scheda nel catalogo e messaggio di successo |
| T03 | Inserire una serie con dati validi | Nuova scheda classificata come serie TV |
| T04 | Inviare il modulo senza titolo | Errore lato client; nessuna richiesta di creazione |
| T05 | Inviare al server un anno non valido | Risposta HTTP `400` con JSON esplicativo |
| T06 | Aprire i dettagli di un ID esistente | Informazioni corrette; richiesta GET per ID visibile in Network |
| T07 | Richiedere un ID inesistente | Risposta HTTP `404` e messaggio gestito |
| T08 | Arrestare il server e aggiornare/tentare un invio | Errore di rete visibile, senza blocchi dell'interfaccia |
| T09 | Aprire il sito con finestra stretta | Layout leggibile senza scorrimento orizzontale anomalo |
| T10 (extra) | Cercare o filtrare titoli | Vengono mostrati soltanto gli elementi pertinenti |
| T11 (extra) | Modificare o cancellare un elemento | Il catalogo riflette il cambiamento |
| T12 (extra) | Riavviare il server dopo un inserimento | I dati salvati su file JSON sono ancora presenti |

Durante la preparazione all'esame saranno controllati anche i pannelli **Elements, Console, Network, Sources** di DevTools, gli header, il payload e la risposta HTTP, i log del server e un breakpoint.

## 8. Criteri di completamento e limiti

La prima versione sarà completa quando tutti i requisiti tecnici obbligatori della consegna saranno presenti, i test fondamentali T01–T09 saranno stati eseguiti con esito documentato, e sarà disponibile un `README.md` con istruzioni di installazione e avvio, funzionalità e informazioni sull'uso dell'AI.

**Fuori ambito:** autenticazione, collegamento a cataloghi online di film, valutazioni pubbliche, immagini esterne, streaming, app mobile nativa. Questi elementi non servono ai requisiti del corso e aumenterebbero la complessità da discutere all'orale.

**Uso dell'AI:** strumenti AI potranno assistere nella stesura delle specifiche, implementazione, test e documentazione. I prompt usati, le eventuali modifiche manuali e i risultati di verifica saranno raccolti durante lo sviluppo, senza dichiarare attività non realmente svolte.
