import { render, fireEvent, screen } from '@testing-library/react';
import Hero from './Hero';
import '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const MockGetStartedButtons = () => {
  return <GetStartedButtons />;
};

describe('Hero component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <Hero />
      </ThemeProvider>
    );
    expect(screen).not.toThrow();
  });

  describe('props', () => {
    const props = {
      linearGradient: true,
      left: { textAlign: 'center' },
      rightSx: {},
    };

    it('renders with correct sx prop', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero {...props} />
        </ThemeProvider>
      );
      expect(screen.getByRole('heading')).toHaveStyle({
        ...props.left.sx,
      });
    });

    it('renders with correct rightSx prop', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero {...props} rightSx={{ p: 4 }} />
        </ThemeProvider>
      );
      expect(screen.getByRole('heading')).toHaveStyle({
        ...props.rightSx,
      });
    });

    it('renders without crashing when props are invalid', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero invalidProp='Invalid' />
        </ThemeProvider>
      );
      expect(screen).not.toThrow();
    });
  });

  describe('user interactions', () => {
    const props = {
      linearGradient: true,
      left: { textAlign: 'center' },
    };

    it('calls GetStartedButtons onClick handler when primary button is clicked', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero {...props} />
        </ThemeProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /primaryLabel/g }));
      expect(MockGetStartedButtons.props.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls GetStartedButtons onClick handler when primary button is clicked with accessibility role', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero {...props} />
        </ThemeProvider>
      );
      fireEvent.click(screen.getByRole('button', { name: /primaryLabel/g, 'aria-label': true }));
      expect(MockGetStartedButtons.props.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls FileExplorerGrid onDragStart handler when grid is dragged', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero {...props} />
        </ThemeProvider>
      );
      const grid = screen.getByRole('grid');
      fireEvent.dragStart(grid);
      expect(grid.props.onDragStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional rendering', () => {
    it('renders FileExplorerGrid when isMdUp is true', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero isMdUp={true} />
        </ThemeProvider>
      );
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('does not render FileExplorerDnd when isMdUp is false', () => {
      render(
        <ThemeProvider theme={theme}>
          <Hero isMdUp={false} />
        </ThemeProvider>
      );
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });
});