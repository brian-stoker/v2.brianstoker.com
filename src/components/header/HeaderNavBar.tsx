/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { unstable_debounce as debounce } from '@mui/utils';
import { useRouter } from 'next/router';
import ROUTES from 'src/route';
import { PRODUCTS } from 'src/products';
import NextLink from 'next/link';
import List from "@mui/material/List";

// Normalize a path for active-route comparison: drop origin, query, hash, and
// any trailing slash. External (absolute) URLs return null and never match.
function normalizePath(href: string): string | null {
  if (/^https?:\/\//.test(href)) {return null;}
  const path = href.split('?')[0].split('#')[0];
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: ROUTES.work, label: 'Work' },
  { href: ROUTES.art, label: 'Art' },
  { href: ROUTES.photography, label: 'Photography' },
  { href: ROUTES.drums, label: 'Drums' },
  { href: ROUTES.resume, label: 'Resume' },
  { href: ROUTES.plan, label: '.plan' },
  { href: ROUTES.bookTime, label: 'Meet' },
];

const Navigation = styled('nav')(({ theme }) => [
  {
    '& > div': {
      cursor: 'default',
    },
    '& ul': {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: theme.spacing(1),
      rowGap: theme.spacing(0.5),
    },
    '& li': {
      ...theme.typography.body2,
      color: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightSemiBold,
      '& > a, & > button': {
        display: 'inline-block',
        color: 'hsl(215 15% 22% / 1)',
        font: 'inherit',
        textDecoration: 'none',
        padding: theme.spacing('6px', '8px'),
        borderRadius: theme.shape.borderRadius,
        border: '1px solid transparent',
        '&:hover': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.grey[50],
          borderColor: theme.palette.grey[100],
          '@media (hover: none)': {
            backgroundColor: 'initial',
            // Reset on touch devices, it doesn't add specificity
          },
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary[500], 0.5)}`,
          outlineOffset: '2px',
        },
        '&[aria-current="page"]': {
          color: theme.palette.primary[600],
          backgroundColor: alpha(theme.palette.primary[500], 0.08),
          borderColor: alpha(theme.palette.primary[500], 0.2),
        },
      },
    },
  },
  {
    '& ul': {
      [theme.breakpoints.down('lg')]: {
        columnGap: theme.spacing(0.5),
      },
    },
    '& li': {
      [theme.breakpoints.down('lg')]: {
        '& > a, & > button': {
          padding: theme.spacing('6px', '6px'),
        },
      },
    },
  },
  theme.applyDarkStyles({
    '& li': {
      '& > a, & > button': {
        color: 'rgb(182, 190, 201)',
        '&:hover': {
          color: theme.palette.primary[50],
          backgroundColor: alpha(theme.palette.primaryDark[700], 0.8),
          borderColor: theme.palette.divider,
        },
        '&[aria-current="page"]': {
          color: theme.palette.primary[200],
          backgroundColor: alpha(theme.palette.primaryDark[700], 0.8),
          borderColor: theme.palette.divider,
        },
      },
    },
  }),
]);

const getProductIds = () => {
  return Object.keys(PRODUCTS);
}

export default function HeaderNavBar() {
  const router = useRouter();
  const currentPath = normalizePath(router.asPath || '');
  const [subMenuOpen, setSubMenuOpen] = React.useState<null | 'products' | 'docs'>(null);
  const [subMenuIndex, setSubMenuIndex] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLUListElement | null>(null);
  const productsMenuRef = React.useRef<HTMLButtonElement>(null);
  const docsMenuRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (typeof subMenuIndex === 'number') {
      document.getElementById(getProductIds()[subMenuIndex])?.focus();
    }
  }, [subMenuIndex]);

  function handleKeyDown(event: React.KeyboardEvent) {
    let menuItem;

    if (subMenuOpen === 'products') {
      menuItem = productsMenuRef.current!;
    } else if (subMenuOpen === 'docs') {
      menuItem = docsMenuRef.current!;
    } else {
      return;
    }

    if (event.key === 'ArrowDown' && subMenuOpen === 'products') {
      event.preventDefault();
      setSubMenuIndex((prevValue) => {
        if (prevValue === null) {
          return 0;
        }
        if (prevValue === getProductIds().length - 1) {
          return 0;
        }
        return prevValue + 1;
      });
    }
    if (event.key === 'ArrowUp' && subMenuOpen === 'products') {
      event.preventDefault();
      setSubMenuIndex((prevValue) => {
        if (prevValue === null) {
          return 0;
        }
        if (prevValue === 0) {
          return getProductIds().length - 1;
        }
        return prevValue - 1;
      });
    }
    if (event.key === 'Escape' || event.key === 'Tab') {
      menuItem.focus();
      setSubMenuOpen(null);
      setSubMenuIndex(null);
    }
  }

  const setSubMenuOpenDebounced = React.useMemo(
    () => debounce(setSubMenuOpen, 40),
    [setSubMenuOpen],
  );

  const setSubMenuOpenUndebounce = (value: typeof subMenuOpen) => () => {
    setSubMenuOpenDebounced.clear();
    setSubMenuOpen(value);
  };

  const handleClickMenu = (value: typeof subMenuOpen) => () => {
    setSubMenuOpenDebounced.clear();
    setSubMenuOpen(subMenuOpen ? null : value);
  };

  React.useEffect(() => {
    return () => {
      setSubMenuOpenDebounced.clear();
    };
  }, [setSubMenuOpenDebounced]);

  const getCurrentProductId = () => {
    if (subMenuIndex === null) {
      return undefined;
    }
    return getProductIds()[subMenuIndex];
  }

  return (
    <Navigation>
      <List sx={{}} ref={navRef} onKeyDown={handleKeyDown}>
        {NAV_ITEMS.map((item) => {
          const itemPath = normalizePath(item.href);
          const active = itemPath !== null && itemPath === currentPath;
          return (
            <li key={item.href}>
              <NextLink href={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </NextLink>
            </li>
          );
        })}
      </List>
    </Navigation>);
}
