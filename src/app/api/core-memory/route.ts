
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// IMPORTANT: The path is relative to the project root where `next` is run
const coreMemoryFilePath = path.resolve(process.cwd(), 'core-memory.json');

interface CoreMemoryEntry {
    key: string;
    url: string;
}

export async function POST(request: Request) {
  try {
    const { url, key } = await request.json();

    if (!url || !key) {
      return NextResponse.json({ message: 'Missing required fields: url and key' }, { status: 400 });
    }

    let memory: CoreMemoryEntry[] = [];
    try {
      const fileContent = await fs.readFile(coreMemoryFilePath, 'utf-8');
      memory = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File does not exist, initialize with an empty array
        memory = [];
      } else {
        console.error('Error reading core-memory.json:', error);
        return NextResponse.json({ message: 'Failed to read core memory' }, { status: 500 });
      }
    }
    
    // Check if key already exists to prevent duplicates
    const existingEntryIndex = memory.findIndex(entry => entry.key === key);
    if(existingEntryIndex !== -1) {
        // Update existing entry
        memory[existingEntryIndex].url = url;
    } else {
        // Add new entry
        const newEntry: CoreMemoryEntry = { key, url };
        memory.push(newEntry);
    }


    await fs.writeFile(coreMemoryFilePath, JSON.stringify(memory, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Core memory updated successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error updating core memory:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
