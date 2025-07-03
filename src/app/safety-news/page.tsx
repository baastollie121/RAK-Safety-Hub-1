import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetyNewsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Safety News
        </h1>
        <p className="text-muted-foreground">
          Latest news and updates in the world of safety.
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
