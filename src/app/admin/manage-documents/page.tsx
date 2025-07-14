
'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, File, Loader2, Download } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, deleteObject, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { cn } from '@/lib/utils';

interface Doc {
  id: string; // Will use the full storage path as ID for uniqueness
  name: string;
  path: string;
}

interface DocCategory {
  [subSection: string]: Doc[];
}

interface AllDocs {
  safety: DocCategory;
  environmental: DocCategory;
  quality: DocCategory;
  hr: DocCategory;
}

const docStructure = {
    safety: [
        'Safety Manual', 'Safety Policies & Procedures', 'Risk Assessments (HIRA)',
        'Safe Work Procedures (SWP)', 'Method Statements', 'Incident Reports & Investigations',
        'Emergency Plans', 'Toolbox Talks & Meeting Minutes', 'Legal & Other Appointments',
        'Registers & Checklists', 'Fall Protection & Working at Heights',
        'Gap Assessments (ISO 45001, Client-specific)', 'Legal Compliance Audit Reports',
        'Internal Audit Plan', 'Internal Audit Reports'
    ],
    environmental: [
        'Environmental Manual', 'Environmental Policy', 'Impact Assessments',
        'Waste Management Plans', 'Environmental Incident Reports', 'Environmental Inspection Checklist'
    ],
    quality: [
        'Quality Manual', 'Quality Policy', 'Quality Procedures & Work Instructions',
        'Audit Reports (Internal & External)', 'Non-conformance & Corrective Actions',
        'Management Reviews', 'Client & Supplier', 'Quality Control Checklists',
        'Tool & Equipment Inspection Logs'
    ],
    hr: [
        'HR Policies & Procedures', 'General Appointments', 'Hiring Policy',
        'Company Property Policy', 'Performance Management', 'Disciplinary & Grievance',
        'Leave Request Forms', 'Employment Contracts & Agreements', 'Warning Templates'
    ]
};

export default function ManageDocumentsPage() {
  const [docs, setDocs] = useState<AllDocs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ category: keyof AllDocs; subSection: string } | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
        const newDocs: AllDocs = { safety: {}, environmental: {}, quality: {}, hr: {} };
        
        for (const [cat, subSections] of Object.entries(docStructure)) {
            for (const sub of subSections) {
                const listRef = ref(storage, `documents/${cat}/${sub}`);
                const res = await listAll(listRef);
                const files = res.items.map(itemRef => ({
                    id: itemRef.fullPath,
                    name: itemRef.name,
                    path: itemRef.fullPath,
                }));
                 if (!newDocs[cat as keyof AllDocs]) {
                    newDocs[cat as keyof AllDocs] = {};
                }
                newDocs[cat as keyof AllDocs][sub] = files;
            }
        }
        setDocs(newDocs);
    } catch (error) {
        console.error("Error fetching documents:", error);
        toast({ variant: 'destructive', title: "Fetch Failed", description: "Could not load documents from storage." });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openUploadDialog = (category: keyof AllDocs, subSection: string) => {
    setUploadTarget({ category, subSection });
    setFileToUpload(null);
    setIsUploadDialogOpen(true);
  };

  const handleDelete = async (docPath: string, docName: string) => {
    try {
        const fileRef = ref(storage, docPath);
        await deleteObject(fileRef);
        await fetchDocs(); // Re-fetch all documents to update state
        toast({ title: "Success", description: `Document "${docName}" has been deleted.` });
    } catch (error) {
        console.error("Error deleting file from Firebase Storage:", error);
        toast({ variant: 'destructive', title: "Deletion Failed", description: "Could not remove the file from storage." });
    }
  };
  
  const handleDownload = async (doc: Doc) => {
    setIsDownloading(doc.id);
    try {
      const url = await getDownloadURL(ref(storage, doc.path));
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank"; // Or use link.download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error getting download URL:', error);
      toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not get the file.'});
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadTarget || !fileToUpload) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a file to upload.' });
      return;
    }
    
    setIsUploading(true);
    
    const storagePath = `documents/${uploadTarget.category}/${uploadTarget.subSection}/${fileToUpload.name}`;
    
    try {
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, fileToUpload);
        await fetchDocs(); // Re-fetch to show the new file
        
        toast({ title: 'Success', description: `"${fileToUpload.name}" has been uploaded successfully.` });
        setIsUploadDialogOpen(false);
        setFileToUpload(null);
        
    } catch (error: any) {
        console.error("File upload error:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload the file. Check storage rules and permissions.' });
    } finally {
        setIsUploading(false);
    }
  };

  const renderDocList = (category: keyof AllDocs, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin" />
            </div>
        ) : !docs || !docs[category] ? (
            <p>No categories found.</p>
        ) : (
            <Accordion type="multiple" className="w-full">
            {Object.entries(docs[category]).map(([subSection, docList]) => (
                <AccordionItem value={subSection} key={subSection}>
                <AccordionTrigger>{subSection}</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-3">
                    <ul className="space-y-2 pl-4">
                        {docList.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <File className="size-4 text-muted-foreground" />
                                <span>{doc.name}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDownloading === doc.id}
                                  onClick={() => handleDownload(doc)}
                                >
                                  {isDownloading === doc.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                  )}
                                  Download
                                </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the document &quot;{doc.name}&quot;.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(doc.id, doc.name)}>
                                        Yes, delete document
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                        ))}
                        {docList.length === 0 && (
                            <li className="text-sm text-muted-foreground pl-4">No documents in this section.</li>
                        )}
                    </ul>
                    <div className="pl-4 pt-2">
                        <Button variant="outline" size="sm" onClick={() => openUploadDialog(category, subSection)}>
                        <Upload className="mr-2 size-4" />
                        Upload Document
                        </Button>
                    </div>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Manage Master Documents
        </h1>
        <p className="text-muted-foreground">
          Upload and manage the master documents that are available to all clients.
        </p>
      </header>
      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>
        <TabsContent value="safety">{renderDocList('safety', 'Manage Safety Documents')}</TabsContent>
        <TabsContent value="environmental">{renderDocList('environmental', 'Manage Environmental Documents')}</TabsContent>
        <TabsContent value="quality">{renderDocList('quality', 'Manage Quality Documents')}</TabsContent>
        <TabsContent value="hr">{renderDocList('hr', 'Manage HR Documents')}</TabsContent>
      </Tabs>
      
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload a new document</DialogTitle>
            <DialogDescription>
              Uploading to: <span className="font-semibold">{uploadTarget?.category} / {uploadTarget?.subSection}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpload} disabled={isUploading || !fileToUpload}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
