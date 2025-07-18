
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
import { generateMethodStatement, GenerateMethodStatementOutput } from '@/ai/flows/method-statement-generator';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useDownloadPdf } from '@/hooks/use-download-pdf';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const procedureStepSchema = z.object({
  value: z.string().min(1, "Step description cannot be empty."),
});

const formSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required.'),
  projectTitle: z.string().min(1, 'Project Title is required.'),
  taskTitle: z.string().min(1, 'Task Title is required.'),
  preparedBy: z.string().min(1, 'Prepared By is required.'),
  reviewDate: z.date({ required_error: 'A review date is required.' }),
  scope: z.string().min(1, 'Scope of Work is required.'),
  hazards: z.string().min(1, 'Identified Hazards are required.'),
  ppe: z.string().min(1, 'Personal Protective Equipment (PPE) is required.'),
  equipment: z.string().min(1, 'Equipment & Resources are required.'),
  procedure: z.array(procedureStepSchema).min(1, "At least one procedure step is required."),
  training: z.string().min(1, 'Training & Competency requirements are required.'),
  monitoring: z.string().min(1, 'Supervision & Monitoring procedures are required.'),
  emergencyProcedures: z.string().min(1, 'Emergency Procedures are required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function MethodStatementPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateMethodStatementOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      projectTitle: '',
      taskTitle: '',
      preparedBy: user?.email || '',
      reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      scope: '',
      hazards: '',
      ppe: '',
      equipment: '',
      procedure: [{ value: '' }],
      training: '',
      monitoring: '',
      emergencyProcedures: '',
    },
  });
  
  const { isDownloading, handleDownload } = useDownloadPdf({
    reportRef,
    fileName: `Method-Statement-${form.getValues('taskTitle').replace(/\s+/g, '_')}`,
    options: {
        companyName: form.getValues('companyName'),
        documentTitle: `Method Statement: ${form.getValues('taskTitle')}`
    }
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedure",
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = {
        ...data,
        reviewDate: format(data.reviewDate, 'PPP'),
        procedure: data.procedure.map(p => p.value),
      };
      const response = await generateMethodStatement(submissionData);
      setResult(response);
      toast({ title: 'Success', description: 'Method Statement generated successfully.' });
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("Method Statement Generation Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate Method Statement.' });
    }
    setIsLoading(false);
  };
  
  const handleSaveStatement = async () => {
    if (!result || !result.methodStatementDocument || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No document or user session to save.' });
      return;
    }

    const { companyName, projectTitle, taskTitle, reviewDate } = form.getValues();

    const newStatement = {
      docType: 'MethodStatement',
      userId: user.uid,
      companyName,
      projectTitle,
      title: taskTitle,
      reviewDate: format(reviewDate, 'PPP'),
      createdAt: serverTimestamp(),
      methodStatementDocument: result.methodStatementDocument,
    };

    try {
      await addDoc(collection(db, 'generated_documents'), newStatement);
      toast({ title: 'Success', description: `Method Statement "${taskTitle}" has been saved.` });
    } catch (error) {
      console.error('Failed to save to Firestore', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the document.' });
    }
  };

  const formSection = (name: keyof FormValues, label: string, placeholder: string, isTextarea = true) => (
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
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Method Statement Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create comprehensive, OSHA-compliant Method Statements for safe work planning.
          </p>
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle>1. Document & Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formSection('companyName', 'Company Name', 'e.g., RAK Safety', false)}
                  {formSection('projectTitle', 'Project Title', 'e.g., New Warehouse Construction', false)}
                  {formSection('taskTitle', 'Specific Task / Operation Title', 'e.g., Installation of Rooftop HVAC Units', false)}
                  {formSection('preparedBy', 'Prepared By', 'e.g., John Doe, Site Manager', false)}
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
                  <CardTitle>2. Work & Safety Details</CardTitle>
                  <CardDescription>Fill in the core details for the Method Statement. The AI will format this into a compliant document.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {formSection('scope', 'Scope of Work', 'e.g., This procedure covers the lifting, placement, and securing of three HVAC units onto the roof of the main warehouse building...')}
                  {formSection('hazards', 'Identified Hazards (from HIRA/JHA)', 'e.g., Working at heights, suspended loads, manual handling, electrical connections, adverse weather.')}
                  {formSection('ppe', 'Personal Protective Equipment (PPE)', 'e.g., Hard hat, safety glasses, steel-toed boots, high-visibility vest, fall arrest harness, and appropriate gloves.')}
                   {formSection('equipment', 'Equipment & Resources', 'e.g., 100-ton mobile crane, certified lifting slings and shackles, hand tools, taglines, communication radios.')}
                </div>
                 <div className="space-y-4">
                  {formSection('training', 'Training & Competency', 'e.g., All personnel must have valid site induction. Crane operator must be certified. Riggers and signalers must be competent. All staff trained on this method statement.')}
                  {formSection('monitoring', 'Supervision & Monitoring', 'e.g., A full-time supervisor will oversee the lift. A pre-lift safety briefing will be conducted. Wind speed will be monitored continuously.')}
                  {formSection('emergencyProcedures', 'Emergency Procedures', 'e.g., In case of lift failure, clear the area immediately. For medical emergencies, contact the site first aider and call emergency services. The assembly point is...')}
                </div>
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Step-by-Step Procedure</CardTitle>
              <CardDescription>Detail the exact sequence of work. Be clear and concise.</CardDescription>
            </CardHeader>
            <CardContent>
               <div>
                  <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                         <FormField
                          key={field.id}
                          control={form.control}
                          name={`procedure.${index}.value`}
                          render={({ field }) => (
                              <FormItem>
                                  <div className="flex items-start gap-2">
                                      <span className="text-muted-foreground pt-2">{index + 1}.</span>
                                      <FormControl>
                                          <Textarea {...field} placeholder={`Step ${index + 1} description...`} rows={2} />
                                      </FormControl>
                                      <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => remove(index)}>
                                          <Trash2 className="size-4 text-destructive" />
                                      </Button>
                                  </div>
                                  <FormMessage className="ml-6" />
                              </FormItem>
                              )}
                          />
                      ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: "" })}>
                      <PlusCircle className="mr-2 size-4" /> Add Step
                  </Button>
                  {form.formState.errors.procedure && <p className="text-destructive text-sm mt-2">{form.formState.errors.procedure.root?.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardFooter className="p-6">
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                      {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : <><WandSparkles className="mr-2" /> Generate Method Statement</>}
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
                        <CardTitle>Generated Method Statement</CardTitle>
                        <CardDescription>Review the document below. You can save it or download as a PDF.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleSaveStatement} variant="outline" disabled={!user}>
                            <FileArchive className="mr-2" /> Save Document
                        </Button>
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-background">
                    <ReactMarkdown>{result.methodStatementDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
