import admin from 'firebase-admin';

import nconf from '../../../config';

const firebaseConfig = nconf.get('firebase');

const defaultApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.credential),
  databaseURL: firebaseConfig.databaseURL,
}, firebaseConfig.name);

export default defaultApp;
