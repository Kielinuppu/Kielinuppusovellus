const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function importPelit() {
  try {
    console.log('Luetaan Pelit.json...');
    // Käytetään täsmälleen samaa polkua kuin tekeminen-siirrossa
    const pelit = JSON.parse(fs.readFileSync('./data/Pelit.json', 'utf8'));
    
    for (const peli of pelit) {
      const docId = peli.ID.toString();
      const peliData = {
        ...peli,
        Created: new Date(peli.Created),
        Updated: new Date(peli.Updated)
      };
      
      await db.collection('pelit').doc(docId).set(peliData);
    }
    console.log('Pelit viety Firestoreen!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

importPelit();