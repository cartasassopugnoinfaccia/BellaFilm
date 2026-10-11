function gestisciErrore(errore, req, res, next) {
  if (res.headersSent) {
    return next(errore);
  }

  if (errore.type === 'entity.parse.failed') {
    return res.status(400).json({ errore: 'JSON non valido.' });
  }

  // Conserviamo gli errori HTTP del parser (per esempio 413: corpo troppo grande).
  if (errore.status >= 400 && errore.status < 500) {
    return res.status(errore.status).json({ errore: 'Richiesta non valida.' });
  }

  console.error(errore);
  res.status(500).json({ errore: 'Errore interno del server.' });
}

module.exports = gestisciErrore;
