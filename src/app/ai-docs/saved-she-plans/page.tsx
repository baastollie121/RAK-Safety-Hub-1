
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

interface SavedShePlan {
  id: string;
  title: string;
  companyName: string;
  reviewDate: string;
  createdAt: string; // ISO string
  shePlanDocument: string;
  userId: string;
  docType: 'ShePlan';
}

const ReportContent = ({ report, onDelete }: { report: SavedShePlan, onDelete: (id: string, title: string) => void }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const { isDownloading, handleDownload } = useDownloadPdf({
      reportRef,
      fileName: `SHE-Plan-${report.title.replace(/\s+/g, '_')}`,
      options: {
        companyName: report.companyName,
        documentTitle: `SHE Plan: ${report.title}`
      }
    });
    
    return (
        <>
            <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-background p-6">
                <ReactMarkdown>{report.shePlanDocument}</ReactMarkdown>
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
                      Delete Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this SHE plan for &quot;{report.title}&quot;.
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


export default function SavedShePlansPage() {
  const { user } = useAuth();
  const [savedPlans, setSavedPlans] = useState<SavedShePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

   useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
        try {
            const q = query(
                collection(db, 'generated_documents'), 
                where('userId', '==', user.uid),
                where('docType', '==', 'ShePlan'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const plansFromDb = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: format(doc.data().createdAt.toDate(), 'PPP p')
            } as SavedShePlan));
            setSavedPlans(plansFromDb);
        } catch (error) {
            console.error("Error fetching plans from Firestore: ", error);
            toast({
                variant: 'destructive',
                title: 'Load Failed',
                description: 'Could not load saved plans.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchPlans();
  }, [user, toast]);

  const handleDelete = async (planId: string, planTitle: string) => {
    try {
      await deleteDoc(doc(db, 'generated_documents', planId));
      setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
      toast({
        title: 'Success',
        description: `Plan "${planTitle}" has been deleted.`,
      });
    } catch (error) {
      console.error('Failed to delete SHE plan from Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the plan.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Saved SHE Plans
          </h1>
          <p className="text-muted-foreground">
            Browse and manage your AI-generated SHE plans.
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
          Saved SHE Plans
        </h1>
        <p className="text-muted-foreground">
          Browse and manage your AI-generated SHE plans.
        </p>
      </header>

      {savedPlans.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {savedPlans.map((plan) => (
            <Card key={plan.id} className="bg-card/50 overflow-hidden">
              <AccordionItem value={plan.id} className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-headline">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      For: {plan.companyName} | Saved on: {plan.createdAt}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ReportContent report={plan} onDelete={handleDelete} />
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileArchive /> No Saved Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven&apos;t saved any SHE plans yet. Go to the{' '}
              <Link href="/she-site-plan-generator" className="text-primary underline">
                SHE Site Plan Generator
              </Link>{' '}
              to create and save your first plan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
