'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

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

const mockConversations: Conversation[] = [
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
// --- END MOCK DATA ---


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
        <div className="flex flex-col h-full">
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
                                "rounded-lg p-3 max-w-lg break-words text-sm",
                                message.role === 'admin' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
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
             <div className="p-4 border-t">
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
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(mockConversations[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelectConversation = (id: string) => {
        setSelectedConvoId(id);
        // Mark messages as read
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
        <div className="h-[calc(100vh-4rem)] p-4">
            <Card className="h-full w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden">
                <div className="col-span-1 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold font-headline">Conversations</h2>
                         <div className="relative mt-2">
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
                <div className="md:col-span-2 lg:col-span-3">
                    {selectedConversation ? (
                        <ChatView conversation={selectedConversation} onSendMessage={handleSendMessage} adminName={adminName} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                            <MessageSquare className="size-12 mb-4"/>
                            <p className="font-semibold">No Conversation Selected</p>
                            <p>Select a conversation from the list to view messages.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
