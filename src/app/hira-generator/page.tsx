'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { Label } from '@/components/ui/label';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Trash2, Loader2, Wand2, Download, CalendarIcon, WandSparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHira, type GenerateHiraOutput } from '@/ai/flows/hira-generator';
import { suggestHiraHazards } from '@/ai/flows/hira-suggester';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const hazardSchema = z.object({
  hazard: z.string().min(1, 'Hazard description is required.'),
  personsAffected: z.string().min(1, 'Persons affected is required.'),
  initialLikelihood: z.coerce.number().min(1, 'Likelihood is required.'),
  initialConsequence: z.coerce.number().min(1, 'Consequence is required.'),
  controlMeasures: z.string().min(1, 'Control measures are required.'),
  residualLikelihood: z.coerce.number().min(1, 'Likelihood is required.'),
  residualConsequence: z.coerce.number().min(1, 'Consequence is required.'),
});

const hiraSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  taskTitle: z.string().min(1, 'Task title is required.'),
  reviewDate: z.date({ required_error: 'A review date is required.' }),
  hazards: z.array(hazardSchema).min(1, 'At least one hazard must be added.'),
});

type HiraFormValues = z.infer<typeof hiraSchema>;

const likelihoodOptions = [
  { value: '1', label: '1 - Almost Impossible' },
  { value: '2', label: '2 - Highly Unlikely' },
  { value: '3', label: '3 - Unlikely' },
  { value: '4', label: '4 - Possible' },
  { value: '5', label: '5 - Even Chance' },
];

const consequenceOptions = [
    { value: '1', label: '1 - Minor first aid injury' },
    { value: '2', label: '2 - Break bone/minor illness' },
    { value: '3', label: '3 - Break bone/serious illness' },
    { value: '4', label: '4 - Loss of limb/eye' },
    { value: '5', label: '5 - Fatality' },
];

const getRiskRating = (likelihood: number, consequence: number) => {
  if (!likelihood || !consequence) return { rating: 0, color: 'text-green-400', level: 'Low' };
  const rating = likelihood * consequence;
  if (rating >= 16) return { rating, color: 'text-red-400', level: 'High' };
  if (rating >= 6) return { rating, color: 'text-yellow-400', level: 'Medium' };
  return { rating, color: 'text-green-400', level: 'Low' };
};

const HazardRow = ({ control, index, remove }: { control: any, index: number, remove: (index: number) => void }) => {
    const {formState: {errors}, register, setValue} = control;
    const hazardValues = useWatch({
        name: `hazards.${index}`,
        control,
    });
    
    const initialRisk = getRiskRating(hazardValues.initialLikelihood, hazardValues.initialConsequence);
    const residualRisk = getRiskRating(hazardValues.residualLikelihood, hazardValues.residualConsequence);
    const hazardErrors = errors.hazards?.[index];

    return (
        <TableRow className="bg-card hover:bg-card/90">
            <TableCell className="align-top space-y-2 p-2 min-w-[300px]">
                <Textarea placeholder="Hazard Description..." {...register(`hazards.${index}.hazard`)} />
                 {hazardErrors?.hazard && <p className="text-destructive text-xs">{hazardErrors.hazard.message}</p>}
                <Textarea placeholder="Persons Affected & Likely Harm..." {...register(`hazards.${index}.personsAffected`)} />
                 {hazardErrors?.personsAffected && <p className="text-destructive text-xs">{hazardErrors.personsAffected.message}</p>}
            </TableCell>
            <TableCell className="align-top space-y-2 p-2 min-w-[220px]">
                <Select onValueChange={(value) => setValue(`hazards.${index}.initialLikelihood`, parseInt(value), { shouldValidate: true })} defaultValue={String(hazardValues.initialLikelihood || '')}>
                    <SelectTrigger><SelectValue placeholder="Select Likelihood" /></SelectTrigger>
                    <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                 <Select onValueChange={(value) => setValue(`hazards.${index}.initialConsequence`, parseInt(value), { shouldValidate: true })} defaultValue={String(hazardValues.initialConsequence || '')}>
                    <SelectTrigger><SelectValue placeholder="Select Consequence" /></SelectTrigger>
                    <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="text-center font-bold p-2 border rounded-md">Risk: <span className={initialRisk.color}>{initialRisk.rating} ({initialRisk.level})</span></div>
            </TableCell>
            <TableCell className="align-top p-2">
                <Textarea placeholder="Additional Control Measures..." {...register(`hazards.${index}.controlMeasures`)} className="min-w-[300px] h-full"/>
                 {hazardErrors?.controlMeasures && <p className="text-destructive text-xs">{hazardErrors.controlMeasures.message}</p>}
            </TableCell>
            <TableCell className="align-top space-y-2 p-2 min-w-[220px]">
                <Select onValueChange={(value) => setValue(`hazards.${index}.residualLikelihood`, parseInt(value), { shouldValidate: true })} defaultValue={String(hazardValues.residualLikelihood || '')}>
                    <SelectTrigger><SelectValue placeholder="Select Likelihood" /></SelectTrigger>
                    <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                 <Select onValueChange={(value) => setValue(`hazards.${index}.residualConsequence`, parseInt(value), { shouldValidate: true })} defaultValue={String(hazardValues.residualConsequence || '')}>
                    <SelectTrigger><SelectValue placeholder="Select Consequence" /></SelectTrigger>
                    <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="text-center font-bold p-2 border rounded-md">Risk: <span className={residualRisk.color}>{residualRisk.rating} ({residualRisk.level})</span></div>
            </TableCell>
            <TableCell className="align-top text-center p-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="text-destructive" /></Button>
            </TableCell>
        </TableRow>
    );
}

export default function HIRAGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [result, setResult] = useState<GenerateHiraOutput | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<HiraFormValues>({
    resolver: zodResolver(hiraSchema),
    defaultValues: {
      companyName: '',
      taskTitle: '',
      reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to one year from now
      hazards: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hazards',
  });

  const onSubmit = async (data: HiraFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const submissionData = {
        ...data,
        reviewDate: format(data.reviewDate, 'PPP'), // Format date to string
      };
      const response = await generateHira(submissionData);
      setResult(response);
      toast({ title: 'Success', description: 'HIRA document generated successfully.' });
    } catch (error) {
      console.error("HIRA Generation Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate HIRA document.' });
    }
    setIsLoading(false);
  };
  
  const addHazard = () => {
    append({
        hazard: '',
        personsAffected: '',
        initialLikelihood: 1,
        initialConsequence: 1,
        controlMeasures: '',
        residualLikelihood: 1,
        residualConsequence: 1,
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

  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    const taskTitle = form.getValues('taskTitle');
    if (!reportElement || !taskTitle) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot download PDF. Please generate a report first.' });
      return;
    }
    
    setIsDownloadingPdf(true);
    
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#111827' // Same as dark theme background
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        const PADDING = 10;
        let finalImgWidth = pdfWidth - (PADDING * 2);
        let finalImgHeight = finalImgWidth / ratio;
        
        let heightLeft = finalImgHeight;
        let position = PADDING;

        pdf.addImage(imgData, 'PNG', PADDING, position, finalImgWidth, finalImgHeight);
        heightLeft -= (pdfHeight - (PADDING * 2));

        while (heightLeft > 0) {
            position = heightLeft - finalImgHeight + PADDING;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', PADDING, position, finalImgWidth, finalImgHeight);
            heightLeft -= (pdfHeight - (PADDING * 2));
        }
        
        pdf.save(`HIRA-${taskTitle.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'Success', description: 'PDF downloaded successfully.' });
    } catch(err) {
        console.error("PDF generation error:", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">HIRA Generator</h1>
        <p className="text-muted-foreground">
          Create OHS Act-compliant Hazard Identification and Risk Assessments.
        </p>
      </header>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
              <CardHeader>
                  <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                      <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Company/Organization Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g., RAK Safety" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </div>
                  <div className="md:col-span-1">
                      <FormField
                          control={form.control}
                          name="taskTitle"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Task/Project Title</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g., Office Electrical Maintenance" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </div>
                   <div className="md:col-span-1">
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
                  </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle>Hazard Analysis</CardTitle>
                      <CardDescription>Add each identified hazard and assess its risk. Use the AI to get suggestions.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={handleSuggestHazards} disabled={isSuggesting || !useWatch({control: form.control, name: 'taskTitle'})}>
                        {isSuggesting ? <><Loader2 className="animate-spin mr-2" /> Thinking...</> : <><WandSparkles className="mr-2" /> Suggest Hazards</>}
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="overflow-x-auto border rounded-lg">
                      <Table>
                          <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                  <TableHead className="w-[30%]">Hazard & Persons Affected</TableHead>
                                  <TableHead>Initial Risk (L-S-R)</TableHead>
                                  <TableHead className="w-[30%]">Control Measures</TableHead>
                                  <TableHead>Residual Risk (L-S-R)</TableHead>
                                  <TableHead>Action</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {fields.length > 0 ? (
                                  fields.map((field, index) => (
                                      <HazardRow key={field.id} control={form} index={index} remove={remove} />
                                  ))
                              ) : (
                                  <TableRow>
                                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                          No hazards added yet. Click "Add Hazard" or "Suggest Hazards" to begin.
                                      </TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </div>
                  {form.formState.errors.hazards && <p className="text-destructive text-sm mt-4 p-2">{form.formState.errors.hazards.message || form.formState.errors.hazards?.root?.message}</p>}
                  <Button type="button" variant="outline" onClick={addHazard} className="mt-4">
                      <PlusCircle className="mr-2" /> Add Hazard Manually
                  </Button>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                  <Separator />
                  <Button type="submit" disabled={isLoading} size="lg">
                      {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : <><Wand2 className="mr-2" /> Generate HIRA Document</>}
                  </Button>
              </CardFooter>
          </Card>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Generated HIRA Document</CardTitle>
                        <CardDescription>Review the document below. You can copy the text or download it as a PDF.</CardDescription>
                    </div>
                    <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                        {isDownloadingPdf ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-card">
                    <ReactMarkdown>{result.hiraDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
