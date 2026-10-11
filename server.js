const creaApp = require('./app');

const app = creaApp();
const porta = process.env.PORT || 3000;

app.listen(porta, (errore) => {
  if (errore) {
    console.error('Impossibile avviare il server:', errore.message);
    process.exitCode = 1;
    return;
  }
  console.log(`BellaFilm: http://localhost:${porta}/api/titoli`);
});
