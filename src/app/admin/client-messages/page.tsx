'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Send, MessageSquare, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';


// --- MOCK DATA ---
interface Message {
    id: string;
    role: 'user' | 'admin';
    text: string;
    timestamp: string;
}

interface Conversation {
    id: string; // Corresponds to user's UID
    userName: string;
    userEmail: string;
    avatar: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
    messages: Message[];
}

interface Client {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

const mockConversationsData: Conversation[] = [
    {
        id: 'client-user',
        userName: 'Ruanakoen',
        userEmail: 'ruanakoen@gmail.com',
        avatar: 'https://placehold.co/64x64.png',
        lastMessage: 'Yes, I have a question about the HIRA generator.',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        unreadCount: 1,
        messages: [
            { id: '1', role: 'admin', text: "Hi there! Welcome to RAK Safety Hub support. How can we help you today?", timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
            { id: '2', role: 'user', text: "Yes, I have a question about the HIRA generator.", timestamp: new Date(Date.now() - 60000 * 3).toISOString() },
        ]
    },
    {
        id: 'client-2',
        userName: 'Test Client',
        userEmail: 'test@example.com',
        avatar: 'https://placehold.co/64x64.png',
        lastMessage: 'Okay, thank you.',
        lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        unreadCount: 0,
        messages: [
            { id: '4', role: 'user', text: 'I need help with my billing.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
            { id: '5', role: 'admin', text: 'I can help with that. What is your invoice number?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5).toISOString() },
            { id: '6', role: 'user', text: 'Okay, thank you.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        ]
    }
];

// A list of all clients an admin can message, even if no conversation exists yet.
const mockAllClients: Client[] = [
    { id: 'client-user', name: 'Ruanakoen', email: 'ruanakoen@gmail.com', avatar: 'https://placehold.co/64x64.png' },
    { id: 'client-2', name: 'Test Client', email: 'test@example.com', avatar: 'https://placehold.co/64x64.png' },
    { id: 'client-3', name: 'New Client Inc.', email: 'new@client.com', avatar: 'https://placehold.co/64x64.png' },
    { id: 'client-4', name: 'Innovate Corp', email: 'contact@innovate.com', avatar: 'https://placehold.co/64x64.png' },
];

const newMessageSchema = z.object({
  clientId: z.string().min(1, 'Please select a client.'),
  message: z.string().min(1, 'Message cannot be empty.'),
});
type NewMessageFormValues = z.infer<typeof newMessageSchema>;

// --- END MOCK DATA & SCHEMA ---

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
                                <p className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(convo.lastMessageTimestamp), { addSuffix: true })}</p>
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


const ChatView = ({ conversation, onSendMessage, adminName }: { conversation: Conversation, onSendMessage: (text: string) => void, adminName: string }) => {
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }, [conversation.messages]);
    
    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

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
                                    {format(new Date(message.timestamp), 'p')}
                                </p>
                            </div>
                             {message.role === 'admin' && <Avatar className="size-8"><AvatarFallback>{adminName.charAt(0)}</AvatarFallback></Avatar>}
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
                    />
                    <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                        <Send />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ClientMessagesPage() {
    // In a real app, this would come from Firestore.
    const { user } = useAuth();
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>(mockConversationsData);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(mockConversationsData[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    
    const form = useForm<NewMessageFormValues>({
        resolver: zodResolver(newMessageSchema),
        defaultValues: { clientId: '', message: '' },
    });

    const handleSelectConversation = (id: string) => {
        setSelectedConvoId(id);
        setConversations(convos => convos.map(c => c.id === id ? {...c, unreadCount: 0} : c));
    };

    const handleSendMessage = (text: string) => {
        if (!selectedConvoId) return;
        
        const newMessage: Message = {
            id: new Date().toISOString(),
            role: 'admin',
            text: text,
            timestamp: new Date().toISOString()
        };

        setConversations(convos => convos.map(c => {
            if (c.id === selectedConvoId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: `You: ${text}`,
                    lastMessageTimestamp: newMessage.timestamp,
                }
            }
            return c;
        }).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
    };

    const handleStartConversation = (data: NewMessageFormValues) => {
        const { clientId, message } = data;
        const now = new Date().toISOString();
        
        const newMessage: Message = { id: now, role: 'admin', text: message, timestamp: now };
        
        const existingConvo = conversations.find(c => c.id === clientId);

        if (existingConvo) {
            // Add message to existing conversation
            setConversations(convos => convos.map(c => 
                c.id === clientId 
                ? { ...c, messages: [...c.messages, newMessage], lastMessage: `You: ${message}`, lastMessageTimestamp: now }
                : c
            ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
        } else {
            // Create a new conversation
            const client = mockAllClients.find(c => c.id === clientId);
            if (!client) {
                toast({ variant: 'destructive', title: 'Error', description: 'Client not found.' });
                return;
            }
            const newConversation: Conversation = {
                id: client.id,
                userName: client.name,
                userEmail: client.email,
                avatar: client.avatar,
                lastMessage: `You: ${message}`,
                lastMessageTimestamp: now,
                unreadCount: 0,
                messages: [newMessage],
            };
            setConversations(convos => [newConversation, ...convos]
                .sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime())
            );
        }

        setSelectedConvoId(clientId);
        setIsNewMessageOpen(false);
        form.reset();
        toast({ title: 'Success', description: 'Message sent.' });
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => 
            c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }, [conversations, searchTerm]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConvoId);
    }, [conversations, selectedConvoId]);
    
    const adminName = user?.email || "Admin";

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
                                                            {mockAllClients.map(client => (
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
                                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                            <Button type="submit">Send Message</Button>
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
                    <ConversationList conversations={filteredConversations} onSelect={handleSelectConversation} selectedId={selectedConvoId} />
                </div>
                <div className="md:col-span-1">
                    {selectedConversation ? (
                        <ChatView conversation={selectedConversation} onSendMessage={handleSendMessage} adminName={adminName} />
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
