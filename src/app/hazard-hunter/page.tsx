import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export default function HazardHunterPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          AI Hazard Hunter
        </h1>
        <p className="text-muted-foreground">
          Upload an image of a worksite, and our AI will identify potential safety risks.
        </p>
      </header>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Analyze a Worksite Image</CardTitle>
          <CardDescription>
            Choose an image file from your device to begin the analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex w-full items-center space-x-2">
            <Input type="file" accept="image/*" />
            <Button>
              <Upload className="mr-2 size-4" />
              Upload & Analyze
            </Button>
          </div>
          <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center bg-background/50">
            <p className="text-muted-foreground">Analysis results will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
