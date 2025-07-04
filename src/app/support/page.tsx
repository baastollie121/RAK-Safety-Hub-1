
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, CreditCard, Banknote, MessageSquare, ArrowLeft, LifeBuoy } from 'lucide-react';

const FnbLogo = () => (
    <svg width="241" height="97" viewBox="0 0 241 97" xmlns="http://www.w3.org/2000/svg" className="w-40 h-auto">
        <rect width="241" height="97" fill="white" />
        <g transform="translate(0, 1)">
            <circle cx="48" cy="48" r="48" fill="#FBB612"/>
            <path d="M-4.28 75.48C30.52 54.48 68.12 54.28 99.88 75.08L100.28 96C65.48 96 29.88 96 -4.28 96Z" fill="#00A79D"/>
            <path d="M48.5,78.5 V56.5 L37.5,50.5 L32.5,35.5 L20.5,31.5 L27.5,19.5 L41.5,23.5 L45.5,37.5 L48.5,41.5 L51.5,37.5 L55.5,23.5 L69.5,19.5 L76.5,31.5 L65.5,35.5 L59.5,50.5 L48.5,56.5 Z M32.5,35.5 L42.5,39.5 M65.5,35.5 L55.5,39.5 M45.5,37.5 L36.5,46.5 M51.5,37.5 L60.5,46.5" fill="#231F20" />
        </g>
        <g transform="translate(115, 23)" fill="#00A79D">
            <path d="M11.5,71.2 H0.2 V0 h21.8 v9.5 H11.5z M11.5,40.7 H22.7 V31.2 H11.5z"/>
            <path d="M35.2,71.2 H23.9 V0 h11.3 l14.8,21.1 v-21.1 H61.4 V71.2 h-11.3 L35.3,50.1 v21.1 z"/>
            <path d="M87.2,71.2 H75.9 V0 h19.3 c10,0 15,5 15,15 c0,10 -5,15 -15,15 h-8.1 v9.5 h8.1 c11,0 16,6 16,16 c0,10 -5,16 -16,16 z M87.2,25.5 h6.3 c4,0 6,-2 6,-6 s-2,-6 -6,-6 h-6.3 z M87.2,61.7 h7.3 c4,0 6,-2.5 6,-6.5 s-2,-6.5 -6,-6.5 h-7.3 z"/>
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
