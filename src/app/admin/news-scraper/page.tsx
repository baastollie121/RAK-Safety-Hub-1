'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, Loader2, Edit } from 'lucide-react';
import { scrapeArticle, type ScrapeArticleOutput } from '@/ai/flows/news-scraper-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NewsScraperPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapeArticleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url) {
      toast({ variant: 'destructive', title: 'URL Required', description: 'Please enter a URL to scrape.' });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const result = await scrapeArticle({ url });
      setScrapedData(result);
    } catch (err) {
      console.error('Scraping Error:', err);
      setError('An error occurred during scraping. The AI may be unable to process this URL. Please try another one.');
      toast({
        variant: 'destructive',
        title: 'Scraping Failed',
        description: 'Could not get a response from the AI.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditAndPublish = () => {
    if (!scrapedData) return;
    try {
        localStorage.setItem('scrapedArticle', JSON.stringify(scrapedData));
        router.push('/admin/manage-news');
    } catch (e) {
        console.error('Failed to save to localStorage', e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not pass data to editor. The content might be too large.' });
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI News Scraper</h1>
        <p className="text-muted-foreground">
          Paste a URL to an article, and the AI will extract its content to help you create a new post.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>1. Enter Article URL</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="article-url">URL</Label>
                <Input
                    id="article-url"
                    placeholder="https://example.com/news/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                />
            </div>
          </CardContent>
           <CardFooter>
            <Button onClick={handleScrape} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 size-4" />
                  Scrape Article
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Results Card */}
        <Card>
            <CardHeader>
                <CardTitle>2. Review Scraped Content</CardTitle>
                <CardDescription>The extracted content will appear here. Review it before publishing.</CardDescription>
            </CardHeader>
             <CardContent>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 py-12">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="font-semibold">AI is reading the article...</p>
                  </div>
                )}
                 {error && (
                    <Alert variant="destructive">
                        <FileSearch className="h-4 w-4" />
                        <AlertTitle>Scraping Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !scrapedData && !error && (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Results will appear here after scraping.</p>
                  </div>
                )}
                {scrapedData && (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                        {scrapedData.imageUrl && (
                             <Image
                                src={scrapedData.imageUrl}
                                alt="Scraped article image"
                                width={200}
                                height={120}
                                className="rounded-md border object-cover w-full aspect-video"
                                unoptimized // Since we don't know the hostname
                                data-ai-hint="news article"
                             />
                        )}
                        <h3 className="text-xl font-bold font-headline">{scrapedData.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-4">{scrapedData.content}</p>
                    </div>
                )}
             </CardContent>
            {scrapedData && (
                 <CardFooter>
                    <Button onClick={handleEditAndPublish} className="w-full">
                        <Edit className="mr-2 size-4" /> Edit & Publish
                    </Button>
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
