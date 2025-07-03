'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, AlertTriangle, ShieldCheck, ScanSearch } from "lucide-react";
import { aiHazardHunter, type AiHazardHunterOutput } from '@/ai/flows/ai-hazard-hunter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function HazardHunterPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiHazardHunterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please choose an image to analyze.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const photoDataUri = await fileToDataUri(file);
      const result = await aiHazardHunter({ photoDataUri });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Hazard Hunter Analysis Error:', err);
      setError('An error occurred during analysis. The AI may be unable to process this image. Please try another one.');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not get a response from the AI. Please try a different image.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">1. Upload Worksite Image</CardTitle>
            <CardDescription>
              Choose a clear image of the area you want to analyze.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} disabled={isLoading} />
              <p className="text-xs text-muted-foreground">Supports JPEG, PNG, WEBP. Max file size: 4MB.</p>
            </div>
            <div className="border-2 border-dashed border-muted rounded-lg aspect-video flex items-center justify-center bg-background/50 p-2">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Worksite preview"
                  width={600}
                  height={400}
                  className="max-h-full w-auto object-contain rounded-md"
                />
              ) : (
                <p className="text-muted-foreground text-center">Image preview will appear here.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanSearch className="mr-2 size-4" />
                  Analyze Image
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">2. Analysis Results</CardTitle>
            <CardDescription>
              Identified hazards and safety assessment will be shown below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 py-12">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="font-semibold">Winston is inspecting the image...</p>
                <p>This may take a moment.</p>
              </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {!isLoading && !analysisResult && !error && (
              <div className="text-center text-muted-foreground py-12">
                <p>Results will appear here after analysis.</p>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 font-headline">Overall Safety Assessment</h3>
                  <Alert variant={analysisResult.identifiedHazards.length > 0 ? "destructive" : "default"} >
                    {analysisResult.identifiedHazards.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" /> }
                    <AlertTitle>{analysisResult.identifiedHazards.length > 0 ? "Potential Risks Detected" : "Looks Good"}</AlertTitle>
                    <AlertDescription>
                      {analysisResult.overallSafetyAssessment}
                    </AlertDescription>
                  </Alert>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 font-headline">Identified Hazards</h3>
                  {analysisResult.identifiedHazards.length > 0 ? (
                    <ul className="space-y-4">
                      {analysisResult.identifiedHazards.map((hazard, index) => (
                        <li key={index} className="p-3 bg-muted/50 rounded-md">
                          <p className="font-medium">{hazard}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <Progress value={(analysisResult.confidenceScores[index] || 0) * 100} className="h-2 w-full" />
                            <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                              {((analysisResult.confidenceScores[index] || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific hazards were identified by the AI.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
