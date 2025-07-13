import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";

admin.initializeApp();
const db = admin.firestore();
const storage = getStorage();

// Define a directory structure for each client
const CLIENT_FOLDERS = {
    'documents': {
        'safety': [
            'Safety Manual', 'Safety Policies & Procedures', 'Risk Assessments (HIRA)', 
            'Safe Work Procedures (SWP)', 'Method Statements', 'Incident Reports & Investigations',
            'Emergency Plans', 'Toolbox Talks & Meeting Minutes', 'Legal & Other Appointments',
            'Registers & Checklists', 'Fall Protection & Working at Heights', 
            'Gap Assessments (ISO 45001, Client-specific)', 'Legal Compliance Audit Reports',
            'Internal Audit Plan', 'Internal Audit Reports'
        ],
        'environmental': [
            'Environmental Manual', 'Environmental Policy', 'Impact Assessments',
            'Waste Management Plans', 'Environmental Incident Reports', 'Environmental Inspection Checklist'
        ],
        'quality': [
            'Quality Manual', 'Quality Policy', 'Quality Procedures & Work Instructions',
            'Audit Reports (Internal & External)', 'Non-conformance & Corrective Actions',
            'Management Reviews', 'Client & Supplier', 'Quality Control Checklists',
            'Tool & Equipment Inspection Logs'
        ],
        'hr': [
            'HR Policies & Procedures', 'General Appointments', 'Hiring Policy',
            'Company Property Policy', 'Performance Management', 'Disciplinary & Grievance',
            'Leave Request Forms', 'Employment Contracts & Agreements', 'Warning Templates'
        ]
    }
};

async function createFolderStructure(bucket: any, basePath: string) {
    const mainFolder = `${basePath}/`;
    // Create a placeholder file to make the "folder" appear in the Firebase console
    const mainFolderFile = bucket.file(`${mainFolder}.placeholder`);
    await mainFolderFile.save('');
    functions.logger.info(`Created main folder placeholder for: ${mainFolder}`);

    for (const [docType, subSections] of Object.entries(CLIENT_FOLDERS.documents)) {
        for (const subSection of subSections) {
            const folderPath = `${mainFolder}${docType}/${subSection}/`;
            const placeholderFile = bucket.file(`${folderPath}.placeholder`);
            await placeholderFile.save('');
            functions.logger.info(`Created placeholder for: ${folderPath}`);
        }
    }
}


// --- Callable Functions ---

// Sets the admin custom claim on a user. Must be called by an existing admin.
export const setAdminClaim = functions.https.onCall(async (data, context) => {
    // Check if the caller is an admin
    if (context.auth?.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can set other admins.');
    }

    const email = data.email;
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
        return { message: `Success! ${email} has been made an admin.` };
    } catch (error) {
        functions.logger.error("Error setting admin claim:", error);
        throw new HttpsError('internal', 'An error occurred while setting the admin claim.');
    }
});


// Onboards a new client. Must be called by an admin.
export const createClientUser = functions.https.onCall(async (data, context) => {
    // Check if the user calling the function is an admin.
    if (context.auth?.token?.role !== 'admin') {
        functions.logger.error("Unauthorized user tried to call createClientUser", { uid: context.auth?.uid });
        throw new HttpsError('permission-denied', 'Only admins can create new client users.');
    }

    const { email, password, firstName, lastName, companyName, joinDate, paymentDate } = data;
    
    // Validate input data
    if (!email || !password || !firstName || !lastName || !companyName || !joinDate || !paymentDate) {
        throw new HttpsError('invalid-argument', 'Missing required fields for client creation.');
    }

    try {
        // Create the user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        // Set custom claims for the user (e.g., role)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'client' });

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

        // Create a dedicated storage bucket folder structure for the client
        const bucket = storage.bucket(); // Default bucket
        const clientBasePath = `clients/${userRecord.uid}`;
        await createFolderStructure(bucket, clientBasePath);

        functions.logger.info(`Successfully created user ${userRecord.uid} and their folder structure.`);
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        functions.logger.error("Error creating client user:", error);
        
        // Provide a more specific error message if available
        if (error.code === 'auth/email-already-exists') {
            throw new HttpsError('already-exists', 'A user with this email address already exists.');
        }

        throw new HttpsError('internal', 'An unexpected error occurred while creating the client.');
    }
});


// --- Scheduled Functions ---

// Runs every day at a specified time to check for expiring training
export const sendExpiringTrainingNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(today.getDate() + 30);
    
    functions.logger.info('Running daily check for expiring training...');

    const trainingDataSnapshot = await db.collection('employeeTraining').get();

    if (trainingDataSnapshot.empty) {
        functions.logger.info('No training data found. Exiting function.');
        return null;
    }

    for (const doc of trainingDataSnapshot.docs) {
        const trainingData = doc.data();
        const clientUid = trainingData.clientUid; // Assuming you store clientUid with the training data

        for (const [course, expiryDateStr] of Object.entries(trainingData.records)) {
            if (typeof expiryDateStr !== 'string') continue;
            
            const expiryDate = new Date(expiryDateStr);
            if (expiryDate > today && expiryDate <= oneMonthFromNow) {
                // Training is expiring within 30 days
                const notification = {
                    clientUid,
                    type: 'TRAINING_EXPIRY',
                    message: `Training "${course}" for employee ${trainingData.employeeName} is expiring on ${expiryDate.toLocaleDateString()}.`,
                    isRead: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                
                await db.collection('notifications').add(notification);
                functions.logger.info(`Created notification for expiring training: ${notification.message}`);
            }
        }
    }

    functions.logger.info('Finished checking for expiring training.');
    return null;
});
