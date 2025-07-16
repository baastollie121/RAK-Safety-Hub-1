
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat } from "lucide-react";

export default function RiskAssessmentPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Risk Assessment Generator
        </h1>
        <p className="text-muted-foreground">
          Let our AI guide you through creating a OHS Act-compliant risk assessment.
        </p>
      </header>
      <Card className="flex flex-col items-center justify-center text-center py-12 px-6">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <HardHat className="size-12 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4">Coming Soon</CardTitle>
            <CardDescription>
                This powerful AI-driven Risk Assessment tool is currently under construction.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                We are working hard to bring you a guided experience for creating comprehensive, legally compliant risk assessments. Please check back later for updates!
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
