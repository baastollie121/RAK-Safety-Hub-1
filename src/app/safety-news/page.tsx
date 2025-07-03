
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Article } from '@/lib/articles';

export default function SafetyNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    // Clear the notification status when the page is viewed
    localStorage.setItem('hasUnreadNews', 'false');
    window.dispatchEvent(new Event('storage')); // Notify sidebar to update dot

    try {
      const storedArticles = JSON.parse(localStorage.getItem('newsArticles') || '[]');
      setArticles(storedArticles);
    } catch (error) {
      console.error('Failed to load articles from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-headline tracking-tight">Safety News</h1>
                <p className="text-muted-foreground">Latest news and updates from our team.</p>
            </header>
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
      </div>
    );
  }

  if (selectedArticle) {
    return (
        <div className="p-4 sm:p-6 md:p-8">
             <Button variant="outline" onClick={() => setSelectedArticle(null)} className="mb-4">
                <ArrowRight className="mr-2 size-4 rotate-180" /> Back to All Articles
            </Button>
            <Card>
                <CardHeader>
                    {selectedArticle.imageUrl && (
                        <div className="relative aspect-video w-full mb-4">
                            <Image src={selectedArticle.imageUrl} alt={selectedArticle.title} fill className="object-cover rounded-md" data-ai-hint="news article" />
                        </div>
                    )}
                    <CardTitle className="font-headline text-3xl">{selectedArticle.title}</CardTitle>
                    <CardDescription>Published on {format(new Date(selectedArticle.createdAt), 'PPP')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {selectedArticle.content}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Safety News</h1>
        <p className="text-muted-foreground">Latest news and updates from our team.</p>
      </header>
      
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
                <Card key={article.id} className="flex flex-col">
                    <CardHeader>
                         {article.imageUrl && (
                            <div className="relative aspect-video w-full mb-4">
                                <Image src={article.imageUrl} alt={article.title} fill className="object-cover rounded-md" data-ai-hint="news article" />
                            </div>
                        )}
                        <CardTitle className="font-headline">{article.title}</CardTitle>
                        <CardDescription>
                            Published on {format(new Date(article.createdAt), 'PPP')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {article.content}
                        </p>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={() => setSelectedArticle(article)} className="w-full">
                            Read More <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : (
        <Card className="text-center py-12">
            <CardHeader>
                <CardTitle className="font-headline">No News Yet</CardTitle>
                <CardDescription>Check back later for the latest updates.</CardDescription>
            </CardHeader>
            <CardContent>
                <Newspaper className="mx-auto size-12 text-muted-foreground" />
            </CardContent>
       </Card>
      )}
    </div>
  );
}
