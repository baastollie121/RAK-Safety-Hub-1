
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Article } from '@/lib/articles';
import { articleCategories } from '@/lib/articles';

const articleFilterCategories = ['All', ...articleCategories];

export default function SafetyNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    // Clear the notification status when the page is viewed
    localStorage.setItem('hasUnreadNews', 'false');
    window.dispatchEvent(new Event('storage')); // Notify sidebar to update dot

    try {
      const storedArticles = JSON.parse(
        localStorage.getItem('newsArticles') || '[]'
      );
      setArticles(storedArticles);
    } catch (error) {
      console.error('Failed to load articles from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredArticles = useMemo(() => {
    const allFiltered = activeFilter === 'All'
      ? articles
      : articles.filter((article) => article.category === activeFilter);
    return allFiltered.slice(0, 6); // Limit to 6 articles
  }, [articles, activeFilter]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Safety News
            </h1>
            <p className="text-muted-foreground mt-2">
              Latest news and updates from our team.
            </p>
          </CardContent>
        </Card>
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
        <Button
          variant="outline"
          onClick={() => setSelectedArticle(null)}
          className="mb-4"
        >
          <ArrowRight className="mr-2 size-4 rotate-180" /> Back to All Articles
        </Button>
        <Card>
          <CardHeader>
            {selectedArticle.imageUrl && (
              <div className="relative mb-4 aspect-video w-full">
                <Image
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="rounded-md object-cover"
                  data-ai-hint="news article"
                  unoptimized
                />
              </div>
            )}
            <CardTitle className="font-headline text-3xl">
              {selectedArticle.title}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mr-2">
                {selectedArticle.category}
              </Badge>
              Published on {format(new Date(selectedArticle.createdAt), 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Safety News
          </h1>
          <p className="text-muted-foreground mt-2">
            Latest news and updates from our team.
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {articleFilterCategories.map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? 'default' : 'outline'}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="flex flex-col">
              <CardHeader>
                {article.imageUrl && (
                  <div className="relative mb-4 aspect-video w-full">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="rounded-md object-cover"
                      data-ai-hint="news article"
                      unoptimized
                    />
                  </div>
                )}
                <CardTitle className="font-headline">{article.title}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mr-2">
                    {article.category}
                  </Badge>
                  Published on {format(new Date(article.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.content}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setSelectedArticle(article)}
                  className="w-full"
                >
                  Read More <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardHeader>
            <CardTitle className="font-headline">No News Found</CardTitle>
            <CardDescription>
              There are no articles matching the &quot;{activeFilter}&quot;
              category. Try another one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Newspaper className="mx-auto size-12 text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
