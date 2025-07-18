
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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

export interface Asset extends AssetFormValues {
  id: string;
}

export default function AssetEquipmentTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      serialNumber: '',
      category: '',
      status: 'Operational',
      inspectedBy: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const assetsQuery = query(collection(db, 'assets'), orderBy('createdAt', 'desc'));
            const assetsSnapshot = await getDocs(assetsQuery);
            const fetchedAssets = assetsSnapshot.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    lastInspected: data.lastInspected.toDate(),
                    lastReplaced: data.lastReplaced?.toDate ? data.lastReplaced.toDate() : undefined,
                } as Asset;
            });
            setAssets(fetchedAssets);

            const uniqueCategories = [...new Set(fetchedAssets.map(a => a.category))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error("Error fetching assets:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load assets.' });
        } finally {
            setIsLoading(false);
        }
    };
    fetchAssets();
  }, [user, toast]);


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
    form.reset({
        ...asset,
        lastInspected: new Date(asset.lastInspected),
        lastReplaced: asset.lastReplaced ? new Date(asset.lastReplaced) : undefined,
    });
    setIsAssetDialogOpen(true);
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    try {
        await deleteDoc(doc(db, 'assets', assetId));
        setAssets(assets.filter((asset) => asset.id !== assetId));
        toast({ title: 'Success', description: `Asset "${assetName}" removed.` });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete asset.' });
    }
  };

  const handleSaveAsset = async (data: AssetFormValues) => {
    const dataToSave = { ...data, createdAt: serverTimestamp() };
    try {
        if (editingAsset) {
            await setDoc(doc(db, 'assets', editingAsset.id), dataToSave, { merge: true });
            setAssets(assets.map((asset) => (asset.id === editingAsset.id ? { ...asset, ...data } : asset)));
            toast({ title: 'Success', description: 'Asset updated.' });
        } else {
            const docRef = await addDoc(collection(db, 'assets'), dataToSave);
            setAssets([{ ...data, id: docRef.id }, ...assets]);
            toast({ title: 'Success', description: 'Asset added.' });
        }
         if (!categories.includes(data.category)) {
            setCategories([...categories, data.category]);
        }
        setIsAssetDialogOpen(false);
        setEditingAsset(null);
    } catch (error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not save asset.' });
    }
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
    // This is a client-side only operation for now. A backend implementation would be better.
    setCategories(categories.filter(c => c !== categoryToDelete));
    // Note: this doesn't delete the assets from the DB. A more robust solution would be a batch delete.
    setAssets(assets.filter(a => a.category !== categoryToDelete));
    toast({ title: 'Success', description: `Category "${categoryToDelete}" removed from view.` });
  };

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    return assets.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <p className="text-muted-foreground">Manage your company&apos;s assets and equipment in one place.</p>
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
      
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : (
            <Accordion type="multiple" defaultValue={categories} className="w-full space-y-2">
                {categories.map((category) => (
                    <AccordionItem value={category} key={category} className="border rounded-lg bg-card">
                    <div className="flex items-center">
                        <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline text-lg font-headline text-left">
                            <div className='flex items-center gap-2'>
                                <GripVertical className="size-5 text-muted-foreground"/>
                                {category} ({assetsByCategory[category]?.length || 0})
                            </div>
                        </AccordionTrigger>
                        <div className="pr-4">
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will only remove the category from the view. It will not delete the assets within it from the database.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
                                    Yes, remove category
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <AccordionContent className="p-0 border-t">
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
                                    {(assetsByCategory[category] && assetsByCategory[category].length > 0) ? (
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
                                            <TableCell>{format(new Date(asset.lastInspected), 'PPP')}</TableCell>
                                            <TableCell>{asset.inspectedBy}</TableCell>
                                            <TableCell>{asset.lastReplaced ? format(new Date(asset.lastReplaced), 'PPP') : 'N/A'}</TableCell>
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
        )}

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
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Cordless Drill" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial Number (Optional)</FormLabel><FormControl><Input placeholder="e.g., SN-123456" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select or type a category" /></SelectTrigger></FormControl>
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
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="Operational">Operational</SelectItem>
                            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                        </SelectContent></Select><FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="lastInspected" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Last Inspected Date</FormLabel>
                        <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                    </FormItem>
                )}
              />
              <FormField control={form.control} name="inspectedBy" render={({ field }) => (<FormItem><FormLabel>Inspected By</FormLabel><FormControl><Input placeholder="e.g., Site Supervisor" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="lastReplaced" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Last Replaced Date (Optional)</FormLabel>
                        <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent></Popover><FormMessage />
                    </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Save Asset</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
