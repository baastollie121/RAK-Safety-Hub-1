
'use server';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import {getStorage, Bucket} from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

admin.initializeApp();
const db = admin.firestore();
const storage = getStorage();

export const createClientUser = onCall(async request => {
  if (request.auth?.token.role !== 'admin') {
    logger.error('Unauthorized user tried to call createClientUser', {
      uid: request.auth?.uid,
    });
    throw new HttpsError(
      'permission-denied',
      'Only admins can create new client users.'
    );
  }

  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    joinDate,
    paymentDate,
  } = request.data;

  // Validate input data
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !companyName ||
    !joinDate ||
    !paymentDate
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Missing required fields for client creation.'
    );
  }

  try {
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Set custom claims for the user (e.g., role)
    await admin.auth().setCustomUserClaims(userRecord.uid, {role: 'client'});

    // Save user details to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      companyName,
      email,
      role: 'client',
      joinDate: new Date(joinDate),
      paymentDate: new Date(paymentDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // The storage folder structure is implicitly created and secured by storage rules.
    // No need to create placeholder files.

    logger.info(
      `Successfully created user ${userRecord.uid}. Their folder structure is secured by rules.`
    );
    return {success: true, uid: userRecord.uid};
  } catch (error: any) {
    logger.error('Error creating client user:', error);

    // Provide a more specific error message if available
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'A user with this email address already exists.'
      );
    }

    throw new HttpsError(
      'internal',
      'An unexpected error occurred while creating the client.'
    );
  }
});
