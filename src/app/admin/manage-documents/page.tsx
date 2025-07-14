
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ManageDocumentsPage() {
  const [documentUrl, setDocumentUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [documentSection, setDocumentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sections = [
    { value: 'hira-reports', label: 'HIRA Reports' },
    { value: 'method-statements', label: 'Method Statements' },
    { value: 'risk-assessments', label: 'Risk Assessments' },
    { value: 'she-plans', label: 'SHE Plans' },
    { value: 'safe-work-procedures', label: 'Safe Work Procedures' },
    { value: 'general-documents', label: 'General Documents' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!documentUrl || !displayName || !documentSection) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentUrl,
          displayName,
          documentSection,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Document Added',
          description: data.message,
        });
        // Reset form fields
        setDocumentUrl('');
        setDisplayName('');
        setDocumentSection('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Add Document',
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Manage Documents</CardTitle>
          <CardDescription>Add new documents to the library.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL (from Uploadthing)</Label>
              <Input
                id="documentUrl"
                type="url"
                placeholder="https://uploadthing.com/f/your-document.pdf"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Document Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="e.g., Q2 Safety Report"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentSection">Document Section</Label>
              <Select value={documentSection} onValueChange={setDocumentSection} required>
                <SelectTrigger id="documentSection">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Adding Document...' : 'Add Document'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
