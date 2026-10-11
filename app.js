const express = require('express');
const path = require('node:path');
const gestisciErrore = require('./errori');

// Ogni nuova app parte con un catalogo vuoto, anche durante i test.
function creaApp() {
  const app = express();
  const titoli = [];
  let prossimoId = 1;

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/titoli', (req, res) => {
    res.status(200).json(titoli);
  });

  app.get('/api/titoli/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ errore: 'ID non valido: serve un intero positivo.' });
    }

    const titolo = titoli.find((elemento) => elemento.id === id);
    if (!titolo) {
      return res.status(404).json({ errore: 'Titolo non trovato.' });
    }
    res.status(200).json(titolo);
  });

  app.post('/api/titoli', (req, res) => {
    const dati = req.body;
    if (!dati || typeof dati !== 'object' || Array.isArray(dati)) {
      return res.status(400).json({ errore: 'Inviare un oggetto JSON con i dati del titolo.' });
    }

    // Verifichiamo il tipo prima di usare trim(), per evitare errori sui numeri o null.
    if (typeof dati.titolo !== 'string' || dati.titolo.trim().length < 2 || dati.titolo.trim().length > 120) {
      return res.status(400).json({ errore: 'Titolo obbligatorio: da 2 a 120 caratteri.' });
    }
    if (!['film', 'serie'].includes(dati.tipo)) {
      return res.status(400).json({ errore: 'Tipo non valido: scegliere film oppure serie.' });
    }
    if (typeof dati.genere !== 'string' || dati.genere.trim().length < 2 || dati.genere.trim().length > 40) {
      return res.status(400).json({ errore: 'Genere obbligatorio: da 2 a 40 caratteri.' });
    }
    if (!Number.isInteger(dati.anno) || dati.anno < 1888 || dati.anno > 2100) {
      return res.status(400).json({ errore: 'Anno non valido: serve un intero tra 1888 e 2100.' });
    }
    if (!['da_vedere', 'in_corso', 'completato'].includes(dati.stato)) {
      return res.status(400).json({ errore: 'Stato non valido: scegliere da_vedere, in_corso oppure completato.' });
    }

    // Copiamo solo i campi previsti: l'ID viene sempre deciso dal server.
    const nuovoTitolo = {
      id: prossimoId,
      titolo: dati.titolo.trim(),
      tipo: dati.tipo,
      genere: dati.genere.trim(),
      anno: dati.anno,
      stato: dati.stato
    };
    titoli.push(nuovoTitolo);
    prossimoId += 1;
    res.status(201).location(`/api/titoli/${nuovoTitolo.id}`).json(nuovoTitolo);
  });

  app.use((req, res) => {
    res.status(404).json({ errore: 'Rotta non trovata.' });
  });

  // Deve venire dopo le rotte e avere quattro parametri.
  app.use(gestisciErrore);
  return app;
}

module.exports = creaApp;
