
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { User } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function ManageClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'client'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedClients = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                companyName: data.companyName,
                role: 'client',
                joinDate: data.joinDate?.toDate ? format(data.joinDate.toDate(), 'PPP') : 'N/A',
                paymentDate: data.paymentDate?.toDate ? format(data.paymentDate.toDate(), 'PPP') : 'N/A',
                createdAt: data.createdAt?.toDate ? format(data.createdAt.toDate(), 'PPP') : 'N/A'
            } as User & { joinDate: string, paymentDate: string, createdAt: string };
        });
        setClients(fetchedClients as unknown as User[]);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Client Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all client accounts on the platform.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            A list of all registered client users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.uid}>
                      <TableCell className="font-medium">{client.companyName}</TableCell>
                      <TableCell>{client.firstName} {client.lastName}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{(client as any).joinDate}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
