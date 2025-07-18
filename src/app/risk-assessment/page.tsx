
'use client';

import React, { useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { PlusCircle, Trash2, Loader2, Wand2, Download, CalendarIcon, FileArchive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRiskAssessment, type GenerateRiskAssessmentOutput } from '@/ai/flows/risk-assessment-generator';
import { suggestHiraHazards } from '@/ai/flows/hira-suggester';
import { cn } from '@/lib/utils';
import { useDownloadPdf } from '@/hooks/use-download-pdf';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const hazardSchema = z.object({
  hazard: z.string().min(1, 'Hazard description is required.'),
  personsAffected: z.string().min(1, 'Persons affected is required.'),
  initialLikelihood: z.coerce.number().min(0).max(5, 'Must be between 0-5'),
  initialConsequence: z.coerce.number().min(0).max(5, 'Must be between 0-5'),
  controlMeasures: z.string().min(1, 'Control measures are required.'),
  residualLikelihood: z.coerce.number().min(0).max(5, 'Must be between 0-5'),
  residualConsequence: z.coerce.number().min(0).max(5, 'Must be between 0-5'),
});

const hiraSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  taskTitle: z.string().min(1, 'Task title is required.'),
  siteLocation: z.string().min(1, 'Site location is required.'),
  reviewDate: z.date({ required_error: 'A review date is required.' }),
  hazards: z.array(hazardSchema).min(1, 'At least one hazard must be added.'),
});

type HiraFormValues = z.infer<typeof hiraSchema>;

const likelihoodOptions = [
  { value: '0', label: '0 - Impossible' },
  { value: '1', label: '1 - Almost Impossible' },
  { value: '2', label: '2 - Highly Unlikely' },
  { value: '3', label: '3 - Unlikely' },
  { value: '4', label: '4 - Possible' },
  { value: '5', label: '5 - Even Chance' },
];

const consequenceOptions = [
    { value: '0', label: '0 - No Injury' },
    { value: '1', label: '1 - Minor First Aid Injury' },
    { value: '2', label: '2 - Break Bone/Minor Illness (Temp)' },
    { value: '3', label: '3 - Break Bone/Serious Illness (Perm)' },
    { value: '4', label: '4 - Loss of Limb/Eye/Major Illness' },
    { value: '5', label: '5 - Fatality' },
];

const getRiskRating = (likelihood: number, consequence: number) => {
  if (likelihood === undefined || consequence === undefined) return { rating: 0, color: 'bg-green-600', level: 'Low' };
  const rating = likelihood * consequence;
  if (rating >= 16) return { rating, color: 'bg-red-600', level: 'High' };
  if (rating >= 6) return { rating, color: 'bg-yellow-500 text-black', level: 'Medium' };
  return { rating, color: 'bg-green-600', level: 'Low' };
};

const HazardInputCard = ({ index, remove, control }: { index: number; remove: (index: number) => void; control: any }) => {
    const hazardValues = useWatch({ name: `hazards.${index}`, control });
    const initialRisk = getRiskRating(hazardValues.initialLikelihood, hazardValues.initialConsequence);
    const residualRisk = getRiskRating(hazardValues.residualLikelihood, hazardValues.residualConsequence);

    return (
        <Card className="bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="font-headline text-lg">Hazard #{index + 1}</CardTitle>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-0">
                <div className="space-y-4">
                    <FormField control={control} name={`hazards.${index}.hazard`} render={({ field }) => ( <FormItem> <FormLabel>Hazard Description</FormLabel> <FormControl> <Textarea placeholder="e.g., Working at heights on a ladder" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={control} name={`hazards.${index}.personsAffected`} render={({ field }) => ( <FormItem> <FormLabel>Persons Affected & Likely Harm</FormLabel> <FormControl> <Textarea placeholder="e.g., Maintenance staff, risk of falls causing injury" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={control} name={`hazards.${index}.controlMeasures`} render={({ field }) => ( <FormItem> <FormLabel>Additional Control Measures</FormLabel> <FormControl> <Textarea placeholder="e.g., Ensure ladder is stable, use a spotter, inspect ladder before use" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                <div className="space-y-6">
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-medium text-center">Initial Risk</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <FormField control={control} name={`hazards.${index}.initialLikelihood`} render={({ field }) => ( <FormItem> <FormLabel>Likelihood</FormLabel> <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value ?? '')}> <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl> <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                           <FormField control={control} name={`hazards.${index}.initialConsequence`} render={({ field }) => ( <FormItem> <FormLabel>Consequence</FormLabel> <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value ?? '')}> <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl> <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        </div>
                        <div className={cn("text-center font-bold p-2 border rounded-md text-white", initialRisk.color)}>Risk Rating: {initialRisk.rating} ({initialRisk.level})</div>
                    </div>
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-medium text-center">Residual Risk</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <FormField control={control} name={`hazards.${index}.residualLikelihood`} render={({ field }) => ( <FormItem> <FormLabel>Likelihood</FormLabel> <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value ?? '')}> <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl> <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                           <FormField control={control} name={`hazards.${index}.residualConsequence`} render={({ field }) => ( <FormItem> <FormLabel>Consequence</FormLabel> <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value ?? '')}> <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl> <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
                        </div>
                        <div className={cn("text-center font-bold p-2 border rounded-md text-white", residualRisk.color)}>Risk Rating: {residualRisk.rating} ({residualRisk.level})</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const SuggestHazardsButton = ({ isSuggesting, onClick, form }: { isSuggesting: boolean, onClick: () => void, form: any }) => {
    const taskTitle = useWatch({ control: form.control, name: 'taskTitle' });

    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={isSuggesting || !taskTitle}
        >
            {isSuggesting ? (
                <><Loader2 className="animate-spin mr-2" /> Thinking...</>
            ) : (
                <><Wand2 className="mr-2" /> Suggest Hazards (AI)</>
            )}
        </Button>
    );
};

export default function RiskAssessmentPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [result, setResult] = useState<GenerateRiskAssessmentOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const form = useForm<HiraFormValues>({
    resolver: zodResolver(hiraSchema),
    defaultValues: {
      companyName: '',
      taskTitle: '',
      siteLocation: '',
      hazards: [],
    },
  });
  
  const { isDownloading, handleDownload } = useDownloadPdf({
      reportRef,
      fileName: `Risk-Assessment-${form.getValues('taskTitle').replace(/\s+/g, '_')}`,
      options: {
        companyName: form.getValues('companyName'),
        documentTitle: `Risk Assessment: ${form.getValues('taskTitle')}`
      }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hazards',
  });

  const onSubmit = async (data: HiraFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = { ...data, reviewDate: format(data.reviewDate, 'PPP') };
      const response = await generateRiskAssessment(submissionData);
      setResult(response);
      toast({ title: 'Success', description: 'Risk Assessment generated successfully.' });
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("Risk Assessment Generation Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate Risk Assessment.' });
    }
    setIsLoading(false);
  };
  
  const addHazard = () => {
    append({
        hazard: '', personsAffected: '',
        initialLikelihood: 0, initialConsequence: 0,
        controlMeasures: '',
        residualLikelihood: 0, residualConsequence: 0,
    });
  }

  const handleSuggestHazards = async () => {
    const taskTitle = form.getValues('taskTitle');
    if (!taskTitle) {
      toast({
        variant: 'destructive',
        title: 'Task Title Required',
        description: 'Please enter a task title before getting AI suggestions.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestHiraHazards({ taskTitle });
      if (result.suggestedHazards && result.suggestedHazards.length > 0) {
        result.suggestedHazards.forEach(h => {
          append({
            hazard: h.hazard,
            personsAffected: h.personsAffected,
            controlMeasures: h.controlMeasures,
            initialLikelihood: 3,
            initialConsequence: 3,
            residualLikelihood: 1,
            residualConsequence: 1,
          });
        });
        toast({
          title: 'Hazards Suggested',
          description: `${result.suggestedHazards.length} new hazards have been added to the list.`,
        });
      } else {
        toast({
          title: 'No Suggestions',
          description: 'The AI could not find any specific suggestions for this task.',
        });
      }
    } catch (error) {
      console.error('Error suggesting hazards:', error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'An error occurred while fetching AI suggestions.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };


  const handleSaveReport = async () => {
    if (!result || !result.riskAssessmentDocument || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'No document or user session to save.' });
      return;
    }
    
    const { companyName, taskTitle, reviewDate } = form.getValues();

    const newReport = {
      docType: 'RiskAssessment',
      userId: user.uid,
      companyName,
      title: taskTitle,
      reviewDate: format(reviewDate, 'PPP'),
      createdAt: serverTimestamp(),
      riskAssessmentDocument: result.riskAssessmentDocument,
    };

    try {
      await addDoc(collection(db, 'generated_documents'), newReport);
      toast({ title: 'Success', description: `Report "${taskTitle}" has been saved.` });
    } catch (error) {
      console.error('Failed to save report to Firestore', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the report.' });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Risk Assessment Generator</h1>
        <p className="text-muted-foreground">
          Create OHS Act-compliant Hazard Identification and Risk Assessments.
        </p>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl font-headline">1. Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem className="lg:col-span-2"> <FormLabel>Company/Organization</FormLabel> <FormControl><Input placeholder="e.g., RAK Safety" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="taskTitle" render={({ field }) => ( <FormItem className="lg:col-span-2"> <FormLabel>Task/Project Title</FormLabel> <FormControl><Input placeholder="e.g., Office Electrical Maintenance" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="siteLocation" render={({ field }) => ( <FormItem className="lg:col-span-2"> <FormLabel>Site Location</FormLabel> <FormControl><Input placeholder="e.g., 123 Industrial Rd, Johannesburg" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField
                    control={form.control}
                    name="reviewDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col lg:col-span-2">
                        <FormLabel>Next Review Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn('pl-3 text-left font-normal w-full', !field.value && 'text-muted-foreground')}
                              >
                                <span className="flex-grow">{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}</span>
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
                  <CardTitle className="text-xl font-headline">2. Hazard Analysis</CardTitle>
                  <CardDescription>Add each identified hazard and assess its risk.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-6">
                      {fields.length > 0 ? (
                          fields.map((field, index) => (
                              <HazardInputCard key={field.id} control={form.control} index={index} remove={remove} />
                          ))
                      ) : (
                          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-6 border-2 border-dashed rounded-lg bg-background/50">
                              <p className="font-semibold">No hazards added yet</p>
                              <p className="text-sm">Click the buttons below to begin.</p>
                          </div>
                      )}
                  </div>
                  {form.formState.errors.hazards && <p className="text-destructive text-sm mt-4 p-2">{form.formState.errors.hazards.message || form.formState.errors.hazards?.root?.message}</p>}
              </CardContent>
              <CardFooter className="flex-wrap gap-2 justify-start">
                  <Button type="button" variant="outline" onClick={addHazard}>
                      <PlusCircle className="mr-2" /> Add Hazard Manually
                  </Button>
                  <SuggestHazardsButton
                      isSuggesting={isSuggesting}
                      onClick={handleSuggestHazards}
                      form={form}
                  />
              </CardFooter>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline">3. Generate Document</CardTitle>
            </CardHeader>
            <CardFooter className="flex-wrap gap-2 justify-start p-6">
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : <><Wand2 className="mr-2" /> Generate Risk Assessment</>}
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
                        <CardTitle>Generated Risk Assessment Document</CardTitle>
                        <CardDescription>Review the document below. You can save the report or download it as a PDF.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleSaveReport} variant="outline" disabled={!user}>
                            <FileArchive className="mr-2" /> Save Report
                        </Button>
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-background">
                    <ReactMarkdown>{result.riskAssessmentDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
