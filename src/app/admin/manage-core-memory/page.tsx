
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit } from 'lucide-react';

export default function ManageCoreMemoryPage() {
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentKey, setDocumentKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!documentUrl || !documentKey) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/core-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: documentUrl,
          key: documentKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Core Memory Updated',
          description: data.message,
        });
        setDocumentUrl('');
        setDocumentKey('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Update Memory',
          description: data.message || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the server. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
       <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Manage AI Core Memory
        </h1>
        <p className="text-muted-foreground">
          Add new documents to Winston's permanent knowledge base.
        </p>
      </header>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BrainCircuit />
            Add Document to Memory
          </CardTitle>
          <CardDescription>
            Provide a URL and a key name for the document you want the AI to remember.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentKey">Document Key / Name</Label>
              <Input
                id="documentKey"
                type="text"
                placeholder="e.g., Company Safety Policy"
                value={documentKey}
                onChange={(e) => setDocumentKey(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL (e.g., from Uploadthing)</Label>
              <Input
                id="documentUrl"
                type="url"
                placeholder="https://u7t73lof0p.ufs.sh/f/your-document.pdf"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Adding to Memory...' : 'Add to Core Memory'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
