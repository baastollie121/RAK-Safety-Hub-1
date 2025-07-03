'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Loader2, Wand2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateHira, type GenerateHiraOutput } from '@/ai/flows/hira-generator';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

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

  const onSubmit = async (data: HiraFormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateHira(data);
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
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="companyName">Company/Organization Name</Label>
                    <Input id="companyName" {...form.register('companyName')} />
                    {form.formState.errors.companyName && <p className="text-destructive text-sm mt-1">{form.formState.errors.companyName.message}</p>}
                </div>
                <div>
                    <Label htmlFor="taskTitle">Task/Project Title</Label>
                    <Input id="taskTitle" {...form.register('taskTitle')} />
                    {form.formState.errors.taskTitle && <p className="text-destructive text-sm mt-1">{form.formState.errors.taskTitle.message}</p>}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Hazard Analysis</CardTitle>
                <CardDescription>Add each identified hazard and assess its risk.</CardDescription>
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
                                        No hazards added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {form.formState.errors.hazards && <p className="text-destructive text-sm mt-4 p-2">{form.formState.errors.hazards.message || form.formState.errors.hazards?.root?.message}</p>}
                 <Button type="button" variant="outline" onClick={addHazard} className="mt-4">
                    <PlusCircle className="mr-2" /> Add Hazard
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
