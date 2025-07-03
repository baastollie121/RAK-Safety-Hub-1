'use client';

import { useState } from 'react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

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
  { id: 2, name: 'Jane', surname: 'Smith', idNumber: '9202025001081', cellPhone: '0837654321', jobTitle: 'Operator', warnings: 1, 'First Aid Level 1': '2025-06-30' },
];


export default function EmployeeTrainingTrackerPage() {
  const [columns, setColumns] = useState<Column[]>([...initialColumns, { id: 'First Aid Level 1', label: 'First Aid Level 1' }]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [newCourseName, setNewCourseName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
            Employee Compliance & Training Tracker
            </h1>
            <p className="text-muted-foreground">
            Manage employee training records, compliance, and custom certifications.
            </p>
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
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="new-course-name">Course Name</Label>
              <Input
                id="new-course-name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g., Working at Heights"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddColumn}>Add Column</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                {columns.map((col) => (
                    <TableHead key={col.id} className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            {col.label}
                            {!initialColumns.some(c => c.id === col.id) && (
                                <Button variant="ghost" size="icon" className="size-6" onClick={() => handleRemoveColumn(col.id)}>
                                    <Trash2 className="size-3 text-destructive"/>
                                    <span className="sr-only">Remove column {col.label}</span>
                                </Button>
                            )}
                        </div>
                    </TableHead>
                ))}
                 <TableHead className="sticky right-0 bg-background/95">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {employees.map((employee) => (
                <TableRow key={employee.id}>
                    {columns.map((col) => (
                    <TableCell key={`${employee.id}-${col.id}`}>
                        <Input
                        type={col.id === 'warnings' ? 'number' : 'text'}
                        value={employee[col.id] || ''}
                        onChange={(e) =>
                            handleInputChange(employee.id, col.id, e.target.value)
                        }
                        className="min-w-[150px]"
                        placeholder={col.label.toLowerCase().includes('date') ? 'YYYY-MM-DD' : col.label}
                        />
                    </TableCell>
                    ))}
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
      </div>
      <div className="mt-4">
        <Button onClick={handleAddRow} variant="outline">
          <Plus className="mr-2" />
          Add Employee
        </Button>
      </div>
    </div>
  );
}
