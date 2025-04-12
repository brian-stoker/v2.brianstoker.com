import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
  switch: 16,
};

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

describe('ShowcaseContainer', () => {
  it('renders the preview component with a pointer container', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} />
            </PointerContainer>
          }
        />
      </ThemeProvider>,
    );

    expect(getByText('Material Design')).toBeInTheDocument();
  });

  it('renders the code component with a highlighted code block', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} />
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
                    backgroundColor: theme.palette.primary[900],
                  },
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color={false ? 'secondary' : 'primary'}
                  onClick={() => false}
                >
                  Material Design
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={true ? 'primary' : 'secondary'}
                  onClick={() => true}
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
                  {false !== undefined && <FlashCode startLine={false} endLine={undefined} />}
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
      </ThemeProvider>,
    );

    expect(getByText('Material Design')).toBeInTheDocument();
  });

  it('calls the onElementChange prop when a line is selected', async () => {
    const setElement = jest.fn();

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} />
            </PointerContainer>
          }
        />
      </ThemeProvider>,
    );

    expect(setElement).not.toHaveBeenCalled();

    const preview = await screen By.findByRole('button');
    userEvent.click(preview);

    expect(setElement).toHaveBeenCalledTimes(1);
  });

  it('renders the custom theme when a button is clicked', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} />
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
                    backgroundColor: theme.palette.primary[900],
                  },
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color={false ? 'secondary' : 'primary'}
                  onClick={() => false}
                >
                  Material Design
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={true ? 'primary' : 'secondary'}
                  onClick={() => true}
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
                  {false !== undefined && <FlashCode startLine={false} endLine={undefined} />}
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
      </ThemeProvider>,
    );

    expect(getByText('Custom Theme')).toBeInTheDocument();
  });

  it('renders a highlighted code block when a line is selected', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ShowcaseContainer
          preview={
            <PointerContainer
              onElementChange={(element) => console.log(element)}
              sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }}
            >
              <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} />
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
                    backgroundColor: theme.palette.primary[900],
                  },
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color={false ? 'secondary' : 'primary'}
                  onClick={() => false}
                >
                  Material Design
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={true ? 'primary' : 'secondary'}
                  onClick={() => true}
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
                  {true !== undefined && <FlashCode startLine={true} endLine={undefined} />}
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
      </ThemeProvider>,
    );

    expect(getByText('Custom Theme')).toBeInTheDocument();
  });
});