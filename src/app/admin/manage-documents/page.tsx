'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Upload, Trash2, File } from 'lucide-react';

interface Doc {
  id: string;
  name: string;
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

const initialDocs: AllDocs = {
  safety: {
    "Safety Manual": [{ id: 'sm1', name: 'Company Safety Manual v1.2' }],
    "Safety Policies & Procedures": [{ id: 'spp1', name: 'General Safety Policy' }, { id: 'spp2', name: 'Working from Home Policy' }],
    "Risk Assessments (HIRA)": [{ id: 'hira1', name: 'General Office Risk Assessment' }, { id: 'hira2', name: 'Construction Site HIRA Template' }],
    "Safe Work Procedures (SWP)": [{ id: 'swp1', name: 'Manual Handling SWP' }, { id: 'swp2', name: 'Lockout/Tagout SWP' }],
    "Method Statements": [{ id: 'ms1', name: 'Installation of HV Equipment' }],
    "Incident Reports & Investigations": [{ id: 'ir1', name: 'Incident Report Form' }, { id: 'ir2', name: 'Investigation Template' }],
    "Emergency Plans": [{ id: 'ep1', name: 'Fire Evacuation Plan' }, { id: 'ep2', name: 'Medical Emergency Response' }],
    "Toolbox Talks & Meeting Minutes": [{ id: 'tt1', name: 'Weekly Safety Meeting Record' }],
    "Legal & Other Appointments": [{ id: 'la1', name: 'CEO Appointment Letter' }],
    "Registers & Checklists": [{ id: 'rc1', name: 'First Aid Box Register' }, { id: 'rc2', name: 'Fire Extinguisher Checklist' }],
    "Fall Protection & Working at Heights": [{ id: 'fp1', name: 'Fall Protection Plan' }],
    "Gap Assessments (ISO 45001, Client-specific)": [{ id: 'ga1', name: 'ISO 45001 Gap Assessment Checklist' }],
    "Legal Compliance Audit Reports": [{ id: 'lcar1', name: 'OHS Act Compliance Audit Report 2023' }],
    "Internal Audit Plan": [{ id: 'iap1', name: 'Internal Audit Schedule 2024' }],
    "Internal Audit Reports": [{ id: 'iar1', name: 'Q1 Internal Audit Report' }],
  },
  environmental: {
    "Environmental Manual": [{ id: 'em1', name: 'Environmental Management Manual' }],
    "Environmental Policy": [{ id: 'epolicy1', name: 'Company Environmental Policy' }],
    "Impact Assessments": [{ id: 'ia1', name: 'New Development EIA Report' }],
    "Waste Management Plans": [{ id: 'wmp1', name: 'Hazardous Waste Management Plan' }],
    "Environmental Incident Reports": [{ id: 'eir1', name: 'Chemical Spill Report Form' }],
    "Environmental Inspection Checklist": [{ id: 'eic1', name: 'Site Environmental Checklist' }],
  },
  quality: {
    "Quality Manual": [{ id: 'qm1', name: 'ISO 9001 Quality Manual' }],
    "Quality Policy": [{ id: 'qpolicy1', name: 'Company Quality Policy' }],
    "Quality Procedures & Work Instructions": [{ id: 'qpwi1', name: 'Document Control Procedure' }],
    "Audit Reports (Internal & External)": [{ id: 'qar1', name: 'External Audit Report 2023' }],
    "Non-conformance & Corrective Actions": [{ id: 'ncr1', name: 'NCR Form' }],
    "Management Reviews": [{ id: 'mr1', name: 'Management Review Meeting Minutes' }],
    "Client & Supplier": [{ id: 'cs1', name: 'Supplier Evaluation Form' }],
    "Quality Control Checklists": [{ id: 'qcc1', name: 'Final Product Inspection Checklist' }],
    "Tool & Equipment Inspection Logs": [{ id: 'teil1', name: 'Crane Inspection Log' }],
  },
  hr: {
    "HR Policies & Procedures": [{ id: 'hrpp1', name: 'Employee Handbook' }],
    "General Appointments": [{ id: 'hrga1', name: 'Appointment Letter Template' }],
    "Hiring Policy": [{ id: 'hrhp1', name: 'Recruitment and Selection Policy' }],
    "Company Property Policy": [{ id: 'hrcpp1', name: 'Asset Usage Policy' }],
    "Performance Management": [{ id: 'hrpm1', name: 'Performance Review Form' }],
    "Disciplinary & Grievance": [{ id: 'hrdg1', name: 'Disciplinary Code' }, { id: 'hrdg2', name: 'Grievance Form' }],
    "Leave Request Forms": [{ id: 'hrlr1', name: 'Annual Leave Request Form' }],
    "Employment Contracts & Agreements": [{ id: 'hrec1', name: 'Permanent Employment Contract Template' }],
    "Warning Templates": [{ id: 'hrwt1', name: 'Verbal Warning Template' }, { id: 'hrwt2', name: 'Written Warning Template' }],
  },
};

export default function ManageDocumentsPage() {
  const [docs, setDocs] = useState<AllDocs>(initialDocs);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ category: keyof AllDocs; subSection: string } | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();

  const openUploadDialog = (category: keyof AllDocs, subSection: string) => {
    setUploadTarget({ category, subSection });
    setNewDocName('');
    setFileToUpload(null);
    setIsUploadDialogOpen(true);
  };

  const handleDelete = (category: keyof AllDocs, subSection: string, docId: string, docName: string) => {
    // This is where you would add logic to delete the file from your storage bucket.
    console.log(`Deleting doc ${docId} from ${category}/${subSection}`);

    setDocs((prevDocs) => {
      const newCategoryDocs = { ...prevDocs[category] };
      newCategoryDocs[subSection] = newCategoryDocs[subSection].filter(
        (doc) => doc.id !== docId
      );
      return { ...prevDocs, [category]: newCategoryDocs };
    });
    toast({ title: "Success", description: `Document "${docName}" has been deleted.` });
  };

  const handleUpload = () => {
    if (!uploadTarget || !newDocName || !fileToUpload) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a document name and select a file.' });
      return;
    }
    
    // This is where you would add logic to upload the file to your storage bucket.
    // The path could be something like: `${uploadTarget.category}/${uploadTarget.subSection}/${fileToUpload.name}`
    console.log(`Uploading ${fileToUpload.name} as "${newDocName}" to ${uploadTarget.category}/${uploadTarget.subSection}`);

    const newDoc: Doc = {
      id: new Date().toISOString(), // Use a unique ID from your backend in a real app
      name: newDocName,
    };

    setDocs((prevDocs) => {
      const newCategoryDocs = { ...prevDocs[uploadTarget.category] };
      const newSubSectionDocs = [...(newCategoryDocs[uploadTarget.subSection] || []), newDoc];
      newCategoryDocs[uploadTarget.subSection] = newSubSectionDocs;
      return { ...prevDocs, [uploadTarget.category]: newCategoryDocs };
    });
    
    toast({ title: 'Success', description: `"${newDocName}" has been uploaded.` });
    setIsUploadDialogOpen(false);
  };

  const renderDocList = (category: keyof AllDocs, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
                              <AlertDialogAction onClick={() => handleDelete(category, subSection, doc.id, doc.name)}>
                                Yes, delete document
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Manage Documents
        </h1>
        <p className="text-muted-foreground">
          Upload, edit, and delete documents in the library.
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a new document</DialogTitle>
            <DialogDescription>
              Uploading to: <span className="font-semibold">{uploadTarget?.category} / {uploadTarget?.subSection}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-name" className="text-right">
                Document Name
              </Label>
              <Input
                id="doc-name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Q2 Safety Report"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="text-right">
                File
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
