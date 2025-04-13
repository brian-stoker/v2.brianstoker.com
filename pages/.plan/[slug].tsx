import * as React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MDXLayout from '../../src/components/MDXLayout';
import Head from 'next/head';
import TopLayoutBlog from '../../src/modules/components/TopLayoutBlog';
interface MDXPost {
  source: MDXRemoteSerializeResult;
  frontMatter: {
    title: string;
    description: string;
    date: string;
    authors: string[];
    tags: string[];
    [key: string]: any;
  };
  slug: string;
}

interface DocsHeader {
  title: string;
  manualCard: string;
  cardTitle?: string;
  authors: string[];
  tags: string[];
  date: string;
}

interface LocalizedDoc {
  description: string;
  rendered: MDXRemoteSerializeResult;
  title?: string;
  headers: DocsHeader;
}

interface Docs {
  en: LocalizedDoc;
}

export default function PlanPost({ source, frontMatter, slug }: MDXPost) {
  const localizedDocs: LocalizedDoc = {
    title: frontMatter.title,
    description: frontMatter.description,
    rendered: source,
    headers: {
      title: frontMatter.title,
      manualCard: frontMatter.manualCard,
      cardTitle: frontMatter.cardTitle,
      authors: frontMatter.authors,
      tags: frontMatter.tags,
      date: frontMatter.date,
    }
  }
  return <TopLayoutBlog docs={{en: localizedDocs}} source={source}/>
}

// This function gets called at build time to generate the paths
export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'pages', '.plan'));
  
  // Filter to only get .mdx files
  const paths = files
    .filter(filename => filename.endsWith('.mdx'))
    .map(filename => ({
      params: {
        slug: filename.replace('.mdx', ''),
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
  const mdxPath = path.join(process.cwd(), 'data', '.plan', `${slug}.mdx`);
  
  // Read file content
  const raw = fs.readFileSync(mdxPath, 'utf8');
  // Use gray-matter to parse the post metadata section
  const { content, data: frontMatter } = matter(raw);
  // Use next-mdx-remote to serialize the content
  const source = await serialize(content, {
    // mdxOptions can include custom remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: frontMatter,
  });
  
  // Use frontmatter directly since we're now using standard frontmatter format
  return {
    props: {
      source,
      frontMatter,
      slug,
    },
  };
}; 