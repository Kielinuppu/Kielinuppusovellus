import { db } from './firebase-temp.js';
import admin from 'firebase-admin';

async function updateLaulutCollection() {
  try {
    console.log("Aloitetaan laulut-kokoelman päivitys...");
    
    const querySnapshot = await db.collection('laulut').get();
    console.log(`Löydettiin ${querySnapshot.size} dokumenttia`);
    
    let updatedCount = 0;
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let updates = {};
      
      if (data['Laulun kuvake']) {
        let kuvakeData = JSON.parse(data['Laulun kuvake'].replace(/'/g, '"'));
        kuvakeData.filename = kuvakeData.filename.replace('.jpg', '.png');
        kuvakeData.url = kuvakeData.url.replace('.jpg', '.png');
        updates['Laulun kuvake'] = JSON.stringify(kuvakeData).replace(/"/g, "'");
      }
      
      if (Object.keys(updates).length > 0) {
        console.log(`Päivitetään dokumentti ID ${doc.id}...`);
        await db.collection('laulut').doc(doc.id).update(updates);
        updatedCount++;
      }
    }
    
    console.log(`Päivitys valmis! Päivitettiin ${updatedCount} dokumenttia.`);
  } catch (error) {
    console.error('Virhe päivityksessä:', error);
  }
}

updateLaulutCollection();