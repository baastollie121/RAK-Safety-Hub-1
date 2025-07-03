
export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null; // Will store the image as a data URI
  createdAt: string;
  category: string;
}
