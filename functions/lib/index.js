"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const storage_1 = require("firebase-admin/storage");
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const storage = (0, storage_1.getStorage)();
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
async function createFolderStructure(bucket, basePath) {
    const mainFolder = `${basePath}/`;
    const mainFolderFile = bucket.file(`${mainFolder}.placeholder`);
    await mainFolderFile.save('');
    logger.info(`Created main folder placeholder for: ${mainFolder}`);
    for (const [docType, subSections] of Object.entries(CLIENT_FOLDERS.documents)) {
        for (const subSection of subSections) {
            const folderPath = `${mainFolder}${docType}/${subSection}/`;
            const placeholderFile = bucket.file(`${folderPath}.placeholder`);
            await placeholderFile.save('');
            logger.info(`Created placeholder for: ${folderPath}`);
        }
    }
}
exports.createClientUser = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    // Check if the user calling the function is an admin.
    if (((_b = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
        logger.error("Unauthorized user tried to call createClientUser", { uid: (_c = request.auth) === null || _c === void 0 ? void 0 : _c.uid });
        throw new https_1.HttpsError('permission-denied', 'Only admins can create new client users.');
    }
    const { email, password, firstName, lastName, companyName, joinDate, paymentDate } = request.data;
    // Validate input data
    if (!email || !password || !firstName || !lastName || !companyName || !joinDate || !paymentDate) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields for client creation.');
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
        logger.info(`Successfully created user ${userRecord.uid} and their folder structure.`);
        return { success: true, uid: userRecord.uid };
    }
    catch (error) {
        logger.error("Error creating client user:", error);
        // Provide a more specific error message if available
        if (error.code === 'auth/email-already-exists') {
            throw new https_1.HttpsError('already-exists', 'A user with this email address already exists.');
        }
        throw new https_1.HttpsError('internal', 'An unexpected error occurred while creating the client.');
    }
});
//# sourceMappingURL=index.js.map