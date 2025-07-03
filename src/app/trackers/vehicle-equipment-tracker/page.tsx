
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Car,
  Truck,
  Bike,
  Wrench,
  Calendar as CalendarIcon,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { initialVehicles, vehicleTypes, type Vehicle, type VehicleType } from '@/lib/vehicles';
import { differenceInDays, parseISO } from 'date-fns';

const addVehicleSchema = z.object({
  name: z.string().min(3, 'Vehicle name must be at least 3 characters.'),
  type: z.custom<VehicleType>((val) => vehicleTypes.includes(val as VehicleType), {
    message: 'Invalid vehicle type selected.',
  }),
  licenseExpiry: z.date({ required_error: 'License expiry date is required.' }),
  nextService: z.date({ required_error: 'Next service date is required.' }),
});

type AddVehicleFormValues = z.infer<typeof addVehicleSchema>;

const VehicleIcon = ({ type }: { type: VehicleType }) => {
  switch (type) {
    case 'truck':
      return <Truck className="size-8 text-primary" />;
    case 'bike':
      return <Bike className="size-8 text-primary" />;
    default:
      return <Car className="size-8 text-primary" />;
  }
};

export default function VehicleEquipmentTrackerPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddVehicleFormValues>({
    resolver: zodResolver(addVehicleSchema),
  });

  const handleAddVehicle = (data: AddVehicleFormValues) => {
    const newVehicle: Vehicle = {
      id: new Date().toISOString(),
      name: data.name,
      type: data.type,
      licenseExpiry: data.licenseExpiry.toISOString(),
      nextService: data.nextService.toISOString(),
      lastService: new Date().toISOString(),
      lastServiceBy: 'Internal',
      damages: [],
    };
    setVehicles([newVehicle, ...vehicles]);
    toast({ title: 'Success', description: `Vehicle "${data.name}" has been added.` });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const getStatus = (vehicle: Vehicle) => {
    const today = new Date();
    const licenseDays = differenceInDays(parseISO(vehicle.licenseExpiry), today);
    const serviceDays = differenceInDays(parseISO(vehicle.nextService), today);
    const hasDamage = vehicle.damages.length > 0;
    
    if (licenseDays < 0 || serviceDays < 0) {
        return { label: 'Action Required', color: 'destructive' as const };
    }
    if (hasDamage) {
        return { label: 'Damaged', color: 'default' as const, className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'};
    }
     if (licenseDays <= 30 || serviceDays <= 30) {
        return { label: 'Attention Soon', color: 'default' as const, className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'};
    }
    return { label: 'Operational', color: 'secondary' as const, className: 'bg-green-500/20 text-green-300 border-green-500/30' };
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Vehicle & Equipment Tracker
          </h1>
          <p className="text-muted-foreground">
            Manage your fleet, track maintenance, and report damages.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" /> Add New Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details for the new vehicle to add it to your fleet.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddVehicle)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name / Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bakkie-01, CA 123-456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bakkie">4-Door Bakkie</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="bike">Motorbike</SelectItem>
                          <SelectItem value="car_2_door">2-Door Car</SelectItem>
                          <SelectItem value="car_4_door">4-Door Car</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="licenseExpiry"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>License Disc Expiry</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                 <FormField
                    control={form.control}
                    name="nextService"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Next Service Due Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Add Vehicle</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>
        {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => {
                    const status = getStatus(vehicle);
                    return (
                        <Link href={`/trackers/vehicle-equipment-tracker/${vehicle.id}`} key={vehicle.id} className="group">
                            <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1 flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="font-headline">{vehicle.name}</CardTitle>
                                    <CardDescription>{vehicle.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardDescription>
                                </div>
                                <VehicleIcon type={vehicle.type} />
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2 text-sm">
                               <div className="flex items-center gap-2">
                                    <CalendarIcon className="size-4 text-muted-foreground" />
                                    <span>License Expires: {format(parseISO(vehicle.licenseExpiry), 'PPP')}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                    <Wrench className="size-4 text-muted-foreground" />
                                    <span>Next Service: {format(parseISO(vehicle.nextService), 'PPP')}</span>
                               </div>
                            </CardContent>
                            <CardFooter>
                                <Badge variant={status.color} className={status.className}>{status.label}</Badge>
                            </CardFooter>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        ) : (
            <Card className="text-center py-12">
                <CardHeader>
                    <CardTitle>No Vehicles Found</CardTitle>
                    <CardDescription>Get started by adding your first vehicle to the tracker.</CardDescription>
                </CardHeader>
            </Card>
        )}
    </div>
  );
}
