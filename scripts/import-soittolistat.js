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

async function importData() {
  try {
    console.log('Aloitetaan soittolistojen tuonti...');
    
    const playlists = JSON.parse(readFileSync('./data/Soittolistat.json', 'utf8'));
    
    for (const playlist of playlists) {
      const playlistData = {
        ...playlist,
        ID: Number(playlist.ID),
        Created: new Date(playlist.Created),
        Updated: new Date(playlist.Updated),
        Lauluts: playlist.Lauluts.toString().split(',').map(id => id.trim())
      };
      
      await db.collection('soittolistat').doc(playlist.ID.toString()).set(playlistData);
      console.log(`Soittolista ${playlist.ID} (${playlist.Name}) lisätty`);
    }

    console.log('Soittolistat siirretty onnistuneesti!');
  } catch (error) {
    console.error('Virhe:', error);
  }
}

importData();