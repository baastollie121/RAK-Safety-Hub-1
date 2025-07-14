
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, File, Star, Search, Briefcase, Leaf, Award, Users, Trash2, FileArchive, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


interface Doc {
  id: string;
  name: string;
  path: string; // Firebase storage path
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
        'Policies and Plans',
        'Risk Assesments',
        'Method Statements',
        'Safe Work Procedures',
        'Checklists'
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

export default function DocumentsPage() {
  const [docs, setDocs] = useState<AllDocs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const newDocs: AllDocs = { safety: {}, environmental: {}, quality: {}, hr: {} };
        const storage = getStorage();

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
        
        // Add the external OHS Act Manual manually
        if (newDocs.safety['Policies and Plans']) {
            newDocs.safety['Policies and Plans'].unshift({
                id: 'external-ohs-manual',
                name: 'OHS Act Manual',
                path: 'https://u7t73lof0p.ufs.sh/f/TqKtlDfGZP7BfWqqdioppQAEZ2iVrfBNJ6ChDRk59n7HMedI',
            });
        }
        
        setDocs(newDocs);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({ variant: 'destructive', title: "Fetch Failed", description: "Could not load documents." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (doc: Doc) => {
    setIsDownloading(doc.id);
    // Check if it's the external file
    if (doc.id === 'external-ohs-manual') {
        window.open(doc.path, '_blank');
        setIsDownloading(null);
        return;
    }

    try {
      const storage = getStorage();
      const url = await getDownloadURL(ref(storage, doc.path));
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error getting download URL:', error);
      toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not get the file.' });
    } finally {
      setIsDownloading(null);
    }
  };

  const DocumentRow = ({ doc }: { doc: Doc }) => (
    <li className="flex items-center justify-between group py-2 pr-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <File className="size-4 text-muted-foreground" />
        <span className="text-sm">{doc.name}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} disabled={isDownloading === doc.id}>
        {isDownloading === doc.id ? (
          <DownloadCloud className="mr-2 size-4 animate-pulse" />
        ) : (
          <DownloadCloud className="mr-2 size-4" />
        )}
        <span className="hidden sm:inline">Download</span>
      </Button>
    </li>
  );

  const renderDocList = (categoryKey: keyof AllDocs, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          {categoryKey === 'safety' && <Briefcase />}
          {categoryKey === 'environmental' && <Leaf />}
          {categoryKey === 'quality' && <Award />}
          {categoryKey === 'hr' && <Users />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !docs || !docs[categoryKey] ? (
          <p>No categories found.</p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {Object.entries(docs[categoryKey]).map(([subSection, docList]) => (
              <AccordionItem value={subSection} key={subSection}>
                <AccordionTrigger>{subSection} ({docList.length})</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-4">
                    {docList.length > 0 ? (
                      docList.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
                    ) : (
                      <li className="text-sm text-muted-foreground py-4">No documents in this section.</li>
                    )}
                  </ul>
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

      <Tabs defaultValue="safety" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>
        <TabsContent value="safety" className="pt-6">{renderDocList('safety', 'Safety Documents')}</TabsContent>
        <TabsContent value="environmental" className="pt-6">{renderDocList('environmental', 'Environmental Documents')}</TabsContent>
        <TabsContent value="quality" className="pt-6">{renderDocList('quality', 'Quality Documents')}</TabsContent>
        <TabsContent value="hr" className="pt-6">{renderDocList('hr', 'HR Documents')}</TabsContent>
      </Tabs>
    </div>
  );
}
