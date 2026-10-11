const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const creaApp = require('../app');
const gestisciErrore = require('../errori');

let server;
let baseUrl;
const valido = { titolo: 'Interstellar', tipo: 'film', genere: 'Fantascienza', anno: 2014, stato: 'completato' };

beforeEach(async () => {
  server = creaApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((errore) => errore ? reject(errore) : resolve()));
});

async function richiesta(percorso, opzioni) {
  const risposta = await fetch(baseUrl + percorso, opzioni);
  assert.match(risposta.headers.get('content-type'), /application\/json/);
  return { status: risposta.status, dati: await risposta.json(), headers: risposta.headers };
}

function inserisci(dati) {
  return richiesta('/api/titoli', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dati)
  });
}

test('GET restituisce il catalogo inizialmente vuoto', async () => {
  const risposta = await richiesta('/api/titoli');
  assert.equal(risposta.status, 200);
  assert.deepEqual(risposta.dati, []);
});

test('POST film e serie, ID del server, pulizia spazi, elenco e dettagli', async () => {
  const film = await inserisci({ ...valido, id: 999, extra: 'ignorato', titolo: '  Interstellar  ', genere: ' Fantascienza ' });
  assert.equal(film.status, 201);
  assert.equal(film.headers.get('location'), '/api/titoli/1');
  assert.deepEqual(film.dati, { id: 1, ...valido });
  const serie = await inserisci({ ...valido, titolo: 'Dark', tipo: 'serie', stato: 'in_corso' });
  assert.equal(serie.status, 201);
  assert.equal(serie.dati.id, 2);
  assert.equal(serie.dati.tipo, 'serie');
  const elenco = await richiesta('/api/titoli');
  assert.equal(elenco.status, 200);
  assert.deepEqual(elenco.dati, [film.dati, serie.dati]);
  const dettaglio = await richiesta('/api/titoli/1');
  assert.equal(dettaglio.status, 200);
  assert.deepEqual(dettaglio.dati, film.dati);
});

test('accetta i limiti inclusivi dei campi e lo stato da_vedere', async () => {
  for (const dati of [
    { ...valido, titolo: 'AB', genere: 'CD', anno: 1888, stato: 'da_vedere' },
    { ...valido, titolo: 'A'.repeat(120), genere: 'G'.repeat(40), anno: 2100 }
  ]) {
    assert.equal((await inserisci(dati)).status, 201);
  }
});

const nonValidi = {
  titolo: [undefined, null, 12, '', ' ', 'A', 'A'.repeat(121)],
  tipo: [undefined, null, 'documentario', 'Film', 1],
  genere: [undefined, null, 12, '', ' ', 'A', 'A'.repeat(41)],
  anno: [undefined, null, '2014', 2014.5, 1887, 2101, true],
  stato: [undefined, null, 'visto', 'COMPLETATO', 1]
};

for (const [campo, valori] of Object.entries(nonValidi)) {
  test(`rifiuta ${campo} non valido senza alterare dati o contatore ID`, async () => {
    for (const valore of valori) {
      const risposta = await inserisci({ ...valido, [campo]: valore });
      assert.equal(risposta.status, 400, `${campo}: ${String(valore)}`);
      assert.equal(typeof risposta.dati.errore, 'string');
    }
    assert.deepEqual((await richiesta('/api/titoli')).dati, []);
    assert.equal((await inserisci(valido)).dati.id, 1);
  });
}

test('rifiuta corpi JSON inadatti, JSON malformato, corpo assente e Content-Type errato', async () => {
  for (const corpo of ['null', '[]', '12', '"testo"', '{}', '{"titolo":', '']) {
    const risposta = await richiesta('/api/titoli', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo
    });
    assert.equal(risposta.status, 400);
    assert.equal(typeof risposta.dati.errore, 'string');
  }
  assert.equal((await richiesta('/api/titoli', { method: 'POST' })).status, 400);
  assert.equal((await richiesta('/api/titoli', {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(valido)
  })).status, 400);
  assert.deepEqual((await richiesta('/api/titoli')).dati, []);
});

test('ID inesistente: 404; ID malformati: 400', async () => {
  assert.equal((await richiesta('/api/titoli/999')).status, 404);
  for (const id of ['abc', '1abc', '1.5', '0', '-1', '9007199254740992']) {
    assert.equal((await richiesta(`/api/titoli/${id}`)).status, 400);
  }
});

test('rotte assenti e operazioni extra non implementate: 404 JSON', async () => {
  for (const [percorso, method] of [['/', 'GET'], ['/inesistente', 'GET'], ['/api/titoli/1', 'PUT'], ['/api/titoli/1', 'DELETE']]) {
    const risposta = await richiesta(percorso, { method });
    assert.equal(risposta.status, 404);
    assert.equal(typeof risposta.dati.errore, 'string');
  }
});

test('il limite del parser produce 413 JSON', async () => {
  const risposta = await inserisci({ ...valido, titolo: 'A'.repeat(110000) });
  assert.equal(risposta.status, 413);
  assert.equal(typeof risposta.dati.errore, 'string');
});

test('middleware statico: serve solo public e non espone i file del progetto', async () => {
  const file = path.join(__dirname, '../public/verifica-test.txt');
  await fs.writeFile(file, 'File temporaneo per il test', { flag: 'wx' });
  try {
    const risposta = await fetch(baseUrl + '/verifica-test.txt');
    assert.equal(risposta.status, 200);
    assert.equal(await risposta.text(), 'File temporaneo per il test');
    assert.equal((await richiesta('/package.json')).status, 404);
    assert.equal((await richiesta('/specifiche/specifiche.md')).status, 404);
  } finally {
    await fs.unlink(file);
  }
});

test('un nuovo avvio riparte con il catalogo vuoto', async () => {
  await inserisci(valido);
  const secondoServer = creaApp().listen(0, '127.0.0.1');
  await once(secondoServer, 'listening');
  try {
    const risposta = await fetch(`http://127.0.0.1:${secondoServer.address().port}/api/titoli`);
    assert.deepEqual(await risposta.json(), []);
  } finally {
    await new Promise((resolve) => secondoServer.close(resolve));
  }
});

test('errore imprevisto: 500 JSON senza dettagli interni', async () => {
  // L'errore viene simulato in una app separata: nessuna rotta di debug nel progetto.
  const app = express();
  app.get('/errore', () => { throw new Error('Errore simulato per il test'); });
  app.use(gestisciErrore);
  const serverErrore = app.listen(0, '127.0.0.1');
  await once(serverErrore, 'listening');
  try {
    const risposta = await fetch(`http://127.0.0.1:${serverErrore.address().port}/errore`);
    assert.equal(risposta.status, 500);
    assert.deepEqual(await risposta.json(), { errore: 'Errore interno del server.' });
  } finally {
    await new Promise((resolve) => serverErrore.close(resolve));
  }
});
