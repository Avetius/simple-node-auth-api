import admin from 'firebase-admin';

const nconf = {
  type: process.env.AWS_TYPE,
  project_id: process.env.AWS_PROJECT_ID,
  private_key_id: process.env.AWS_PRIVATE_KEY_ID,
  private_key: process.env.AWS_PRIVATE_KEY,
  client_email: process.env.AWS_CLIENT_EMAIL,
  client_id: process.env.AWS_CLIENT_ID,
  auth_uri: process.env.AWS_AUTH_URI,
  token_uri: process.env.AWS_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AWS_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.AWS_CLIENT_X509_CERT_URL,
};

const firebaseConfig = nconf.get('firebase');

const defaultApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.credential),
  databaseURL: firebaseConfig.databaseURL,
}, firebaseConfig.name);

export default defaultApp;
