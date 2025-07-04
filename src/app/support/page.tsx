
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, CreditCard, Banknote, MessageSquare, ArrowLeft, LifeBuoy } from 'lucide-react';

const FnbLogo = () => (
    <svg width="241" height="97" viewBox="0 0 241 97" xmlns="http://www.w3.org/2000/svg" className="w-40 h-auto">
        <rect width="241" height="97" fill="white" />
        <g>
            <circle cx="48.5" cy="48.5" r="48.5" fill="#FBB612"/>
            <path d="M-2.52783 75.8339C28.7995 56.916 63.8587 56.916 99.186 75.8339L105.862 68.217C67.7336 47.7479 25.0236 47.7479 -13.1047 68.217L-2.52783 75.8339Z" fill="#00A79D"/>
            <path d="M48.4,26.7l-4.2,29.3H44l-20.9-8.4l5.6-4.3h-7.1l-4.7-9.5h14.4l-5.1,9.4h3.7l17.4-26.5h0.2l17.4,26.5h3.7l-5.1-9.4h14.4l-4.7,9.5h-7.1l5.6,4.3L52.8,56h-0.2l-4.2-29.3Z M48.4,85v-27H48v27H48.4z" fill="#000"/>
        </g>
        <g transform="translate(115, 23)">
            <path d="M11.5,71.2H0.2V34.4H0.2V27.3h9.5V14.1c0-8.9,4.4-14.9,14.6-14.9c4.1,0,7.3,0.3,9,0.5v8.5c-1.4-0.2-2.9-0.3-4.5-0.3 c-4.8,0-6.1,2.1-6.1,6.5v6.9h10.9v7.1H22.7v36.8H11.5z" fill="#00A79D"/>
            <path d="M63.5,71.2H52.2V0h11.3V71.2z M87.1,71.2l-10.4-18V71.2H65.4V0h16.2L96.4,17.9L111.2,0h11.3v71.1H111.2V38.8L100.8,56.7h-4.6 L87.1,38.8V71.2z" fill="#00A79D"/>
        </g>
    </svg>
);


const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-6 text-green-500 fill-current mt-1">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.46 3.49 1.32 4.95L2.05 22l5.25-1.38c1.41.8 3.06 1.28 4.74 1.28h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.15c-1.48 0-2.92-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 01-1.26-4.38c0-4.54 3.69-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.23-8.24 8.23zm4.49-5.46c-.24-.12-1.42-.7-1.64-.78-.23-.08-.39-.12-.56.12-.17.25-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.71-.61-1.18-1.36-1.32-1.59-.14-.23 0-.36.11-.47.1-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.56-.42-.16 0-.35-.02-.52-.02-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.24 3.75 2.49 1.08 2.49.72 2.94.69.45-.03 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.08-.12-.24-.18-.52-.3z"/>
    </svg>
);


const PayGateLogo = () => (
    <div className="text-xl font-bold font-headline text-blue-600">
        PayGate
    </div>
);


export default function SupportPage() {
    const [view, setView] = useState<'main' | 'support' | 'billing'>('main');

    const renderMainView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => setView('support')}>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><LifeBuoy /> Contact Support</CardTitle>
                    <CardDescription>Reach out to us for any technical or general questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Get help via email, live chat, or WhatsApp.</p>
                </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => setView('billing')}>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><CreditCard /> Billing Information</CardTitle>
                    <CardDescription>Details for making payments for your subscription.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Find our banking details and online payment information.</p>
                </CardContent>
            </Card>
        </div>
    );

    const renderSupportView = () => (
         <Card>
            <CardHeader>
                <Button variant="ghost" onClick={() => setView('main')} className="mb-2 -ml-4 justify-start w-fit">
                    <ArrowLeft className="mr-2"/> Back
                </Button>
                <CardTitle className="font-headline">Contact Support</CardTitle>
                <CardDescription>Reach out to us for any technical or billing questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <Mail className="size-6 text-primary mt-1"/>
                    <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <p className="text-muted-foreground text-sm mb-2">For all inquiries, please email our support team. We aim to respond within 24 hours.</p>
                        <Button asChild variant="outline" size="sm">
                            <a href="mailto:support@sitesafety.services">support@sitesafety.services</a>
                        </Button>
                    </div>
                </div>
                 <Separator />
                 <div className="flex items-start gap-4">
                    <WhatsAppIcon />
                    <div>
                        <h3 className="font-semibold">WhatsApp Chat</h3>
                        <p className="text-muted-foreground text-sm mb-2">For urgent billing or technical support, you can reach us on WhatsApp.</p>
                         <Button asChild variant="outline" size="sm">
                            <a href="https://wa.me/27790225981" target="_blank" rel="noopener noreferrer">
                                Chat on WhatsApp (079 022 5981)
                            </a>
                        </Button>
                    </div>
                </div>
                 <Separator />
                <div className="flex items-start gap-4">
                    <MessageSquare className="size-6 text-primary mt-1"/>
                    <div>
                        <h3 className="font-semibold">Live Site Chat</h3>
                        <p className="text-muted-foreground text-sm mb-2">For quick questions, use the live chat widget located at the bottom-right of your screen. Our agents are standing by to assist you.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderBillingView = () => (
         <Card>
            <CardHeader>
                <Button variant="ghost" onClick={() => setView('main')} className="mb-2 -ml-4 justify-start w-fit">
                     <ArrowLeft className="mr-2"/> Back
                </Button>
                <CardTitle className="font-headline">Billing Information</CardTitle>
                <CardDescription>Details for making payments for your subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                    <h3 className="font-semibold flex items-center gap-2"><CreditCard className="size-5 text-primary"/> Online Payment</h3>
                    <p className="text-muted-foreground text-sm mb-3">We use PayGate for secure online credit card payments. Please use the link provided on your invoice.</p>
                    <div className="p-4 border rounded-lg bg-background flex items-center gap-4">
                        <PayGateLogo />
                        <span className="text-muted-foreground text-sm">Secure payments processed by PayGate.</span>
                    </div>
               </div>
                <Separator />
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><Banknote className="size-5 text-primary"/> Direct EFT Payment</h3>
                     <div className="flex items-center gap-4 mt-3">
                        <FnbLogo />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1">
                            <span className="text-muted-foreground">Bank:</span> <strong>First National Bank (FNB)</strong>
                            <span className="text-muted-foreground">Account Number:</span> <strong>6315 2958 890</strong>
                            <span className="text-muted-foreground">Branch Code:</span> <strong>250 655</strong>
                        </div>
                    </div>
                     <p className="text-muted-foreground text-sm mt-4">
                        Please email your proof of payment to{' '}
                        <a href="mailto:support@sitesafety.services" className="font-medium text-primary hover:underline">
                            support@sitesafety.services
                        </a> to ensure your account is updated promptly.
                     </p>
                </div>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch(view) {
            case 'support':
                return renderSupportView();
            case 'billing':
                return renderBillingView();
            case 'main':
            default:
                return renderMainView();
        }
    }


  return (
    <div className="p-4 sm:p-6 md:p-8">
        <Card className="mb-8">
            <CardContent className="p-6">
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                Support & Billing
                </h1>
                <p className="text-muted-foreground mt-2">
                Get help, manage your subscription, and view payment details.
                </p>
            </CardContent>
        </Card>
       {renderContent()}
    </div>
  );
}
