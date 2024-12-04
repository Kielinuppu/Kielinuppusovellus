const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function importMuskarit() {
  try {
    console.log('Luetaan Muskarit.json...');
    const muskarit = JSON.parse(fs.readFileSync('./data/Muskarit.json', 'utf8'));
    
    for (const muskari of muskarit) {
      const docId = muskari.ID.toString();
      const muskariData = {
        ...muskari,
        Created: new Date(muskari.Created),
        Updated: new Date(muskari.Updated)
      };
      
      await db.collection('muskarit').doc(docId).set(muskariData);
    }
    console.log('Muskarit viety Firestoreen!');
  } catch (error) {
    console.error('Virhe:', error);
    process.exit(1);
  }
}

importMuskarit();