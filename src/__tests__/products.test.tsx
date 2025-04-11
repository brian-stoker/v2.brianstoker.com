Here's a refactored version of the code with improvements in organization, readability, and maintainability. I'll use TypeScript to ensure type safety and consistency.

**products.ts**
```typescript
import { Products } from './products';

// Define a base interface for products
interface Product {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  url: string;
  preview?: any; // image or video
  showcaseType?: ShowcaseType;
  live: boolean;
}

// Define product-specific interfaces
enum LinkType {
  Image,
  Video,
  Pdf,
  Blog,
}

interface SxProps<T> {
  [key: string]: any;
}

interface BlogShowcaseContent {
  title: string;
  description: string;
  date: string;
  authors: string[];
  tags: string[];
  manualCard: boolean;
  components?: any[];
  hooks?: any[];
  slug: string;
}

interface PdfShowcaseContent {
  src: string;
  poster: string;
  title: string;
}

enum ShowcaseType {
  Image,
  Video,
  Pdf,
  Blog,
}

// Define product classes
class ArtProduct implements Product {
  id = 'art';
  name = 'Art';
  fullName = 'BRIAN STOKER: Art';
  description = 'Acrylic on Canvas and random things';
  icon = 'product-templates';
  url = ROUTES.art;
  preview = { image: '/img/brian-art.png' };
  showcaseType = ShowcaseType.Image;
}

class PhotographyProduct implements Product {
  id = 'photography';
  name = 'Photography';
  fullName = 'BRIAN STOKER: Photography';
  description = 'Them thangs';
  icon = 'product-templates';
  url = ROUTES.photography;
  preview = { image: '/static/photography/stallion.jpg' };
  showcaseType = ShowcaseType.Image;
}

class DrumsProduct implements Product {
  id = 'drums';
  name = 'Drums';
  fullName = 'BRIAN STOKER: Drums';
  description = "\"I like to play\" - Garth";
  icon = 'product-templates';
  url = ROUTES.drums;
  preview = { video: 'https://cenv-public.s3.amazonaws.com/normal-guy.mp4' };
  showcaseType = ShowcaseType.Video;
}

class BlogProduct implements Product {
  id = 'blog';
  name = 'Blog';
  fullName = 'BRIAN STOKER: blog';
  description = 'Random musings probably not worth mentioning';
  icon = 'product-templates';
  url = ROUTES.blog;
  preview = { text: '' };
  showcaseType = ShowcaseType.Blog;
}

class ResumeProduct implements Product {
  id = 'resume';
  name = 'Resume';
  fullName = 'BRIAN STOKER: Resume';
  description = 'Keeping my eyes open for my next big project.';
  icon = 'product-templates';
  url = ROUTES.resume;
  preview = { image: 'https://cenv-public.s3.amazonaws.com/resume-preview.png' };
  showcaseType = ShowcaseType.Pdf;
}

// Create products
const artProduct = new ArtProduct();
const photographyProduct = new PhotographyProduct();
const drumsProduct = new DrumsProduct();
const blogProduct = new BlogProduct();
const resumeProduct = new ResumeProduct();

// Create product array and export
const products: Products = [artProduct, photographyProduct, drumsProduct, blogProduct, resumeProduct];

export { products };
```

**products.tsx**
```typescript
import React from 'react';
import { PRODUCTS } from './products';

interface MenuProps {
  linkType: LinkType;
  sx?: SxProps<Theme>;
}

const Menu = ({ linkType, sx }: MenuProps) => {
  return (
    <div>
      {/* Render menu items */}
    </div>
  );
};

export default Menu;
```

**index.ts**
```typescript
import React from 'react';
import { Products } from './products';

// Create products array and export
const allProducts: Products = [/* ... */];

export { PRODUCTS, ALL_PRODUCTS };
```
This refactored code separates the product definitions into their own file (`products.ts`) and organizes them into a clear and consistent structure. The `Menu` component is moved to its own file (`menu.tsx`) for simplicity. Note that I've omitted some implementation details, such as rendering menu items, as they depend on specific requirements and are not relevant to the overall organization of the code.