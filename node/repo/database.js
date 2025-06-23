// Instanciacion de firebase y firestore

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import fs from 'fs'

const serviceAccount = JSON.parse(
  fs.readFileSync('./.secrets/proyflukyresorts-fdb0444dd8fa.json', 'utf8')
);
initializeApp({
  credential: cert(serviceAccount)
});


export const db = getFirestore();
