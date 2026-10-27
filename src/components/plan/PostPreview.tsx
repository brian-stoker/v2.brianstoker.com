import * as React from 'react';
import { alpha } from '@mui/material/styles';
import { Avatar, AvatarGroup, Box, Button, Chip, Paper, SxProps, Typography } from '@mui/material';
import NextLink from 'next/link';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { authors as AUTHORS } from 'src/modules/components/TopLayoutBlog';
import type { BlogPost } from '../../../lib/sourcing';

// Post dates are stored as UTC midnight; show that calendar day in every timezone.
function utcDate(date: string) {
  const d = new Date(date);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

export function PostPreview({post, size = 'default', showImage = false }: {post: BlogPost, size?: 'default' | 'mini', showImage?: boolean}) {
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap'  }} id={'chip-container'}>
        {post?.tags?.map((tag) => (
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
        <NextLink href={`/.plan/${post?.slug}/`} passHref  aria-describedby={`describe-${post?.slug}`} color="text.primary">
            {post?.title}
        </NextLink>
      </Typography>
      {showImage && post?.image && (
        <Box
          component="img"
          src={post.image}
          alt={post.imageAlt || post.title}
          sx={(theme) => ({
            aspectRatio: '16 / 9',
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: theme.palette.grey[200],
            mb: 2,
            ...theme.applyDarkStyles({ borderColor: alpha(theme.palette.primaryDark[600], 0.5) }),
          })}
        />
      )}
      <Typography color="text.secondary" sx={{ mb: 'auto' }}>
        {post?.description}
      </Typography>
      {post?.authors && (
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
          {(post.authors as Array<keyof typeof AUTHORS>).map((author) => {
            const rec = AUTHORS[author];
            if (!rec) return null;
            return (
            <Avatar
              key={author as string}
              alt={rec.name}
              src={`${rec.avatar}?s=${28}`}
              srcSet={`${rec.avatar}?s=${28 * 2} 2x, ${rec.avatar}?s=${
                28 * 3
              } 3x`}
            />
            );
          })}
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
          {post?.authors && (
            <Typography variant="body2" id={'by-line'} fontWeight="medium">
                {post?.authors
                ?.slice(0, 3)
                .map((userId) => {
                  const name = AUTHORS[userId as keyof typeof AUTHORS]?.name;
                  if (name) {
                    if (post?.authors && post?.authors?.length > 1) {
                      // display only firstName
                      return name.split(' ')[0];
                    }
                    return name;
                  }
                  return userId;
                })
                .join(', ')}
              {post?.authors?.length > 2 && ', and more.'}
            </Typography>
          )}
          {post?.date && (
            <Typography variant="caption" fontWeight="regular" color="text.tertiary">
              { size === 'mini' ? new Date(post?.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', timeZone: 'UTC' } ) : utcDate(post.date).toDateString()}
            </Typography>
          )}
        </Box>
        <Button
          component={NextLink}
          href={`/.plan/${post?.slug}`}
          passHref={true}
          aria-describedby={`describe-${post?.slug}`}
          id={`describe-${post?.slug}`}
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
    key={post?.slug}
    component="li"
    variant="outlined"
    sx={[(theme) => ({
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: ((theme as any).vars || theme).palette.gradients.radioSubtle,
      boxShadow: '0 4px 12px rgba(170, 180, 190, 0.2)',
      ...theme.applyDarkStyles({
        background: theme.palette.primaryDark[900],
        // theme.palette is the light palette here; the CSS var switches per scheme,
        // otherwise dark cards get the light blue wash and turn grey.
        backgroundImage: ((theme as any).vars || theme).palette.gradients.radioSubtle,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }),
    }), ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <PostPreview post={post} size={size} showImage={size !== 'mini'} />
  </Paper>
}

