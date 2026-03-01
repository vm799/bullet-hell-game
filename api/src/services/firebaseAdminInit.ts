/**
 * Firebase Admin SDK Initialization
 */

import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 */
export async function initializeFirebase(): Promise<void> {
  if (admin.apps.length > 0) {
    console.log('Firebase already initialized');
    return;
  }

  try {
    // Get credentials from environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const clientId = process.env.FIREBASE_CLIENT_ID;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Missing Firebase credentials in environment variables');
    }

    const credentials = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: clientId,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    };

    admin.initializeApp({
      credential: admin.credential.cert(credentials as admin.ServiceAccount),
      databaseURL: `https://${projectId}.firebaseio.com`,
    });

    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin instance
 */
export function getFirebaseAdmin(): typeof admin {
  if (admin.apps.length === 0) {
    throw new Error('Firebase not initialized');
  }
  return admin;
}

/**
 * Get Firebase Realtime Database reference
 */
export function getDatabase() {
  return admin.database();
}

/**
 * Get Firebase Auth reference
 */
export function getAuth() {
  return admin.auth();
}
