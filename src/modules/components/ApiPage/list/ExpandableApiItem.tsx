import * as React from 'react';
import clsx from 'clsx';
import { alpha, styled } from '@mui/material/styles';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Divider, IconButton, SxProps } from '@mui/material';
import {
  brandingDarkTheme as darkTheme,
  brandingLightTheme as lightTheme,
} from '@stoked-ui/docs/branding';

type DescriptionType = 'props' | 'classes' | 'CSS' | 'slots';

const Root = styled('div')<{ ownerState: { type?: DescriptionType } }>(
  ({ theme }) => ({
    position: 'relative',
    marginBottom: 12,
    scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
    '& .MuiApi-item-header': {
      minHeight: 26,
      display: 'flex',
      alignItems: 'center',
      marginLeft: -38,
      marginBottom: 8,
      lineHeight: 1.5,
    },
    '& .MuiApi-item-link-visual': {
      display: 'none',
      flexShrink: 0,
      border: '1px solid',
      borderColor: `var(--muidocs-palette-divider, ${lightTheme.palette.divider})`,
      borderRadius: 8,
      backgroundColor: `var(--muidocs-palette-primary-50, ${lightTheme.palette.primary[50]})`,
      height: 26,
      width: 26,
      textAlign: 'center',
      lineHeight: '26px',
      '& svg': {
        fill: `var(--muidocs-palette-text-secondary, ${lightTheme.palette.text.secondary})`,
        height: '14px',
        width: '14px',
      },
    },
    '& .MuiApi-item-title': {
      marginLeft: 32,
      padding: '2px 6px',
      flexShrink: 0,
      fontWeight: theme.typography.fontWeightSemiBold,
      fontFamily: theme.typography.fontFamilyCode,
      fontSize: theme.typography.pxToRem(13),
      color: `var(--muidocs-palette-primary-600, ${lightTheme.palette.primary[600]})`,
    },
    '& .MuiApi-item-content': {
      verticalAlign: 'top',
      paddingBottom: theme.spacing(2),
      p: { marginBottom: theme.spacing(1.5) },
    },
    '& .MuiApi-item-note': {
      fontSize: 12,
      marginLeft: 2,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: `var(--muidocs-palette-success-800, ${lightTheme.palette.success[800]})`,
      fontWeight: theme.typography.fontWeightBold,
      lineHeight: '24px',
    },
    '& .MuiApi-expend-button': {},
    '& hr': {
      margin: 0,
    },
    [theme.breakpoints.up('lg')]: {
      '&:hover, &:target': {
        '.MuiApi-item-link-visual': {
          display: 'inline-block',
        },
        '.MuiApi-item-title': {
          marginLeft: 6,
        },
        '.MuiApi-item-link-visual:hover': {
          cursor: 'pointer',
          backgroundColor: alpha(lightTheme.palette.primary[100], 0.4),
          borderColor: `var(--muidocs-palette-primary-100, ${lightTheme.palette.primary[100]})`,
          '& svg': {
            fill: `var(--muidocs-palette-primary-main, ${lightTheme.palette.primary.main})`,
          },
        },
      },
      '&:target': {
        '.MuiApi-item-link-visual': {
          '&>svg': {
            transform: 'rotate(90deg) translateX(-0.5px) translateY(0.1px)',
          },
        },
      },
    },
    '& code.Api-code': {
      ...theme.typography.caption,
      fontFamily: theme.typography.fontFamilyCode,
      fontWeight: theme.typography.fontWeightRegular,
      color: `var(--muidocs-palette-text-primary, ${lightTheme.palette.text.primary})`,
      padding: '1px 4px',
      borderRadius: 6,
      border: '1px solid',
      borderColor: alpha(darkTheme.palette.primary[100], 0.8),
      backgroundColor: `var(--muidocs-palette-primary-50, ${lightTheme.palette.primary[50]})`,
    },
  }),
  ({ theme }) => ({
    [`:where(${theme.vars ? '[data-mui-color-scheme="dark"]' : '.mode-dark'}) &`]: {
      '& .MuiApi-item-header': {
        '&>span, &>div': {
          borderColor: `var(--muidocs-palette-divider, ${darkTheme.palette.divider})`,
        },
        '& .MuiApi-item-title': {
          color: `var(--muidocs-palette-primary-200, ${darkTheme.palette.primary[200]})`,
        },
        '& .MuiApi-item-link-visual': {
          borderColor: `var(--muidocs-palette-divider, ${darkTheme.palette.divider})`,
          backgroundColor: alpha(darkTheme.palette.primary[900], 0.5),
          '& svg': {
            fill: `var(--muidocs-palette-primary-200, ${darkTheme.palette.primary[200]})`,
          },
        },
        '&:hover, &:target': {
          '.MuiApi-item-link-visual:hover': {
            borderColor: `var(--muidocs-palette-primary-900, ${darkTheme.palette.primary[900]})`,
            backgroundColor: alpha(darkTheme.palette.primary[900], 0.6),
            '& svg': {
              fill: `var(--muidocs-palette-primary-100, ${darkTheme.palette.primary[100]})`,
            },
          },
        },
        '& .MuiApi-item-description': {
          color: `var(--muidocs-palette-grey-500, ${darkTheme.palette.grey[500]})`,
        },
        '& .MuiApi-item-note': {
          color: `var(--muidocs-palette-success-400, ${darkTheme.palette.success[400]})`,
        },
      },
      '& code.Api-code': {
        color: `var(--muidocs-palette-text-primary, ${darkTheme.palette.text.primary})`,
        borderColor: `var(--muidocs-palette-divider, ${darkTheme.palette.divider})`,
        backgroundColor: alpha(darkTheme.palette.primary[900], 0.3),
      },
    },
  }),
);

type ExpandableApiItemProps = {
  children?: React.ReactNode;
  className?: string;
  description?: string;
  displayOption?: 'collapsed' | 'expanded';
  id: string;
  isExtendable?: boolean;
  note?: string;
  sx?: SxProps;
  title: string | React.ReactNode;
  type?: DescriptionType;
};

export default function ExpandableApiItem(props: ExpandableApiItemProps) {
  const {
    children,
    className,
    description,
    displayOption,
    id,
    isExtendable = true,
    note,
    title,
    type,
    ...other
  } = props;

  const [isExtended, setIsExtended] = React.useState(() => displayOption === 'expanded');

  React.useEffect(() => {
    setIsExtended(displayOption === 'expanded');
  }, [displayOption]);
  return (
    <Root
      ownerState={{ type }}
      {...other}
      id={id}
      className={clsx(
        `MuiApi-item-root ${isExtendable ? 'MuiApi-item-header-extendable' : ''}`,
        className,
      )}
    >
      <div className="MuiApi-item-header">
        <a className="MuiApi-item-link-visual" href={`#${id}`}>
          <svg>
            <use xlinkHref="#anchor-link-icon" />
          </svg>
        </a>
        <span
          className="MuiApi-item-title algolia-lvl3" // This className is used by Algolia
        >
          {title}
        </span>
        {note && <span className="MuiApi-item-note">{note}</span>}
        {isExtendable && (
          <IconButton
            onClick={() => setIsExtended((prev) => !prev)}
            className="MuiApi-expend-button"
            aria-label={isExtended ? 'Collapse' : 'Expand'}
            size="small"
            sx={{ p: 0, ml: 'auto', borderRadius: '6px' }}
          >
            {isExtended ? (
              <KeyboardArrowUpIcon sx={{ color: 'grey.500' }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ color: 'grey.500' }} />
            )}
          </IconButton>
        )}
      </div>
      {isExtended && <div className={`MuiApi-item-content`}>{isExtended && children}</div>}
      <Divider />
    </Root>
  );
}

export const ApiItemContaier = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});
