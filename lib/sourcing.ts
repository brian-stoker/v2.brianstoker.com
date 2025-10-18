import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

// Only import fs on the server side
let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

const blogDirs = [
  path.join(process.cwd(), 'data/.plan'),
  path.join(process.cwd(), 'pages/home'),
];

type BlogFileEntry = {
  dir: string;
  file: string;
};

const getBlogFileEntries = (ext = '.mdx'): BlogFileEntry[] => {
  if (!fs) {
    return [];
  }

  return blogDirs.flatMap((dir) => {
    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs
      .readdirSync(dir)
      .filter((file: string) => file.endsWith(ext))
      .map((file: string) => ({ dir, file }));
  });
};

export interface BlogPostMeta {
   title: string;
  description: string;
  image?: string | null;
  tags: Array<string>;
  authors?: Array<string>;
  date?: string | null;
  sui?: boolean | null;
}
export interface BlogPost extends BlogPostMeta {
  slug: string;
  source?: MDXRemoteSerializeResult;
}

async function getBlogPost(entry: BlogFileEntry): Promise<BlogPost> {
  const { dir, file } = entry;
  const slug = file.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
  const { content, data: frontMatter } = matter(raw);
  // Use next-mdx-remote to serialize the content
  const source = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: frontMatter,
  });

  const meta = frontMatter as Partial<BlogPostMeta>;
  const tags = Array.isArray(meta.tags)
    ? meta.tags
    : meta.tags
    ? [meta.tags]
    : [];

  return {
    source,
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    image: meta.image || null,
    tags,
    authors: Array.isArray(meta.authors) ? meta.authors : meta.authors ? [meta.authors] : [],
    date: meta.date || null,
    sui: meta.sui || null,
  };
}

// Avoid typos in the .plan markdown pages.
// https://www.notion.so/mui-org/Blog-247ec2bff5fa46e799ef06a693c94917
const ALLOWED_TAGS = [
  'Company',
  'Developer Survey',
  'Guide',
  'Product',
  // Product tags
  'Stoked UI',
  'MUI X',
  'Material UI',
  'Base UI',
  'Pigment CSS',
  'Joy UI',
  'SUI X',
  'SUI System',
  'Toolpad',
];

const SUI_TAGS = [
  'Stoked UI',
  'SUI',
  'Common',
  'File Explorer',
  'Media Selector',
  'Editor',
  'Timeline',
  '.plan'
];

const ALL_TAGS = SUI_TAGS.concat(ALLOWED_TAGS);
export const getAllBlogPosts = async () => {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    throw new Error('getAllBlogPosts can only be called on the server side');
  }

  const fileEntries = getBlogFileEntries();
  const blogPostsMap = new Map<string, BlogPost>();

  await Promise.all(
    fileEntries.map(async (entry) => {
      const post = await getBlogPost(entry);
      blogPostsMap.set(post.slug, post);
    }),
  );

  const blogPosts = Array.from(blogPostsMap.values());
  const rawBlogPosts = blogPosts.sort((post1, post2) => {
      if (post1.date && post2.date) {
        return new Date(post1.date) > new Date(post2.date) ? -1 : 1;
      }
      if (post1.date && !post2.date) {
        return 1;
      }
      return -1;
    });

  const allBlogPosts = rawBlogPosts.filter((post) => !!post.title);
  const tagInfo: Record<string, number | undefined> = {};
  allBlogPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (!ALL_TAGS.includes(tag)) {
        throw new Error(
          `The tag "${tag}" in "${post.title}" was not whitelisted. Are you sure it's not a typo?`,
        );
      }
      tagInfo[tag] = (tagInfo[tag] || 0) + 1;
    });
  });

  const mostRecentPosts: BlogPost[] = allBlogPosts.slice(0, 5);

  return {
    mostRecentPosts,
    allBlogPosts, // posts with at least a title
    tagInfo,
  };
};
