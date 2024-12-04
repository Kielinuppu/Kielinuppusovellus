const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Alustetaan Firebase Admin service keyllä
initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function importData() {
  try {
    // Lue JSON tiedostot
    console.log('Luetaan JSON tiedostot...');
    const aiheet = JSON.parse(fs.readFileSync('./data/Aiheet.json', 'utf8'));
    const laulut = JSON.parse(fs.readFileSync('./data/Laulut.json', 'utf8'));

    // Tarkista ja tulosta ensimmäisen aiheen rakenne
    console.log('Esimerkki aihe:', aiheet[0]);

    // Vie aiheet Firestoreen
    for (const aihe of aiheet) {
      if (!aihe || typeof aihe !== 'object') {
        console.log('Ohitetaan virheellinen aihe:', aihe);
        continue;
      }
      // Käytetään indeksiä dokumentin ID:nä jos aihe.id puuttuu
      const docId = aihe.id ? aihe.id.toString() : aiheet.indexOf(aihe).toString();
      await db.collection('aiheet').doc(docId).set(aihe);
    }
    console.log('Aiheet viety Firestoreen!');

    // Tarkista ja tulosta ensimmäisen laulun rakenne
    console.log('Esimerkki laulu:', laulut[0]);

    // Vie laulut Firestoreen
    for (const laulu of laulut) {
      if (!laulu || typeof laulu !== 'object') {
        console.log('Ohitetaan virheellinen laulu:', laulu);
        continue;
      }
      // Käytetään indeksiä dokumentin ID:nä jos laulu.id puuttuu
      const docId = laulu.id ? laulu.id.toString() : laulut.indexOf(laulu).toString();
      await db.collection('laulut').doc(docId).set(laulu);
    }
    console.log('Laulut viety Firestoreen!');

  } catch (error) {
    console.error('Virhe:', error);
  }
}

importData();