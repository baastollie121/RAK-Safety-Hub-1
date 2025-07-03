import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function SafetyConsultantPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 h-[calc(100vh-theme(spacing.4))] flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          AI Safety Consultant
        </h1>
        <p className="text-muted-foreground">
          Chat with Winston, your AI safety expert, for guidance and advice.
        </p>
      </header>
      <div className="flex-grow flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Chat with Winston</CardTitle>
            <CardDescription>Ask any safety-related question.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between gap-4">
            <div className="flex-grow rounded-lg border bg-background/50 p-4 space-y-4 overflow-y-auto">
              {/* Chat messages will go here */}
              <div className="flex items-start gap-3">
                 <div className="size-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">W</div>
                 <div className="rounded-lg bg-muted p-3">
                    <p className="font-bold">Winston</p>
                    <p>Hello! I am Winston, your AI Safety Consultant. How can I assist you today?</p>
                 </div>
              </div>
            </div>
            <div className="flex w-full items-center space-x-2">
                <Textarea placeholder="Type your message here." />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
