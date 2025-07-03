import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, CreditCard, Banknote } from 'lucide-react';

const FnbLogo = () => (
    <svg viewBox="0 0 249 249" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
        <path d="M74.29 209.47c-25.57 0-41.29-16.14-41.29-41.86 0-23.57 14.57-41.14 41.29-41.14 11.29 0 21.29 3.14 28.57 9.14l-11.43 11.57c-4.43-3.86-11.14-6.14-17.14-6.14-14.86 0-24.43 11-24.43 26.57s9.57 26.57 24.43 26.57c6 0 12.71-2.29 17.14-6.14l11.43 11.57c-7.28 6-17.28 9.14-28.57 9.14z" fill="#0088cc"></path>
        <path d="M124.5 126.34c25.57 0 41.29 16.14 41.29 41.86 0 23.57-14.57 41.14-41.29 41.14-11.29 0-21.29-3.14-28.57-9.14l11.43-11.57c4.43 3.86 11.14 6.14 17.14 6.14 14.86 0 24.43-11 24.43-26.57s-9.57-26.57-24.43-26.57c-6 0-12.71-2.29-17.14-6.14l-11.43-11.57c7.29-6 17.29-9.14 28.57-9.14z" fill="#0088cc"></path>
        <path d="M124.5 43.2c-23.71 4.57-44.29 25.14-48.86 48.86-3.86 19.86 2.43 39.71 16.14 53.43-13.71-13.72-19.86-33.57-16.14-53.43C80.21 68.35 100.79 47.77 124.5 43.2z" fill="#0088cc"></path>
        <path d="M141.54 118.91c-14.43 2-28.14 8.71-38.14 19.29-2.57-11.86.71-24.14 8.71-33.29 9.14-9.86 22-15.57 35.86-15.57-4.14 9.14-6.43 19.29-6.43 30.14a30.15 30.15 0 000 .57c0-.19 0-.38 0-.57z" fill="#78be20"></path>
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
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Support & Billing
        </h1>
        <p className="text-muted-foreground">
          Get help, manage your subscription, and view payment details.
        </p>
      </header>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
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
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
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
       </div>
    </div>
  );
}
