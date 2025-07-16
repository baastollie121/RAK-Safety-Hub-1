
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat } from "lucide-react";

export default function SavedRiskAssessmentsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Saved Risk Assessments
        </h1>
        <p className="text-muted-foreground">
          Browse and manage your AI-generated risk assessments.
        </p>
      </header>
       <Card className="flex flex-col items-center justify-center text-center py-12 px-6">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                <HardHat className="size-12 text-primary" />
            </div>
            <CardTitle className="font-headline mt-4">Coming Soon</CardTitle>
            <CardDescription>
                This section will display all of your saved Risk Assessments.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Once the Risk Assessment Generator is live, you'll be able to save and manage your documents here. Please check back soon!
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
