import * as React from 'react';

import {alpha, styled} from '@mui/material/styles';
import {useTheme} from '@mui/system';
import {useRouter} from 'next/router';
import {exactProp} from '@mui/utils';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Head from 'src/modules/components/Head';
import * as StokedDocs from '@stoked-ui/docs';
import AppHeader from 'src/layouts/AppHeader';
import AppContainer from 'src/modules/components/AppContainer';
import AppFooter from 'src/layouts/AppFooter';
import HeroEnd from 'src/components/home/HeroEnd';
import MarkdownElement from 'src/modules/components/MarkdownElement';
//import MdxElement  from 'src/modules/components/RichMarkdownElement';
import {pathnameToLanguage} from 'src/modules/utils/helpers';
import ROUTES from 'src/route';
import {Link} from '@stoked-ui/docs/Link';
import {Theme} from '@mui/material/styles';
import { MDXRemote } from 'next-mdx-remote';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

// Use RichMarkdownElement instead of MdxElement since it was commented out
// and RichMarkdownElement was referenced in the original code

const { BrandingCssVarsProvider } = StokedDocs;

interface Author {
  name: string;
  avatar: string;
  github: string;
}

export const authors: Record<string, Author> = {
  oliviertassinari: {
    name: 'Olivier Tassinari',
    avatar: 'https://avatars.githubusercontent.com/u/3165635',
    github: 'oliviertassinari',
  },
  brianstoker: {
    name: 'Brian Stoker',
    avatar: 'https://avatars.githubusercontent.com/u/91224556',
    github: 'brian-stoker',
  },
};

const classes = {
  back: 'TopLayoutBlog-back',
  time: 'TopLayoutBlog-time',
  container: 'TopLayoutBlog-container',
};

// Replicate the value used by https://medium.com/, a trusted reference.
const BLOG_MAX_WIDTH = 692;

const AuthorsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2),
  '& .author': {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(3),
    '& .MuiAvatar-root': {
      marginRight: theme.spacing(1),
    },
  },
}));

const Root = styled('div')(
  ({ theme }) => ({
    flexGrow: 1,
    background: `linear-gradient(180deg, ${
      theme.palette.grey[50]
    } 0%, #FFFFFF 100%)`,
    backgroundSize: '100% 500px',
    backgroundRepeat: 'no-repeat',
    [`& .${classes.back}`]: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(-1),
    },
    [`& .${classes.container}`]: {
      paddingTop: 60 + 20,
      marginBottom: theme.spacing(12),
      maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(2 * 2)})`,
      [theme.breakpoints.up('md')]: {
        maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(3 * 2)})`,
      },
      [theme.breakpoints.up('lg')]: {
        maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(8 * 2)})`,
      },
      '& h1': {
        marginBottom: theme.spacing(3),
      },
    },
    '& .markdown-body': {
      lineHeight: 1.7,
      '& img, & video': {
        border: '1px solid',
        borderColor: theme.palette.grey[200],
        borderRadius: 12,
        display: 'block',
        margin: 'auto',
        marginBottom: 16,
      },
      '& figure': {
        margin: 0,
        padding: 0,
        marginBottom: 16,
        '& img, & video': {
          marginBottom: 8,
        },
      },
      '& figcaption': {
        color: theme.palette.text.tertiary,
        fontSize: theme.typography.pxToRem(14),
        textAlign: 'center',
      },
      '& strong': {
        color: theme.palette.grey[900],
      },
      '& summary': {
        padding: 8,
        fontSize: theme.typography.pxToRem(14),
        fontWeight: theme.typography.fontWeightMedium,
        color: theme.palette.grey[900],
      },
      '& details': {
        paddingLeft: 16,
        paddingRight: 16,
        background: alpha(theme.palette.grey[50], 0.5),
        border: '1px solid',
        borderRadius: 10,
        borderColor: theme.palette.grey[200],
        transitionProperty: 'all',
        transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '200ms',
        '&:hover, &:focus-visible': {
          background: theme.palette.grey[50],
          borderColor: theme.palette.grey[300],
        },
      },
      '& th': {
        width: '100%',
        textAlign: 'left',
        borderBottom: `3px solid rgba(62, 80, 96, 0.2) !important`,
      },
      '& .plan-description': {
        fontSize: theme.typography.pxToRem(13),
        marginTop: 8,
        textAlign: 'center',
        color: theme.palette.grey[700],
        '& a': {
          color: 'inherit',
          textDecoration: 'underline',
        },
      },
      '& .MuiCode-root + .plan-description': {
        marginTop: -20 + 8,
      },
    },
    [`& .${classes.time}`]: {
      color: theme.palette.text.secondary,
      ...theme.typography.caption,
      fontWeight: 500,
    },
  }),
  ({ theme }) =>
    theme.applyDarkStyles({
      background: `linear-gradient(180deg, ${alpha(theme.palette.primary[900], 0.2)} 0%, ${
        theme.palette.primaryDark[900]
      } 100%)`,
      backgroundSize: '100% 1000px',
      backgroundRepeat: 'no-repeat',
      '& .markdown-body': {
        '& strong': {
          color: theme.palette.grey[100],
        },
        '& summary': {
          color: theme.palette.grey[300],
        },
        '& img, & video': {
          borderColor: alpha(theme.palette.primaryDark[600], 0.5),
        },
        '& details': {
          background: alpha(theme.palette.primary[900], 0.3),
          borderColor: theme.palette.primaryDark[700],
          '&:hover, &:focus-visible': {
            background: alpha(theme.palette.primary[900], 0.4),
            borderColor: theme.palette.primaryDark[500],
          },
        },
        '& .plan-description': {
          color: theme.palette.grey[500],
        },
      },
    }),
);

const mdxComponents = {
  h1: (props: any) => (
    <Typography component="h1" variant="h3" sx={{ mt: 6, mb: 2 }} {...props} />
  ),
  h2: (props: any) => (
    <Typography component="h2" variant="h4" sx={{ mt: 4, mb: 2 }} {...props} />
  ),
  h3: (props: any) => (
    <Typography component="h3" variant="h5" sx={{ mt: 3, mb: 1.5 }} {...props} />
  ),
  h4: (props: any) => (
    <Typography component="h4" variant="h6" sx={{ mt: 2, mb: 1 }} {...props} />
  ),
  h5: (props: any) => (
    <Typography component="h5" variant="subtitle1" sx={{ mt: 2, mb: 1 }} {...props} />
  ),
  h6: (props: any) => (
    <Typography component="h6" variant="subtitle2" sx={{ mt: 2, mb: 1 }} {...props} />
  ),
  p: (props: any) => (
    <Typography variant="body1" component="p" sx={{ my: 2 }} {...props} />
  ),
  a: (props: any) => (
    <Link {...props} color="primary" />
  ),
  ul: (props: any) => (
    <ul {...props} style={{ marginBottom: 16 }} />
  ),
  ol: (props: any) => (
    <ol {...props} style={{ marginBottom: 16 }} />
  ),
  li: (props: any) => <li {...props} style={{ marginBottom: 8 }} />,
  blockquote: (props: any) => (
    <Typography
      component="blockquote"
      variant="body1"
      sx={{
        borderLeft: '4px solid',
        borderColor: (theme) => theme.palette.grey[200],
        pl: 2,
        my: 2,
        color: 'text.secondary',
      }}
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      {...props}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        padding: '3px 5px',
        borderRadius: '3px',
        fontFamily: 'monospace',
      }}
    />
  ),
  pre: (props: any) => (
    <pre
      {...props}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        padding: '12px',
        borderRadius: '6px',
        overflow: 'auto',
      }}
    />
  ),
};

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
  rendered: string[];
  title?: string;
  headers: DocsHeader;
}

interface Docs {
  en: LocalizedDoc;
}

interface TopLayoutBlogProps {
  className?: string;
  demoComponents?: Record<string, React.ComponentType<any>>;
  demos?: Record<string, any>;
  docs: Docs;
  srcComponents?: Record<string, React.ComponentType<any>>;
  source?: MDXRemoteSerializeResult;
}

export default function TopLayoutBlog(props: TopLayoutBlogProps): React.ReactElement {
  const theme = useTheme<Theme>();
  const { className, docs, demos, demoComponents, srcComponents, source } = props;
  const { description, rendered, title, headers } = docs.en;
  const finalTitle = title || headers.title;
  const router = useRouter();
  const slug = router.pathname.replace(/(.*)\/(.*)/, '$2');
  const { canonicalAsServer } = pathnameToLanguage(router.asPath);
  const card =
    headers.manualCard === 'true'
      ? `/static/.plan/${slug}/card.png`
      : `/edge-functions/og-image/?title=${headers.cardTitle || finalTitle}&authors=${headers.authors
          .map((author) => {
            const { github, name } = authors[author];
            return `${name} @${github}`;
          })
          .join(',')}&product=plan`;

  if (process.env.NODE_ENV !== 'production') {
    if (headers.manualCard === undefined) {
      throw new Error(
        [
          `SUI: the "manualCard" markdown header for the plan post "${slug}" is missing.`,
          `Set manualCard: true or manualCard: false header in docs/pages/blog/${slug}.md.`,
        ].join('\n'),
      );
    }
  }

  return (
    <BrandingCssVarsProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppHeader />
        <Head
        title={`${finalTitle} - SUI`}
        description={description}
        largeCard
        disableAlternateLocale
        card={card}
        type="article"
      >
        <meta name="author" content={headers.authors.map((key) => authors[key].name).join(', ')} />
        <meta property="article:published_time" content={headers.date} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              publisher: {
                '@type': 'Organization',
                name: 'bstoked.plan',
                url: 'https://brianstoker.com/bstoked.plan/',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://brianstoker.com/static/icons/512x512.png',
                },
              },
              author: {
                '@type': 'Person',
                name: authors[headers.authors[0]].name,
                image: {
                  '@type': 'ImageObject',
                  url: `${authors[headers.authors[0]].avatar}?s=${250}`,
                  width: 250,
                  height: 250,
                },
                sameAs: [`https://github.com/${authors[headers.authors[0]].github}`],
              },
              headline: finalTitle,
              url: `https://brianstoker.com${canonicalAsServer}`,
              datePublished: headers.date,
              dateModified: headers.date,
              image: {
                '@type': 'ImageObject',
                url: card,
                width: 1280,
                height: 640,
              },
              keywords: headers.tags.join(', '),
              description,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': 'https://brianstoker.com/.plan/',
              },
            }),
          }}
        />
      </Head>
      <Root className={className} sx={{ flex: 1 }}>
        <AppContainer component="main" className={classes.container}>
          <Link
            href={ROUTES.plan}
            {...(ROUTES.plan.startsWith('http') && {
              rel: 'nofollow',
            })}
            color="primary"
            variant="body2"
            className={classes.back}
          >
            <ChevronLeftRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
            {/* eslint-disable-next-line material-ui/no-hardcoded-labels */}
            {'Back to .plan'}
          </Link>
          {headers.title ? (
            <React.Fragment>
              {/*
                Depending on the timezone, the display date can change from one day to another.
                e.g. Sunday vs. Monday
                TODO: Move the date formating to the server.
              */}
              <time dateTime={headers.date} className={classes.time}>
                {new Intl.DateTimeFormat('en', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(headers.date))}
              </time>
                <h1>{headers.title}</h1>
              <AuthorsContainer>
                {headers.authors.map((author) => (
                  <div key={author} className="author">
                    <Avatar
                      sx={{ width: 36, height: 36 }}
                      alt=""
                      src={`${authors[author].avatar}?s=${36}`}
                      srcSet={`${authors[author].avatar}?s=${36 * 2} 2x, ${
                        authors[author].avatar
                      }?s=${36 * 3} 3x`}
                    />
                    <div>
                      <Typography variant="body2" fontWeight="500">
                        {authors[author].name}
                      </Typography>
                      <Link
                        href={`https://github.com/${authors[author].github}`}
                        target="_blank"
                        rel="noopener"
                        color="primary"
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        @{authors[author].github}
                      </Link>
                    </div>
                  </div>
                ))}
              </AuthorsContainer>
            </React.Fragment>
          ) : null}
          {source ? (
            <div className="markdown-body">
              <MDXRemote {...source} components={mdxComponents} />
            </div>
          ) : (
            rendered?.map((chunk, index) => (
              <MarkdownElement
                key={index}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: typeof chunk === 'string' ? chunk : '' }}
              />
            ))
          )}
        </AppContainer>
        <Divider />
        <AppFooter />
      </Root>
      </div>
    </BrandingCssVarsProvider>
  );
}
