// Shared wire format. Author handles are editorial attribution, not accounts.
export interface PlanPost {
  id: string;
  title: string;
  text?: string;
  description: string;
  authors: string[];
  date: string;
  image: string | null;
  imageAlt: string;
  tags: string[];
  url: string;
}

export const authorPattern = /^[a-z][a-z0-9-]{0,39}$/;
export const normalizeAuthor = (author: string) => author === 'brianstoker' ? 'bstoked' : author;
