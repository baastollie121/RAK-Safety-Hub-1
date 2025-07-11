
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
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
