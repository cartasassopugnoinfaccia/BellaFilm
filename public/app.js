const modulo = document.querySelector('#modulo');
const campi = document.querySelector('#campi');
const salva = document.querySelector('#salva');
const messaggio = document.querySelector('#messaggio');
const schede = document.querySelector('#schede');
const catalogo = document.querySelector('.catalogo');
const dettagli = document.querySelector('#dettagli');
const contenutoDettagli = document.querySelector('#contenuto-dettagli');
const nomiCampi = ['titolo', 'tipo', 'genere', 'anno', 'stato'];
const stati = { da_vedere: 'Da vedere', in_corso: 'In corso', completato: 'Completato' };

function mostraMessaggio(testo, tipo = 'informazione') {
  messaggio.textContent = testo;
  messaggio.dataset.tipo = tipo;
}

// fetch restituisce una Promise. await attende la risposta senza bloccare la pagina.
async function richiedi(percorso, opzioni) {
  let risposta;
  try {
    risposta = await fetch(percorso, opzioni);
  } catch (errore) {
    throw new Error('Connessione non riuscita. Controlla che il server sia avviato e riprova.');
  }
  const dati = await risposta.json();
  // fetch non considera automaticamente 400, 404 e 500 come errori.
  if (!risposta.ok) {
    throw new Error(dati.errore || 'Il server non ha completato la richiesta.');
  }
  return dati;
}

function validaCampo(nome) {
  const campo = modulo.elements[nome];
  const valore = campo.value.trim();
  let errore = '';
  if (nome === 'titolo' && (valore.length < 2 || valore.length > 120)) {
    errore = 'Inserisci un titolo da 2 a 120 caratteri.';
  }
  if (nome === 'genere' && (valore.length < 2 || valore.length > 40)) {
    errore = 'Inserisci un genere da 2 a 40 caratteri.';
  }
  if (nome === 'anno' && (!valore || !Number.isInteger(Number(valore)) || Number(valore) < 1888 || Number(valore) > 2100)) {
    errore = 'Inserisci un anno intero tra 1888 e 2100.';
  }
  if (nome === 'tipo' && !['film', 'serie'].includes(valore)) {
    errore = 'Scegli Film o Serie TV.';
  }
  if (nome === 'stato' && !Object.keys(stati).includes(valore)) {
    errore = 'Scegli uno stato di visione.';
  }
  document.querySelector(`#errore-${nome}`).textContent = errore;
  campo.setAttribute('aria-invalid', String(Boolean(errore)));
  return errore === '';
}

for (const nome of nomiCampi) {
  modulo.elements[nome].addEventListener('input', () => validaCampo(nome));
}

// textContent tratta anche i simboli HTML come testo, senza eseguirli.
function elemento(tag, testo, classe) {
  const nodo = document.createElement(tag);
  nodo.textContent = testo;
  if (classe) nodo.className = classe;
  return nodo;
}

function creaScheda(titolo) {
  const scheda = document.createElement('article');
  scheda.className = 'scheda';
  scheda.dataset.tipo = titolo.tipo;
  const copertina = elemento('div', '', 'copertina');
  copertina.setAttribute('aria-hidden', 'true');
  copertina.append(elemento('span', titolo.tipo === 'film' ? 'FILM' : 'SERIE TV'), elemento('span', titolo.tipo === 'film' ? '▷' : '▤'));
  const corpo = elemento('div', '', 'corpo-scheda');
  const pulsante = elemento('button', 'Dettagli →');
  pulsante.type = 'button';
  pulsante.setAttribute('aria-label', `Dettagli di ${titolo.titolo}`);
  pulsante.addEventListener('click', () => caricaDettagli(titolo.id));
  corpo.append(
    elemento('h3', titolo.titolo),
    elemento('p', `${titolo.tipo === 'film' ? 'Film' : 'Serie TV'} · ${titolo.anno} · ${titolo.genere}`, 'metadati'),
    elemento('p', stati[titolo.stato], 'stato'), pulsante
  );
  scheda.append(copertina, corpo);
  return scheda;
}

async function caricaCatalogo() {
  catalogo.setAttribute('aria-busy', 'true');
  document.querySelector('#errore-catalogo').hidden = true;
  try {
    const titoli = await richiedi('/api/titoli');
    schede.replaceChildren();
    for (const titolo of titoli) schede.append(creaScheda(titolo));
    document.querySelector('#vuoto').hidden = titoli.length !== 0;
    document.querySelector('#conteggio').textContent = `${titoli.length} ${titoli.length === 1 ? 'titolo' : 'titoli'}`;
    return titoli.length;
  } catch (errore) {
    document.querySelector('#vuoto').hidden = true;
    document.querySelector('#errore-catalogo').hidden = false;
    throw errore;
  } finally {
    catalogo.setAttribute('aria-busy', 'false');
  }
}

async function caricaDettagli(id) {
  dettagli.setAttribute('aria-busy', 'true');
  const pulsanti = schede.querySelectorAll('button');
  for (const pulsante of pulsanti) pulsante.disabled = true;
  contenutoDettagli.replaceChildren(elemento('p', 'Caricamento dei dettagli…'));
  mostraMessaggio('Caricamento dei dettagli…');
  try {
    const titolo = await richiedi(`/api/titoli/${id}`);
    const elenco = document.createElement('dl');
    const voci = { ID: titolo.id, Tipo: titolo.tipo === 'film' ? 'Film' : 'Serie TV', Genere: titolo.genere, Anno: titolo.anno, Stato: stati[titolo.stato] };
    for (const [nome, valore] of Object.entries(voci)) {
      const gruppo = document.createElement('div');
      gruppo.append(elemento('dt', nome), elemento('dd', valore));
      elenco.append(gruppo);
    }
    contenutoDettagli.replaceChildren(elemento('h3', titolo.titolo), elenco);
    mostraMessaggio(`Dettagli di «${titolo.titolo}» caricati.`);
    document.querySelector('#titolo-dettagli').focus();
  } catch (errore) {
    contenutoDettagli.replaceChildren(elemento('p', errore.message));
    mostraMessaggio(errore.message, 'errore');
  } finally {
    dettagli.setAttribute('aria-busy', 'false');
    for (const pulsante of pulsanti) pulsante.disabled = false;
  }
}

modulo.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (campi.disabled) return;
  // Controlliamo tutti i campi, non soltanto il primo errore.
  const campiErrati = nomiCampi.filter((nome) => !validaCampo(nome));
  if (campiErrati.length > 0) {
    mostraMessaggio('Controlla i campi indicati prima di aggiungere il titolo.', 'errore');
    modulo.elements[campiErrati[0]].focus();
    return;
  }
  const dati = {
    titolo: modulo.elements.titolo.value.trim(),
    tipo: modulo.elements.tipo.value,
    genere: modulo.elements.genere.value.trim(),
    anno: Number(modulo.elements.anno.value),
    stato: modulo.elements.stato.value
  };
  campi.disabled = true;
  salva.textContent = 'Salvataggio…';
  mostraMessaggio('Salvataggio del titolo…');
  try {
    const nuovo = await richiedi('/api/titoli', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dati)
    });
    modulo.reset();
    try {
      await caricaCatalogo();
      mostraMessaggio(`«${nuovo.titolo}» aggiunto al catalogo.`, 'successo');
    } catch (errore) {
      mostraMessaggio(`Titolo salvato, ma il catalogo non è stato aggiornato. ${errore.message}`, 'errore');
    }
  } catch (errore) {
    // Conserviamo i dati digitati, così l'utente può correggerli o riprovare.
    mostraMessaggio(errore.message, 'errore');
  } finally {
    campi.disabled = false;
    salva.textContent = 'Aggiungi al catalogo ＋';
  }
});

async function avvia() {
  campi.disabled = true;
  try {
    const numero = await caricaCatalogo();
    mostraMessaggio(numero === 0 ? 'Il catalogo è pronto. Aggiungi la tua prima storia.' : 'Il tuo catalogo è pronto.');
  } catch (errore) {
    mostraMessaggio(errore.message, 'errore');
  } finally {
    campi.disabled = false;
  }
}

avvia();
