import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This feature is currently under development. Please check back later.</p>
        </CardContent>
       </Card>
    </div>
  );
}
