'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Upload, Loader2, Bot, User } from "lucide-react";
import { aiSafetyConsultant } from '@/ai/flows/ai-safety-consultant';
import { analyzeDocument } from '@/ai/flows/document-analyzer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function SafetyConsultantPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hello! I am Winston, your AI Safety Consultant. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // State for the admin "core memory" upload feature
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);

    try {
      const response = await aiSafetyConsultant({ query: input });
      const botMessage: Message = { role: 'bot', content: response.advice };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with AI Safety Consultant:', error);
      const errorMessage: Message = { role: 'bot', content: "I'm sorry, but I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsBotTyping(false);
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

  const handleAnalyzeDocument = async () => {
    if (!fileToUpload) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a file to analyze.' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const documentDataUri = await fileToDataUri(fileToUpload);
      const result = await analyzeDocument({ documentDataUri });
      setAnalysisResult(result.summary);
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the document.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = () => {
    // In a real application, you would save the document embedding to a vector store here.
    toast({ title: 'Success', description: "Document added to Winston's core memory." });
    setIsUploadDialogOpen(false);
    setFileToUpload(null);
    setAnalysisResult(null);
  };
  
  const openUploadDialog = () => {
    setFileToUpload(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setIsUploadDialogOpen(true);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 h-[calc(100vh-theme(spacing.4))] flex flex-col">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">AI Safety Consultant</h1>
          <p className="text-muted-foreground">Chat with Winston, your AI safety expert, for guidance and advice.</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openUploadDialog}>
            <Upload className="mr-2" /> Upload to Core Memory
          </Button>
        )}
      </header>
      <div className="flex-grow flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Chat with Winston</CardTitle>
            <CardDescription>Ask any safety-related question.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between gap-4">
            <div className="flex-grow rounded-lg border bg-background/50 p-4 space-y-4 overflow-y-auto" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'bot' && (
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shrink-0">
                      <Bot className="size-5" />
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-lg break-words ${message.role === 'user' ? 'bg-secondary' : 'bg-muted'}`}>
                    <p className="font-bold text-sm">{message.role === 'user' ? 'You' : 'Winston'}</p>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0">
                      <User className="size-5" />
                    </div>
                  )}
                </div>
              ))}
              {isBotTyping && (
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shrink-0">
                    <Bot className="size-5" />
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="font-bold text-sm">Winston</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Winston is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Type your message here."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isBotTyping}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload to Core Memory</DialogTitle>
            <DialogDescription>
              Upload a document for Winston to learn from. This will be added to its core knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="core-memory-file">Document File</Label>
              <Input
                id="core-memory-file"
                type="file"
                onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" />
                <span>Analyzing document...</span>
              </div>
            )}
            {analysisResult && (
              <Alert>
                <AlertTitle className="font-headline">Analysis Complete</AlertTitle>
                <AlertDescription className="max-h-60 overflow-y-auto">
                    <p className="font-semibold mb-2">Here's what Winston learned:</p>
                    {analysisResult}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            {analysisResult ? (
                <>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirmSave}>Confirm & Save</Button>
                </>
            ) : (
                <>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAnalyzeDocument} disabled={!fileToUpload || isAnalyzing}>
                        Analyze Document
                    </Button>
                </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
