import * as React from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import TopLayoutBlog from '../../src/modules/components/TopLayoutBlog';
import type { BlogPostMeta } from '../../lib/sourcing';

interface MDXPost {
  source: MDXRemoteSerializeResult;
  frontMatter: BlogPostMeta & {
    manualCard?: boolean | string;
    cardTitle?: string;
    manualCardAsset?: string;
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
  description: string;
  rendered: string[];
  title?: string;
  headers: DocsHeader;
}

interface Docs {
  en: LocalizedDoc;
}

const planContentDirs = [
  path.join(process.cwd(), 'data', '.plan'),
  path.join(process.cwd(), 'pages', 'home'),
];

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
    rendered: [],
    headers: {
      title: frontMatter.title,
      manualCard:
        typeof frontMatter.manualCard === 'boolean'
          ? String(frontMatter.manualCard)
          : frontMatter.manualCard,
      cardTitle: frontMatter.cardTitle,
      authors,
      tags,
      date: frontMatter.date ?? '',
    }
  }
  return <TopLayoutBlog docs={{en: localizedDocs}} source={source} />
}

// This function gets called at build time to generate the paths
export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = new Set<string>();

  planContentDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      return;
    }

    fs.readdirSync(dir)
      .filter((filename) => filename.endsWith('.mdx'))
      .forEach((filename) => {
        slugs.add(filename.replace(/\.mdx$/, ''));
      });
  });

  const paths = Array.from(slugs).map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: false, // Show 404 for paths not returned by getStaticPaths
  };
};

// This function gets called at build time on server-side
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const mdxDir = planContentDirs.find((dir) =>
    fs.existsSync(path.join(dir, `${slug}.mdx`)),
  );

  if (!mdxDir) {
    return {
      notFound: true,
    };
  }

  const mdxPath = path.join(mdxDir, `${slug}.mdx`);

  // Read file content
  const raw = fs.readFileSync(mdxPath, 'utf8');
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
