
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComp } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Wrench,
  CalendarIcon,
  Plus,
  Mail,
  User,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  initialVehicles,
  vehiclePartLists,
  type Vehicle,
  type DamageReport,
} from '@/lib/vehicles';
import VehicleDiagram from '@/components/vehicle/vehicle-diagram';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const reportDamageSchema = z.object({
  partId: z.string().min(1, 'Please select a part from the diagram.'),
  partName: z.string(),
  description: z.string().min(10, 'Please provide a detailed description.'),
  reportedBy: z.string().min(2, 'Reporter name is required.'),
  isChecklistDone: z.boolean().default(false),
});

type ReportDamageFormValues = z.infer<typeof reportDamageSchema>;

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);

  const form = useForm<ReportDamageFormValues>({
    resolver: zodResolver(reportDamageSchema),
  });

  useEffect(() => {
    setIsMounted(true);
    // In a real app, this would be a fetch call.
    // For now, we simulate finding the vehicle and its state from localStorage or mock.
    const vehicleId = params.id as string;
    const storedVehicles: Vehicle[] = JSON.parse(localStorage.getItem('vehicles') || JSON.stringify(initialVehicles));
    const foundVehicle = storedVehicles.find((v) => v.id === vehicleId);
    
    if (foundVehicle) {
      setVehicle(foundVehicle);
    } else {
        // If not found in localStorage (e.g. first load), check initial mock data
        const mockVehicle = initialVehicles.find((v) => v.id === vehicleId);
        if (mockVehicle) setVehicle(mockVehicle);
        else toast({ variant: 'destructive', title: 'Vehicle not found' });
    }
  }, [params.id, toast]);

  const updateVehicleState = (updatedVehicle: Vehicle) => {
    setVehicle(updatedVehicle);
     try {
      const storedVehicles: Vehicle[] = JSON.parse(localStorage.getItem('vehicles') || JSON.stringify(initialVehicles));
      const updatedVehicles = storedVehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    } catch(e) {
      // Fallback for initial load
      localStorage.setItem('vehicles', JSON.stringify(initialVehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)));
    }
  }

  const handlePartClick = (partId: string, partName: string) => {
    form.reset({
      partId,
      partName,
      description: '',
      reportedBy: '',
      isChecklistDone: false,
    });
    setIsDamageDialogOpen(true);
  };
  
  const handleReportDamage = (data: ReportDamageFormValues) => {
    if (!vehicle) return;

    const newDamageReport: DamageReport = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      ...data,
    };
    
    const updatedVehicle = { ...vehicle, damages: [...vehicle.damages, newDamageReport] };
    updateVehicleState(updatedVehicle);
    
    toast({ title: 'Success', description: 'Damage has been reported.' });
    setIsDamageDialogOpen(false);
  };
  
  const handleDeleteDamage = (damageId: string) => {
    if (!vehicle) return;
    const updatedVehicle = { ...vehicle, damages: vehicle.damages.filter(d => d.id !== damageId) };
    updateVehicleState(updatedVehicle);
    toast({ title: 'Success', description: 'Damage report removed.' });
  }

  const generateMailtoLink = () => {
    if (!vehicle) return '';

    const subject = `Vehicle Report: ${vehicle.name}`;
    const body = `
Hi Manager,

This is a report for vehicle: ${vehicle.name}.

Status Summary:
- License Expiry: ${format(new Date(vehicle.licenseExpiry), 'PPP')}
- Next Service Due: ${format(new Date(vehicle.nextService), 'PPP')}

Damage Reports (${vehicle.damages.length} total):
${vehicle.damages.map(d => `- ${d.partName}: ${d.description} (Reported by ${d.reportedBy} on ${format(new Date(d.date), 'PPP')})`).join('\n') || 'No damages reported.'}

Please review.

Regards,
RAK Safety Hub
    `;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  if (!isMounted || !vehicle) {
    return (
         <div className="p-4 sm:p-6 md:p-8 space-y-4">
             <Skeleton className="h-10 w-1/4" />
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
                 <div className="lg:col-span-2 space-y-4">
                     <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-48 w-full" />
                 </div>
             </div>
         </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2" /> Back to Fleet
        </Button>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{vehicle.name}</h1>
        <p className="text-muted-foreground">
          {vehicle.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left/Main column */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Damage Report</CardTitle>
              <CardDescription>Click on a vehicle part to report new damage.</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleDiagram
                vehicleType={vehicle.type}
                damagedParts={vehicle.damages.map((d) => d.partId)}
                onPartClick={handlePartClick}
              />
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle>Damage Log</CardTitle>
                    <CardDescription>Chronological record of all reported damages for this vehicle.</CardDescription>
                </CardHeader>
                <CardContent>
                    {vehicle.damages.length > 0 ? (
                        <ul className="space-y-4">
                            {vehicle.damages.map(damage => (
                                <li key={damage.id} className="flex items-start justify-between gap-4 p-3 rounded-md border">
                                    <div>
                                        <p className="font-semibold">{damage.partName}</p>
                                        <p className="text-sm text-muted-foreground">{damage.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Reported by {damage.reportedBy} on {format(new Date(damage.date), 'PPP')}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteDamage(damage.id)}>
                                        <Trash2 className="size-4"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-sm text-muted-foreground text-center py-8">No damages reported for this vehicle.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right/Sidebar column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <strong>License Expires:</strong>
                <span>{format(new Date(vehicle.licenseExpiry), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                <strong>Next Service:</strong>
                <span>{format(new Date(vehicle.nextService), 'PPP')}</span>
              </div>
               <div className="flex items-center gap-2">
                <Wrench className="size-4 text-muted-foreground" />
                <strong>Last Service:</strong>
                <span>{format(new Date(vehicle.lastService), 'PPP')} by {vehicle.lastServiceBy}</span>
              </div>
            </CardContent>
             <CardFooter>
                 <a href={generateMailtoLink()} className={cn(buttonVariants(), 'w-full')}>
                    <Mail className="mr-2" /> Report to Manager
                 </a>
            </CardFooter>
          </Card>
        </div>
      </div>

       <Dialog open={isDamageDialogOpen} onOpenChange={setIsDamageDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report Damage for: {form.getValues('partName')}</DialogTitle>
                <DialogDescription>
                    Please provide details about the damage to this part.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleReportDamage)} className="space-y-4 py-4">
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Damage Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Large crack across the bottom, obstructing view." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="reportedBy"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Name (Reporter)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="isChecklistDone"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Pre-use Checklist Done?</FormLabel>
                                <FormDescription>
                                Was the daily vehicle checklist completed before use?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Submit Damage Report</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
       </Dialog>
    </div>
  );
}
