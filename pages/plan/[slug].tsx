import * as React from 'react';
import type { GetServerSideProps, GetStaticProps } from 'next';
import PlanFeed from '../../src/components/plan/PlanFeed';
import type { PlanFeedProps } from '../../src/components/plan/PlanFeed';
import { authorPattern } from '../../lib/plan';
import { planFeedProps } from '../../lib/plan-feed-props';
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

type LocalizedDoc = React.ComponentProps<typeof TopLayoutBlog>['docs']['en'];

const planContentDirs = [
  path.join(process.cwd(), 'data', '.plan'),
  path.join(process.cwd(), 'pages', 'home'),
];

export default function PlanRoute(props: MDXPost | PlanFeedProps) {
  if ('posts' in props) return <PlanFeed {...props} />;
  return <LegacyPlanPost {...props} />;
}

function LegacyPlanPost({ source, frontMatter, slug }: MDXPost) {
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
          : frontMatter.manualCard || 'false',
      cardTitle: frontMatter.cardTitle,
      authors,
      tags,
      date: frontMatter.date ?? '',
      image: frontMatter.image ?? undefined,
      imageAlt: frontMatter.imageAlt ?? undefined,
    }
  }
  return <TopLayoutBlog docs={{en: localizedDocs}} source={source} />
}

// This function gets called at build time on server-side
const getLegacyProps: GetStaticProps = async ({ params }) => {
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params?.slug as string;
  context.res.setHeader('Cache-Control', 'no-store');
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(slug)) return { notFound: true };
  // Historical article URLs take precedence over author handles.
  if (planContentDirs.some((dir) => fs.existsSync(path.join(dir, `${slug}.mdx`)))) {
    return getLegacyProps(context);
  }
  if (!authorPattern.test(slug)) return { notFound: true };
  const page = Number(context.query.page || 1);
  if (!Number.isInteger(page) || page < 1 || page > 1000) return { notFound: true };
  const props = await planFeedProps(slug, page);
  if (!props.authors.includes(slug)) {
    if (props.unavailable) context.res.statusCode = 503;
    else return { notFound: true };
  }
  return { props };
};
