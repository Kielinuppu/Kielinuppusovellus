import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import serviceAccount from '../serviceAccountKey.json' assert { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function reimportUsers() {
  try {
    console.log('Aloitetaan käyttäjien uudelleentuonti...');

    // Poistetaan ensin kaikki käyttäjät
    const snapshot = await db.collection('kayttajat').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Vanhat käyttäjät poistettu');
    
    // Luetaan käyttäjädata ja järjestetään se ID:n mukaan
    const kayttajat = JSON.parse(readFileSync('./data/kayttajat.json', 'utf8'))
      .sort((a, b) => a.ID - b.ID);
    
    // Lisätään käyttäjät batch-operaatiolla
    const addBatch = db.batch();
    
    for (const kayttaja of kayttajat) {
      const docId = kayttaja.ID.toString();
      const docRef = db.collection('kayttajat').doc(docId);
      
      const kayttajaData = {
        ...kayttaja,
        ID: Number(kayttaja.ID),
        Created: new Date(kayttaja.Created),
        Updated: new Date(kayttaja.Updated),
        ...(kayttaja['last used'] && {'last used': new Date(kayttaja['last used'])})
      };
      
      addBatch.set(docRef, kayttajaData);
    }

    await addBatch.commit();
    console.log('Kaikki käyttäjät tuotu uudelleen järjestyksessä!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

reimportUsers();