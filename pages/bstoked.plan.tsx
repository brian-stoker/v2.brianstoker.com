import * as React from "react";
import {InferGetStaticPropsType} from "next";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {useRouter} from "next/router";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DiscordIcon from 'src/icons/DiscordIcon';
import {AvatarGroup, Pagination, SxProps} from "@mui/material";
import {BrandingCssVarsProvider} from "@stoked-ui/docs";
import {authors as AUTHORS} from 'src/modules/components/TopLayoutBlog';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import GradientText from "../src/components/typography/GradientText";
import Section from "../src/layouts/Section";
import Slack from "../src/icons/Slack";
import {BlogPost, getAllBlogPosts} from "../lib/sourcing";
import generateRssFeed from "../scripts/generateRSSFeed";
import SectionHeadline from "../src/components/typography/SectionHeadline";
import HeroEnd from "../src/components/home/HeroEnd";
  
export const getStaticProps = () => {
  const data = getAllBlogPosts();
  generateRssFeed(data.allBlogPosts);
  return {
    props: data,
  };
};

export function PostPreview({post, size = 'default' }: {post: BlogPost, size?: 'default' | 'mini'}) {
  console.log('post', post)
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }} id={'chip-container'}>
        {post.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            color="primary"
            sx={(theme) => ({
              height: 22,
              fontWeight: 'medium',
              fontSize: theme.typography.pxToRem(13),
              '& .MuiChip-label': {
                px: '6px',
              },
              ...theme.applyDarkStyles({
                color: theme.palette.grey[200],
              }),
            })}
          />
        ))}
      </Box>
      <Typography component="h2" fontWeight="bold" variant="subtitle1" gutterBottom>
        <Link
          aria-describedby={`describe-${post.slug}`}
          href={`/.plan/${post.slug}/`}
          color="text.primary"
          sx={{
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {post.title}
        </Link>
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 'auto' }}>
        {post.description}
      </Typography>
      {post.authors && (
        <AvatarGroup
          sx={[
            (theme) => ({
              mt: 2,
              mb: 1,
              alignSelf: 'flex-start',
              '& .MuiAvatar-circular': {
                width: 28,
                height: 28,
                border: `1px solid ${theme.palette.divider}`,
                outline: '3px solid',
                outlineColor: '#FFF',
                backgroundColor: theme.palette.grey[100],
              },
            }),
            (theme) =>
              theme.applyDarkStyles({
                '& .MuiAvatar-circular': {
                  outlineColor: theme.palette.primaryDark[900],
                  backgroundColor: theme.palette.primaryDark[700],
                },
              }),
          ]}
        >
          {(post.authors as Array<keyof typeof AUTHORS>).map((author) => (
            <Avatar
              key={author as string}
              alt=""
              src={`${AUTHORS[author].avatar}?s=${28}`}
              srcSet={`${AUTHORS[author].avatar}?s=${28 * 2} 2x, ${AUTHORS[author].avatar}?s=${
                28 * 3
              } 3x`}
            />
          ))}
        </AvatarGroup>
      )}
      <Box
        sx={{
          display: { sm: 'block', md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <Box id={'by-line-container'} sx={{ position: 'relative' }}>
          {post.authors && (
            <Typography variant="body2" id={'by-line'} fontWeight="medium">
              {post.authors
                .slice(0, 3)
                .map((userId) => {
                  const name = AUTHORS[userId as keyof typeof AUTHORS]?.name;
                  if (name) {
                    if (post.authors && post.authors.length > 1) {
                      // display only firstName
                      return name.split(' ')[0];
                    }
                    return name;
                  }
                  return userId;
                })
                .join(', ')}
              {post.authors.length > 2 && ', and more.'}
            </Typography>
          )}
          {post.date && (
            <Typography variant="caption" fontWeight="regular" color="text.tertiary">
              { size === 'mini' ? new Date(post.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' } ) : new Date(post.date).toDateString()}
            </Typography>
          )}
        </Box>
        <Button
          component={Link}
          aria-describedby={`describe-${post.slug}`}
          href={`/.plan/${post.slug}`}
          id={`describe-${post.slug}`}
          className='read-more-button'
          endIcon={<KeyboardArrowRightRoundedIcon />}
          size="small"
        >
          { size === 'mini' ? 'More' : 'Read more'}
        </Button>
      </Box>
    </React.Fragment>
  );
}

export function PostPreviewBox({post, size = 'default' }: {post: BlogPost, size?: 'default' | 'mini'}) {
  let sx: SxProps = {
    '& .MuiAvatar-circular': {
      width: '28px',
      height: '28px',
      border: '1px solid #FFF',
      outline: '3px solid',
      backgroundColor: '#FFF',
      '&:hover': {
        outline: '3px solid theme.palette.primary.main'
      }
    },
    '& .read-more-button': {
      mt: { xs: 0.5, md: 0 },
      p: { xs: 0, sm: '6px 8px' }
    }
  }
  if (size === 'mini') {
    sx = {
      width: '150px',
      height: '150px',
      overflow: 'hidden',
      padding: '8px',
      position: 'relative',
      '& .MuiTypography-subtitle1': {
        fontSize: '12px'
      },
      '& .MuiTypography-body1': {
        fontSize: '10px'
      },
      '& #chip-container': {
        display: 'none'
      },
      
      '& .MuiAvatarGroup-root': {
        display: 'none'
      },
      '& #by-line': {
        display: 'none'
      },
      '& .read-more-button': {
        mt: '3px',
        p: 0
      }
    }
  }
  return <Paper
    key={post.slug}
    component="li"
    variant="outlined"
    sx={[(theme) => ({
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: theme.palette.gradients.radioSubtle,
      boxShadow: '0 4px 12px rgba(170, 180, 190, 0.2)',
      ...theme.applyDarkStyles({
        background: theme.palette.primaryDark[900],
        backgroundImage: theme.palette.gradients.radioSubtle,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }),
    }), ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {post.image && (
      <Box
        component="img"
        src={post.image}
        sx={{
          aspectRatio: '16 / 9',
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '4px',
        }}
      />
    )}
    <PostPreview post={post} size={size} />
  </Paper>
}

const PAGE_SIZE = 7;


export default function Blog(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const postListRef = React.useRef<HTMLDivElement | null>(null);
  const [page, setPage] = React.useState(0);
  const [selectedTags, setSelectedTags] = React.useState<Record<string, boolean>>({});
  const { allBlogPosts, tagInfo: rawTagInfo } = props;
  const [firstPost, secondPost, ...otherPosts] = allBlogPosts;
  const tagInfo = { ...rawTagInfo };
  [firstPost, secondPost].forEach((post) => {
    post.tags.forEach((tag) => {
      if (tagInfo[tag]) {
        tagInfo[tag]! -= 1;
      }
    });
  });
  Object.entries(tagInfo).forEach(([tagName, tagCount]) => {
    if (tagCount === 0) {
      delete tagInfo[tagName];
    }
  });
  const filteredPosts = otherPosts.filter((post) => {
    if (Object.keys(selectedTags).length === 0) {
      return true;
    }

    return post.tags.some((tag) => {
      return Object.keys(selectedTags).includes(tag);
    });
  });
  const pageStart = page * PAGE_SIZE;
  const totalPage = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const displayedPosts = filteredPosts.slice(pageStart, pageStart + PAGE_SIZE);
  const getTags = React.useCallback(() => {
    const { tags = '' } = router.query;
    return (typeof tags === 'string' ? tags.split(',') : tags || [])
      .map((str) => str.trim())
      .filter((tag) => !!tag);
  }, [router.query]);

  React.useEffect(() => {
    const arrayTags = getTags();
    const finalTags: Record<string, boolean> = {};
    arrayTags.forEach((tag) => {
      finalTags[tag] = true;
    });
    setSelectedTags(finalTags);
    setPage(0);
  }, [getTags]);

  const removeTag = (tag: string) => {
    router.push(
      {
        query: {
          ...router.query,
          tags: getTags().filter((value) => value !== tag),
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <BrandingCssVarsProvider>
      <Head
        title="bstoked.plan"
        description="notes, musings, and ignorable anecdotes"
        card="/static/social-previews/blog-preview.jpg"
        disableAlternateLocale
      />
      <AppHeader />
      <main id="main-content">
        <Section cozy bg="gradient" sx={{ py: { xs: 4, sm: 6, md: 16 } }}>
          <SectionHeadline
            alwaysCenter
            overline=".plan"
            title={
              <Typography variant="h2" component="h1">
                 notes, musings, and <GradientText>useless anecdotes</GradientText>
              </Typography>
            }
          />
        </Section>
        <Divider />
        <Container sx={{ mt: { xs: 2, sm: -6 } }}>
          <Box
            component="ul"
            sx={{
              display: 'grid',
              m: 0,
              p: 0,
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            {[firstPost, secondPost].map((post, index) => (
              <PostPreviewBox post={post} key={index}/>
            ))}
          </Box>
        </Container>
        <Container
          ref={postListRef}
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            mt: -6,
            display: 'grid',
            gridTemplateColumns: { md: '1fr 380px' },
            columnGap: 8,
          }}
        >
          <Typography
            component="h2"
            variant="h6"
            fontWeight="semiBold"
            sx={{ mb: { xs: 1, sm: 2 }, mt: 8 }} // margin-top makes the title appear when scroll into view
          >
            Posts{' '}
            {Object.keys(selectedTags).length ? (
              <span>
                tagged as{' '}
                <Typography component="span" variant="inherit" color="primary" noWrap>
                  &quot;{Object.keys(selectedTags)[0]}&quot;
                </Typography>
              </span>
            ) : (
              ''
            )}
          </Typography>
          <Box sx={{ gridRow: 'span 2' }}>
            <Box
              sx={{
                position: 'sticky',
                top: 90,
                mt: { xs: 0, md: 9 },
                mb: { xs: 2, md: 0 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                '& .MuiPaper-root': {
                  p: 2,
                  bgcolor: 'transparent',
                  borderColor: 'divider',
                },
              }}
            >
              <Paper variant="outlined">
                <Typography
                  color="text.primary"
                  fontWeight="semiBold"
                  variant="subtitle2"
                  sx={{ mb: 2 }}
                >
                  Filter posts by tag
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.keys(tagInfo).map((tag) => {
                    const selected = !!selectedTags[tag];
                    return (
                      <Chip
                        key={tag}
                        variant={selected ? 'filled' : 'outlined'}
                        color={selected ? 'primary' : undefined}
                        {...(selected
                          ? {
                            label: tag,
                            onDelete: () => {
                              postListRef.current?.scrollIntoView();
                              removeTag(tag);
                            },
                          }
                          : {
                            label: tag,
                            onClick: () => {
                              postListRef.current?.scrollIntoView();
                              router.push(
                                {
                                  query: {
                                    ...router.query,
                                    tags: tag,
                                  },
                                },
                                undefined,
                                { shallow: true },
                              );
                            },
                          })}
                        size="small"
                        sx={{
                          py: 1.2,
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>
              <Paper variant="outlined">
                <Typography
                  color="text.primary"
                  fontWeight="semiBold"
                  variant="subtitle2"
                  gutterBottom
                >
                  Want to hear more from us?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Get up to date with everything SUI-related through our social media:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, '* > svg': { mr: 1 } }}>
                  <Link href="https://github.com/brian-stoker" target="_blank" fontSize={14}>
                    <GitHubIcon fontSize="small" />
                    GitHub
                  </Link>
                  <Link href="https://stokedconsulting.slack.com/" target="_blank" fontSize={14}>
                    <Slack fontSize="small" variant={"monochrome"} />
                    Slack
                  </Link>
                  <Link href="https://discord.gg/YHpSwttm" target="_blank" fontSize={14}>
                    <DiscordIcon fontSize="small" />
                    Discord
                  </Link>
                  <Link href="https://www.linkedin.com/in/brian-stoker/" target="_blank" fontSize={14}>
                    <LinkedInIcon fontSize="small" />
                    LinkedIn
                  </Link>
                </Box>
              </Paper>
            </Box>
          </Box>
          <div>
            <Box component="ul" sx={{ p: 0, m: 0 }}>
              {displayedPosts.map((post) => (
                <Box
                  component="li"
                  key={post.slug}
                  sx={() => ({
                    py: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:not(:last-of-type)': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  })}
                >
                  <PostPreview post={post} />
                </Box>
              ))}
            </Box>
            <Pagination
              page={page + 1}
              count={totalPage}
              variant="outlined"
              shape="rounded"
              onChange={(_, value) => {
                setPage(value - 1);
                postListRef.current?.scrollIntoView();
              }}
              sx={{ mt: 1, mb: 8 }}
            />
          </div>
        </Container>
      </main>
      <Divider />
      <HeroEnd />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}

/*
import * as React from 'react';
import { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import Chip from '@mui/material/Chip';
import Slack from 'src/icons/Slack';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DiscordIcon from 'src/icons/DiscordIcon';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import GradientText from 'src/components/typography/GradientText';
import BrandingCssVarsProvider from 'src/BrandingCssVarsProvider';
import { authors as AUTHORS } from 'src/modules/components/TopLayoutBlog';
import HeroEnd from 'src/components/home/HeroEnd';
import { Link } from '@stoked-ui/docs/Link';
// import generateRssFeed from 'scripts/generateRSSFeed';
import Section from 'src/layouts/Section';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import { BlogPost } from 'lib/sourcing';

export const getStaticProps = () => {
  // const data = getAllBlogPosts();
  // generateRssFeed(data.allBlogPosts);
  return {
    props: { allBlogPosts: [], tagInfo: {}},
  };
};

export function PostPreview(props: BlogPost) {
  console.log('post preview', JSON.stringify(props, null, 2))
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
        {props.tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            variant="outlined"
            color="primary"
            sx={(theme) => ({
              height: 22,
              fontWeight: 'medium',
              fontSize: theme.typography.pxToRem(13),
              '& .MuiChip-label': {
                px: '6px',
              },
              ...theme.applyDarkStyles({
                color: theme.palette.grey[200],
              }),
            })}
          />
        ))}
      </Box>
      <Typography component="h2" fontWeight="bold" variant="subtitle1" gutterBottom>
        <Link
          aria-describedby={`describe-${props.slug}`}
          href={`/.plan/${props.slug}/`}
          color="text.primary"
          sx={{
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {props.title}
        </Link>
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 'auto' }}>
        {props.description}
      </Typography>
      {props.authors && (
        <AvatarGroup
          sx={[
            (theme) => ({
              mt: 2,
              mb: 1,
              alignSelf: 'flex-start',
              '& .MuiAvatar-circular': {
                width: 28,
                height: 28,
                border: `1px solid ${theme.palette.divider}`,
                outline: '3px solid',
                outlineColor: '#FFF',
                backgroundColor: theme.palette.grey[100],
              },
            }),
            (theme) =>
              theme.applyDarkStyles({
                '& .MuiAvatar-circular': {
                  outlineColor: theme.palette.primaryDark[900],
                  backgroundColor: theme.palette.primaryDark[700],
                },
              }),
          ]}
        >
          {(props.authors as Array<keyof typeof AUTHORS>).map((author) => (
            <Avatar
              key={author}
              alt=""
              src={`${AUTHORS[author].avatar}?s=${28}`}
              srcSet={`${AUTHORS[author].avatar}?s=${28 * 2} 2x, ${AUTHORS[author].avatar}?s=${
                28 * 3
              } 3x`}
            />
          ))}
        </AvatarGroup>
      )}
      <Box
        sx={{
          display: { sm: 'block', md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {props.authors && (
            <Typography variant="body2" fontWeight="medium">
              {props.authors
                .slice(0, 3)
                .map((userId) => {
                  const name = AUTHORS[userId as keyof typeof AUTHORS]?.name;
                  if (name) {
                    if (props.authors && props.authors.length > 1) {
                      // display only firstName
                      return name.split(' ')[0];
                    }
                    return name;
                  }
                  return userId;
                })
                .join(', ')}
              {props.authors.length > 2 && ', and more.'}
            </Typography>
          )}
          {props.date && (
            <Typography variant="caption" fontWeight="regular" color="text.tertiary">
              {new Date(props.date).toDateString()}
            </Typography>
          )}
        </Box>
        <Button
          component={Link}
          aria-describedby={`describe-${props.slug}`}
          href={props.sui ? `/.plan/${props.slug}` : `https://brianstoker.com/blog/${props.slug}`}
          id={`describe-${props.slug}`}
          endIcon={<KeyboardArrowRightRoundedIcon />}
          size="small"
          sx={{ mt: { xs: 0.5, md: 0 }, p: { xs: 0, sm: '6px 8px' } }}
        >
          Read more
        </Button>
      </Box>
    </React.Fragment>
  );
}

export function PostPreviewBox(post: BlogPost) {
  return <Paper
    key={post.slug}
    component="li"
    variant="outlined"
    sx={(theme) => ({
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: theme.palette.gradients.radioSubtle,
      boxShadow: '0 4px 12px rgba(170, 180, 190, 0.2)',
      ...theme.applyDarkStyles({
        background: theme.palette.primaryDark[900],
        backgroundImage: theme.palette.gradients.radioSubtle,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }),
    })}
  >
    {post.image && (
      <Box
        component="img"
        src={post.image}
        sx={{
          aspectRatio: '16 / 9',
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '4px',
        }}
      />
    )}
    <PostPreview {...post} />
  </Paper>
}

const PAGE_SIZE = 7;

export default function Blog(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const postListRef = React.useRef<HTMLDivElement | null>(null);
  const [page, setPage] = React.useState(0);
  const [selectedTags, setSelectedTags] = React.useState<Record<string, boolean>>({});
  const { allBlogPosts, tagInfo: rawTagInfo } = props;
  const [firstPost, secondPost, ...otherPosts] = allBlogPosts;
  const tagInfo = { ...rawTagInfo };
  [firstPost, secondPost].forEach((post) => {
    post.tags.forEach((tag) => {
      if (tagInfo[tag]) {
        tagInfo[tag]! -= 1;
      }
    });
  });
  Object.entries(tagInfo).forEach(([tagName, tagCount]) => {
    if (tagCount === 0) {
      delete tagInfo[tagName];
    }
  });
  const filteredPosts = otherPosts.filter((post) => {
    if (Object.keys(selectedTags).length === 0) {
      return true;
    }

    return post.tags.some((tag) => {
      return Object.keys(selectedTags).includes(tag);
    });
  });
  const pageStart = page * PAGE_SIZE;
  const totalPage = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const displayedPosts = filteredPosts.slice(pageStart, pageStart + PAGE_SIZE);
  const getTags = React.useCallback(() => {
    const { tags = '' } = router.query;
    return (typeof tags === 'string' ? tags.split(',') : tags || [])
      .map((str) => str.trim())
      .filter((tag) => !!tag);
  }, [router.query]);

  React.useEffect(() => {
    const arrayTags = getTags();
    const finalTags: Record<string, boolean> = {};
    arrayTags.forEach((tag) => {
      finalTags[tag] = true;
    });
    setSelectedTags(finalTags);
    setPage(0);
  }, [getTags]);

  const removeTag = (tag: string) => {
    router.push(
      {
        query: {
          ...router.query,
          tags: getTags().filter((value) => value !== tag),
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <BrandingCssVarsProvider>
      <Head
        title="Blog - SUI"
        description="Follow the SUI .plan to learn about new product features, latest advancements in UI development, and business initiatives."
        card="/static/social-previews/.plan-preview.jpg"
        disableAlternateLocale
      />
      <AppHeader />
      <main id="main-content">
        <Section cozy bg="gradient">
          <SectionHeadline
            alwaysCenter
            overline="Blog"
            title={
              <Typography variant="h2" component="h1">
                Stay <GradientText>in the loop</GradientText> with
                <br /> the latest about SUI&apos;s and MUI&apos;s products
              </Typography>
            }
          />
        </Section>
        <Divider />
        <Container sx={{ mt: { xs: 2, sm: -6 } }}>
          <Box
            component="ul"
            sx={{
              display: 'grid',
              m: 0,
              p: 0,
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            {[firstPost, secondPost].map((post, index) => (
              <PostPreviewBox post={post} key={index}/>
            ))}
          </Box>
        </Container>
        <Container
          ref={postListRef}
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            mt: -6,
            display: 'grid',
            gridTemplateColumns: { md: '1fr 380px' },
            columnGap: 8,
          }}
        >
          <Typography
            component="h2"
            variant="h6"
            fontWeight="semiBold"
            sx={{ mb: { xs: 1, sm: 2 }, mt: 8 }} // margin-top makes the title appear when scroll into view
          >
            Posts{' '}
            {Object.keys(selectedTags).length ? (
              <span>
                tagged as{' '}
                <Typography component="span" variant="inherit" color="primary" noWrap>
                  &quot;{Object.keys(selectedTags)[0]}&quot;
                </Typography>
              </span>
            ) : (
              ''
            )}
          </Typography>
          <Box sx={{ gridRow: 'span 2' }}>
            <Box
              sx={{
                position: 'sticky',
                top: 90,
                mt: { xs: 0, md: 9 },
                mb: { xs: 2, md: 0 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                '& .MuiPaper-root': {
                  p: 2,
                  bgcolor: 'transparent',
                  borderColor: 'divider',
                },
              }}
            >
              <Paper variant="outlined">
                <Typography
                  color="text.primary"
                  fontWeight="semiBold"
                  variant="subtitle2"
                  sx={{ mb: 2 }}
                >
                  Filter posts by tag
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.keys(tagInfo).map((tag) => {
                    const selected = !!selectedTags[tag];
                    return (
                      <Chip
                        key={tag}
                        variant={selected ? 'filled' : 'outlined'}
                        color={selected ? 'primary' : undefined}
                        {...(selected
                          ? {
                              label: tag,
                              onDelete: () => {
                                postListRef.current?.scrollIntoView();
                                removeTag(tag);
                              },
                            }
                          : {
                              label: tag,
                              onClick: () => {
                                postListRef.current?.scrollIntoView();
                                router.push(
                                  {
                                    query: {
                                      ...router.query,
                                      tags: tag,
                                    },
                                  },
                                  undefined,
                                  { shallow: true },
                                );
                              },
                            })}
                        size="small"
                        sx={{
                          py: 1.2,
                        }}
                      />
                    );
                  })}
                </Box>
              </Paper>
              <Paper variant="outlined">
                <Typography
                  color="text.primary"
                  fontWeight="semiBold"
                  variant="subtitle2"
                  gutterBottom
                >
                  Want to hear more from us?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Get up to date with everything SUI-related through our social media:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, '* > svg': { mr: 1 } }}>
                  <Link href="https://github.com/brian-stoker" target="_blank" fontSize={14}>
                    <GitHubIcon fontSize="small" />
                    GitHub
                  </Link>
                  <Link href="https://stokedconsulting.slack.com/" target="_blank" fontSize={14}>
                    <Slack fontSize="small" variant={"monochrome"} />
                    Slack
                  </Link>
                  <Link href="https://discord.gg/YHpSwttm" target="_blank" fontSize={14}>
                    <DiscordIcon fontSize="small" />
                    Discord
                  </Link>
                  <Link href="https://www.linkedin.com/in/brian-stoker/" target="_blank" fontSize={14}>
                    <LinkedInIcon fontSize="small" />
                    LinkedIn
                  </Link>
                </Box>
              </Paper>
            </Box>
          </Box>
          <div>
            <Box component="ul" sx={{ p: 0, m: 0 }}>
              {displayedPosts.map((post) => (
                <Box
                  component="li"
                  key={post.slug}
                  sx={() => ({
                    py: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:not(:last-of-type)': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  })}
                >
                  <PostPreview {...post} />
                </Box>
              ))}
            </Box>
            <Pagination
              page={page + 1}
              count={totalPage}
              variant="outlined"
              shape="rounded"
              onChange={(_, value) => {
                setPage(value - 1);
                postListRef.current?.scrollIntoView();
              }}
              sx={{ mt: 1, mb: 8 }}
            />
          </div>
        </Container>
      </main>
      <Divider />
      <HeroEnd />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
*/
