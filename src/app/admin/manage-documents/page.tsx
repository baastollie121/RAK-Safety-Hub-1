
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
import { Upload, Trash2, File, CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface Doc {
  id: string;
  name: string;
  fileType: string;
  fileSize: string;
  lastModified: string;
  storagePath: string;
  downloadURL: string;
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

// Initial docs data
const initialDocs: AllDocs = {
  safety: {
    "Safety Manual": [{ id: 'sm1', name: 'Company Safety Manual v1.2', fileType: 'PDF', fileSize: '2.4 MB', lastModified: '2024-05-15', storagePath: '', downloadURL: '' }],
    "Safety Policies & Procedures": [
      { id: 'spp1', name: 'General Safety Policy', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-11-20', storagePath: '', downloadURL: '' },
      { id: 'spp2', name: 'Working from Home Policy', fileType: 'Word', fileSize: '120 KB', lastModified: '2024-01-30', storagePath: '', downloadURL: '' },
    ],
    "Risk Assessments (HIRA)": [
        { id: 'hira1', name: 'General Office Risk Assessment', fileType: 'Excel', fileSize: '88 KB', lastModified: '2024-06-01', storagePath: '', downloadURL: '' },
        { id: 'hira2', name: 'Construction Site HIRA Template', fileType: 'PDF', fileSize: '450 KB', lastModified: '2023-09-05', storagePath: '', downloadURL: '' }
    ],
    "Safe Work Procedures (SWP)": [
        { id: 'swp1', name: 'Manual Handling SWP', fileType: 'PDF', fileSize: '210 KB', lastModified: '2024-02-11', storagePath: '', downloadURL: '' },
        { id: 'swp2', name: 'Lockout/Tagout SWP', fileType: 'PDF', fileSize: '315 KB', lastModified: '2024-03-22', storagePath: '', downloadURL: '' }
    ],
    "Method Statements": [{ id: 'ms1', name: 'Installation of HV Equipment', fileType: 'Word', fileSize: '680 KB', lastModified: '2024-04-18', storagePath: '', downloadURL: '' }],
    "Incident Reports & Investigations": [
        { id: 'ir1', name: 'Incident Report Form', fileType: 'PDF', fileSize: '150 KB', lastModified: '2023-05-01', storagePath: '', downloadURL: '' },
        { id: 'ir2', name: 'Investigation Template', fileType: 'Word', fileSize: '95 KB', lastModified: '2023-05-02', storagePath: '', downloadURL: '' }
    ],
    "Emergency Plans": [
        { id: 'ep1', name: 'Fire Evacuation Plan', fileType: 'PDF', fileSize: '1.2 MB', lastModified: '2024-01-10', storagePath: '', downloadURL: '' },
        { id: 'ep2', name: 'Medical Emergency Response', fileType: 'PDF', fileSize: '850 KB', lastModified: '2024-01-12', storagePath: '', downloadURL: '' }
    ],
    "Toolbox Talks & Meeting Minutes": [{ id: 'tt1', name: 'Weekly Safety Meeting Record', fileType: 'Excel', fileSize: '55 KB', lastModified: '2024-07-01', storagePath: '', downloadURL: '' }],
    "Legal & Other Appointments": [{ id: 'la1', name: 'CEO Appointment Letter', fileType: 'PDF', fileSize: '90 KB', lastModified: '2022-01-01', storagePath: '', downloadURL: '' }],
    "Registers & Checklists": [
        { id: 'rc1', name: 'First Aid Box Register', fileType: 'Excel', fileSize: '45 KB', lastModified: '2024-07-01', storagePath: '', downloadURL: '' },
        { id: 'rc2', name: 'Fire Extinguisher Checklist', fileType: 'PDF', fileSize: '180 KB', lastModified: '2024-06-28', storagePath: '', downloadURL: '' }
    ],
    "Fall Protection & Working at Heights": [{ id: 'fp1', name: 'Fall Protection Plan', fileType: 'PDF', fileSize: '950 KB', lastModified: '2024-03-01', storagePath: '', downloadURL: '' }],
    "Gap Assessments (ISO 45001, Client-specific)": [{ id: 'ga1', name: 'ISO 45001 Gap Assessment Checklist', fileType: 'Excel', fileSize: '250 KB', lastModified: '2023-10-15', storagePath: '', downloadURL: '' }],
    "Legal Compliance Audit Reports": [{ id: 'lcar1', name: 'OHS Act Compliance Audit Report 2023', fileType: 'PDF', fileSize: '3.1 MB', lastModified: '2023-12-01', storagePath: '', downloadURL: '' }],
    "Internal Audit Plan": [{ id: 'iap1', name: 'Internal Audit Schedule 2024', fileType: 'Word', fileSize: '75 KB', lastModified: '2024-02-01', storagePath: '', downloadURL: '' }],
    "Internal Audit Reports": [{ id: 'iar1', name: 'Q1 Internal Audit Report', fileType: 'PDF', fileSize: '450 KB', lastModified: '2024-04-05', storagePath: '', downloadURL: '' }],
  },
  environmental: {
    "Environmental Manual": [{ id: 'em1', name: 'Environmental Management Manual', fileType: 'PDF', fileSize: '1.8 MB', lastModified: '2023-08-20', storagePath: '', downloadURL: '' }],
    "Environmental Policy": [{ id: 'epolicy1', name: 'Company Environmental Policy', fileType: 'PDF', fileSize: '200 KB', lastModified: '2023-01-15', storagePath: '', downloadURL: '' }],
    "Impact Assessments": [{ id: 'ia1', name: 'New Development EIA Report', fileType: 'PDF', fileSize: '5.5 MB', lastModified: '2022-11-30', storagePath: '', downloadURL: '' }],
    "Waste Management Plans": [{ id: 'wmp1', name: 'Hazardous Waste Management Plan', fileType: 'Word', fileSize: '400 KB', lastModified: '2024-02-28', storagePath: '', downloadURL: '' }],
    "Environmental Incident Reports": [{ id: 'eir1', name: 'Chemical Spill Report Form', fileType: 'PDF', fileSize: '130 KB', lastModified: '2023-04-10', storagePath: '', downloadURL: '' }],
    "Environmental Inspection Checklist": [{ id: 'eic1', name: 'Site Environmental Checklist', fileType: 'Excel', fileSize: '60 KB', lastModified: '2024-06-15', storagePath: '', downloadURL: '' }],
  },
  quality: {
    "Quality Manual": [{ id: 'qm1', name: 'ISO 9001 Quality Manual', fileType: 'PDF', fileSize: '2.1 MB', lastModified: '2023-07-01', storagePath: '', downloadURL: '' }],
    "Quality Policy": [{ id: 'qpolicy1', name: 'Company Quality Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-01-15', storagePath: '', downloadURL: '' }],
    "Quality Procedures & Work Instructions": [{ id: 'qpwi1', name: 'Document Control Procedure', fileType: 'Word', fileSize: '300 KB', lastModified: '2023-02-10', storagePath: '', downloadURL: '' }],
    "Audit Reports (Internal & External)": [{ id: 'qar1', name: 'External Audit Report 2023', fileType: 'PDF', fileSize: '1.5 MB', lastModified: '2023-11-05', storagePath: '', downloadURL: '' }],
    "Non-conformance & Corrective Actions": [{ id: 'ncr1', name: 'NCR Form', fileType: 'Excel', fileSize: '90 KB', lastModified: '2023-03-01', storagePath: '', downloadURL: '' }],
    "Management Reviews": [{ id: 'mr1', name: 'Management Review Meeting Minutes', fileType: 'PDF', fileSize: '600 KB', lastModified: '2024-05-20', storagePath: '', downloadURL: '' }],
    "Client & Supplier": [{ id: 'cs1', name: 'Supplier Evaluation Form', fileType: 'Word', fileSize: '150 KB', lastModified: '2024-01-10', storagePath: '', downloadURL: '' }],
    "Quality Control Checklists": [{ id: 'qcc1', name: 'Final Product Inspection Checklist', fileType: 'PDF', fileSize: '220 KB', lastModified: '2024-06-18', storagePath: '', downloadURL: '' }],
    "Tool & Equipment Inspection Logs": [{ id: 'teil1', name: 'Crane Inspection Log', fileType: 'Excel', fileSize: '120 KB', lastModified: '2024-07-01', storagePath: '', downloadURL: '' }],
  },
  hr: {
    "HR Policies & Procedures": [{ id: 'hrpp1', name: 'Employee Handbook', fileType: 'PDF', fileSize: '1.1 MB', lastModified: '2024-01-01', storagePath: '', downloadURL: '' }],
    "General Appointments": [{ id: 'hrga1', name: 'Appointment Letter Template', fileType: 'Word', fileSize: '80 KB', lastModified: '2023-01-10', storagePath: '', downloadURL: '' }],
    "Hiring Policy": [{ id: 'hrhp1', name: 'Recruitment and Selection Policy', fileType: 'PDF', fileSize: '250 KB', lastModified: '2023-02-15', storagePath: '', downloadURL: '' }],
    "Company Property Policy": [{ id: 'hrcpp1', name: 'Asset Usage Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-03-20', storagePath: '', downloadURL: '' }],
    "Performance Management": [{ id: 'hrpm1', name: 'Performance Review Form', fileType: 'Word', fileSize: '110 KB', lastModified: '2024-06-01', storagePath: '', downloadURL: '' }],
    "Disciplinary & Grievance": [
        { id: 'hrdg1', name: 'Disciplinary Code', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-04-01', storagePath: '', downloadURL: '' },
        { id: 'hrdg2', name: 'Grievance Form', fileType: 'Word', fileSize: '70 KB', lastModified: '2023-04-01', storagePath: '', downloadURL: '' }
    ],
    "Leave Request Forms": [{ id: 'hrlr1', name: 'Annual Leave Request Form', fileType: 'PDF', fileSize: '60 KB', lastModified: '2023-01-01', storagePath: '', downloadURL: '' }],
    "Employment Contracts & Agreements": [{ id: 'hrec1', name: 'Permanent Employment Contract Template', fileType: 'Word', fileSize: '150 KB', lastModified: '2023-01-10', storagePath: '', downloadURL: '' }],
    "Warning Templates": [
        { id: 'hrwt1', name: 'Verbal Warning Template', fileType: 'Word', fileSize: '50 KB', lastModified: '2023-02-01', storagePath: '', downloadURL: '' },
        { id: 'hrwt2', name: 'Written Warning Template', fileType: 'Word', fileSize: '55 KB', lastModified: '2023-02-01', storagePath: '', downloadURL: '' }
    ],
  },
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ManageDocumentsPage() {
  const [docs, setDocs] = useState<AllDocs>(initialDocs);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ category: keyof AllDocs; subSection: string } | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [newFileType, setNewFileType] = useState('');
  const [newLastModified, setNewLastModified] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const openUploadDialog = (category: keyof AllDocs, subSection: string) => {
    setUploadTarget({ category, subSection });
    setNewDocName('');
    setFileToUpload(null);
    setNewFileType('');
    setNewLastModified(new Date());
    setIsUploadDialogOpen(true);
  };

  const handleDelete = async (category: keyof AllDocs, subSection: string, doc: Doc) => {
    if (doc.storagePath) {
        try {
            const fileRef = ref(storage, doc.storagePath);
            await deleteObject(fileRef);
        } catch (error) {
            console.error("Error deleting file from Firebase Storage:", error);
            toast({ variant: 'destructive', title: "Deletion Failed", description: "Could not remove the file from storage. Please try again." });
            return;
        }
    }

    setDocs((prevDocs) => {
      const newCategoryDocs = { ...prevDocs[category] };
      newCategoryDocs[subSection] = newCategoryDocs[subSection].filter(
        (d) => d.id !== doc.id
      );
      return { ...prevDocs, [category]: newCategoryDocs };
    });
    toast({ title: "Success", description: `Document "${doc.name}" has been deleted.` });
  };

  // FIXED: Auto-detect file type and set document name based on file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      
      // Auto-set document name if empty
      if (!newDocName) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setNewDocName(nameWithoutExtension);
      }
      
      // Auto-detect file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        switch (extension) {
          case 'pdf':
            setNewFileType('PDF');
            break;
          case 'doc':
          case 'docx':
            setNewFileType('Word');
            break;
          case 'xls':
          case 'xlsx':
            setNewFileType('Excel');
            break;
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
            setNewFileType('Image');
            break;
          default:
            setNewFileType('Other');
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadTarget || !newDocName || !fileToUpload || !newFileType || !newLastModified) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields and select a file.' });
      return;
    }
    
    setIsUploading(true);
    
    // FIXED: Create unique filename to prevent conflicts
    const timestamp = Date.now();
    const sanitizedFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `documents/${uploadTarget.category}/${uploadTarget.subSection}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);
    
    try {
        // Upload the file to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, fileToUpload);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // Create new document object
        const newDoc: Doc = {
          id: `${uploadTarget.category}_${timestamp}`, // FIXED: More unique ID
          name: newDocName,
          fileType: newFileType,
          fileSize: formatFileSize(fileToUpload.size),
          lastModified: format(newLastModified, 'yyyy-MM-dd'),
          storagePath: storagePath,
          downloadURL: downloadURL,
        };

        // FIXED: Correct state update
        setDocs((prevDocs) => {
          const newCategoryDocs = { ...prevDocs[uploadTarget.category] };
          const newSubSectionDocs = [...(newCategoryDocs[uploadTarget.subSection] || []), newDoc];
          newCategoryDocs[uploadTarget.subSection] = newSubSectionDocs;
          return { ...prevDocs, [uploadTarget.category]: newCategoryDocs }; // FIXED: Use uploadTarget.category instead of just 'category'
        });
        
        toast({ title: 'Success', description: `"${newDocName}" has been uploaded successfully.` });
        setIsUploadDialogOpen(false);
        
        // FIXED: Reset form after successful upload
        setNewDocName('');
        setFileToUpload(null);
        setNewFileType('');
        setNewLastModified(new Date());
        
    } catch (error) {
        console.error("File upload error:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file. Please check your connection and try again.' });
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
                          <span className="text-xs text-muted-foreground">({doc.fileType}, {doc.fileSize})</span>
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
                              <AlertDialogAction onClick={() => handleDelete(category, subSection, doc)}>
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
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input
                id="doc-name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g., Q2 Safety Report"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="file-type">File Type</Label>
                    <Select onValueChange={setNewFileType} value={newFileType}>
                        <SelectTrigger id="file-type">
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="Word">Word</SelectItem>
                            <SelectItem value="Excel">Excel</SelectItem>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="last-modified">Last Modified Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !newLastModified && 'text-muted-foreground'
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newLastModified ? format(newLastModified, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={newLastModified}
                        onSelect={setNewLastModified}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpload} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
