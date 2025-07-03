
export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null; // Will store the image as a data URI
  createdAt: string;
  category: string;
}

export const articleCategories = [
    "Legislative & Legal Updates",
    "Industry Partner News",
    "Global Incidents & Case Studies",
    "Professional Body News",
] as const;

export type ArticleCategory = (typeof articleCategories)[number];
