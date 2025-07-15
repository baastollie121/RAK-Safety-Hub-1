
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const documentsFilePath = path.resolve(process.cwd(), 'documents.json');

export async function POST(request: Request) {
  try {
    const { documentUrl, displayName, documentSection, userId, companyName } = await request.json();

    if (!documentUrl || !displayName || !documentSection || !userId || !companyName) {
      return NextResponse.json({ message: 'Missing required fields (documentUrl, displayName, documentSection, userId, companyName)' }, { status: 400 });
    }

    let documents = [];
    try {
      const fileContent = await fs.readFile(documentsFilePath, 'utf-8');
      documents = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File does not exist, initialize with an empty array
        documents = [];
      } else {
        console.error('Error reading documents.json:', error);
        return NextResponse.json({ message: 'Failed to read documents' }, { status: 500 });
      }
    }

    const newDocument = {
      id: Date.now().toString(), // Simple unique ID
      documentUrl,
      displayName,
      documentSection,
      userId,        // New: Store the user ID
      companyName,   // New: Store the company name
      createdAt: new Date().toISOString(),
    };

    documents.push(newDocument);

    await fs.writeFile(documentsFilePath, JSON.stringify(documents, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Document added successfully', document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error adding document:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
