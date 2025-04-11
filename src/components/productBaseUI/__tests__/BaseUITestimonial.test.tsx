import { render, fireEvent } from '@testing-library/react';
import BaseUITestimonial from './BaseUITestimonial';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { MuiThemeProvider } from '@mui/material';

// Define the theme
const theme = createTheme();

// Mock the Link component to return a mock href
jest.mock('@stoked-ui/docs/Link', () => ({
  __esModule: true,
  default: ({ href, children }) => {
    return <div data-testid="mock-link">{children}</div>;
  },
}));

describe('BaseUITestimonial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MuiThemeProvider theme={theme}>
        <BaseUITestimonial />
      </MuiThemeProvider>
    );
    expect(container).toMatchSnapshot();
  });

  describe('props', () => {
    it('accepts a valid section prop', () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial Section="TestSection" />
        </MuiThemeProvider>
      );
      expect(getByText('TestSection')).toBeInTheDocument();
    });

    it('does not accept an invalid section prop', () => {
      expect(() => render(<BaseUITestimonial Section="InvalidSection" />)).toThrowError(
        'InvalidSection is not a valid prop for BaseUITestimonial'
      );
    });
  });

  describe('conditional rendering', () => {
    it('renders the avatar and link when a user visits the testimonial', () => {
      const { getByText, getByRole } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      expect(getByText('Szilárd Dóró')).toBeInTheDocument();
      expect(getByRole('link')).toHaveAttribute('href', 'https://nhost.io/blog/new-database-ui');
    });

    it('does not render the avatar and link when a user does not visit the testimonial', () => {
      const { queryByText, queryByRole } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      expect(queryByText('Szilárd Dóró')).not.toBeInTheDocument();
      expect(queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls the onHover function when a user hovers over the testimonial', async () => {
      const { getByText, hover } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      await hover(getByText('Szilárd Dóró'));
      expect(BaseUITestimonial.onHover).toHaveBeenCalledTimes(1);
    });

    it('calls the onClick function when a user clicks on the link', async () => {
      const { getByText, click } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      await click(getByText('Szilárd Dóró'));
      expect(BaseUITestimonial.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('styles', () => {
    it('applies the dark styles when the user is in a dark theme', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      expect(getByText('Szilárd Dóró')).toHaveStyle({
        color: 'white',
      });
    });

    it('does not apply the dark styles when the user is in a light theme', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <BaseUITestimonial />
        </MuiThemeProvider>
      );
      expect(getByText('Szilárd Dóró')).toHaveStyle({
        color: 'black',
      });
    });
  });
});