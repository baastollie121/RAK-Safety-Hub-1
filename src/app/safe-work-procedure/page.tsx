
'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { generateSafeWorkProcedure, GenerateSafeWorkProcedureOutput } from '@/ai/flows/safe-work-procedure-generator';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useDownloadPdf } from '@/hooks/use-download-pdf';

const procedureStepSchema = z.object({
  value: z.string().min(1, "Step description cannot be empty."),
});

const formSchema = z.object({
  taskTitle: z.string().min(1, 'Task / Operation Title is required.'),
  companyName: z.string().min(1, 'Company Name is required.'),
  preparedBy: z.string().min(1, 'Prepared By is required.'),
  reviewDate: z.date({ required_error: 'A review date is required.' }),
  scope: z.string().min(1, 'Scope & Application is required.'),
  hazards: z.string().min(1, 'Identified Hazards are required.'),
  ppe: z.string().min(1, 'Personal Protective Equipment (PPE) is required.'),
  procedure: z.array(procedureStepSchema).min(1, "At least one procedure step is required."),
  emergencyProcedures: z.string().min(1, 'Emergency Procedures are required.'),
});

type SwpFormValues = z.infer<typeof formSchema>;

interface SavedSwp {
    id: string;
    title: string;
    companyName: string;
    reviewDate: string;
    createdAt: string;
    swpDocument: string;
}

export default function SafeWorkProcedurePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateSafeWorkProcedureOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<SwpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      taskTitle: '',
      preparedBy: user?.email || '',
      reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      scope: '',
      hazards: '',
      ppe: '',
      procedure: [{ value: '' }],
      emergencyProcedures: '',
    },
  });

  const { isDownloading: isDownloadingPdf, handleDownload: handleDownloadPdf } = useDownloadPdf({
    reportRef,
    fileName: `SWP-${form.getValues('taskTitle').replace(/\s+/g, '_')}`,
    options: {
        companyName: form.getValues('companyName'),
        documentTitle: `Safe Work Procedure: ${form.getValues('taskTitle')}`
    }
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedure",
  });

  const onSubmit = async (data: SwpFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = {
        ...data,
        reviewDate: format(data.reviewDate, 'PPP'),
        procedure: data.procedure.map(p => p.value),
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

  const formSection = (name: keyof SwpFormValues, label: string, placeholder: string, isTextarea = true) => (
      <FormField
          control={form.control}
          name={name as any}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    {isTextarea ? (
                      <Textarea placeholder={placeholder} {...field} />
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
                     {form.formState.errors.procedure && <p className="text-destructive text-sm mt-1">{form.formState.errors.procedure.root?.message}</p>}
                    <div className="space-y-2 mt-2">
                        {fields.map((field, index) => (
                           <FormField
                            key={field.id}
                            control={form.control}
                            name={`procedure.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{index + 1}.</span>
                                        <FormControl>
                                            <Textarea {...field} placeholder={`Step ${index + 1} description...`} rows={2} />
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
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
