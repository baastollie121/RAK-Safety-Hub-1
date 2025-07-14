
'use client';

import { useState, useRef } from 'react';
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
import { PlusCircle, Trash2, Loader2, Wand2, Download, CalendarIcon, WandSparkles, FileArchive, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHira, type GenerateHiraOutput } from '@/ai/flows/hira-generator';
import { suggestHiraHazards } from '@/ai/flows/hira-suggester';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

interface SavedHiraReport {
    id: string;
    title: string;
    companyName: string;
    reviewDate: string;
    createdAt: string;
    hiraDocument: string;
}

const likelihoodOptions = [
  { value: '1', label: '1 - Almost Impossible' },
  { value: '2', label: '2 - Highly Unlikely' },
  { value: '3', label: '3 - Unlikely' },
  { value: '4', label: '4 - Possible' },
  { value: '5', label: '5 - Even Chance' },
];

const consequenceOptions = [
    { value: '1', label: '1 - Minor first aid injury' },
    { value: '2', label: '2 - Break bone/minor illness/1st-2nd degree burns' },
    { value: '3', label: '3 - Break bone/serious illness/3rd-4th degree burns over 50% body' },
    { value: '4', label: '4 - Loss of limb/eye/serious illness/50%+ burns' },
    { value: '5', label: '5 - Fatality' },
];

const getRiskRatingDetails = (rating: number) => {
    if (rating >= 16) return { color: 'bg-red-500', level: 'High' };
    if (rating >= 6) return { color: 'bg-yellow-500', level: 'Medium' };
    return { color: 'bg-green-500', level: 'Low' };
};

const getRiskRating = (likelihood: number, consequence: number) => {
  if (!likelihood || !consequence) return { rating: 0, color: 'text-green-400', level: 'Low' };
  const rating = likelihood * consequence;
  if (rating >= 16) return { rating, color: 'text-red-400', level: 'High' };
  if (rating >= 6) return { rating, color: 'text-yellow-400', level: 'Medium' };
  return { rating, color: 'text-green-400', level: 'Low' };
};

const RiskMatrix = ({ hazards }: { hazards: any[] }) => (
    <div className="p-4 border rounded-lg bg-card/30">
        <h3 className="font-bold text-center mb-2 font-headline">Risk Matrix</h3>
        <div className="grid grid-cols-6 gap-1 text-xs text-center">
            <div className="font-bold col-span-1 self-center">Consequence</div>
            <div className="font-bold col-span-5 grid grid-cols-5 gap-1">
                <div className="p-1">1</div>
                <div className="p-1">2</div>
                <div className="p-1">3</div>
                <div className="p-1">4</div>
                <div className="p-1">5</div>
            </div>

            {likelihoodOptions.slice().reverse().map((l, lIndex) => (
                <React.Fragment key={l.value}>
                    <div className="font-bold self-center">{5 - lIndex}</div>
                    <div className="col-span-5 grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map(c => {
                            const rating = (5 - lIndex) * c;
                            const { color } = getRiskRatingDetails(rating);
                            const initialHazards = hazards.filter(h => h.initialLikelihood === (5 - lIndex) && h.initialConsequence === c);
                            const residualHazards = hazards.filter(h => h.residualLikelihood === (5 - lIndex) && h.residualConsequence === c);

                            return (
                                <div key={c} className={cn("h-10 w-full rounded flex items-center justify-center text-white font-bold relative", color)}>
                                    {rating}
                                    {initialHazards.length > 0 && 
                                        <div className="absolute -top-1 -left-1 size-4 bg-black text-white rounded-full flex items-center justify-center border-2 border-white text-xs">
                                            {initialHazards.length}
                                        </div>
                                    }
                                     {residualHazards.length > 0 && 
                                        <div className="absolute -bottom-1 -right-1 size-4 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white text-xs">
                                            {residualHazards.length}
                                        </div>
                                    }
                                </div>
                            );
                        })}
                    </div>
                </React.Fragment>
            ))}
             <div className="col-start-2 col-span-5 font-bold text-center mt-1">Likelihood</div>
             <div className="col-start-1 col-span-6 mt-2 flex justify-center items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="size-3 rounded-full bg-black border" /> Initial Risk</div>
                <div className="flex items-center gap-1"><div className="size-3 rounded-full bg-blue-600 border" /> Residual Risk</div>
            </div>
        </div>
    </div>
);

const HazardInputCard = ({ index, remove, control }: { index: number; remove: (index: number) => void; control: any }) => {
    const hazardValues = useWatch({
        name: `hazards.${index}`,
        control,
    });
    
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
                {/* Column 1: Descriptions */}
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name={`hazards.${index}.hazard`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hazard Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Working at heights on a ladder" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`hazards.${index}.personsAffected`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Persons Affected & Likely Harm</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Maintenance staff, risk of falls causing injury" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`hazards.${index}.controlMeasures`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Control Measures</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Ensure ladder is stable, use a spotter, inspect ladder before use" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Column 2: Risk Ratings */}
                <div className="space-y-6">
                    {/* Initial Risk */}
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-medium text-center">Initial Risk</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <FormField
                                control={control}
                                name={`hazards.${index}.initialLikelihood`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Likelihood</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || '')}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`hazards.${index}.initialConsequence`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consequence</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || '')}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="text-center font-bold p-2 border rounded-md bg-background">Risk Rating: <span className={initialRisk.color}>{initialRisk.rating} ({initialRisk.level})</span></div>
                    </div>

                    {/* Residual Risk */}
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="font-medium text-center">Residual Risk</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <FormField
                                control={control}
                                name={`hazards.${index}.residualLikelihood`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Likelihood</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || '')}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{likelihoodOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`hazards.${index}.residualConsequence`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consequence</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value || '')}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{consequenceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="text-center font-bold p-2 border rounded-md bg-background">Risk Rating: <span className={residualRisk.color}>{residualRisk.rating} ({residualRisk.level})</span></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


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
      hazards: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hazards',
  });
  
  const watchedHazards = useWatch({
      control: form.control,
      name: 'hazards'
  })

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
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

  const handleSaveHira = () => {
    if (!result || !result.hiraDocument) {
      toast({ variant: 'destructive', title: 'Error', description: 'No HIRA document to save.' });
      return;
    }

    // TODO: Implement cloud save to Firebase/Supabase
    
    const { companyName, taskTitle, reviewDate } = form.getValues();

    const newReport: SavedHiraReport = {
      id: new Date().toISOString(),
      companyName,
      title: taskTitle,
      reviewDate: format(reviewDate, 'PPP'),
      createdAt: format(new Date(), 'PPP p'),
      hiraDocument: result.hiraDocument,
    };

    try {
      const savedReports: SavedHiraReport[] = JSON.parse(localStorage.getItem('savedHiraReports') || '[]');
      savedReports.unshift(newReport);
      localStorage.setItem('savedHiraReports', JSON.stringify(savedReports));
      toast({ title: 'Success', description: `HIRA report "${taskTitle}" has been saved.` });
    } catch (error) {
      console.error('Failed to save HIRA to localStorage', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the report.' });
    }
  };


  const handleDownloadPdf = async () => {
    const reportElement = reportRef.current;
    const taskTitle = form.getValues('taskTitle');
    const companyName = form.getValues('companyName');

    if (!reportElement || !taskTitle) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot download PDF. Please generate a report first.' });
      return;
    }
    
    setIsDownloadingPdf(true);
    
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        // Add Header
        const logoUrl = '/logo-black.png'; // Make sure this path is correct in your `public` folder
        try {
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                pdf.addImage(base64data, 'PNG', 15, 10, 30, 15);
                
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.text(companyName, pdf.internal.pageSize.getWidth() - 15, 20, { align: 'right' });
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`HIRA: ${taskTitle}`, pdf.internal.pageSize.getWidth() - 15, 26, { align: 'right' });

                // Add content
                addContentToPdf();
            }
        } catch(e) {
            console.error("Logo fetch failed, proceeding without it.", e);
            // Incase logo fails, still generate PDF
             pdf.setFontSize(18);
             pdf.text(companyName, pdf.internal.pageSize.getWidth() - 15, 20, { align: 'right' });
             addContentToPdf();
        }
        
        const addContentToPdf = () => {
             const pdfWidth = pdf.internal.pageSize.getWidth();
            const PADDING = 15;
            const contentWidth = pdfWidth - (PADDING * 2);
            const contentStartY = 40; // Start content below header
            const imgHeight = (canvas.height * contentWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = contentStartY;

            pdf.addImage(imgData, 'PNG', PADDING, position, contentWidth, imgHeight);
            heightLeft -= (pdf.internal.pageSize.getHeight() - contentStartY - PADDING);

            let page = 1;
            const addFooter = () => {
                pdf.setFontSize(8);
                pdf.text(`Page ${page}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
                pdf.text(`Generated by RAK Safety Hub`, 15, pdf.internal.pageSize.getHeight() - 10);
                pdf.text(format(new Date(), 'PPP'), pdf.internal.pageSize.getWidth() - 15, pdf.internal.pageSize.getHeight() - 10, { align: 'right'});
            };
            
            addFooter();

            while (heightLeft > 0) {
                position = heightLeft - imgHeight - PADDING + contentStartY;
                pdf.addPage();
                page++;
                addFooter();
                pdf.addImage(imgData, 'PNG', PADDING, -position + contentStartY, contentWidth, imgHeight);
                heightLeft -= (pdf.internal.pageSize.getHeight() - PADDING * 2);
            }
            
            pdf.save(`HIRA-${taskTitle.replace(/\s+/g, '_')}.pdf`);
            toast({ title: 'Success', description: 'PDF downloaded successfully.' });
            setIsDownloadingPdf(false);
        }

    } catch(err) {
        console.error("PDF generation error:", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
        setIsDownloadingPdf(false);
    }
  };

  const handleExportCsv = () => {
    const hazards = form.getValues('hazards');
    if (hazards.length === 0) {
      toast({ variant: 'destructive', title: 'No Hazards', description: 'Add at least one hazard to export.' });
      return;
    }

    const headers = [
      'Hazard Description', 'Persons Affected',
      'Initial Likelihood', 'Initial Consequence', 'Initial Risk',
      'Control Measures',
      'Residual Likelihood', 'Residual Consequence', 'Residual Risk'
    ];

    const rows = hazards.map(h => {
      const initialRisk = getRiskRating(h.initialLikelihood, h.initialConsequence);
      const residualRisk = getRiskRating(h.residualLikelihood, h.residualConsequence);
      return [
        `"${h.hazard.replace(/"/g, '""')}"`,
        `"${h.personsAffected.replace(/"/g, '""')}"`,
        h.initialLikelihood,
        h.initialConsequence,
        initialRisk.rating,
        `"${h.controlMeasures.replace(/"/g, '""')}"`,
        h.residualLikelihood,
        h.residualConsequence,
        residualRisk.rating
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HIRA_Export_${form.getValues('taskTitle')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Success', description: 'HIRA data exported as CSV.' });
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl font-headline">1. Project Details</CardTitle>
                  <CardDescription>Enter the high-level details for this HIRA.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Company/Organization</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., RAK Safety" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
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
                                              className={cn('pl-3 text-left font-normal w-full', !field.value && 'text-muted-foreground')}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">2. Hazard Analysis</CardTitle>
                        <CardDescription>Add each identified hazard and assess its risk. Use the AI to get suggestions.</CardDescription>
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
                        <Button type="button" variant="outline" onClick={handleSuggestHazards} disabled={isSuggesting || !useWatch({control: form.control, name: 'taskTitle'})}>
                            {isSuggesting ? <><Loader2 className="animate-spin mr-2" /> Thinking...</> : <><WandSparkles className="mr-2" /> Suggest Hazards (AI)</>}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card className="sticky top-24">
                     <CardHeader>
                         <CardTitle className="text-xl font-headline">Risk Overview</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <RiskMatrix hazards={watchedHazards} />
                     </CardContent>
                 </Card>
            </div>
          </div>


          <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline">3. Generate & Export</CardTitle>
                <CardDescription>Once all sections are complete, generate your professional HIRA document.</CardDescription>
            </CardHeader>
            <CardFooter className="flex-wrap gap-2 justify-start p-6">
                  <Button type="submit" disabled={isLoading} size="lg">
                      {isLoading ? <><Loader2 className="animate-spin mr-2" /> Generating...</> : <><Wand2 className="mr-2" /> Generate HIRA Document</>}
                  </Button>
                   <Button type="button" variant="outline" size="lg" onClick={handleExportCsv} disabled={watchedHazards.length === 0}>
                      <FileDown className="mr-2" /> Export as CSV
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
                        <CardTitle>Generated HIRA Document</CardTitle>
                        <CardDescription>Review the document below. You can save the report or download it as a PDF.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleSaveHira} variant="outline">
                            <FileArchive className="mr-2" /> Save Report
                        </Button>
                        <Button onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? <><Loader2 className="animate-spin mr-2" /> Downloading...</> : <><Download className="mr-2" /> Download as PDF</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 bg-background">
                    <ReactMarkdown>{result.hiraDocument}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
