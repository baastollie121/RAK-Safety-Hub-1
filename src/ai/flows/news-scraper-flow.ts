'use server';

/**
 * @fileOverview An AI agent that scrapes and summarizes a web article.
 *
 * - scrapeArticle - A function that handles the scraping process.
 * - ScrapeArticleInput - The input type for the scrapeArticle function.
 * - ScrapeArticleOutput - The return type for the scrapeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScrapeArticleInputSchema = z.object({
  url: z.string().url().describe("The URL of the article to scrape."),
});
export type ScrapeArticleInput = z.infer<typeof ScrapeArticleInputSchema>;

const ScrapeArticleOutputSchema = z.object({
  title: z.string().describe("The extracted title of the article."),
  content: z.string().describe("The full extracted content of the article, formatted in Markdown."),
  imageUrl: z.string().url().optional().describe("The URL of the main image of the article, if found."),
});
export type ScrapeArticleOutput = z.infer<typeof ScrapeArticleOutputSchema>;

export async function scrapeArticle(input: ScrapeArticleInput): Promise<ScrapeArticleOutput> {
  return scrapeArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scrapeArticlePrompt',
  input: {schema: ScrapeArticleInputSchema},
  output: {schema: ScrapeArticleOutputSchema},
  prompt: `You are an expert web content extractor. Your task is to analyze the content of the provided webpage URL and extract key information.

Analyze the webpage at the given URL and perform the following actions:
1.  **Extract Title**: Identify and extract the main title of the article.
2.  **Extract Content**: Extract the full body of the article. Clean it up by removing ads, navigation menus, and other non-essential elements. Format the content using basic Markdown for readability (e.g., headings, bold text, lists).
3.  **Extract Image URL**: Find the URL of the most prominent, relevant image associated with the article (e.g., the hero image). If no suitable image is found, omit this field.

Return your findings ONLY in the specified JSON format.

Webpage: {{web url=url}}`,
});

const scrapeArticleFlow = ai.defineFlow(
  {
    name: 'scrapeArticleFlow',
    inputSchema: ScrapeArticleInputSchema,
    outputSchema: ScrapeArticleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
