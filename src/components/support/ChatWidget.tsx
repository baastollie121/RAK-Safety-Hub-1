
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
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, doc, setDoc } from 'firebase/firestore';


interface Message {
  id: string;
  role: 'user' | 'admin';
  text: string;
  timestamp: any; // Can be a Firestore Timestamp or a string
}


export function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) return;

        setIsLoading(true);
        const messagesRef = collection(db, 'chats', user.uid, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Message, 'id'> }));
            setMessages(fetchedMessages);
            setIsLoading(false);

            // Auto-scroll on new message
             setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                  viewport.scrollTop = viewport.scrollHeight;
                }
            }, 100);
        });

        return () => unsubscribe();

    }, [isOpen, user]);

    useEffect(() => {
        if (isOpen && scrollAreaRef.current) {
            setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
                if (viewport) {
                  viewport.scrollTop = viewport.scrollHeight;
                }
            }, 100)
        }
    }, [isOpen]);


    const handleSendMessage = async () => {
        if (!input.trim() || !user || isSending) return;
        setIsSending(true);
        
        const newMessage = {
            role: 'user',
            text: input,
            timestamp: serverTimestamp(),
            read: false, // Mark as unread for the admin
        };

        try {
            // Ensure the parent chat document exists
            const chatDocRef = doc(db, 'chats', user.uid);
            await setDoc(chatDocRef, { 
                userName: `${user.firstName} ${user.lastName}`, 
                userEmail: user.email, 
                lastActivity: serverTimestamp() 
            }, { merge: true });

            const messagesRef = collection(db, 'chats', user.uid, 'messages');
            await addDoc(messagesRef, newMessage);
            
            setInput('');
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally show a toast to the user
        } finally {
            setIsSending(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    }

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
                            {isLoading && <div className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></div>}
                            {!isLoading && messages.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground">
                                    <p>Send a message to start a conversation with our support team.</p>
                                </div>
                            )}
                            {messages.map(message => (
                                <div key={message.id} className={cn("flex items-end gap-2", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'admin' && <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 text-sm">R</div>}
                                    <div className={cn(
                                        "rounded-lg p-3 max-w-xs break-words text-sm shadow",
                                        message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none"
                                    )}>
                                        <p>{message.text}</p>
                                        <p className={cn("text-xs mt-1 text-right", message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                                            {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'p') : ''}
                                        </p>
                                    </div>
                                    {message.role === 'user' && user && <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold shrink-0 text-sm">{getInitials(user.firstName)}</div>}
                                </div>
                            ))}
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
                                disabled={isSending}
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={isSending || !input.trim()}>
                                {isSending ? <Loader2 className="animate-spin"/> : <Send />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
