import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import SvgHamburgerMenu from 'src/icons/SvgHamburgerMenu';
import { Link } from '@stoked-ui/docs/Link';
import ROUTES from 'src/route';
import IconImage from "../icon/KeyIcon";

const Anchor = styled('a')<{ component?: React.ElementType; noLinkStyle?: boolean }>(
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

const PRODUCTS = [
  {
    name: 'Stoked UI Core',
    description: 'Ready-to-use foundational React components, free forever.',
    href: ROUTES.productCore,
  },
  {
    name: 'Stoked UI X',
    description: 'Advanced and powerful components for complex use cases.',
    href: ROUTES.productAdvanced,
  },
  {
    name: 'Stoked Consulting Services',
    description: 'Full stack consulting services.',
    href: ROUTES.productTemplates,
  }
];

const DOCS = [
  {
    name: 'Material UI',
    description: "Component library that implements Google's Material Design.",
    href: ROUTES.materialDocs,
  },
  {
    name: 'Joy UI',
    description: "Component library that implements SUI's own in-house design principles.",
    href: ROUTES.joyDocs,
  },
  {
    name: 'Base UI',
    description: 'Unstyled React components and low-level hooks.',
    href: ROUTES.baseDocs,
  },
  {
    name: 'SUI System',
    description: 'CSS utilities for rapidly laying out custom designs.',
    href: ROUTES.systemDocs,
  },
  {
    name: 'SUI X',
    description: 'Advanced components for complex use cases.',
    href: ROUTES.xIntro,
  },
  {
    name: 'Toolpad',
    description: 'Low-code admin builder',
    href: ROUTES.toolpadStudioDocs,
    chip: 'Beta',
  },
];

export default function HeaderNavDropdown() {
  const [open, setOpen] = React.useState(false);
  const [productsOpen, setProductsOpen] = React.useState(true);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const hambugerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <React.Fragment>
      <IconButton
        color="primary"
        aria-label="Menu"
        ref={hambugerRef}
        disableRipple
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: 'relative',
          '& rect': {
            transformOrigin: 'center',
            transition: '0.2s',
          },
          ...(open && {
            '& rect:first-of-type': {
              transform: 'translate(1.5px, 1.6px) rotateZ(-45deg)',
            },
            '& rect:last-of-type': {
              transform: 'translate(1.5px, -1.2px) rotateZ(45deg)',
            },
          }),
        }}
      >
        <SvgHamburgerMenu/>
      </IconButton>
      <ClickAwayListener
        onClickAway={(event) => {
          if (!hambugerRef.current!.contains(event.target as Node)) {
            setOpen(false);
          }
        }}
      >
        <Collapse
          in={open}
          sx={(theme) => ({
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            boxShadow: `0px 16px 20px rgba(170, 180, 190, 0.3)`,
            ...theme.applyDarkStyles({
              boxShadow: '0px 16px 20px rgba(0, 0, 0, 0.8)',
            }),
          })}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              maxHeight: 'calc(100vh - 56px)',
              overflow: 'auto',
            }}
          >
            <UList
              sx={(theme) => ({
                '& ul': {
                  borderLeft: '1px solid',
                  borderColor: 'grey.100',
                  ...theme.applyDarkStyles({
                    borderColor: 'primaryDark.700',
                  }),
                  pl: 1,
                  pb: 1,
                  ml: 1,

                },
              })}
            >
              <li>
                <Anchor href={ROUTES.work} as={Link} noLinkStyle>
                  Work
                </Anchor>
              </li>
              <li>
                <Anchor href={ROUTES.art} as={Link} noLinkStyle>
                  Art
                </Anchor>
              </li>
              <li>
                <Anchor href={ROUTES.photography} as={Link} noLinkStyle>
                  Photography
                </Anchor>
              </li>
              <li>
                <Anchor href={ROUTES.drums} as={Link} noLinkStyle>
                  Drums
                </Anchor>
              </li>
              <li>
                <Anchor href={ROUTES.resume} as={Link} noLinkStyle>
                  Resume
                </Anchor>
              </li>
              
              <li>
                <Anchor href={ROUTES.plan} as={Link} noLinkStyle>
                  .plan
                </Anchor>
              </li>
            </UList>
          </Box>
        </Collapse>
      </ClickAwayListener>
    </React.Fragment>
  );
}
