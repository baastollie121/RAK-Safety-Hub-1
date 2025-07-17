
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, doc, setDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// --- DATA TYPES ---
interface Message {
    id: string;
    role: 'user' | 'admin';
    text: string;
    timestamp: any; // Firestore timestamp object or ISO string
}

interface Conversation {
    id: string; // Corresponds to user's UID
    userName: string;
    userEmail: string;
    avatar: string;
    lastMessage: string;
    lastMessageTimestamp: any; // Firestore timestamp object or ISO string
    unreadCount: number;
    messages: Message[];
}

interface Client {
    id: string; // UID
    name: string;
    email: string;
    avatar: string;
}

const newMessageSchema = z.object({
  clientId: z.string().min(1, 'Please select a client.'),
  message: z.string().min(1, 'Message cannot be empty.'),
});
type NewMessageFormValues = z.infer<typeof newMessageSchema>;

// --- COMPONENTS ---
const ConversationList = ({ conversations, onSelect, selectedId }: { conversations: Conversation[], onSelect: (id: string) => void, selectedId: string | null }) => {
    return (
        <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
                {conversations.map(convo => (
                    <button
                        key={convo.id}
                        onClick={() => onSelect(convo.id)}
                        className={cn(
                            "flex w-full items-center gap-3 p-2 rounded-lg text-left transition-colors",
                            selectedId === convo.id ? "bg-accent" : "hover:bg-muted/50"
                        )}
                    >
                        <Avatar>
                            <AvatarImage src={convo.avatar} alt={convo.userName} data-ai-hint="person" />
                            <AvatarFallback>{convo.userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold truncate">{convo.userName}</p>
                                <p className="text-xs text-muted-foreground shrink-0">
                                    {convo.lastMessageTimestamp ? formatDistanceToNow(new Date(convo.lastMessageTimestamp.toDate ? convo.lastMessageTimestamp.toDate() : convo.lastMessageTimestamp), { addSuffix: true }) : 'N/A'}
                                </p>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                {convo.unreadCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{convo.unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
                 {conversations.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <p>No conversations found.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
};

const ChatView = ({ conversation, onSendMessage, adminName, isLoading }: { conversation: Conversation, onSendMessage: (text: string) => void, adminName: string, isLoading: boolean }) => {
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }, [conversation.messages]);
    
    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b flex items-center gap-4">
                 <Avatar>
                    <AvatarImage src={conversation.avatar} alt={conversation.userName} data-ai-hint="person" />
                    <AvatarFallback>{conversation.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{conversation.userName}</h3>
                    <p className="text-sm text-muted-foreground">{conversation.userEmail}</p>
                </div>
            </div>
            <ScrollArea className="flex-grow bg-muted/20" ref={scrollAreaRef}>
                 <div className="p-4 space-y-4">
                    {conversation.messages.map(message => (
                        <div key={message.id} className={cn("flex items-end gap-2", message.role === 'admin' ? 'justify-end' : 'justify-start')}>
                            {message.role === 'user' && <Avatar className="size-8"><AvatarImage src={conversation.avatar} data-ai-hint="person" /><AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                                "rounded-lg p-3 max-w-lg break-words text-sm shadow",
                                message.role === 'admin' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none"
                            )}>
                                <p>{message.text}</p>
                                <p className={cn("text-xs mt-1 text-right", message.role === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                                    {message.timestamp ? format(new Date(message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp), 'p') : ''}
                                </p>
                            </div>
                             {message.role === 'admin' && <Avatar className="size-8"><AvatarFallback>{getInitials(adminName)}</AvatarFallback></Avatar>}
                        </div>
                    ))}
                </div>
            </ScrollArea>
             <div className="p-4 border-t bg-background">
                <div className="flex w-full items-center space-x-2">
                     <Input
                        placeholder="Type your reply..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="flex-grow"
                        disabled={isLoading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ClientMessagesPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const form = useForm<NewMessageFormValues>({
        resolver: zodResolver(newMessageSchema),
        defaultValues: { clientId: '', message: '' },
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'client'));
                const querySnapshot = await getDocs(q);
                const clients = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: `${doc.data().firstName} ${doc.data().lastName}`,
                    email: doc.data().email,
                    avatar: `https://placehold.co/64x64.png?text=${doc.data().firstName.charAt(0)}${doc.data().lastName.charAt(0)}`
                }));
                setAllClients(clients);
            } catch (error) {
                console.error("Error fetching clients:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load client list.' });
            }
        };

        fetchClients();
    }, [toast]);

    useEffect(() => {
        if (allClients.length === 0) {
            setIsLoading(false);
            return;
        }

        const unsubscribes = allClients.map(client => {
            const convoRef = doc(db, 'chats', client.id);
            const messagesRef = collection(db, 'chats', client.id, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

            return onSnapshot(q, (querySnapshot) => {
                let lastMessageData: Message | null = null;
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    lastMessageData = { id: doc.id, ...doc.data() } as Message;
                }

                setConversations(prev => {
                    const existingConvo = prev.find(c => c.id === client.id);
                    if (lastMessageData) {
                        const newConvoData = {
                            id: client.id,
                            userName: client.name,
                            userEmail: client.email,
                            avatar: client.avatar,
                            lastMessage: lastMessageData.text,
                            lastMessageTimestamp: lastMessageData.timestamp,
                            unreadCount: existingConvo?.unreadCount || 0, // Placeholder
                            messages: existingConvo?.messages || [],
                        };
                        if (existingConvo) {
                            return prev.map(c => c.id === client.id ? { ...c, ...newConvoData } : c);
                        } else {
                            return [...prev, newConvoData];
                        }
                    }
                    return prev;
                });
                setIsLoading(false);
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [allClients]);

    useEffect(() => {
        if (!selectedConvoId) return;

        const messagesRef = collection(db, 'chats', selectedConvoId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setConversations(prev => prev.map(c => c.id === selectedConvoId ? { ...c, messages: fetchedMessages } : c));
        });

        return () => unsubscribe();
    }, [selectedConvoId]);

    const handleSendMessage = async (text: string) => {
        if (!selectedConvoId || !user) return;
        setIsSending(true);

        const newMessage = {
            role: 'admin',
            text,
            timestamp: serverTimestamp(),
            read: true,
            adminId: user.uid,
        };

        try {
            const messagesRef = collection(db, 'chats', selectedConvoId, 'messages');
            await addDoc(messagesRef, newMessage);
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
        } finally {
            setIsSending(false);
        }
    };
    
    const handleStartConversation = async (data: NewMessageFormValues) => {
        const { clientId, message } = data;
        if (!user) return;
        setIsSending(true);

        const chatDocRef = doc(db, 'chats', clientId);
        const messagesColRef = collection(db, 'chats', clientId, 'messages');
        const now = serverTimestamp();

        try {
            // Ensure chat document exists (doesn't hurt if it does)
            await setDoc(chatDocRef, { startedBy: user.uid, startedAt: now }, { merge: true });

            await addDoc(messagesColRef, {
                role: 'admin',
                text: message,
                timestamp: now,
                read: true,
                adminId: user.uid
            });

            // Manually add to local state to make it appear instantly
            const client = allClients.find(c => c.id === clientId);
            if (client) {
                const newConvo = {
                    id: client.id,
                    userName: client.name,
                    userEmail: client.email,
                    avatar: client.avatar,
                    lastMessage: message,
                    lastMessageTimestamp: new Date(), // Use current time as a placeholder
                    unreadCount: 0,
                    messages: [],
                }
                 setConversations(prev => {
                    const exists = prev.some(c => c.id === clientId);
                    if (exists) {
                       return prev.map(c => c.id === clientId ? {...c, ...newConvo} : c);
                    }
                    return [...prev, newConvo];
                });
            }

            
            setSelectedConvoId(clientId);
            setIsNewMessageOpen(false);
            form.reset();
            toast({ title: 'Success', description: 'Message sent.' });

        } catch (error) {
             console.error("Error starting conversation:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start new conversation.' });
        } finally {
            setIsSending(false);
        }
    };

    const sortedConversations = useMemo(() => {
        return conversations
            .filter(c => 
                c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const timeA = a.lastMessageTimestamp?.toDate ? a.lastMessageTimestamp.toDate().getTime() : 0;
                const timeB = b.lastMessageTimestamp?.toDate ? b.lastMessageTimestamp.toDate().getTime() : 0;
                return timeB - timeA;
            });
    }, [conversations, searchTerm]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConvoId);
    }, [conversations, selectedConvoId]);
    
    const adminName = user ? `${user.firstName} ${user.lastName}` : "Admin";

    return (
        <div className="h-full flex flex-col p-4">
            <Card className="h-full w-full grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] overflow-hidden flex-grow">
                <div className="col-span-1 border-r flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="font-headline">Conversations</CardTitle>
                        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Plus />
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>New Message</DialogTitle>
                                    <DialogDescription>Select a client and compose your message.</DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleStartConversation)} className="space-y-4 py-4">
                                        <FormField
                                            control={form.control}
                                            name="clientId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Client</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a client to message..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {allClients.map(client => (
                                                                <SelectItem key={client.id} value={client.id}>{client.name} ({client.email})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Message</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Type your message here..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="outline" disabled={isSending}>Cancel</Button></DialogClose>
                                            <Button type="submit" disabled={isSending}>
                                                {isSending && <Loader2 className="animate-spin mr-2" />}
                                                Send Message
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <div className="px-4 pb-2 border-b">
                         <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <ConversationList conversations={sortedConversations} onSelect={setSelectedConvoId} selectedId={selectedConvoId} />
                    )}
                </div>
                <div className="md:col-span-1">
                    {selectedConversation ? (
                        <ChatView conversation={selectedConversation} onSendMessage={handleSendMessage} adminName={adminName} isLoading={isSending} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20">
                            <MessageSquare className="size-12 mb-4"/>
                            <p className="font-semibold">No Conversation Selected</p>
                            <p className="text-sm">Select a conversation from the list or start a new one.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
