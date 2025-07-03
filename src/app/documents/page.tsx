
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, File, Star, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doc {
  id: string;
  name: string;
  fileType: string;
  fileSize: string;
  lastModified: string;
}

interface DocCategory {
  [subSection: string]: Doc[];
}

const safetyDocs: DocCategory = {
  "Safety Manual": [{ id: 'sm1', name: 'Company Safety Manual v1.2', fileType: 'PDF', fileSize: '2.4 MB', lastModified: '2024-05-15' }],
  "Safety Policies & Procedures": [
    { id: 'spp1', name: 'General Safety Policy', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-11-20' },
    { id: 'spp2', name: 'Working from Home Policy', fileType: 'Word', fileSize: '120 KB', lastModified: '2024-01-30' },
  ],
  "Risk Assessments (HIRA)": [
      { id: 'hira1', name: 'General Office Risk Assessment', fileType: 'Excel', fileSize: '88 KB', lastModified: '2024-06-01' },
      { id: 'hira2', name: 'Construction Site HIRA Template', fileType: 'PDF', fileSize: '450 KB', lastModified: '2023-09-05' }
  ],
  "Safe Work Procedures (SWP)": [
      { id: 'swp1', name: 'Manual Handling SWP', fileType: 'PDF', fileSize: '210 KB', lastModified: '2024-02-11' },
      { id: 'swp2', name: 'Lockout/Tagout SWP', fileType: 'PDF', fileSize: '315 KB', lastModified: '2024-03-22' }
  ],
  "Method Statements": [{ id: 'ms1', name: 'Installation of HV Equipment', fileType: 'Word', fileSize: '680 KB', lastModified: '2024-04-18' }],
  "Incident Reports & Investigations": [
      { id: 'ir1', name: 'Incident Report Form', fileType: 'PDF', fileSize: '150 KB', lastModified: '2023-05-01' },
      { id: 'ir2', name: 'Investigation Template', fileType: 'Word', fileSize: '95 KB', lastModified: '2023-05-02' }
  ],
  "Emergency Plans": [
      { id: 'ep1', name: 'Fire Evacuation Plan', fileType: 'PDF', fileSize: '1.2 MB', lastModified: '2024-01-10' },
      { id: 'ep2', name: 'Medical Emergency Response', fileType: 'PDF', fileSize: '850 KB', lastModified: '2024-01-12' }
  ],
  "Toolbox Talks & Meeting Minutes": [{ id: 'tt1', name: 'Weekly Safety Meeting Record', fileType: 'Excel', fileSize: '55 KB', lastModified: '2024-07-01' }],
  "Legal & Other Appointments": [{ id: 'la1', name: 'CEO Appointment Letter', fileType: 'PDF', fileSize: '90 KB', lastModified: '2022-01-01' }],
  "Registers & Checklists": [
      { id: 'rc1', name: 'First Aid Box Register', fileType: 'Excel', fileSize: '45 KB', lastModified: '2024-07-01' },
      { id: 'rc2', name: 'Fire Extinguisher Checklist', fileType: 'PDF', fileSize: '180 KB', lastModified: '2024-06-28' }
  ],
  "Fall Protection & Working at Heights": [{ id: 'fp1', name: 'Fall Protection Plan', fileType: 'PDF', fileSize: '950 KB', lastModified: '2024-03-01' }],
  "Gap Assessments (ISO 45001, Client-specific)": [{ id: 'ga1', name: 'ISO 45001 Gap Assessment Checklist', fileType: 'Excel', fileSize: '250 KB', lastModified: '2023-10-15' }],
  "Legal Compliance Audit Reports": [{ id: 'lcar1', name: 'OHS Act Compliance Audit Report 2023', fileType: 'PDF', fileSize: '3.1 MB', lastModified: '2023-12-01' }],
  "Internal Audit Plan": [{ id: 'iap1', name: 'Internal Audit Schedule 2024', fileType: 'Word', fileSize: '75 KB', lastModified: '2024-02-01' }],
  "Internal Audit Reports": [{ id: 'iar1', name: 'Q1 Internal Audit Report', fileType: 'PDF', fileSize: '450 KB', lastModified: '2024-04-05' }],
};

const environmentalDocs: DocCategory = {
  "Environmental Manual": [{ id: 'em1', name: 'Environmental Management Manual', fileType: 'PDF', fileSize: '1.8 MB', lastModified: '2023-08-20' }],
  "Environmental Policy": [{ id: 'epolicy1', name: 'Company Environmental Policy', fileType: 'PDF', fileSize: '200 KB', lastModified: '2023-01-15' }],
  "Impact Assessments": [{ id: 'ia1', name: 'New Development EIA Report', fileType: 'PDF', fileSize: '5.5 MB', lastModified: '2022-11-30' }],
  "Waste Management Plans": [{ id: 'wmp1', name: 'Hazardous Waste Management Plan', fileType: 'Word', fileSize: '400 KB', lastModified: '2024-02-28' }],
  "Environmental Incident Reports": [{ id: 'eir1', name: 'Chemical Spill Report Form', fileType: 'PDF', fileSize: '130 KB', lastModified: '2023-04-10' }],
  "Environmental Inspection Checklist": [{ id: 'eic1', name: 'Site Environmental Checklist', fileType: 'Excel', fileSize: '60 KB', lastModified: '2024-06-15' }],
};

const qualityDocs: DocCategory = {
  "Quality Manual": [{ id: 'qm1', name: 'ISO 9001 Quality Manual', fileType: 'PDF', fileSize: '2.1 MB', lastModified: '2023-07-01' }],
  "Quality Policy": [{ id: 'qpolicy1', name: 'Company Quality Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-01-15' }],
  "Quality Procedures & Work Instructions": [{ id: 'qpwi1', name: 'Document Control Procedure', fileType: 'Word', fileSize: '300 KB', lastModified: '2023-02-10' }],
  "Audit Reports (Internal & External)": [{ id: 'qar1', name: 'External Audit Report 2023', fileType: 'PDF', fileSize: '1.5 MB', lastModified: '2023-11-05' }],
  "Non-conformance & Corrective Actions": [{ id: 'ncr1', name: 'NCR Form', fileType: 'Excel', fileSize: '90 KB', lastModified: '2023-03-01' }],
  "Management Reviews": [{ id: 'mr1', name: 'Management Review Meeting Minutes', fileType: 'PDF', fileSize: '600 KB', lastModified: '2024-05-20' }],
  "Client & Supplier": [{ id: 'cs1', name: 'Supplier Evaluation Form', fileType: 'Word', fileSize: '150 KB', lastModified: '2024-01-10' }],
  "Quality Control Checklists": [{ id: 'qcc1', name: 'Final Product Inspection Checklist', fileType: 'PDF', fileSize: '220 KB', lastModified: '2024-06-18' }],
  "Tool & Equipment Inspection Logs": [{ id: 'teil1', name: 'Crane Inspection Log', fileType: 'Excel', fileSize: '120 KB', lastModified: '2024-07-01' }],
};

const hrDocs: DocCategory = {
  "HR Policies & Procedures": [{ id: 'hrpp1', name: 'Employee Handbook', fileType: 'PDF', fileSize: '1.1 MB', lastModified: '2024-01-01' }],
  "General Appointments": [{ id: 'hrga1', name: 'Appointment Letter Template', fileType: 'Word', fileSize: '80 KB', lastModified: '2023-01-10' }],
  "Hiring Policy": [{ id: 'hrhp1', name: 'Recruitment and Selection Policy', fileType: 'PDF', fileSize: '250 KB', lastModified: '2023-02-15' }],
  "Company Property Policy": [{ id: 'hrcpp1', name: 'Asset Usage Policy', fileType: 'PDF', fileSize: '180 KB', lastModified: '2023-03-20' }],
  "Performance Management": [{ id: 'hrpm1', name: 'Performance Review Form', fileType: 'Word', fileSize: '110 KB', lastModified: '2024-06-01' }],
  "Disciplinary & Grievance": [
    { id: 'hrdg1', name: 'Disciplinary Code', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-04-01' },
    { id: 'hrdg2', name: 'Grievance Form', fileType: 'Word', fileSize: '70 KB', lastModified: '2023-04-01' }
  ],
  "Leave Request Forms": [{ id: 'hrlr1', name: 'Annual Leave Request Form', fileType: 'PDF', fileSize: '60 KB', lastModified: '2023-01-01' }],
  "Employment Contracts & Agreements": [{ id: 'hrec1', name: 'Permanent Employment Contract Template', fileType: 'Word', fileSize: '150 KB', lastModified: '2023-01-10' }],
  "Warning Templates": [
    { id: 'hrwt1', name: 'Verbal Warning Template', fileType: 'Word', fileSize: '50 KB', lastModified: '2023-02-01' },
    { id: 'hrwt2', name: 'Written Warning Template', fileType: 'Word', fileSize: '55 KB', lastModified: '2023-02-01' }
  ],
};

const allDocsList: Doc[] = [
  ...Object.values(safetyDocs).flat(),
  ...Object.values(environmentalDocs).flat(),
  ...Object.values(qualityDocs).flat(),
  ...Object.values(hrDocs).flat(),
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('documentFavorites') || '[]');
      setFavorites(storedFavorites);
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('documentFavorites', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  const toggleFavorite = (docId: string) => {
    setFavorites((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleDownload = (doc: Doc) => {
    const fileContent = `This is a placeholder for the document: ${doc.name}\n\nFile Type: ${doc.fileType}\nFile Size: ${doc.fileSize}\nLast Modified: ${doc.lastModified}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const favoriteDocs = useMemo(() => {
    return allDocsList.filter(doc => favorites.includes(doc.id))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [favorites]);
  
  const filterDocs = (category: DocCategory): [DocCategory, number] => {
    if (!searchTerm) return [category, Object.values(category).flat().length];

    let count = 0;
    const filteredCategory: DocCategory = {};
    for (const subSection in category) {
      const matchingDocs = category[subSection].filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingDocs.length > 0) {
        filteredCategory[subSection] = matchingDocs;
        count += matchingDocs.length;
      }
    }
    return [filteredCategory, count];
  }

  const [filteredSafetyDocs, safetyCount] = filterDocs(safetyDocs);
  const [filteredEnvDocs, envCount] = filterDocs(environmentalDocs);
  const [filteredQualityDocs, qualityCount] = filterDocs(qualityDocs);
  const [filteredHrDocs, hrCount] = filterDocs(hrDocs);

  const DocumentRow = ({ doc }: { doc: Doc }) => (
     <li className="flex items-center justify-between group py-1">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => toggleFavorite(doc.id)}>
                <Star className={cn("size-4 text-muted-foreground transition-colors", favorites.includes(doc.id) && "fill-yellow-400 text-yellow-400")} />
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-default">
                            <File className="size-4 text-muted-foreground" />
                            <span>{doc.name}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                       <div className="text-sm space-y-1 p-1">
                            <p><strong>File Type:</strong> {doc.fileType}</p>
                            <p><strong>File Size:</strong> {doc.fileSize}</p>
                            <p><strong>Last Modified:</strong> {doc.lastModified}</p>
                       </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
            <Download className="mr-2 size-4" />
            Download
        </Button>
    </li>
  )

  const DocumentList = ({ category }: { category: DocCategory }) => (
      <Accordion type="multiple" className="w-full">
        {Object.entries(category).map(([subSection, docs]) => (
          <AccordionItem value={subSection} key={subSection}>
            <AccordionTrigger>{subSection} ({docs.length})</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 pl-4">
                {docs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Document Library
          </h1>
          <p className="text-muted-foreground mt-2">
            Access all your company documents in one place.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
          <CardContent className="p-4">
               <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search all documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-base"
                />
            </div>
          </CardContent>
      </Card>
      
      {favorites.length > 0 && (
         <Card className="mb-6">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400"/> My Pinned Documents
                </CardTitle>
                <CardDescription>Quick access to your most used documents.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-1">
                    {favoriteDocs.map(doc => <DocumentRow key={doc.id} doc={doc} />)}
                </ul>
            </CardContent>
         </Card>
      )}

      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="safety">Safety ({safetyCount})</TabsTrigger>
          <TabsTrigger value="environmental">Environmental ({envCount})</TabsTrigger>
          <TabsTrigger value="quality">Quality ({qualityCount})</TabsTrigger>
          <TabsTrigger value="hr">HR ({hrCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Safety Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {safetyCount > 0 ? <DocumentList category={filteredSafetyDocs} /> : <p className="text-muted-foreground text-center p-8">No safety documents match your search.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="environmental">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Environmental Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {envCount > 0 ? <DocumentList category={filteredEnvDocs} /> : <p className="text-muted-foreground text-center p-8">No environmental documents match your search.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quality Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {qualityCount > 0 ? <DocumentList category={filteredQualityDocs} /> : <p className="text-muted-foreground text-center p-8">No quality documents match your search.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hr">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">HR Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {hrCount > 0 ? <DocumentList category={filteredHrDocs} /> : <p className="text-muted-foreground text-center p-8">No HR documents match your search.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
