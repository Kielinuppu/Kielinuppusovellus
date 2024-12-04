const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))
});

const db = getFirestore();

async function checkAiheet() {
  try {
    console.log('\nAIHEET:');
    const snapshot = await db.collection('aiheet').get();
    snapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
      console.log('-------------------');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkLaulut() {
  try {
    console.log('\nLAULUT:');
    const snapshot = await db.collection('laulut').get();
    console.log('Laulujen määrä:', snapshot.size);
    snapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
      console.log('-------------------');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Suorita molemmat tarkistukset
async function runChecks() {
  await checkAiheet();
  await checkLaulut();
}

runChecks();