const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

function parseJsonField(jsonString) {
  try {
    // Korvataan single quotet double quoteilla JSON.parse varten
    const fixedString = jsonString.replace(/'/g, '"');
    return JSON.parse(fixedString);
  } catch (error) {
    console.error('JSON parsing virhe:', error);
    return null;
  }
}

async function importBingot() {
  try {
    console.log('Luetaan Bingot.json...');
    const bingot = JSON.parse(fs.readFileSync('./data/Bingot.json', 'utf8'));
    
    for (const bingo of bingot) {
      const docId = bingo.ID.toString();
      
      // Parsitaan JSON-stringit objekteiksi
      const kuvaObj = parseJsonField(bingo.kuva);
      const pelialustatObj = parseJsonField(bingo.pelialustat);

      const bingoData = {
        ...bingo,
        kuva: kuvaObj,
        pelialustat: pelialustatObj,
        Created: new Date(bingo.Created),
        Updated: new Date(bingo.Updated),
        // Varmistetaan että numerokentät ovat numeroina
        ID: Number(bingo.ID),
        'osoite vai ei': Number(bingo['osoite vai ei'])
      };
      
      await db.collection('bingot').doc(docId).set(bingoData);
      console.log(`Bingo ${docId} lisätty`);
    }
    console.log('Bingot viety Firestoreen!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

importBingot();