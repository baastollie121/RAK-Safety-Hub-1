
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
import { Users, Package, GripVertical, Plus, List, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
];

const mockAssets: Asset[] = [
  { id: 'asset-1', name: 'Hammer Drill', category: 'Drills', assignedTo: 'pool' },
  { id: 'asset-2', name: 'Angle Grinder', category: 'Grinders', assignedTo: 'pool' },
  { id: 'asset-3', name: 'Step Ladder 6ft', category: 'Ladders', assignedTo: 'pool' },
  { id: 'asset-4', name: 'Forklift', category: 'Moving Machinery', assignedTo: 'pool' },
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
      <Card className="p-3 bg-card/50 hover:bg-card/70 cursor-grab active:cursor-grabbing">
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
        <Card ref={setNodeRef} className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Building className="size-5"/> {site.name}
                </CardTitle>
                <CardDescription>Drag & drop resources here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-[200px] p-2">
                <SortableContext items={assignedIds} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <h4 className="font-semibold text-sm mb-2 px-2">Personnel</h4>
                             {employees.length > 0 ? (
                                employees.map(emp => <PlannerItem key={emp.id} item={emp} />)
                            ) : (
                                <p className="text-xs text-muted-foreground p-2">No personnel assigned.</p>
                            )}
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-2 px-2">Equipment</h4>
                             {assets.length > 0 ? (
                                assets.map(asset => <PlannerItem key={asset.id} item={asset} />)
                            ) : (
                                <p className="text-xs text-muted-foreground p-2">No equipment assigned.</p>
                            )}
                        </div>
                    </div>
                </SortableContext>
            </CardContent>
             <CardFooter className="p-2">
                <Badge variant="secondary" className="mr-2">Personnel: {employees.length}</Badge>
                <Badge variant="secondary">Equipment: {assets.length}</Badge>
            </CardFooter>
        </Card>
    )
}

// --- RESOURCE POOL COLUMN (Droppable) ---
const ResourceColumn = ({ id, title, icon, items }: { id: string, title: string, icon: React.ReactNode, items: DraggableItem[] }) => {
    const { setNodeRef } = useSortable({ id, data: { type: 'resource-column' } });

    return (
        <Card ref={setNodeRef} className="flex flex-col h-full max-h-[80vh]">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    {icon} {title}
                </CardTitle>
                <CardDescription>Available resources</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-grow">
                 <CardContent>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {items.length > 0 ? (
                            items.map(item => <PlannerItem key={item.id} item={item} />)
                        ) : (
                            <p className="text-sm text-muted-foreground p-4 text-center">All resources assigned.</p>
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
  const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // --- DERIVED STATE ---
  const unassignedEmployees = useMemo(() => employees.filter(e => e.assignedTo === 'pool'), [employees]);
  const unassignedAssets = useMemo(() => assets.filter(a => a.assignedTo === 'pool'), [assets]);
  
  const getEmployeesForSite = (siteId: string) => employees.filter(e => e.assignedTo === siteId);
  const getAssetsForSite = (siteId: string) => assets.filter(a => a.assignedTo === siteId);

  // --- DND HANDLERS ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = employees.find(e => e.id === active.id) || assets.find(a => a.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Determine target container ID
    const overIsSite = sites.some(s => s.id === overId);
    const overIsPool = ['personnel-pool', 'equipment-pool'].includes(overId);
    let targetContainerId = overId;
    if (over.data.current?.type === 'item') {
        const parentId = findParentContainer(overId);
        if (parentId) targetContainerId = parentId;
    }

    const isEmployee = employees.some(e => e.id === activeId);

    // Prevent dropping into wrong pool
    if ((isEmployee && targetContainerId === 'equipment-pool') || (!isEmployee && targetContainerId === 'personnel-pool')) {
        return;
    }
    
    // Update state
    if(isEmployee) {
        setEmployees(emps => emps.map(e => e.id === activeId ? {...e, assignedTo: targetContainerId.includes('pool') ? 'pool' : targetContainerId } : e));
    } else {
        setAssets(asts => asts.map(a => a.id === activeId ? {...a, assignedTo: targetContainerId.includes('pool') ? 'pool' : targetContainerId} : a));
    }
  };
  
  const findParentContainer = (itemId: string): string | null => {
      if (unassignedEmployees.some(e => e.id === itemId) || unassignedAssets.some(a => a.id === itemId)) {
          return employees.some(e => e.id === itemId) ? 'personnel-pool' : 'equipment-pool';
      }
      for (const site of sites) {
          if (getEmployeesForSite(site.id).some(e => e.id === itemId) || getAssetsForSite(site.id).some(a => a.id === itemId)) {
              return site.id;
          }
      }
      return null;
  }

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
  
  const allDroppableIds = useMemo(() => [
    'personnel-pool',
    'equipment-pool',
    ...sites.map(s => s.id)
  ], [sites]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Site & Resource Planner
            </h1>
            <p className="text-muted-foreground">
              Drag and drop resources to assign them to job sites.
            </p>
          </div>
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
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {/* Resource Pools */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6">
             <ResourceColumn id="personnel-pool" title="Available Personnel" icon={<Users />} items={unassignedEmployees} />
             <ResourceColumn id="equipment-pool" title="Available Equipment" icon={<Package />} items={unassignedAssets} />
          </div>

          {/* Site Columns */}
          <div className="lg:col-span-2 xl:col-span-3">
             <SortableContext items={allDroppableIds} strategy={verticalListSortingStrategy}>
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sites.map(site => (
                        <SiteCard
                            key={site.id}
                            site={site}
                            employees={getEmployeesForSite(site.id)}
                            assets={getAssetsForSite(site.id)}
                        />
                    ))}
                 </div>
             </SortableContext>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeItem ? <PlannerItem item={activeItem} /> : null}
      </DragOverlay>

        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Resource Assignment Report</DialogTitle>
                    <DialogDescription>A summary of where all resources are currently assigned.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 pr-4 py-4">
                        {sites.map(site => {
                            const siteEmployees = getEmployeesForSite(site.id);
                            const siteAssets = getAssetsForSite(site.id);
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
                        <div className="border-t pt-4">
                            <h3 className="font-bold text-lg pb-1 mb-2">Unassigned Resources</h3>
                             <h4 className="font-semibold mt-2">Personnel ({unassignedEmployees.length})</h4>
                             {unassignedEmployees.length > 0 ? (
                                <ul className="list-disc pl-5 text-sm">
                                    {unassignedEmployees.map(e => <li key={e.id}>{e.name} ({e.jobTitle})</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">None.</p>}
                             <h4 className="font-semibold mt-2">Equipment ({unassignedAssets.length})</h4>
                             {unassignedAssets.length > 0 ? (
                                <ul className="list-disc pl-5 text-sm">
                                    {unassignedAssets.map(a => <li key={a.id}>{a.name} ({a.category})</li>)}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">None.</p>}
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
