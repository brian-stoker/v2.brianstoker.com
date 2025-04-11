import React from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button, { buttonClasses } from '@mui/material/Button';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/components/markdown/MarkdownElement';
import MaterialDesignDemo, { componentCode } from 'src/components/home/MaterialDesignDemo';
import ShowcaseContainer from 'src/components/home/ShowcaseContainer';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import StylingInfo from 'src/components/action/StylingInfo';
import FlashCode from 'src/components/animation/FlashCode';
import Frame from "../action/Frame";
import NoSsr from "@mui/material/NoSsr";
import Fade from "@mui/material/Fade";

const lineMapping: Record<string, number | number[]> = {
  card: [0, 20],
  cardmedia: [1, 5],
  stack: [6, 19],
  stack2: [7, 16],
  typography: 8,
  stack3: [9, 16],
  chip: [10, 14],
  rating: 15,
  switch: 18,
};

const mockTheme = {
  palette: {
    mode: 'dark',
  },
  shape: {
    borderRadius: 12,
  },
  shadows: ['none', '0px 4px 20px 0px hsla(210, 14%, 28%, 0.2)'],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0px 4px 12px rgba(0, 0, 0, 0.4)',
          backgroundColor:
            'rgba(0, 0, 0, 0.2)',
          border: '1px solid',
          borderColor:
            'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 50,
          height: 50,
          borderRadius: 99,
        },
      },
    },
    MuiSwich: {},
    MuiChip: {
      styleOverrides: {
        filled: {
          fontWeight: 'medium',
          '&.MuiChip-colorSuccess': {
            backgroundColor:
              'rgba(0, 0, 255, 1)',
            color:
              'rgba(0, 0, 0, 1)',
          },
          '&.MuiChip-colorDefault': {
            backgroundColor:
              'rgba(0, 128, 0, 1)',
            color:
              'rgba(0, 0, 0, 1)',
          },
        },
      },
    },
  },
};

function TestShowcase() {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ShowcaseContainer />
    </ThemeProvider>
  );
}

describe('Showcase', () => {
  it('renders the showcase component', () => {
    const { getByText } = render(<TestShowcase />);
    expect(getByText('Wild Eyes')).toBeInTheDocument();
  });

  it('has correct height and display flexbox layout', () => {
    const { container, getByRole } = render(<TestShowcase />);
    expect(container).toHaveStyleRule('height', '100%');
    expect(container).toHaveStyleRule('display', 'flex');
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('has correct border radius and img style', () => {
    const { getByRole } = render(<TestShowcase />);
    expect(getByRole('img').style).toHaveProperty('borderRadius', '12px');
    expect(getByRole('img')).toHaveStyleRule('border-radius', '12px');
  });

  it('renders highlighted lines and image with correct line number', () => {
    const { getByText } = render(<TestShowcase />);
    expect(getByText('Wild Eyes').parentElement).toHaveStyleRule(
      'height',
      'calc(100% - 1em)'
    );
  });
});