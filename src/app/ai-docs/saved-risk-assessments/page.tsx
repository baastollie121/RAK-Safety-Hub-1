
'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { useDownloadPdf } from '@/hooks/use-download-pdf';
import { Trash2, FileArchive, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

interface SavedRiskAssessment {
  id: string; // Firestore document ID
  title: string;
  companyName: string;
  reviewDate: string;
  createdAt: string; // ISO string
  riskAssessmentDocument: string;
  userId: string;
  docType: 'RiskAssessment';
}

const ReportContent = ({ report, onDelete }: { report: SavedRiskAssessment, onDelete: (id: string, title: string) => void }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const { isDownloading, handleDownload } = useDownloadPdf({
      reportRef,
      fileName: `Risk-Assessment-${report.title.replace(/\s+/g, '_')}`,
      options: {
        companyName: report.companyName,
        documentTitle: `Risk Assessment: ${report.title}`
      }
    });

    return (
        <>
            <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-background p-6">
                <ReactMarkdown>{report.riskAssessmentDocument}</ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
                    {isDownloading ? (
                        <>
                            <Loader2 className="animate-spin mr-2 size-4" /> Downloading...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 size-4" /> Download PDF
                        </>
                    )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 size-4" />
                      Delete Report
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this Risk Assessment for &quot;{report.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(report.id, report.title)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}

export default function SavedRiskAssessmentsPage() {
  const { user } = useAuth();
  const [savedReports, setSavedReports] = useState<SavedRiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
        try {
            const q = query(
                collection(db, 'generated_documents'), 
                where('userId', '==', user.uid),
                where('docType', '==', 'RiskAssessment'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const reportsFromDb = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: format(doc.data().createdAt.toDate(), 'PPP p')
            } as SavedRiskAssessment));
            setSavedReports(reportsFromDb);
        } catch (error) {
            console.error("Error fetching reports from Firestore: ", error);
            toast({
                variant: 'destructive',
                title: 'Load Failed',
                description: 'Could not load saved reports.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchReports();
  }, [user, toast]);

  const handleDelete = async (reportId: string, reportTitle: string) => {
    try {
      await deleteDoc(doc(db, 'generated_documents', reportId));
      setSavedReports(savedReports.filter(report => report.id !== reportId));
      toast({
        title: 'Success',
        description: `Report "${reportTitle}" has been deleted.`,
      });
    } catch (error) {
      console.error('Failed to delete report from Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the report.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Saved Risk Assessments
          </h1>
          <p className="text-muted-foreground">
            Browse and manage your AI-generated risk assessments.
          </p>
        </header>
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Saved Risk Assessments
        </h1>
        <p className="text-muted-foreground">
          Browse and manage your AI-generated risk assessments.
        </p>
      </header>

      {savedReports.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {savedReports.map((report) => (
            <Card key={report.id} className="bg-card/50 overflow-hidden">
              <AccordionItem value={report.id} className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-headline">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      For: {report.companyName} | Saved on: {report.createdAt}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ReportContent report={report} onDelete={handleDelete} />
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileArchive /> No Saved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven&apos;t saved any Risk Assessments yet. Go to the{' '}
              <Link href="/risk-assessment" className="text-primary underline">
                Risk Assessment Generator
              </Link>{' '}
              to create and save your first report.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
