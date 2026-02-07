// setAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// Inicjalizacja Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Podaj UID użytkownika, którego chcesz zrobić adminem
const uid = "Fm4icKBO2cPeTRV7pI458mCISBb2";

admin.auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Admin ustawiony dla UID: ${uid}`);
    process.exit(0);
  })
  .catch(err => {
    console.error("Błąd podczas nadawania roli admin:", err);
    process.exit(1);
  });
