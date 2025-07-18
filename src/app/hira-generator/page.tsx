
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';

export default function HIRAGeneratorPage() {

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-xl text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 font-headline">
                    <ClipboardCheck className="size-8" /> This Page has Moved
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base">
                    The simple HIRA Generator has been upgraded! It is now part of the more powerful and comprehensive Risk Assessment Generator.
                </CardDescription>
                <p className="mt-4">
                    Please use the new tool for all your risk assessment needs.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/risk-assessment">Go to Risk Assessment Generator</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
