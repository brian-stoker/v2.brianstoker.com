import { render, fireEvent, screen } from '@testing-library/react';
import Hero from './Hero';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { MuiThemeProvider } from '@mui/material/styles';

describe('Hero component', () => {
  const theme = createTheme();
  const getStartedButtonProps = (primaryUrl: string) =>
    ({ primaryLabel, primaryUrl });

  it('renders without crashing', async () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero />
        </ThemeProvider>
      </MuiThemeProvider>,
    );
  });

  it('renders with correct props', async () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero
            linearGradient
            rightSx={{
              p: 4,
              ml: 2,
              minWidth: 2000,
              overflow: 'hidden',
            }}
            right={
              <React.Fragment>
                <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
                  <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
                  <FileExplorerDnd id={'file-explorer-dnd'} sx={{ width: 360 }} />
                </Stack>
              </React.Fragment>,
            }
          />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(getByText('Stoked UI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' })).toBeInTheDocument();
  });

  it('renders with drag and drop component', async () => {
    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero
            linearGradient
            rightSx={{
              p: 4,
              ml: 2,
              minWidth: 2000,
              overflow: 'hidden',
            }}
            right={
              <React.Fragment>
                {screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' })}
                <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
                  <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
                  <FileExplorerDnd id={'file-explorer-dnd'} sx={{ width: 360 }} />
                </Stack>
              </React.Fragment>,
            }
          />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    expect(getByText('Stoked UI')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Checkout the roadmap to see whats next' })).toBeInTheDocument();

    const fileExplorerGrid = screen.getByTestId('file-explorer-grid');
    fireEvent.dragOver(fileExplorerGrid, {
      dataTransfer: {
        effect: 3,
        types: ['text'],
      },
    });

    expect(getByRole('button', { name: 'Checkout the roadmap to see whats next' })).toBeInTheDocument();
  });

  it('calls GetStartedButton props when clicked', async () => {
    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero
            linearGradient
            rightSx={{
              p: 4,
              ml: 2,
              minWidth: 2000,
              overflow: 'hidden',
            }}
            right={
              <React.Fragment>
                {screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' })}
                <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
                  <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
                  <FileExplorerDnd id={'file-explorer-dnd'} sx={{ width: 360 }} />
                </Stack>
              </React.Fragment>,
            }
          />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const getStartedButton = screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' });
    fireEvent.click(getStartedButton);

    expect(getByRole('button', { name: 'Checkout the roadmap to see whats next' })).toBeInTheDocument();
  });

  it('calls GetStartedButton props with primaryUrl when clicked', async () => {
    const primaryUrl = 'https://example.com';
    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero
            linearGradient
            rightSx={{
              p: 4,
              ml: 2,
              minWidth: 2000,
              overflow: 'hidden',
            }}
            right={
              <React.Fragment>
                {screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' })}
                <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
                  <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
                  <FileExplorerDnd id={'file-explorer-dnd'} sx={{ width: 360 }} />
                </Stack>
              </React.Fragment>,
            }
          />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const getStartedButton = screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' });
    const buttonProps = getStartedButton.props.getStartedButtonProps();
    fireEvent.click(getStartedButton);

    expect(buttonProps.primaryUrl).toBe(primaryUrl);
  });

  it('calls GetStartedButton props with primaryLabel when clicked', async () => {
    const primaryLabel = 'Checkout the roadmap to see whats next';
    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero
            linearGradient
            rightSx={{
              p: 4,
              ml: 2,
              minWidth: 2000,
              overflow: 'hidden',
            }}
            right={
              <React.Fragment>
                {screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' })}
                <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
                  <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
                  <FileExplorerDnd id={'file-explorer-dnd'} sx={{ width: 360 }} />
                </Stack>
              </React.Fragment>,
            }
          />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const getStartedButton = screen.getByRole('button', { name: 'Checkout the roadmap to see whats next' });
    fireEvent.click(getStartedButton);

    expect(getByRole('button', { name: primaryLabel })).toBeInTheDocument();
  });

  it('renders with correct theme', async () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const style = global.getComputedStyle(document.body);
    expect(style.backgroundColor).toBe(theme.palette.background.default);
  });

  it('renders with correct fontFamily', async () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <Hero />
        </ThemeProvider>
      </MuiThemeProvider>,
    );

    const style = global.getComputedStyle(document.body);
    expect(style.fontFamily).toBe(theme.typography.fontFamily);
  });
});