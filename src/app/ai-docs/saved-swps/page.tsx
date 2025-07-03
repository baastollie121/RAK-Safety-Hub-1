import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileArchive } from "lucide-react";
import Link from 'next/link';

export default function SavedSwpsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Saved SWPs
        </h1>
        <p className="text-muted-foreground">
          Browse and manage your AI-generated Safe Work Procedures.
        </p>
      </header>
       <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><FileArchive /> No Saved SWPs</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">When you generate a Safe Work Procedure, you can save it here for later access. Go to the <Link href="/safe-work-procedure" className="text-primary underline">Safe Work Procedure Generator</Link> to get started.</p>
            <p className="text-sm text-muted-foreground mt-4">(This feature is currently under development.)</p>
        </CardContent>
       </Card>
    </div>
  );
}
