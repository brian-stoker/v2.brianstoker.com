import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import SvgHamburgerMenu from 'src/icons/SvgHamburgerMenu';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ROUTES from 'src/route';
import ThemeModeToggle from './ThemeModeToggle';
import IconImage from '../icon/IconImage';

// Normalize a path for active-route comparison (origin/query/hash/trailing-slash agnostic)
function normalizePath(href: string): string | null {
  if (/^https?:\/\//.test(href)) {return null;}
  const path = href.split('?')[0].split('#')[0];
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

const StyledLink = styled(NextLink)(
  ({ theme }) => [
    {
      ...theme.typography.body2,
      fontWeight: theme.typography.fontWeightBold,
      textDecoration: 'none',
      border: 'none',
      width: '100%',
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      transition: theme.transitions.create('background'),
      '&:hover, &:focus-visible': {
        backgroundColor: theme.palette.grey[100],
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
    },
    theme.applyDarkStyles({
      color: '#fff',
      '&:hover, &:focus-visible': {
        backgroundColor: theme.palette.primaryDark[700],
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
    }),
  ],
);

const UList = styled('ul')({
  listStyleType: 'none',
  padding: 0,
  margin: 0,
});

const navItems = [
  { href: ROUTES.work, icon: 'sui-logo', label: 'Work' },
  { href: ROUTES.art, icon: 'icon-hex', label: 'Art' },
  { href: ROUTES.photography, icon: 'icon-radiate', label: 'Photography' },
  { href: ROUTES.drums, icon: 'icon-diamonds', label: 'Drums' },
  { href: ROUTES.resume, icon: 'icon-rect', label: 'Resume' },
  { href: ROUTES.plan, icon: 'icon-triangle', label: '.plan' },
  { href: ROUTES.bookTime, icon: 'icon-hex', label: 'Meet' },
];

export default function HeaderNavDropdown() {
  const router = useRouter();
  const currentPath = normalizePath(router.asPath || '');
  const [open, setOpen] = React.useState(false);
  const hambugerRef = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();
  return (
    <React.Fragment>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        pr: 2,
      }}>
        {navItems.map((item) => {
          const itemPath = normalizePath(item.href);
          const active = itemPath !== null && itemPath === currentPath;
          return (
            <Tooltip key={item.href} title={item.label} arrow>
              <IconButton
                component={NextLink}
                href={item.href}
                color="primary"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                disableRipple
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  ...(active && {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 16,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: 'primary.main',
                    },
                  }),
                }}
              >
                <IconImage name={item.icon} width={20} height={20} />
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
    </React.Fragment>
  );
}
