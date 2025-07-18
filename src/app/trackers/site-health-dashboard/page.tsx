
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Wrench, ShieldCheck, UserCheck, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { type Vehicle } from '@/lib/vehicles';
import { type Asset } from '../asset-equipment-tracker/page';
import { type Employee, type TrainingCourse } from '../employee-training-tracker/page';

interface TrainingRecord {
    employee: Employee;
    course: TrainingCourse;
    expiryDate: string;
}

export default function SiteHealthDashboardPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [trainings, setTrainings] = useState<TrainingRecord[]>([]);

    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Assets
                const assetsQuery = query(collection(db, 'assets'));
                const assetsSnapshot = await getDocs(assetsQuery);
                const fetchedAssets = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
                setAssets(fetchedAssets);

                // Fetch Trainings
                const employeesQuery = query(collection(db, 'employees'));
                const coursesQuery = query(collection(db, 'training_courses'));
                const [employeesSnapshot, coursesSnapshot] = await Promise.all([getDocs(employeesQuery), getDocs(coursesQuery)]);
                
                const fetchedEmployees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
                const fetchedCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingCourse));

                const fetchedTrainings: TrainingRecord[] = [];
                fetchedEmployees.forEach(emp => {
                    fetchedCourses.forEach(course => {
                        if (emp[course.id]) {
                            fetchedTrainings.push({
                                employee: emp,
                                course: course,
                                expiryDate: emp[course.id],
                            });
                        }
                    });
                });
                setTrainings(fetchedTrainings);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

  const assetStatusData = useMemo(() => {
    const counts = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'Operational', value: counts['Operational'] || 0, fill: 'hsl(var(--chart-2))' },
      { name: 'Needs Repair', value: counts['Needs Repair'] || 0, fill: 'hsl(var(--chart-4))' },
      { name: 'Out of Service', value: counts['Out of Service'] || 0, fill: 'hsl(var(--chart-1))' },
    ];
  }, [assets]);

  const trainingStatusData = useMemo(() => {
    const today = new Date();
    const statuses = trainings.reduce((acc, training) => {
        try {
            const expiryDate = parseISO(training.expiryDate);
            if(isNaN(expiryDate.getTime())) return acc;

            const daysUntilExpiry = differenceInDays(expiryDate, today);

            if (daysUntilExpiry < 0) {
                acc.Expired += 1;
            } else if (daysUntilExpiry <= 30) {
                acc['Expiring Soon'] += 1;
            } else {
                acc.Compliant += 1;
            }
        } catch (e) {
            // Ignore invalid date strings
        }
        return acc;
    }, { Compliant: 0, 'Expiring Soon': 0, Expired: 0 });

    return [
        { name: 'Compliant', value: statuses.Compliant, fill: 'hsl(var(--chart-2))' },
        { name: 'Expiring Soon', value: statuses['Expiring Soon'], fill: 'hsl(var(--chart-4))' },
        { name: 'Expired', value: statuses.Expired, fill: 'hsl(var(--chart-1))' },
    ];
  }, [trainings]);

  const assetsNeedingAttention = useMemo(() => {
    return assets.filter(a => a.status === 'Needs Repair' || a.status === 'Out of Service');
  }, [assets]);

  const trainingsNeedingAttention = useMemo(() => {
    const today = new Date();
    return trainings.filter(t => {
        try {
            const expiryDate = parseISO(t.expiryDate);
             if(isNaN(expiryDate.getTime())) return false;
            const daysUntilExpiry = differenceInDays(expiryDate, today);
            return daysUntilExpiry <= 30;
        } catch(e) {
            return false;
        }
    }).sort((a,b) => differenceInDays(parseISO(a.expiryDate), parseISO(b.expiryDate)));
  }, [trainings]);

  // Chart Configurations
  const assetChartConfig: ChartConfig = {
    value: { label: 'Assets' },
    Operational: { label: 'Operational', color: 'hsl(var(--chart-2))' },
    'Needs Repair': { label: 'Needs Repair', color: 'hsl(var(--chart-4))' },
    'Out of Service': { label: 'Out of Service', color: 'hsl(var(--chart-1))' },
  };

  const trainingChartConfig: ChartConfig = {
    value: { label: 'Trainings' },
    Compliant: { label: 'Compliant', color: 'hsl(var(--chart-2))' },
    'Expiring Soon': { label: 'Expiring Soon', color: 'hsl(var(--chart-4))' },
    Expired: { label: 'Expired', color: 'hsl(var(--chart-1))' },
  };
  
    if (isLoading) {
        return (
             <div className="p-4 sm:p-6 md:p-8 space-y-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Site Health Dashboard</h1>
                    <p className="text-muted-foreground">An overview of your site&apos;s safety and compliance status.</p>
                </header>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="lg:col-span-2 h-48 w-full" />
                </div>
             </div>
        )
    }


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Site Health Dashboard</h1>
        <p className="text-muted-foreground">An overview of your site&apos;s safety and compliance status.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset & Equipment Health</CardTitle>
            <CardDescription>Status of all tracked assets.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={assetChartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={assetStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} strokeWidth={5}>
                         {assetStatusData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
             </ChartContainer>
          </CardContent>
           <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex w-full items-center text-muted-foreground">
                <span>Total Assets</span>
                <span className="ml-auto font-bold">{assets.length}</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Compliance</CardTitle>
            <CardDescription>Employee training status.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={trainingChartConfig} className="w-full h-[250px]">
                <BarChart data={trainingStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                     <XAxis type="number" hide />
                     <YAxis type="category" dataKey="name" hide />
                     <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={5} layout="vertical">
                         {trainingStatusData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
             </ChartContainer>
          </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
            <div className="w-full leading-none text-muted-foreground flex items-center gap-4">
                 {trainingStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }}/>
                        <div className="flex-1">{item.name}</div>
                        <div className="font-bold text-foreground">{item.value}</div>
                    </div>
                ))}
            </div>
            </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Items Needing Attention</CardTitle>
                <CardDescription>Assets and trainings that require immediate action.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Wrench className="size-4"/>Equipment Status</h3>
                        {assetsNeedingAttention.length > 0 ? (
                            <ul className="space-y-2">
                                {assetsNeedingAttention.map(asset => (
                                    <li key={asset.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                        <span>{asset.name}</span>
                                        <Badge variant={asset.status === 'Needs Repair' ? 'default' : 'destructive'} className={cn({
                                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': asset.status === 'Needs Repair',
                                                'bg-red-500/20 text-red-300 border-red-500/30': asset.status === 'Out of Service'
                                            })}>{asset.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="text-sm flex items-center gap-2 p-2 rounded-md bg-green-500/20 text-green-300">
                                <ShieldCheck className="size-4"/>All equipment is operational.
                            </div>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><CalendarClock className="size-4"/>Training Renewals</h3>
                        {trainingsNeedingAttention.length > 0 ? (
                            <ul className="space-y-2">
                                {trainingsNeedingAttention.map(training => {
                                    const days = differenceInDays(parseISO(training.expiryDate), new Date());
                                    const isExpired = days < 0;
                                    return (
                                        <li key={`${training.employee.id}-${training.course.id}`} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                            <span>{training.employee.name} - {training.course.label}</span>
                                            <Badge variant={isExpired ? 'destructive' : 'default'} className={cn({
                                                'bg-red-500/20 text-red-300 border-red-500/30': isExpired,
                                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': !isExpired
                                            })}>
                                                {isExpired ? `Expired ${-days}d ago` : `Expires in ${days}d`}
                                            </Badge>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                             <div className="text-sm flex items-center gap-2 p-2 rounded-md bg-green-500/20 text-green-300">
                                <UserCheck className="size-4"/>All trainings are up-to-date.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
