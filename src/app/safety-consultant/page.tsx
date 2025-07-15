
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, Bot, User, RefreshCcw } from "lucide-react";
import { Alert } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

const conversationStarters = [
    "What are the risks of working at heights?",
    "Summarize the OHS Act Section 8 for me.",
    "What PPE is required for basic electrical work?",
    "How should I handle a chemical spill?"
];

export default function SafetyConsultantPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
        const storedMessages = localStorage.getItem('safety-consultant-chat');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            setMessages([{ id: 'initial-bot-message', role: 'bot', content: 'Hello! I am Winston, your AI Safety Consultant. How can I assist you today?' }]);
        }
    } catch(e) {
        setMessages([{ id: 'initial-bot-message-error', role: 'bot', content: 'Hello! I am Winston, your AI Safety Consultant. How can I assist you today?' }]);
    }
    inputBoxRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('safety-consultant-chat', JSON.stringify(messages));
    }
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isBotTyping]);


  const handleSendMessage = async (messageText?: string) => {
    if (isBotTyping) return;
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: new Date().toISOString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);

    // Add an empty bot message to update with streamed content
    const botMessageId = new Date().toISOString() + '-bot';
    const botMessage: Message = { id: botMessageId, role: 'bot', content: '' };
    setMessages(prev => [...prev, botMessage]);

    try {
        const response = await fetch('/api/safety-consultant/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: textToSend }),
        });

        if (!response.body) throw new Error('Response body is null');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${errorText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            const chunk = decoder.decode(value, { stream: true });
            
            setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: m.content + chunk } : m));
        }
    } catch (error) {
      console.error('Error with AI Safety Consultant:', error);
      const fallbackBotMessage = "I couldn't process that. Try rephrasing your question or, if you're an admin, add a relevant document to my Core Memory.";
      setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: fallbackBotMessage } : m));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const startNewChat = () => {
    localStorage.removeItem('safety-consultant-chat');
    setMessages([{ id: new Date().toISOString(), role: 'bot', content: 'Hello! I am Winston, your AI Safety Consultant. How can I assist you today?' }]);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="neon-gradient-card flex-grow flex flex-col">
        <div className="bg-card rounded-lg flex flex-col flex-grow overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-4 border-b">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">AI Safety Consultant</h1>
              <p className="text-muted-foreground mt-2">Chat with Winston, your AI safety expert, for guidance and advice.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={startNewChat}>
                    <RefreshCcw className="mr-2 size-4" /> New Chat
                </Button>
                {user?.role === 'admin' && (
                    <Button size="sm" asChild>
                       <Link href="/admin/manage-core-memory">Manage Core Memory</Link>
                    </Button>
                )}
            </div>
          </div>
          
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
             <div className="p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex items-end gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'bot' && (
                        <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-orange-500 text-white"><Bot className="size-5" /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn("rounded-lg p-3 max-w-lg break-words text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="size-8 shrink-0">
                           <AvatarFallback><User className="size-5" /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isBotTyping && messages[messages.length-1]?.role === 'bot' && messages[messages.length-1]?.content === '' && (
                    <div className="flex items-end gap-3 justify-start">
                        <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-orange-500 text-white"><Bot className="size-5" /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3">
                            <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Winston is typing...</span>
                            </div>
                        </div>
                    </div>
                )}
                {messages.length <= 1 && (
                    <div className='pt-8'>
                        <p className="text-center text-sm font-semibold text-muted-foreground mb-4">Or try one of these conversation starters:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {conversationStarters.map(q => (
                                <Button key={q} variant="outline" size="sm" className="h-auto py-2" onClick={() => handleSendMessage(q)}>
                                    <p className="whitespace-normal text-left">{q}</p>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </ScrollArea>
           <div className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                ref={inputBoxRef}
                placeholder="Ask Winston a safety question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                className="max-h-24 resize-none"
              />
              <Button size="icon" onClick={() => handleSendMessage()} disabled={isBotTyping || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
