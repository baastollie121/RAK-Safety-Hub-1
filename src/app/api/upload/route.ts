
'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return NextResponse.json({ error: 'This API route is no longer used. Uploads are handled client-side.' }, { status: 410 });
}
