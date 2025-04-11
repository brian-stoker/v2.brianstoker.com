import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeSlider from './ThemeSlider.test.tsx';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ThemeSlider component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<ThemeSlider />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders default theme', () => {
      const { getByText } = render(<ThemeSlider />);
      expect(getByText('Temperature')).toBeInTheDocument();
    });

    it('renders dark theme', async () => {
      global.theme = {
        palette: {
          grey: {
            200: '#333',
          },
          primary: {
            main: '#333',
            dark: '#222',
          },
        },
      };
      const { getByText } = render(<ThemeSlider />);
      expect(getByText('Temperature')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('validates valid props', async () => {
      global.theme = {};
      const { getByText, getByRole } = render(<ThemeSlider theme={global.theme} />);
      expect(getByRole('slider')).toBeInTheDocument();
      expect(getByText('Temperature')).toBeInTheDocument();
    });

    it('validates invalid props (missing theme)', async () => {
      const { getByRole } = render(<ThemeSlider />);
      expect(() => getByRole('slider')).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('handles slider click', async () => {
      global.theme = {};
      const { getByRole, getByText } = render(<ThemeSlider theme={global.theme} />);
      const slider = getByRole('slider');
      fireEvent.change(slider, { target: { value: 50 } });
      expect(getByText('50°C')).toBeInTheDocument();
    });

    it('handles input change', async () => {
      global.theme = {};
      const { getByText, getByRole } = render(<ThemeSlider theme={global.theme} />);
      const slider = getByRole('slider');
      fireEvent.change(slider, { target: { value: 50 } });
      expect(getByText('50°C')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      global.theme = {};
      const { getByText, getByRole } = render(<ThemeSlider theme={global.theme} />);
      const slider = getByRole('slider');
      fireEvent.change(slider, { target: { value: 50 } });
      fireEvent.click(getByText('Submit'));
      expect(getByText('Success')).toBeInTheDocument();
    });
  });

  describe('Side Effects', () => {
    it('calls theme.applyDarkStyles', async () => {
      const applyDarkStylesMock = jest.fn();
      global.theme = {
        applyDarkStyles: applyDarkStylesMock,
      };
      const { getByRole, getByText } = render(<ThemeSlider theme={global.theme} />);
      expect(applyDarkStylesMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with snapshot', async () => {
    const { asFragment } = render(<ThemeSlider />);
    expect(asFragment()).toMatchSnapshot();
  });
});