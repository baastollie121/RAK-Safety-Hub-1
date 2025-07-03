'use client';

import { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Download, CalendarIcon, WandSparkles, FileArchive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateShePlan, GenerateShePlanInputSchema, type GenerateShePlanOutput } from '@/ai/flows/she-plan-generator';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';


type ShePlanFormValues = z.infer<typeof GenerateShePlanInputSchema>;

interface SavedShePlan {
    id: string;
    title: string;
    companyName: string;
    reviewDate: string;
    createdAt: string;
    shePlanDocument: string;
}

export default function SHESitePlanGeneratorPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [result, setResult] = useState<GenerateShePlanOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<ShePlanFormValues>({
    resolver: zodResolver(GenerateShePlanInputSchema),
    defaultValues: {
      companyName: '',
      projectTitle: '',
      projectLocation: '',
      preparedBy: user?.email || '',
      reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      projectOverview: '',
      siteHazards: '',
      emergencyProcedures: '',
      ppeRequirements: '',
      trainingRequirements: '',
      environmentalControls: '',
    },
  });

  const onSubmit = async (data: ShePlanFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = {
        ...data,
        reviewDate: format(data.reviewDate, 'PPP'),
      };
      const response = await generateShePlan(submissionData);
      setResult(response);
      toast({ title: 'Success', description: 'SHE Site Plan generated successfully.' });
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("SHE Plan Generation Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate SHE Site Plan.' });
    }
    setIsLoading(false);
  };
  
  const handleSavePlan = () => {
    if (!result || !result.shePlanDocument) {
      toast({ variant: 'destructive', title: 'Error', description: 'No SHE plan to save.' });
      return;
    }

    const { companyName, projectTitle, reviewDate } = form.getValues();

    const newPlan: SavedShePlan = {
      id: new Date().toISOString(),
      companyName,
      title: projectTitle,
      reviewDate: format(reviewDate, 'PPP'),
      createdAt: format(new Date(), 'PPP p'),
      shePlanDocument: result.shePlanDocument,
    };

    try {
      const savedPlans: SavedShePlan[] = JSON.parse(localStorage.getItem('savedShePlans') || '[]');
      savedPlans.unshift(newPlan);
      localStorage.setItem('savedShePlans', JSON.stringify(savedPlans));
      toast({ title: 'Success', description: `SHE Plan "${projectTitle}" has been saved.` });
    } catch (error) {
      console.error('Failed to save SHE Plan to localStorage', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the plan.' });
    }
  };


  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    const projectTitle = form.getValues('projectTitle');
    if (!reportElement || !projectTitle) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot download PDF. Please generate a plan first.' });
      return;
    }
    
    setIsDownloadingPdf(true);
    
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const PADDING = 10;
        const contentWidth = pdfWidth - (PADDING * 2);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = PADDING;

        pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, imgHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - (PADDING * 2));

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + PADDING;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, imgHeight);
            heightLeft -= (pdf.internal.pageSize.getHeight() - (PADDING * 2));
        }
        
        pdf.save(`SHE-Plan-${projectTitle.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch(err) {
        console.error("PDF generation error:", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloadingPdf(false);
    }
  };

  const formSection = (name: keyof ShePlanFormValues, label: string, placeholder: string, isTextarea = true, rows = 5) => (
      <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    {isTextarea ? (
                      <Textarea placeholder={placeholder} {...field} rows={rows} />
                    ) : (
                      <Input placeholder={placeholder} {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
              </FormItem>
          )}
      />
  );


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">SHE Site Plan Generator</h1>
        <p className="text-muted-foreground">
          Create comprehensive Safety, Health, and Environment site plans.
        </p>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>1. Project Details</CardTitle>
                  <CardDescription>Start by providing the basic information about the project.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formSection('companyName', 'Company Name', 'e.g., RAK Safety', false)}
                  {formSection('projectTitle', 'Project Title', 'e.g., New Warehouse Construction', false)}
                  {formSection('projectLocation', 'Project Location', 'e.g., 123 Industrial Rd, Johannesburg', false)}
                  {formSection('preparedBy', 'Prepared By', 'e.g., John Doe, Safety Officer', false)}
                  <FormField
                      control={form.control}
                      name="reviewDate"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                              <FormLabel>Next Review Date</FormLabel>
                              <Popover>
                                  <PopoverTrigger asChild>
                                      <FormControl>
                                          <Button
                                              variant={'outline'}
                                              className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                          >
                                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                      </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                  </PopoverContent>
                              </Popover>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>2. Plan Content</CardTitle>
                  <CardDescription>Fill in the details for each section of the SHE plan. The AI will expand on these points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formSection('projectOverview', 'Project Overview', 'Describe the scope, timeline, and key phases of the project...')}
                {formSection('siteHazards', 'Site-Specific Hazards', 'List the main hazards identified on site (e.g., fall hazards from scaffolding, electrical risks from temporary power, excavation work)...')}
                {formSection('ppeRequirements', 'Personal Protective Equipment (PPE)', 'Describe the minimum required PPE for site access and any task-specific PPE...')}
                {formSection('trainingRequirements', 'Training & Competency', 'List mandatory training like site induction, first aid, specific equipment operation certifications...')}
                {formSection('emergencyProcedures', 'Emergency Response Procedures', 'Describe procedures for medical emergencies, fire, chemical spills, and site evacuation protocols...')}
                {formSection('environmentalControls', 'Environmental Controls', 'Describe measures for waste management, dust suppression, noise control, and water protection...')}
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>3. Generate Document</CardTitle>
                <CardDescription>Once all sections are complete, generate your professional SHE plan.</CardDescription>
            </CardHeader>
             <CardFooter>
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                      {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating Plan...</> : <><WandSparkles className="mr-2" /> Generate SHE Plan</>}
                  </Button>
              </CardFooter>
          </Card>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <CardTitle>Generated SHE Site Plan</CardTitle>
                        <CardDescription>Review the document below. You can save it or download as a PDF.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleSavePlan} variant="outline">
                            <FileArchive className="mr-2" /> Save Plan
                        </Button>
                        <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-background">
                    <ReactMarkdown>{result.shePlanDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
