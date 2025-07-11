
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { auth } from 'firebase-admin';
import { getAuth } from 'firebase/auth';


// Helper function to initialize Firebase Admin SDK
async function getAdminApp() {
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );

  if (!getApps().length) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApps()[0];
}


export async function POST(req: NextRequest) {
  try {
    // We will use this in the future to secure the route.
    // For now, we will allow any authenticated user to upload.
    // const adminApp = await getAdminApp();
    // const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    // if (!authToken) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const decodedToken = await auth(adminApp).verifyIdToken(authToken);
    // if (!decodedToken) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const storagePath = formData.get('storagePath') as string;

    if (!file || !storagePath) {
      return NextResponse.json({ error: 'File and storage path are required.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, buffer, { contentType: file.type });
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ downloadURL });
  } catch (error) {
    console.error('Server-side upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
