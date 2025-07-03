
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Trash2,
  Edit,
  FolderPlus,
  CalendarIcon,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const assetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  serialNumber: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
  status: z.enum(['Operational', 'Needs Repair', 'Out of Service']),
  lastInspected: z.date(),
  inspectedBy: z.string().min(2, 'Inspected by is required.'),
  lastReplaced: z.date().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface Asset extends AssetFormValues {
  id: string;
}

const initialCategories = [
  'Hand Tools',
  'Electrical Equipment',
  'Drills',
  'Grinders',
  'Welding',
  'Storage',
  'Ladders',
  'Moving Machinery',
  'Generators',
  'Gas Cutters',
  'Lifting Equipment',
];

const initialAssets: Asset[] = [
    { id: '1', name: 'Hammer Drill', serialNumber: 'HD-12345', category: 'Drills', status: 'Operational', lastInspected: new Date('2024-05-10'), inspectedBy: 'John Doe', lastReplaced: new Date('2022-01-15') },
    { id: '2', name: 'Angle Grinder', serialNumber: 'AG-67890', category: 'Grinders', status: 'Needs Repair', lastInspected: new Date('2024-03-20'), inspectedBy: 'Jane Smith' },
    { id: '3', name: 'Step Ladder 6ft', serialNumber: 'SL-ABCDE', category: 'Ladders', status: 'Operational', lastInspected: new Date('2024-06-01'), inspectedBy: 'John Doe' },
    { id: '4', name: 'Forklift', serialNumber: 'FL-XYZ', category: 'Moving Machinery', status: 'Out of Service', lastInspected: new Date('2023-12-01'), inspectedBy: 'Maintenance Co.', lastReplaced: new Date('2018-07-20') },
];

export default function AssetEquipmentTrackerPage() {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      serialNumber: '',
      category: '',
      status: 'Operational',
      inspectedBy: '',
      lastInspected: new Date(),
      lastReplaced: undefined,
    },
  });

  const handleAddAssetClick = () => {
    setEditingAsset(null);
    form.reset({
      name: '',
      serialNumber: '',
      category: '',
      status: 'Operational',
      inspectedBy: '',
      lastInspected: new Date(),
      lastReplaced: undefined,
    });
    setIsAssetDialogOpen(true);
  };

  const handleEditAssetClick = (asset: Asset) => {
    setEditingAsset(asset);
    form.reset(asset);
    setIsAssetDialogOpen(true);
  };

  const handleDeleteAsset = (assetId: string, assetName: string) => {
    setAssets(assets.filter((asset) => asset.id !== assetId));
    toast({ title: 'Success', description: `Asset "${assetName}" removed.` });
  };

  const handleSaveAsset = (data: AssetFormValues) => {
    if (editingAsset) {
      setAssets(assets.map((asset) => (asset.id === editingAsset.id ? { ...asset, ...data } : asset)));
      toast({ title: 'Success', description: 'Asset updated.' });
    } else {
      setAssets([...assets, { ...data, id: new Date().toISOString() }]);
      toast({ title: 'Success', description: 'Asset added.' });
    }
    setIsAssetDialogOpen(false);
    setEditingAsset(null);
  };
  
  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
      toast({ title: 'Success', description: `Category "${newCategoryName}" created.` });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Category name is invalid or already exists.' });
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(categories.filter(c => c !== categoryToDelete));
    setAssets(assets.filter(a => a.category !== categoryToDelete));
    toast({ title: 'Success', description: `Category "${categoryToDelete}" and its assets have been removed.` });
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.inspectedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  const assetsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category] = filteredAssets.filter((asset) => asset.category === category);
      return acc;
    }, {} as Record<string, Asset[]>);
  }, [categories, filteredAssets]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Asset & Equipment Tracker</h1>
        <p className="text-muted-foreground">Manage your company's assets and equipment in one place.</p>
      </header>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <Input 
                placeholder="Search by name, serial number, or inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
            />
            <div className="flex gap-2">
                <Button onClick={handleAddAssetClick} className="w-full md:w-auto">
                    <Plus className="mr-2" /> Add Equipment
                </Button>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                            <FolderPlus className="mr-2" /> Create Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Category</DialogTitle>
                            <DialogDescription>Enter a name for the new equipment category.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input 
                                placeholder="e.g., Safety Harnesses"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleAddCategory}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </CardContent>
      </Card>
      
      <Accordion type="multiple" defaultValue={initialCategories} className="w-full">
        {categories.map((category) => (
            <AccordionItem value={category} key={category} className="border rounded-lg mb-2 bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-lg font-headline">
                <div className="flex items-center justify-between w-full">
                    <div className='flex items-center gap-2'>
                        <GripVertical className="size-5 text-muted-foreground"/>
                        {category} ({assetsByCategory[category].length})
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the &quot;{category}&quot; category and all {assetsByCategory[category].length} assets within it. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
                            Yes, delete category
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Serial No.</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Inspected</TableHead>
                                <TableHead>Inspected By</TableHead>
                                <TableHead>Last Replaced</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assetsByCategory[category].length > 0 ? (
                                assetsByCategory[category].map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium">{asset.name}</TableCell>
                                    <TableCell>{asset.serialNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={asset.status === 'Operational' ? 'secondary' : asset.status === 'Needs Repair' ? 'default' : 'destructive'}
                                            className={cn({
                                                'bg-green-500/20 text-green-300 border-green-500/30': asset.status === 'Operational',
                                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': asset.status === 'Needs Repair',
                                                'bg-red-500/20 text-red-300 border-red-500/30': asset.status === 'Out of Service'
                                            })}
                                        >
                                            {asset.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(asset.lastInspected, 'PPP')}</TableCell>
                                    <TableCell>{asset.inspectedBy}</TableCell>
                                    <TableCell>{asset.lastReplaced ? format(asset.lastReplaced, 'PPP') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditAssetClick(asset)}>
                                        <Edit className="size-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="size-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the asset &quot;{asset.name}&quot;. This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteAsset(asset.id, asset.name)}>
                                            Yes, delete asset
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                        No assets in this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit' : 'Add'} Equipment/Asset</DialogTitle>
             <DialogDescription>
                Fill out the details for the equipment below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveAsset)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cordless Drill" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SN-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Operational">Operational</SelectItem>
                            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastInspected"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Last Inspected Date</FormLabel>
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
                name="inspectedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspected By</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Site Supervisor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastReplaced"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Last Replaced Date (Optional)</FormLabel>
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Asset</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
