
'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Package, GripVertical, Plus, List, Building, HardHat, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// --- TYPE DEFINITIONS ---
interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  assignedTo: string; // 'pool' or site ID
}

interface Asset {
  id: string;
  name: string;
  category: string;
  assignedTo: string; // 'pool' or site ID
}

interface Site {
  id: string;
  name: string;
}

type DraggableItem = Employee | Asset;

// --- MOCK DATA (Simulating data from other trackers) ---
const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'John Doe', jobTitle: 'Supervisor', assignedTo: 'pool' },
  { id: 'emp-2', name: 'Jane Smith', jobTitle: 'Operator', assignedTo: 'pool' },
  { id: 'emp-3', name: 'Peter Jones', jobTitle: 'Driver', assignedTo: 'pool' },
  { id: 'emp-4', name: 'Sam Wilson', jobTitle: 'Electrician', assignedTo: 'pool' },
  { id: 'emp-5', name: 'Mary Johnson', jobTitle: 'Rigger', assignedTo: 'pool' },
];

const mockAssets: Asset[] = [
  { id: 'asset-1', name: 'Hammer Drill', category: 'Drills', assignedTo: 'pool' },
  { id: 'asset-2', name: 'Angle Grinder', category: 'Grinders', assignedTo: 'pool' },
  { id: 'asset-3', name: 'Step Ladder 6ft', category: 'Ladders', assignedTo: 'pool' },
  { id: 'asset-4', name: 'Forklift', category: 'Moving Machinery', assignedTo: 'pool' },
  { id: 'asset-5', name: 'Welding Machine', category: 'Welding', assignedTo: 'pool' },
];


// --- DRAGGABLE ITEM COMPONENT ---
const PlannerItem = ({ item }: { item: DraggableItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'item' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const isEmployee = 'jobTitle' in item;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <Card className="p-2 bg-background hover:bg-muted/80 cursor-grab active:cursor-grabbing shadow-sm">
        <div className="flex items-center gap-2">
            <GripVertical className="size-5 text-muted-foreground" />
            <div className="flex-grow">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{isEmployee ? item.jobTitle : item.category}</p>
            </div>
        </div>
      </Card>
    </div>
  );
};


// --- SITE CARD COMPONENT (Droppable) ---
const SiteCard = ({ site, employees, assets }: { site: Site, employees: Employee[], assets: Asset[]}) => {
    const { setNodeRef } = useSortable({ id: site.id, data: { type: 'site-column' } });
    const assignedIds = useMemo(() => [...employees.map(e => e.id), ...assets.map(a => a.id)], [employees, assets]);

    return (
        <Card ref={setNodeRef} className="flex flex-col bg-card/50 min-h-[300px]">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline text-base flex items-center gap-2">
                    <Building className="size-4"/> {site.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-2 space-y-2">
                 <SortableContext items={assignedIds} strategy={verticalListSortingStrategy}>
                    {employees.length === 0 && assets.length === 0 ? (
                        <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed rounded-md">
                            <p className="text-sm text-muted-foreground">Drop resources here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {employees.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-xs text-muted-foreground mb-1 px-2 flex items-center gap-1.5"><HardHat className="size-3"/>Personnel</h4>
                                    <div className="pl-1 space-y-1">
                                        {employees.map(emp => <PlannerItem key={emp.id} item={emp} />)}
                                    </div>
                                </div>
                            )}
                             {assets.length > 0 && (
                                 <div>
                                    <h4 className="font-semibold text-xs text-muted-foreground mb-1 px-2 flex items-center gap-1.5"><Package className="size-3"/>Equipment</h4>
                                    <div className="pl-1 space-y-1">
                                        {assets.map(asset => <PlannerItem key={asset.id} item={asset} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                 </SortableContext>
            </CardContent>
             <CardFooter className="p-2 border-t mt-auto">
                <Badge variant="secondary" className="mr-2">Personnel: {employees.length}</Badge>
                <Badge variant="secondary">Equipment: {assets.length}</Badge>
            </CardFooter>
        </Card>
    )
}

// --- RESOURCE POOL COLUMN (Droppable) ---
const ResourceColumn = ({ id, title, icon, items, searchTerm, setSearchTerm }: { id: string, title: string, icon: React.ReactNode, items: DraggableItem[], searchTerm: string, setSearchTerm: (term: string) => void }) => {
    const { setNodeRef } = useSortable({ id, data: { type: 'resource-column' } });

    return (
        <Card ref={setNodeRef} className="flex flex-col h-full max-h-[calc(100vh-14rem)] bg-muted/20">
            <CardHeader className='pb-2'>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    {icon} {title} ({items.length})
                </CardTitle>
                 <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </CardHeader>
            <ScrollArea className="flex-grow">
                 <CardContent className='p-2'>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {items.length > 0 ? (
                            items.map(item => <PlannerItem key={item.id} item={item} />)
                        ) : (
                            <p className="text-sm text-muted-foreground p-4 text-center h-40 flex items-center justify-center">No available resources match your search.</p>
                        )}
                    </SortableContext>
                </CardContent>
            </ScrollArea>
        </Card>
    );
};


export default function SiteResourcePlannerPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [sites, setSites] = useState<Site[]>([
    { id: 'site-1', name: 'Project Alpha (JHB)' },
    { id: 'site-2', name: 'Warehouse Expansion (CPT)' },
  ]);
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState('');
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // --- DERIVED STATE ---
  const personnelPool = useMemo(() => 
    employees.filter(e => e.assignedTo === 'pool' && e.name.toLowerCase().includes(personnelSearchTerm.toLowerCase())), 
    [employees, personnelSearchTerm]
  );
  const equipmentPool = useMemo(() => 
    assets.filter(a => a.assignedTo === 'pool' && (a.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) || a.category.toLowerCase().includes(assetSearchTerm.toLowerCase()))),
    [assets, assetSearchTerm]
  );
  
  // --- DND HANDLERS ---
  const findContainer = (id: string) => {
    // Check if the id is one of the pool containers themselves
    if (id === 'personnel-pool') return 'personnel-pool';
    if (id === 'equipment-pool') return 'equipment-pool';
    // Check if the id is one of the site containers themselves
    if (sites.some(s => s.id === id)) return id;

    // Check if the id belongs to an item (employee or asset) and find its container
    const employee = employees.find(e => e.id === id);
    if (employee) {
        return employee.assignedTo === 'pool' ? 'personnel-pool' : employee.assignedTo;
    }
    const asset = assets.find(a => a.id === id);
    if (asset) {
        return asset.assignedTo === 'pool' ? 'equipment-pool' : asset.assignedTo;
    }
    return null;
  };
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = employees.find(e => e.id === active.id) || assets.find(a => a.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;
    
    const originalContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    
    if (!originalContainer || !overContainer || originalContainer === overContainer) {
      return;
    }

    const itemIsEmployee = employees.some(e => e.id === active.id);

    // Prevent dropping employees in equipment pool and vice versa
    if ((itemIsEmployee && overContainer === 'equipment-pool') || (!itemIsEmployee && overContainer === 'personnel-pool')) {
        return;
    }

    const newAssignedTo = overContainer.includes('-pool') ? 'pool' : overContainer;

    if (itemIsEmployee) {
        setEmployees(emps => emps.map(e => e.id === active.id ? {...e, assignedTo: newAssignedTo } : e));
    } else {
        setAssets(asts => asts.map(a => a.id === active.id ? {...a, assignedTo: newAssignedTo } : a));
    }
  };
  
  // --- OTHER HANDLERS ---
  const handleAddSite = () => {
    if (newSiteName.trim().length < 2) {
      toast({ variant: 'destructive', title: 'Invalid Name', description: 'Site name must be at least 2 characters.' });
      return;
    }
    const newSite: Site = { id: `site-${new Date().toISOString()}`, name: newSiteName };
    setSites(prev => [...prev, newSite]);
    setNewSiteName('');
    setIsSiteDialogOpen(false);
    toast({ title: 'Success', description: `Site "${newSiteName}" created.` });
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Site & Resource Planner
            </h1>
            <p className="text-muted-foreground">
              Drag resources from the side pools and drop them onto a project site in the center.
            </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
          {/* Personnel Pool */}
          <div className="lg:col-span-1 xl:col-span-1">
             <ResourceColumn id="personnel-pool" title="Personnel Pool" icon={<Users />} items={personnelPool} searchTerm={personnelSearchTerm} setSearchTerm={setPersonnelSearchTerm} />
          </div>

          {/* Site Columns */}
          <div className="lg:col-span-2 xl:col-span-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-headline font-semibold">Project Sites</h2>
                <div className="flex gap-2">
                    <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus className="mr-2"/>Add New Site</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a New Site</DialogTitle>
                                <DialogDescription>Enter a name for the new job site or project.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="e.g., Downtown Tower Project"
                                    value={newSiteName}
                                    onChange={(e) => setNewSiteName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                <Button onClick={handleAddSite}>Create Site</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => setIsReportOpen(true)}><List className="mr-2" />Generate Report</Button>
                </div>
            </div>
             <ScrollArea className="h-[calc(100vh-14rem)]">
                <div className="space-y-4 pr-4">
                {sites.map(site => (
                    <SiteCard
                        key={site.id}
                        site={site}
                        employees={employees.filter(e => e.assignedTo === site.id)}
                        assets={assets.filter(a => a.assignedTo === site.id)}
                    />
                ))}
                </div>
             </ScrollArea>
          </div>
          
           {/* Equipment Pool */}
          <div className="lg:col-span-1 xl:col-span-1">
             <ResourceColumn id="equipment-pool" title="Equipment Pool" icon={<Package />} items={equipmentPool} searchTerm={assetSearchTerm} setSearchTerm={setAssetSearchTerm} />
          </div>

        </div>
      </div>
      <DragOverlay>
        {activeItem ? <PlannerItem item={activeItem} /> : null}
      </DragOverlay>

        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle className="font-headline">Resource Assignment Report</DialogTitle>
                    <DialogDescription>A summary of where all resources are currently assigned.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 pr-4 py-4">
                        {sites.map(site => {
                            const siteEmployees = employees.filter(e => e.assignedTo === site.id);
                            const siteAssets = assets.filter(a => a.assignedTo === site.id);
                            return (
                                <div key={site.id}>
                                    <h3 className="font-bold text-lg border-b pb-1 mb-2">{site.name}</h3>
                                    <h4 className="font-semibold mt-2">Personnel ({siteEmployees.length})</h4>
                                    {siteEmployees.length > 0 ? (
                                        <ul className="list-disc pl-5 text-sm">
                                            {siteEmployees.map(e => <li key={e.id}>{e.name} ({e.jobTitle})</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-muted-foreground">None assigned.</p>}
                                    <h4 className="font-semibold mt-2">Equipment ({siteAssets.length})</h4>
                                    {siteAssets.length > 0 ? (
                                        <ul className="list-disc pl-5 text-sm">
                                            {siteAssets.map(a => <li key={a.id}>{a.name} ({a.category})</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-muted-foreground">None assigned.</p>}
                                </div>
                            )
                        })}
                        <Separator className="my-4" />
                        <div>
                            <h3 className="font-bold text-lg pb-1 mb-2">Unassigned Resources</h3>
                             <h4 className="font-semibold mt-2">Personnel ({employees.filter(e => e.assignedTo === 'pool').length})</h4>
                             {employees.filter(e => e.assignedTo === 'pool').length > 0 ? (
                                <ul className="list-disc pl-5 text-sm">
                                    {employees.filter(e => e.assignedTo === 'pool').map(e => <li key={e.id}>{e.name} ({e.jobTitle})</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">All personnel are assigned.</p>}
                             <h4 className="font-semibold mt-2">Equipment ({assets.filter(a => a.assignedTo === 'pool').length})</h4>
                             {assets.filter(a => a.assignedTo === 'pool').length > 0 ? (
                                <ul className="list-disc pl-5 text-sm">
                                    {assets.filter(a => a.assignedTo === 'pool').map(a => <li key={a.id}>{a.name} ({a.category})</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">All equipment is assigned.</p>}
                        </div>
                    </div>
                </ScrollArea>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </DndContext>
  );
}

    