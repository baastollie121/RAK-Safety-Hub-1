
'use client';

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowRight,
  Bot,
  FileCheck2, 
  FileText, 
  Folder, 
  Newspaper, 
  ScanSearch, 
  ShieldCheck, 
  UserCog,
  Map,
  ClipboardCheck
} from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  {
    title: "Document Library",
    description: "Browse and download safety, quality, and HR documents.",
    icon: <Folder className="size-8 text-primary" />,
    href: "/documents",
  },
  {
    title: "AI Safety Consultant",
    description: "Get expert safety advice from our AI consultant, Winston.",
    icon: <Bot className="size-8 text-primary" />,
    href: "/safety-consultant",
  },
  {
    title: "Safety News",
    description: "Stay up-to-date with the latest in safety news.",
    icon: <Newspaper className="size-8 text-primary" />,
    href: "/safety-news",
  },
  {
    title: "AI Hazard Hunter",
    description: "Upload an image to identify potential safety risks instantly.",
    icon: <ScanSearch className="size-8 text-primary" />,
    href: "/hazard-hunter",
  },
  {
    title: "Risk Assessment Generator",
    description: "Generate OHS Act-compliant risk assessments with a guided tool.",
    icon: <ClipboardCheck className="size-8 text-primary" />,
    href: "/risk-assessment",
  },
  {
    title: "Method Statement Generator",
    description: "Dynamically assemble method statements based on your inputs.",
    icon: <FileText className="size-8 text-primary" />,
    href: "/method-statement",
  },
  {
    title: "Safe Work Procedure Generator",
    description: "Create custom safe work procedures for your tasks.",
    icon: <ShieldCheck className="size-8 text-primary" />,
    href: "/safe-work-procedure",
  },
   {
    title: "SHE Site Plan Generator",
    description: "Create comprehensive SHE site plans for your projects.",
    icon: <Map className="size-8 text-primary" />,
    href: "/she-site-plan-generator",
  },
  {
    title: "Admin",
    description: "Manage clients, documents, and system settings.",
    icon: <UserCog className="size-8 text-primary" />,
    href: "/admin/onboard-client",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const filteredFeatures = useMemo(() => {
    if (user?.role === 'admin') {
      return features;
    }
    return features.filter(feature => feature.title !== 'Admin');
  }, [user]);


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card className="mb-8 neon-gradient-card">
        <CardContent className="p-6 bg-card rounded-lg flex flex-col md:flex-row items-center gap-6">
            <div className="md:scale-150 md:mx-4">
              <Logo />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                  Welcome, {user?.firstName || 'User'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Your all-in-one platform for workplace management hub to ensure legal compliance 24/7
                </p>
            </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
            <Card className="h-full transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium font-headline">
                  {feature.title}
                </CardTitle>
                {feature.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span>Go to page</span>
                  <ArrowRight className="ml-1 size-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
