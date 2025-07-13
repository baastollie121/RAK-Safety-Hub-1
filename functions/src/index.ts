
'use server';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import {getStorage, Bucket} from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

admin.initializeApp();
const db = admin.firestore();
const storage = getStorage();

const CLIENT_FOLDERS = {
  documents: {
    safety: [
      'Safety Manual',
      'Safety Policies & Procedures',
      'Risk Assessments (HIRA)',
      'Safe Work Procedures (SWP)',
      'Method Statements',
      'Incident Reports & Investigations',
      'Emergency Plans',
      'Toolbox Talks & Meeting Minutes',
      'Legal & Other Appointments',
      'Registers & Checklists',
      'Fall Protection & Working at Heights',
      'Gap Assessments (ISO 45001, Client-specific)',
      'Legal Compliance Audit Reports',
      'Internal Audit Plan',
      'Internal Audit Reports',
    ],
    environmental: [
      'Environmental Manual',
      'Environmental Policy',
      'Impact Assessments',
      'Waste Management Plans',
      'Environmental Incident Reports',
      'Environmental Inspection Checklist',
    ],
    quality: [
      'Quality Manual',
      'Quality Policy',
      'Quality Procedures & Work Instructions',
      'Audit Reports (Internal & External)',
      'Non-conformance & Corrective Actions',
      'Management Reviews',
      'Client & Supplier',
      'Quality Control Checklists',
      'Tool & Equipment Inspection Logs',
    ],
    hr: [
      'HR Policies & Procedures',
      'General Appointments',
      'Hiring Policy',
      'Company Property Policy',
      'Performance Management',
      'Disciplinary & Grievance',
      'Leave Request Forms',
      'Employment Contracts & Agreements',
      'Warning Templates',
    ],
  },
};

async function createFolderStructure(bucket: Bucket, basePath: string) {
  for (const [docType, subSections] of Object.entries(
    CLIENT_FOLDERS.documents
  )) {
    for (const subSection of subSections) {
      const folderPath = `${basePath}/${docType}/${subSection}/.placeholder`;
      const file = bucket.file(folderPath);
      await file.save('');
      logger.info(`Created placeholder for: ${folderPath}`);
    }
  }
}

export const setAdminClaim = onCall(async request => {
  if (request.auth?.token.role !== 'admin') {
    logger.error('Unauthorized attempt to set admin claim', {
      uid: request.auth?.uid,
    });
    throw new HttpsError(
      'permission-denied',
      'Only admins can set other admins.'
    );
  }

  const email = request.data.email;
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required.');
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {role: 'admin'});
    return {message: `Success! ${email} has been made an admin.`};
  } catch (error) {
    logger.error('Error setting admin claim:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while setting the admin claim.'
    );
  }
});

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
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {role: 'client'});

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

    const bucket = storage.bucket();
    const clientBasePath = `clients/${userRecord.uid}`;
    await createFolderStructure(bucket, clientBasePath);

    logger.info(
      `Successfully created user ${userRecord.uid} and their folder structure.`
    );
    return {success: true, uid: userRecord.uid};
  } catch (error: any) {
    logger.error('Error creating client user:', error);

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

export const sendExpiringTrainingNotifications = onSchedule(
  'every 24 hours',
  async event => {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(today.getDate() + 30);

    logger.info('Running daily check for expiring training...');

    const trainingDataSnapshot = await db.collection('employeeTraining').get();

    if (trainingDataSnapshot.empty) {
      logger.info('No training data found. Exiting function.');
      return null;
    }

    for (const doc of trainingDataSnapshot.docs) {
      const trainingData = doc.data();
      const clientUid = trainingData.clientUid;

      if (!clientUid) continue;

      for (const [course, expiryDateStr] of Object.entries(
        trainingData.records
      )) {
        if (typeof expiryDateStr !== 'string') continue;

        const expiryDate = new Date(expiryDateStr);
        if (expiryDate > today && expiryDate <= oneMonthFromNow) {
          const notification = {
            clientUid,
            type: 'TRAINING_EXPIRY',
            message: `Training "${course}" for employee ${
              trainingData.employeeName
            } is expiring on ${expiryDate.toLocaleDateString()}.`,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await db.collection('notifications').add(notification);
          logger.info(
            `Created notification for expiring training: ${notification.message}`
          );
        }
      }
    }

    logger.info('Finished checking for expiring training.');
    return null;
  }
);
