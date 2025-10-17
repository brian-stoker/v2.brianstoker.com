import * as React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import TopLayoutBlog from '../../src/modules/components/TopLayoutBlog';
const PLAN_CONTENT_DIR = path.join(process.cwd(), 'data', '.plan');
const SUPPORTED_EXTENSIONS = ['.mdx', '.md'];

interface MDXPost {
  source: MDXRemoteSerializeResult;
  frontMatter: {
    title?: string;
    description?: string;
    date?: string;
    authors?: string[];
    tags?: string[];
    [key: string]: any;
  };
  slug: string;
}

interface DocsHeader {
  title: string;
  manualCard?: string;
  cardTitle?: string;
  authors?: string[];
  tags?: string[];
  date?: string;
}

interface LocalizedDoc {
  description?: string;
  rendered?: React.ReactNode;
  mdxSource?: MDXRemoteSerializeResult;
  title?: string;
  headers: DocsHeader;
}

interface Docs {
  en: LocalizedDoc;
}

export default function PlanPost({ source, frontMatter, slug }: MDXPost) {
  const authors = Array.isArray(frontMatter.authors)
    ? frontMatter.authors
    : frontMatter.authors
    ? [frontMatter.authors]
    : [];
  const tags = Array.isArray(frontMatter.tags)
    ? frontMatter.tags
    : frontMatter.tags
    ? [frontMatter.tags]
    : [];

  const localizedDocs: LocalizedDoc = {
    title: frontMatter.title ?? slug,
    description: frontMatter.description,
    mdxSource: source,
    headers: {
      title: frontMatter.title ?? slug,
      manualCard: frontMatter.manualCard ?? '',
      cardTitle: frontMatter.cardTitle,
      authors,
      tags,
      date: frontMatter.date ?? '',
    }
  }
  return <TopLayoutBlog docs={{en: localizedDocs}} />
}

// This function gets called at build time to generate the paths
export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(PLAN_CONTENT_DIR);

  const paths = files
    .filter((filename) =>
      SUPPORTED_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext)),
    )
    .map((filename) => ({
      params: {
        slug: filename.replace(/\.(mdx?|md)$/, ''),
      },
    }));
  
  return {
    paths,
    fallback: false, // Show 404 for paths not returned by getStaticPaths
  };
};

// This function gets called at build time on server-side
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const matched = SUPPORTED_EXTENSIONS
    .map((ext) => ({
      ext,
      filePath: path.join(PLAN_CONTENT_DIR, `${slug}${ext}`),
    }))
    .find(({ filePath }) => fs.existsSync(filePath));

  if (!matched) {
    return { notFound: true };
  }

  // Read file content
  const raw = fs.readFileSync(matched.filePath, 'utf8');
  // Use gray-matter to parse the post metadata section
  const { content, data: frontMatter } = matter(raw);
  const normalizedFrontMatter = {
    ...frontMatter,
    authors: Array.isArray(frontMatter.authors)
      ? frontMatter.authors
      : frontMatter.authors
      ? [frontMatter.authors]
      : [],
    tags: Array.isArray(frontMatter.tags)
      ? frontMatter.tags
      : frontMatter.tags
      ? [frontMatter.tags]
      : [],
  };
  // Use next-mdx-remote to serialize the content
  const source = await serialize(content, {
    // mdxOptions can include custom remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: normalizedFrontMatter,
  });
  
  // Use frontmatter directly since we're now using standard frontmatter format
  return {
    props: {
      source,
      frontMatter: normalizedFrontMatter,
      slug,
    },
  };
}; 
