import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button, { buttonClasses } from '@mui/material/Button';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/components/markdown/MarkdownElement';
import MaterialDesignDemo, { componentCode } from 'src/components/home/MaterialDesignDemo';
import ShowcaseContainer from 'src/components/home/ShowcaseContainer';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import StylingInfo from 'src/components/action/StylingInfo';
import FlashCode from 'src/components/animation/FlashCode';

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

const MockTheme = () => {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return <ThemeProvider theme={theme} />;
};

describe('ShowcaseContainer', () => {
  it('renders properly', async () => {
    const { container } = render(
      <MockTheme>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element: Data) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <MaterialDesignDemo />
            </PointerContainer>
          }
          code={
            <div data-mui-color-scheme="dark">
              <Box
                sx={{
                  pb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  right: 0,
                  zIndex: 10,
                  [`& .${buttonClasses.root}`]: {
                    borderRadius: 40,
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    lineHeight: 18 / 12,
                  },
                  '& .MuiButton-outlinedPrimary': {
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                  },
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => console.log('Button clicked')}
                >
                  Material Design
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => console.log('Button clicked')}
                >
                  Custom Theme
                </Button>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'clip',
                  flexGrow: 1,
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  '& pre': {
                    bgcolor: 'transparent !important',
                    position: 'relative',
                    zIndex: 1,
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <FlashCode startLine={8} endLine={12} />
                  <HighlightedCode
                    copyButtonHidden
                    component={MarkdownElement}
                    code={componentCode}
                    language="jsx"
                  />
                  <StylingInfo appeared={true} sx={{ mx: -2 }} />
                </Box>
              </Box>
            </div>
          }
        />
      </MockTheme>,
    );

    expect(container).toBeTruthy();
  });

  it('calls onElementChange', async () => {
    const element: Data = { id: 'some-id' };
    const onElementChangeSpy = jest.fn();

    render(
      <MockTheme>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={onElementChangeSpy}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <MaterialDesignDemo />
            </PointerContainer>
          }
          code={
            // ...
          }
        />
      </MockTheme>,
    );

    const button = document.querySelector('button') as HTMLButtonElement;
    fireEvent.click(button!);

    expect(onElementChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('renders highlighted lines', async () => {
    render(
      <MockTheme>
        <ShowcaseContainer
          preview={
            // ...
          }
          code={
            <div data-mui-color-scheme="dark">
              {/* ... */}
              <Box sx={{ position: 'relative' }}>
                {8 !== undefined && <FlashCode startLine={8} endLine={12} />}
                {/* ... */}
              </Box>
            </div>
          }
        />
      </MockTheme>,
    );

    const flashCode = document.querySelector('flash-code');
    expect(flashCode).toBeTruthy();
  });

  it('renders highlighted code', async () => {
    render(
      <MockTheme>
        <ShowcaseContainer
          preview={
            // ...
          }
          code={
            <div data-mui-color-scheme="dark">
              {/* ... */}
              <Box sx={{ position: 'relative' }}>
                {12 !== undefined && <HighlightedCode startLine={8} endLine={12} />}
                {/* ... */}
              </Box>
            </div>
          }
        />
      </MockTheme>,
    );

    const highlightedCode = document.querySelector('highlighted-code');
    expect(highlightedCode).toBeTruthy();
  });
});