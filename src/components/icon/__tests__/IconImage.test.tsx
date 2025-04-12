import { render, fireEvent, waitFor } from '@testing-library/react';
import IconImage from './IconImage';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('./@mui/material/styles'),
  useTheme: () => ({ palette: { mode: 'dark' } }),
}));

describe('IconImage component', () => {
  const props = {
    name: 'product-core',
    height: 100,
    width: 200,
    sx: {},
    mode: '',
  };

  beforeEach(() => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { getByAltText } = render(<IconImage {...props} />);
      expect(getByAltText(props.name)).toBeInTheDocument();
    });

    it('renders different images for light and dark mode', async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      const { getByAltText } = render(<IconImage {...props} mode="light" />);
      expect(getByAltText(props.name + '-light')).toBeInTheDocument();

      global.innerWidth = 1920;
      global.innerHeight = 1080;

      const { getByAltText } = render(<IconImage {...props} mode="dark" />);
      expect(getByAltText(props.name + '-dark')).toBeInTheDocument();
    });

    it('renders a placeholder for an image', async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      const { getByAltText } = render(<IconImage {...props} mode="" loading="eager" />);
      expect(getByAltText(props.name)).toBeInTheDocument();
    });

    it('renders a Box component for an image', async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      const { getByAltText } = render(<IconImage {...props} mode="" loading="eager" />);
      expect(getByAltText(props.name)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('throws an error for invalid name prop', async () => {
      expect(() => render(<IconImage name="invalid-name" />)).toThrowError(
        'Invalid value for prop `name`: expected one of "product-core", ...',
      );
    });

    it('throws an error for invalid mode prop', async () => {
      expect(() => render(<IconImage {...props} mode="invalid-mode" />)).toThrowError(
        'Invalid value for prop `mode`: expected one of "", "light", "dark"',
      );
    });
  });

  describe('User interactions', () => {
    it('calls the correct width and height on the img tag when updated', async () => {
      const { getByAltText, getByRole } = render(<IconImage {...props} />);
      const imgTag = getByRole('img');
      expect(imgTag.getAttribute('width')).toBe(props.width.toString());
      expect(imgTag.getAttribute('height')).toBe(props.height.toString());

      fireEvent.change(getByRole('img'), {
        target: { width: 400 },
        target: { height: 600 },
      });

      await waitFor(() => expect(imgTag.getAttribute('width')).toBe(props.width.toString());
      await waitFor(() => expect(imgTag.getAttribute('height')).toBe(props.height.toString());
    });
  });
});