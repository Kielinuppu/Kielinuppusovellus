const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function importData() {
  try {
    const users = JSON.parse(fs.readFileSync('../data/kayttajat.json', 'utf8'));
    const playlists = JSON.parse(fs.readFileSync('../data/soittolistat.json', 'utf8'));

    for (const user of users) {
      await db.collection('kayttajat').doc(user.Koodi).set(user);
      console.log('Käyttäjä lisätty:', user.Koodi);
    }

    for (const playlist of playlists) {
      await db.collection('soittolistat').doc(playlist.ID.toString()).set(playlist);
      console.log('Soittolista lisätty:', playlist.ID);
    }

    console.log('Tiedot siirretty onnistuneesti!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

importData();