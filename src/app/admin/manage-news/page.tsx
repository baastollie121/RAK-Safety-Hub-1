
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Article } from '@/lib/articles';

const articleCategories = [
    "Legislative & Legal Updates",
    "Industry Partner News",
    "Global Incidents & Case Studies",
    "Professional Body News",
];

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
  category: z.string().min(1, 'Category is required.'),
  image: z.any().optional(),
  imageUrl: z.string().url().optional(), // For scraped image URL
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};

export default function ManageNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedArticles = JSON.parse(localStorage.getItem('newsArticles') || '[]');
      setArticles(storedArticles);
      
      const scrapedDataString = localStorage.getItem('scrapedArticle');
      if (scrapedDataString) {
        const scrapedData = JSON.parse(scrapedDataString);
        localStorage.removeItem('scrapedArticle');
        openDialog(null, scrapedData);
      }

    } catch (error) {
      console.error('Failed to load articles from localStorage', error);
      toast({ variant: 'destructive', title: 'Load Failed', description: 'Could not load news articles.' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      image: null,
      imageUrl: '',
    }
  });

  const openDialog = (article: Article | null = null, scrapedData: any = null) => {
    setEditingArticle(article);
    if (article) {
        form.reset({ title: article.title, content: article.content, category: article.category, image: null, imageUrl: article.imageUrl || '' });
    } else if (scrapedData) {
        form.reset({ title: scrapedData.title || '', content: scrapedData.content || '', category: '', image: null, imageUrl: scrapedData.imageUrl || '' });
    } else {
        form.reset({ title: '', content: '', category: '', image: null, imageUrl: '' });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (articleId: string) => {
    const updatedArticles = articles.filter(a => a.id !== articleId);
    setArticles(updatedArticles);
    localStorage.setItem('newsArticles', JSON.stringify(updatedArticles));
    toast({ title: 'Success', description: 'Article deleted.' });
  };

  const onSubmit = async (data: ArticleFormValues) => {
    let finalImageUrl: string | null = editingArticle?.imageUrl || data.imageUrl || null;
    
    if (data.image && data.image[0]) {
        try {
            finalImageUrl = await fileToDataUri(data.image[0]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Image Error', description: 'Could not process the image file.'});
            return;
        }
    }

    let updatedArticles: Article[];
    if (editingArticle) {
        updatedArticles = articles.map(a => a.id === editingArticle.id ? { ...a, title: data.title, content: data.content, category: data.category, imageUrl: finalImageUrl } : a);
        toast({ title: 'Success', description: 'Article updated.' });
    } else {
        const newArticle: Article = {
            id: new Date().toISOString(),
            title: data.title,
            content: data.content,
            category: data.category,
            imageUrl: finalImageUrl,
            createdAt: new Date().toISOString(),
        };
        updatedArticles = [newArticle, ...articles];
        toast({ title: 'Success', description: 'Article published.' });
        localStorage.setItem('hasUnreadNews', 'true');
        window.dispatchEvent(new Event('storage')); // Notify sidebar
    }
    
    setArticles(updatedArticles);
    localStorage.setItem('newsArticles', JSON.stringify(updatedArticles));
    setIsDialogOpen(false);
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Articles</h1>
            <p className="text-muted-foreground">Create, edit, and delete news articles for clients.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2" /> Create New Article
        </Button>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>Published Articles</CardTitle>
        </CardHeader>
        <CardContent>
            {articles.length > 0 ? (
                <ul className="space-y-4">
                    {articles.map(article => (
                        <li key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h3 className="font-semibold">{article.title}</h3>
                                <p className="text-sm text-muted-foreground">Category: {article.category} | Published: {format(new Date(article.createdAt), 'PPP')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openDialog(article)}>
                                    <Edit className="mr-2 size-4" /> Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="mr-2 size-4" /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the article &quot;{article.title}&quot;. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(article.id)}>
                                                Yes, delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Newspaper className="mx-auto size-12" />
                    <p className="mt-4 font-semibold">No articles published yet.</p>
                    <p>Click "Create New Article" to get started.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editingArticle ? 'Edit' : 'Create'} Article</DialogTitle>
                <DialogDescription>
                    Fill in the details below. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Article Title</FormLabel>
                                <FormControl><Input placeholder="e.g., New Safety Regulations Announced" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl><Textarea placeholder="Write your article content here..." {...field} rows={10} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {articleCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload Image (Optional)</FormLabel>
                                <FormDescription>This will override the scraped image if one exists.</FormDescription>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        onChange={(e) => field.onChange(e.target.files)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {(editingArticle?.imageUrl || form.getValues('imageUrl')) && (
                        <div>
                            <p className="text-sm text-muted-foreground">Current Image:</p>
                             <Image 
                                src={editingArticle?.imageUrl || form.getValues('imageUrl')!} 
                                alt="Current article image" 
                                width={100} 
                                height={100} 
                                className="rounded-md border object-cover"
                                unoptimized
                                data-ai-hint="news article"
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Save Article</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
