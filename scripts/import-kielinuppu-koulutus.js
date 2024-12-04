const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

initializeApp({
  credential: cert(require('../serviceAccountKey.json'))  // Yksi taso ylös juureen
});

const db = getFirestore();

function parseJsonField(jsonString) {
  try {
    if (!jsonString) return null;
    // Korvataan single quotet double quoteilla JSON.parse varten
    const fixedString = jsonString.replace(/'/g, '"');
    return JSON.parse(fixedString);
  } catch (error) {
    console.error('JSON parsing virhe:', error);
    return null;
  }
}

async function importKielinuppuKoulutusMateriaali() {
  try {
    console.log('Luetaan koulutusmateriaali.json...');
    const materiaalit = JSON.parse(fs.readFileSync('../data/koulutusmateriaali.json', 'utf8')); // Yksi taso ylös ja data-kansioon
    
    for (const materiaali of materiaalit) {
      const docId = materiaali.ID.toString();
      
      const materiaaliData = {
        ...materiaali,
        Created: new Date(materiaali.Created),
        Updated: new Date(materiaali.Updated),
        ID: Number(materiaali.ID),
        järjestys: Number(materiaali.järjestys) || null
      };
      
      await db.collection('kielinuppu-koulutusmateriaali').doc(docId).set(materiaaliData);
      console.log(`Koulutusmateriaali ${docId} lisätty`);
    }
    console.log('Koulutusmateriaalit viety Firestoreen!');
  } catch (error) {
    console.error('Virhe koulutusmateriaaleissa:', error);
  }
}

async function importKielinuppuKoulutusSisalto() {
  try {
    console.log('Luetaan koulutussisalto.json...');
    const sisallot = JSON.parse(fs.readFileSync('../data/koulutussisalto.json', 'utf8')); // Yksi taso ylös ja data-kansioon
    
    for (const sisalto of sisallot) {
      const docId = sisalto.ID.toString();
      
      // Parsitaan PDF-kenttä jos se on JSON-string
      const pdfObj = parseJsonField(sisalto.PDF);
      const kuvaObj = parseJsonField(sisalto.Kuva);
      
      const sisaltoData = {
        ...sisalto,
        PDF: pdfObj || sisalto.PDF,
        Kuva: kuvaObj || sisalto.Kuva,
        Created: new Date(sisalto.Created),
        Updated: new Date(sisalto.Updated),
        ID: Number(sisalto.ID),
        'mihin kuuluu': Number(sisalto['mihin kuuluu']) || null,
        järjestysnum: sisalto.järjestysnum ? Number(sisalto.järjestysnum) : null
      };
      
      await db.collection('kielinuppu-koulutussisalto').doc(docId).set(sisaltoData);
      console.log(`Koulutussisältö ${docId} lisätty`);
    }
    console.log('Koulutussisällöt viety Firestoreen!');
  } catch (error) {
    console.error('Virhe koulutussisällöissä:', error);
  }
}

async function importAll() {
  await importKielinuppuKoulutusMateriaali();
  await importKielinuppuKoulutusSisalto();
  console.log('Kaikki data siirretty onnistuneesti!');
}

importAll();