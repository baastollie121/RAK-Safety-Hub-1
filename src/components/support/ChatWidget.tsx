'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/logo';
import { Send, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'admin';
  text: string;
  timestamp: string;
}

// Mock chat history
const mockHistory: Message[] = [
    { id: '1', role: 'admin', text: "Hi there! Welcome to RAK Safety Hub support. How can we help you today?", timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
];


export function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>(mockHistory);
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && scrollAreaRef.current) {
            setTimeout(() => {
                const scrollEl = scrollAreaRef.current?.querySelector('div > div');
                if (scrollEl) {
                  scrollEl.scrollTop = scrollEl.scrollHeight;
                }
            }, 100)
        }
    }, [isOpen, messages]);


    const handleSendMessage = () => {
        if (!input.trim() || !user) return;
        
        const newMessage: Message = {
            id: new Date().toISOString(),
            role: 'user',
            text: input,
            timestamp: new Date().toISOString(),
        };

        // In a real app, you'd save this to Firestore.
        // `await addDoc(collection(db, 'chats', user.uid, 'messages'), newMessage)`
        setMessages(prev => [...prev, newMessage]);
        setInput('');

        // Simulate admin reply
        setIsLoading(true);
        setTimeout(() => {
             const adminReply: Message = {
                id: new Date().toISOString() + '2',
                role: 'admin',
                text: "Thanks for reaching out! An agent will be with you shortly.",
                timestamp: new Date().toISOString(),
            };
             setMessages(prev => [...prev, adminReply]);
             setIsLoading(false);
        }, 1500);
    };

    return (
        <>
            <div className={cn(
                "fixed bottom-4 right-4 z-50 transition-all duration-300",
                isOpen && "opacity-0 pointer-events-none"
            )}>
                <Button onClick={() => setIsOpen(true)} className="flex flex-col items-center justify-center h-20 w-20 rounded-full shadow-lg gap-1">
                    <Logo />
                    <span className="text-xs font-bold">Support</span>
                </Button>
            </div>
            
            <div className={cn(
                "fixed bottom-4 right-4 z-50 transition-all duration-300 w-full max-w-sm",
                !isOpen && "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <Card className="flex flex-col h-[60vh] shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Logo />
                            <div>
                                <CardTitle className="font-headline text-lg">Support Chat</CardTitle>
                                <CardDescription>We typically reply in minutes.</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="size-5" />
                        </Button>
                    </CardHeader>
                    <ScrollArea className="flex-grow bg-muted/30" viewportRef={scrollAreaRef as any}>
                         <div className="p-4 space-y-4">
                            {messages.map(message => (
                                <div key={message.id} className={cn("flex items-end gap-2", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'admin' && <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-sm">R</div>}
                                    <div className={cn(
                                        "rounded-lg p-3 max-w-xs break-words text-sm",
                                        message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                    )}>
                                        <p>{message.text}</p>
                                        <p className={cn("text-xs mt-1", message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                                            {format(new Date(message.timestamp), 'p')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-end gap-2 justify-start">
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-sm">R</div>
                                    <div className="rounded-lg p-3 max-w-xs break-words text-sm bg-muted rounded-bl-none">
                                        <Loader2 className="animate-spin" />
                                    </div>
                                </div>
                            )}
                         </div>
                    </ScrollArea>
                    <CardFooter className="p-2 border-t">
                        <div className="flex w-full items-center space-x-2">
                             <Textarea
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                                }}
                                rows={1}
                                className="flex-grow resize-none"
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                                <Send />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
