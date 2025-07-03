
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Plus, Trash2, Users, CalendarClock, AlertTriangle } from 'lucide-react';
import { differenceInDays, parse, isValid, format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define the structure for a column
interface Column {
  id: string;
  label: string;
}

// Define the structure for an employee, allowing for dynamic course keys
interface Employee {
  id: number;
  [key: string]: any; // Allows for dynamic properties like course names
}

const initialColumns: Column[] = [
  { id: 'name', label: 'Name' },
  { id: 'surname', label: 'Surname' },
  { id: 'idNumber', label: 'ID Number' },
  { id: 'cellPhone', label: 'Cell Phone' },
  { id: 'jobTitle', label: 'Job Title' },
  { id: 'warnings', label: 'Warnings Received' },
];

const initialEmployees: Employee[] = [
  { id: 1, name: 'John', surname: 'Doe', idNumber: '9001015000080', cellPhone: '0821234567', jobTitle: 'Supervisor', warnings: 0, 'First Aid Level 1': '2024-12-31' },
  { id: 2, name: 'Jane', surname: 'Smith', idNumber: '9202025001081', cellPhone: '0837654321', jobTitle: 'Operator', warnings: 1, 'Working at Heights': '2024-07-25' }, // Expiring soon
  { id: 3, name: 'Peter', surname: 'Jones', idNumber: '8803155002082', cellPhone: '0841122334', jobTitle: 'Driver', warnings: 0, 'Fire Fighting': '2024-06-01' }, // Expired
];

const DATE_FORMAT = 'yyyy-MM-dd';

const getTrainingStatus = (dateString: string) => {
    if (!dateString) return { label: 'Not Set', colorClass: 'bg-muted' };
    
    const date = parse(dateString, DATE_FORMAT, new Date());
    if (!isValid(date)) {
        return { label: 'Invalid Date', colorClass: 'bg-destructive/50' };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const daysUntilExpiry = differenceInDays(date, today);

    if (daysUntilExpiry < 0) {
        return { label: `Expired ${-daysUntilExpiry}d ago`, colorClass: 'bg-red-500' };
    }
    if (daysUntilExpiry <= 7) {
        return { label: `Expires in ${daysUntilExpiry}d`, colorClass: 'bg-yellow-500' };
    }
    return { label: 'Valid', colorClass: 'bg-green-500' };
};


export default function EmployeeTrainingTrackerPage() {
  const [columns, setColumns] = useState<Column[]>([
    ...initialColumns, 
    { id: 'First Aid Level 1', label: 'First Aid Level 1' },
    { id: 'Working at Heights', label: 'Working at Heights' },
    { id: 'Fire Fighting', label: 'Fire Fighting' }
  ]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [newCourseName, setNewCourseName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const expiringSoonList = useMemo(() => {
    const soon: { employeeName: string; courseName: string; expiryDate: string, daysLeft: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    employees.forEach(emp => {
      columns.forEach(col => {
        if (!initialColumns.some(c => c.id === col.id)) { // It's a training column
          const dateString = emp[col.id];
          if (dateString) {
            const date = parse(dateString, DATE_FORMAT, new Date());
            if (isValid(date)) {
              const daysUntilExpiry = differenceInDays(date, today);
              if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
                soon.push({
                  employeeName: `${emp.name} ${emp.surname}`,
                  courseName: col.label,
                  expiryDate: format(date, 'PPP'),
                  daysLeft: daysUntilExpiry,
                });
              }
            }
          }
        }
      });
    });
    return soon.sort((a,b) => a.daysLeft - b.daysLeft);
  }, [employees, columns]);


  const handleInputChange = (employeeId: number, columnId: string, value: string) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === employeeId ? { ...emp, [columnId]: value } : emp
      )
    );
  };

  const handleAddRow = () => {
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = { id: newId };
    columns.forEach(col => {
        const defaultValue = col.id === 'warnings' ? 0 : '';
        newEmployee[col.id] = defaultValue;
    });
    setEmployees([...employees, newEmployee]);
  };
  
  const handleAddColumn = () => {
    if (newCourseName && !columns.find(col => col.id === newCourseName)) {
      const newColumn = { id: newCourseName, label: newCourseName };
      setColumns([...columns, newColumn]);
      setEmployees(employees.map(emp => ({ ...emp, [newCourseName]: '' })));
      setNewCourseName('');
      setIsDialogOpen(false);
    }
  };

  const handleRemoveRow = (employeeId: number) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
  }

  const handleRemoveColumn = (columnId: string) => {
    // Prevent removing initial columns
    if (initialColumns.some(c => c.id === columnId)) return;

    setColumns(columns.filter(col => col.id !== columnId));
    const newEmployees = employees.map(emp => {
      const newEmp = { ...emp };
      delete newEmp[columnId];
      return newEmp;
    });
    setEmployees(newEmployees);
  }


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
        Employee Compliance & Training Tracker
        </h1>
        <p className="text-muted-foreground">
        Manage employee training records, compliance, and custom certifications.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
                <p className="text-xs text-muted-foreground">Total employees being tracked</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{expiringSoonList.length}</div>
                <p className="text-xs text-muted-foreground">Trainings expiring within 7 days</p>
            </CardContent>
        </Card>
      </div>
      
       {expiringSoonList.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="text-yellow-500" /> Action Required: Training Expiring Soon</CardTitle>
              <CardDescription>The following employee training certifications require renewal within the next 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {expiringSoonList.map((item, index) => (
                  <li key={index} className="text-sm flex justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <span className="font-semibold">{item.employeeName}</span> - {item.courseName}
                    </div>
                     <span className="font-medium">{item.daysLeft > 0 ? `Expires in ${item.daysLeft} days` : `Expires today`} on {item.expiryDate}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>Training Matrix</CardTitle>
                    <CardDescription>Add or remove columns for custom courses, and edit details directly in the cells.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                    <Plus className="mr-2" />
                    Add Custom Course
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Add New Course Column</DialogTitle>
                     <DialogDescription>
                        Enter the name for a new training or certification you want to track.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                    <Label htmlFor="new-course-name">Course Name</Label>
                    <Input
                        id="new-course-name"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="e.g., Advanced Rigging"
                    />
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddColumn}>Add Column</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    {columns.map((col) => (
                        <TableHead key={col.id} className="whitespace-nowrap bg-muted/50">
                            <div className="flex items-center gap-1">
                                {col.label}
                                {!initialColumns.some(c => c.id === col.id) && (
                                    <Button variant="ghost" size="icon" className="size-6 group" onClick={() => handleRemoveColumn(col.id)}>
                                        <Trash2 className="size-3 text-muted-foreground group-hover:text-destructive"/>
                                        <span className="sr-only">Remove column {col.label}</span>
                                    </Button>
                                )}
                            </div>
                        </TableHead>
                    ))}
                    <TableHead className="sticky right-0 bg-muted/95">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                    <TableRow key={employee.id}>
                        {columns.map((col) => {
                            const isTrainingCol = !initialColumns.some(c => c.id === col.id);
                            const status = isTrainingCol ? getTrainingStatus(employee[col.id]) : null;
                            
                            return (
                                <TableCell key={`${employee.id}-${col.id}`}>
                                    <div className="relative">
                                        <Input
                                            type={col.id === 'warnings' ? 'number' : 'text'}
                                            value={employee[col.id] || ''}
                                            onChange={(e) =>
                                                handleInputChange(employee.id, col.id, e.target.value)
                                            }
                                            className={cn("min-w-[200px]", isTrainingCol ? 'pr-8' : '')}
                                            placeholder={isTrainingCol ? 'YYYY-MM-DD' : col.label}
                                        />
                                        {status && (
                                            <span
                                                title={status.label}
                                                className={cn(
                                                    'h-2.5 w-2.5 rounded-full absolute right-2.5 top-1/2 -translate-y-1/2',
                                                    status.colorClass
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                            );
                        })}
                        <TableCell className="sticky right-0 bg-background/95">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(employee.id)}>
                                <Trash2 className="size-4 text-destructive" />
                                <span className="sr-only">Delete row</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddRow} variant="outline">
            <Plus className="mr-2" />
            Add Employee
            </Button>
      </CardFooter>
      </Card>
    </div>
  );
}
