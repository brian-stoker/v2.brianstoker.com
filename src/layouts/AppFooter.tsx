import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import SvgBsLogotype from 'src/icons/SvgBsLogotype';
import EmailSubscribe from 'src/components/footer/EmailSubscribe';
import ROUTES from 'src/route';
import DiscordIcon from 'src/icons/DiscordIcon';
import { Link } from '@stoked-ui/docs/Link';
import SvgStackOverflow from 'src/icons/SvgStackOverflow';
import Slack from '../icons/Slack';

interface AppFooterProps {
  stackOverflowUrl?: string;
}

export default function AppFooter(props: AppFooterProps) {
  const { stackOverflowUrl } = props;

  return (
    <Container component="footer">
      <Box
        sx={{
          py: { xs: 4, sm: 8 },
          display: 'grid',
          gridAutoColumns: '1fr',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: '1fr  1.75fr', md: '1.75fr 1.75fr', lg: '1.75fr 1fr' },
          gridTemplateRows: 'auto',
          '& a:not(.MuiIconButton-root)': {
            pt: 0.5,
            pb: 0.5,
            color: 'text.secondary',
            typography: 'body2',
            '&:hover': {
              color: 'primary.main',
            },
          },
        }}
      >
        <Box>
          <Link prefetch={false} href="/" aria-label="Go to homepage" sx={{
            mb: 2,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
            },
            '& span': {
              color: 'text.secondary',
              textDecoration: 'none'
            },
            '&:hover span': {
              color: 'text.secondary',
              textDecoration: 'none'
            }
          }}>
            <SvgBsLogotype height={28} /><span className={'stoked-font'} style={{ fontSize: '24px' }}>BRIAN STOKER</span>
          </Link>
          <Typography variant="body2" fontWeight="semiBold" gutterBottom>
            Keep up to date
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Join the newsletter for blog updates. No spam ever.
          </Typography>
          <EmailSubscribe />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoColumns: '1fr',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Sections
            </Typography>
            <Link prefetch={false} href={ROUTES.art}>
              Art
            </Link>
            <Link prefetch={false} href={ROUTES.photography}>
              Photography
            </Link>
            <Link prefetch={false} href={ROUTES.drums}>
              Drums
            </Link>
            <Link prefetch={false} href={ROUTES.blog}>
              Blog
            </Link>
            <Link prefetch={false} href={ROUTES.resume}>
              Resume
            </Link>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography fontWeight="semiBold" variant="body2" sx={{ mb: 0.5 }}>
              Company
            </Typography>
            <Link prefetch={false} href={ROUTES.about}>
              About
            </Link>
            <Link prefetch={false} href={ROUTES.vision}>
              Vision
            </Link>
            <Link prefetch={false} href={ROUTES.support}>
              Support
            </Link>
            <Link prefetch={false} href={ROUTES.privacyPolicy}>
              Privacy policy
            </Link>
            <a target="_blank" href="mailto:b@stokedconsulting.com">
              Contact us
            </a>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent={{ sm: 'space-between' }}
        gap={{ xs: 2, sm: 1 }}
        sx={{ my: 4 }}
      >
        <Typography color="text.tertiary" variant="caption" fontWeight={400}>
          Copyright © {new Date().getFullYear()} BRIAN STOKER
        </Typography>
        <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://github.com/brian-stoker"
            aria-label="github"
            title="GitHub"
            size="small"
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href={ROUTES.rssFeed}
            aria-label="RSS Feed"
            title="RSS Feed"
            size="small"
          >
            <RssFeedIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://stokedconsulting.slack.com"
            aria-label="slack"
            title="Slack"
            size="small"
          >
            <Slack sx={(theme) => ({ color: theme.palette.mode === 'light' ? 'grey' : '#FFF' ,...theme.applyDarkStyles({color: '#FFF'}) })} variant={'hover-color'} fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://www.linkedin.com/in/brian-stoker/"
            aria-label="linkedin"
            title="LinkedIn"
            size="small"
          >
            <LinkedInIcon fontSize="small" />
          </IconButton>
          <IconButton
            target="_blank"
            rel="noopener"
            href="https://discord.gg/YHpSwttm"
            aria-label="Discord"
            title="Discord"
            size="small"
          >
            <DiscordIcon fontSize="small" />
          </IconButton>
          {stackOverflowUrl ? (
            <IconButton
              target="_blank"
              rel="noopener"
              href={stackOverflowUrl}
              aria-label="Stack Overflow"
              title="Stack Overflow"
              size="small"
            >
              <SvgStackOverflow fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
