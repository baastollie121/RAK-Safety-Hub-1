
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, File, Star, Search, Briefcase, Leaf, Award, Users, Trash2, FileArchive, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

interface Doc {
  id: string;
  name: string;
  path: string; // Firebase storage path or external URL
  fileType: string;
  fileSize: string;
  lastModified: string;
  isExternal?: boolean;
}

interface DocCategory {
  [subSection: string]: Doc[];
}

const safetyDocs: DocCategory = {
  "Safety Manual": [{ id: 'sm1', name: 'OHS Act Manual', path: 'https://u7t73lof0p.ufs.sh/f/TqKtlDfGZP7BfWqqdioppQAEZ2iVrfBNJ6ChDRk59n7HMedI', fileType: 'PDF', fileSize: 'N/A', lastModified: '2024-07-18', isExternal: true }],
  "Safety Policies & Procedures": [
    { id: 'spp1', name: 'General Safety Policy', path: 'documents/safety/policy.pdf', fileType: 'PDF', fileSize: '350 KB', lastModified: '2023-11-20' },
  ],
};

const environmentalDocs: DocCategory = {
  "Environmental Manual": [{ id: 'em1', name: 'Environmental Management Manual', path: 'documents/environmental/manual.pdf', fileType: 'PDF', fileSize: '1.8 MB', lastModified: '2023-08-20' }],
};

const qualityDocs: DocCategory = {
  "Quality Manual": [{ id: 'qm1', name: 'ISO 9001 Quality Manual', path: 'documents/quality/manual.pdf', fileType: 'PDF', fileSize: '2.1 MB', lastModified: '2023-07-01' }],
};

const hrDocs: DocCategory = {
  "HR Policies & Procedures": [{ id: 'hrpp1', name: 'Employee Handbook', path: 'documents/hr/handbook.pdf', fileType: 'PDF', fileSize: '1.1 MB', lastModified: '2024-01-01' }],
};

const allDocsList: Doc[] = [
  ...Object.values(safetyDocs).flat(),
  ...Object.values(environmentalDocs).flat(),
  ...Object.values(qualityDocs).flat(),
  ...Object.values(hrDocs).flat(),
];

const allCategories = {
    'All Documents': allDocsList,
    'Safety': Object.values(safetyDocs).flat(),
    'Environmental': Object.values(environmentalDocs).flat(),
    'Quality': Object.values(qualityDocs).flat(),
    'HR': Object.values(hrDocs).flat(),
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('All Documents');
  const [sortOrder, setSortOrder] = useState<'name' | 'date'>('name');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

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
  
  const toggleSelection = (docId: string) => {
    setSelectedDocs(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
  }
  
  const handleDownload = async (doc: Doc) => {
    // If it's an external URL, just open it.
    if (doc.isExternal) {
        window.open(doc.path, '_blank');
        return;
    }

    const storage = getStorage();
    const docRef = ref(storage, doc.path);
    try {
        const url = await getDownloadURL(docRef);
        const link = document.createElement('a');
        link.href = url;
        link.target = "_blank"; // Open in new tab to download
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch(error) {
        console.error("Download error:", error);
        alert("Could not download file. Please check permissions or contact support.");
    }
  };

  const filteredAndSortedDocs = useMemo(() => {
    let docs = activeTab === 'All Documents' ? allDocsList : allCategories[activeTab as keyof typeof allCategories];

    if (searchTerm) {
        docs = docs.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    docs.sort((a, b) => {
        if (sortOrder === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        }
    });

    return docs;
  }, [activeTab, searchTerm, sortOrder]);
  
  const toggleSelectAll = () => {
      if(selectedDocs.length === filteredAndSortedDocs.length) {
          setSelectedDocs([]);
      } else {
          setSelectedDocs(filteredAndSortedDocs.map(d => d.id));
      }
  }

  const DocumentRow = ({ doc }: { doc: Doc }) => (
     <li className="flex items-center justify-between group py-1 pr-2 rounded-md hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-1">
            <Checkbox
                aria-label={`Select document ${doc.name}`}
                checked={selectedDocs.includes(doc.id)}
                onCheckedChange={() => toggleSelection(doc.id)}
                className="mx-2"
            />
            <Button variant="ghost" size="icon" className="w-7 h-7" aria-label={favorites.includes(doc.id) ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleFavorite(doc.id)}>
                <Star className={cn("size-4 text-muted-foreground transition-colors", favorites.includes(doc.id) && "fill-yellow-400 text-yellow-400")} />
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-default">
                            <File className="size-4 text-muted-foreground" />
                            <span className="text-sm sm:text-base">{doc.name}</span>
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
        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} aria-label={`Download ${doc.name}`}>
            <DownloadCloud className="mr-2 size-4" />
            <span className="hidden sm:inline">Download</span>
        </Button>
    </li>
  )

  const BulkActionsToolbar = () => (
      <div className="flex items-center justify-between p-2 border rounded-lg bg-card mb-4">
          <div className="flex items-center gap-2">
              <Checkbox
                  id="select-all"
                  aria-label="Select all documents"
                  checked={selectedDocs.length > 0 && selectedDocs.length === filteredAndSortedDocs.length}
                  onCheckedChange={toggleSelectAll}
                />
              <Label htmlFor="select-all" className="font-semibold text-sm">{selectedDocs.length} selected</Label>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={selectedDocs.length === 0}><Download className="mr-2 size-4"/>Download ZIP</Button>
              <Button variant="outline" size="sm" disabled={selectedDocs.length === 0}><FileArchive className="mr-2 size-4"/>Archive</Button>
              <Button variant="destructive" size="sm" disabled={selectedDocs.length === 0}><Trash2 className="mr-2 size-4"/>Delete</Button>
          </div>
      </div>
  )

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
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
               <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-base"
                />
            </div>
            <Select value={sortOrder} onValueChange={(value: 'name' | 'date') => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
            </Select>
          </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="All Documents">All</TabsTrigger>
          <TabsTrigger value="Safety"><Briefcase className="mr-2 size-4" />Safety</TabsTrigger>
          <TabsTrigger value="Environmental"><Leaf className="mr-2 size-4"/>Environmental</TabsTrigger>
          <TabsTrigger value="Quality"><Award className="mr-2 size-4"/>Quality</TabsTrigger>
          <TabsTrigger value="HR"><Users className="mr-2 size-4"/>HR</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="pt-4">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{activeTab}</CardTitle>
                </CardHeader>
                <CardContent>
                    <BulkActionsToolbar />
                    {filteredAndSortedDocs.length > 0 ? (
                        <ul className="space-y-1">
                            {filteredAndSortedDocs.map(doc => <DocumentRow key={doc.id} doc={doc} />)}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center p-8">No documents found.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
