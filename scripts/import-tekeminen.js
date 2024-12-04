const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function importTekeminen() {
  try {
    console.log('Luetaan Tekeminen.json...');
    const tekemiset = JSON.parse(fs.readFileSync('./data/Tekeminen.json', 'utf8'));
    
    for (const tekeminen of tekemiset) {
      const docId = tekeminen.ID.toString();
      await db.collection('tekeminen').doc(docId).set(tekeminen);
    }
    console.log('Tekemiset viety Firestoreen!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

importTekeminen();