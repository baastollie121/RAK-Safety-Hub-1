'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
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
import { Loader2, Download, CalendarIcon, WandSparkles, FileArchive, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSafeWorkProcedure, GenerateSafeWorkProcedureInputSchema, type GenerateSafeWorkProcedureOutput } from '@/ai/flows/safe-work-procedure-generator';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';


type SwpFormValues = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

interface SavedSwp {
    id: string;
    title: string;
    companyName: string;
    reviewDate: string;
    createdAt: string;
    swpDocument: string;
}

const formSchema = GenerateSafeWorkProcedureInputSchema.extend({
    reviewDate: z.date({ required_error: 'A review date is required.' }),
})

export default function SafeWorkProcedurePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [result, setResult] = useState<GenerateSafeWorkProcedureOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      taskTitle: '',
      preparedBy: user?.email || '',
      reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      scope: '',
      hazards: '',
      ppe: '',
      procedure: [''],
      emergencyProcedures: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedure",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = {
        ...data,
        reviewDate: format(data.reviewDate, 'PPP'),
      };
      const response = await generateSafeWorkProcedure(submissionData);
      setResult(response);
      toast({ title: 'Success', description: 'Safe Work Procedure generated successfully.' });
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("SWP Generation Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate SWP.' });
    }
    setIsLoading(false);
  };
  
  const handleSaveSwp = () => {
    if (!result || !result.swpDocument) {
      toast({ variant: 'destructive', title: 'Error', description: 'No SWP to save.' });
      return;
    }

    const { companyName, taskTitle, reviewDate } = form.getValues();

    const newSwp: SavedSwp = {
      id: new Date().toISOString(),
      companyName,
      title: taskTitle,
      reviewDate: format(reviewDate, 'PPP'),
      createdAt: format(new Date(), 'PPP p'),
      swpDocument: result.swpDocument,
    };

    try {
      const savedSwps: SavedSwp[] = JSON.parse(localStorage.getItem('savedSwps') || '[]');
      savedSwps.unshift(newSwp);
      localStorage.setItem('savedSwps', JSON.stringify(savedSwps));
      toast({ title: 'Success', description: `SWP "${taskTitle}" has been saved.` });
    } catch (error) {
      console.error('Failed to save SWP to localStorage', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the SWP.' });
    }
  };


  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    const projectTitle = form.getValues('taskTitle');
    if (!reportElement || !projectTitle) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot download PDF. Please generate a SWP first.' });
      return;
    }
    
    setIsDownloadingPdf(true);
    
    try {
        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
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
        
        pdf.save(`SWP-${projectTitle.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch(err) {
        console.error("PDF generation error:", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloadingPdf(false);
    }
  };

  const formSection = (name: keyof SwpFormValues, label: string, placeholder: string, isTextarea = true, rows = 4) => (
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
        <h1 className="text-3xl font-bold font-headline tracking-tight">Safe Work Procedure Generator</h1>
        <p className="text-muted-foreground">
          Create comprehensive, OSHA-compliant Safe Work Procedures (SWPs).
        </p>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>1. Document Details</CardTitle>
                  <CardDescription>Provide the basic information for the SWP.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formSection('companyName', 'Company Name', 'e.g., RAK Safety', false)}
                  {formSection('taskTitle', 'Task / Operation Title', 'e.g., Changing a Lightbulb', false)}
                  {formSection('preparedBy', 'Prepared By', 'e.g., John Doe', false)}
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
                  <CardTitle>2. Procedure Content</CardTitle>
                  <CardDescription>Fill in the core details for the SWP. The AI will format this into a compliant document.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formSection('scope', 'Scope & Application', 'e.g., This procedure applies to all maintenance staff performing lighting changes in office buildings during working hours.')}
                {formSection('hazards', 'Identified Hazards', 'e.g., Working at heights on a ladder, risk of electric shock, falling objects, manual handling of materials.')}
                {formSection('ppe', 'Personal Protective Equipment (PPE)', 'e.g., Safety glasses, insulated gloves, non-slip safety footwear, hard hat if working under other activities.')}
                
                <div>
                    <FormLabel>Step-by-Step Procedure</FormLabel>
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                           <FormField
                            key={field.id}
                            control={form.control}
                            name={`procedure.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{index + 1}.</span>
                                        <FormControl>
                                            <Input {...field} placeholder={`Step ${index + 1}`}/>
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append("")}>
                        <PlusCircle className="mr-2 size-4" /> Add Step
                    </Button>
                </div>
                
                {formSection('emergencyProcedures', 'Emergency Procedures', 'e.g., In case of electric shock, immediately cut power at the breaker. Do not touch the person. Call emergency services. For a fall, do not move the injured person and call for medical assistance.')}
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>3. Generate Document</CardTitle>
                <CardDescription>Once all sections are complete, generate your professional SWP.</CardDescription>
            </CardHeader>
             <CardFooter>
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                      {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating SWP...</> : <><WandSparkles className="mr-2" /> Generate SWP</>}
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
                        <CardTitle>Generated Safe Work Procedure</CardTitle>
                        <CardDescription>Review the document below. You can save it or download as a PDF.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleSaveSwp} variant="outline">
                            <FileArchive className="mr-2" /> Save SWP
                        </Button>
                        <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-background">
                    <ReactMarkdown>{result.swpDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
