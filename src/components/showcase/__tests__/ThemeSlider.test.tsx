import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeSlider from './ThemeSlider';

describe('ThemeSlider', () => {
  let slider;
  beforeEach(() => {
    slider = render(<ThemeSlider />);
  });

  it('renders without crashing', () => {
    expect(slider.container).not.toBeNull();
  });

  describe('Conditional Rendering', () => {
    it('should render with default values', () => {
      const { getByText } = render(<ThemeSlider />);
      expect(getByText('25°C')).toBeInTheDocument();
      expect(getByText('50°C')).toBeInTheDocument();
    });

    it('should render without value labels when display is set to "off"', () => {
      const { getByRole } = render(<ThemeSlider valueLabelDisplay="off" />);
      expect(getByRole('text')).not.toBeNull();
    });

    it('should render with custom marks', () => {
      const { getByText } = render(<ThemeSlider marks={[{ value: 100, label: 'Custom mark' }]}/>);
      expect(getByText('100°C')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should throw an error with invalid type for defaultValue', () => {
      const { getByText } = render(<ThemeSlider defaultValue="invalid" />);
      expect(getByText('Invalid value type: string')).toBeInTheDocument();
    });

    it('should validate invalid range for value', () => {
      const { getByText } = render(<ThemeSlider defaultValue={[100, 200]} />);
      expect(getByText('Value range should be within [0, 100]')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should change the value when clicked', () => {
      const { getByRole } = render(<ThemeSlider />);
      const sliderHandle = getByRole('slider-handle');
      fireEvent.click(sliderHandle);
      expect(sliderHandle.getAttribute('aria-label')).not.toBeNull();
    });

    it('should update the input field when changed', () => {
      const { getByRole, getByPlaceholderText } = render(<ThemeSlider />);
      const sliderInput = getByRole('slider-input');
      fireEvent.change(sliderInput, { target: { value: '75' } });
      expect(getByPlaceholderText('Temperature')).toHaveValue('75°C');
    });

    it('should submit the form when submitted', () => {
      const { getByRole, getByText } = render(<ThemeSlider />);
      const sliderSubmitButton = getByText('Submit');
      fireEvent.click(sliderSubmitButton);
      expect(getByText('Form submitted successfully')).toBeInTheDocument();
    });
  });

  describe('Side Effects and State Changes', () => {
    it('should update the state when changed', async () => {
      const { getByRole } = render(<ThemeSlider />);
      const sliderInput = getByRole('slider-input');
      fireEvent.change(sliderInput, { target: { value: '75' } });
      await waitFor(() => expect(getByRole('slider-value')).toHaveValue('75'));
    });

    it('should update the theme when changed', async () => {
      const { getByRole } = render(<ThemeSlider />);
      const sliderInput = getByRole('slider-input');
      fireEvent.change(sliderInput, { target: { value: '75' } });
      await waitFor(() => expect(getByRole('slider-handle')).toHaveStyle('background-color', 'primary.main'));
    });
  });

  it('should render with theme applied', async () => {
    const mockTheme = {
      palette: {
        primaryDark: '#3f51b5',
        grey: [ '#d9d9d9', '#4a4a4a' ],
        text: { secondary: 'text.secondary', tertiary: 'text.tertiary' },
      },
      applyDarkStyles: (styles) => styles,
    };

    const themeProvider = render(<ThemeSlider />);
    jest.mocked(themeProvider.themeContext Provider.props.theme).mockImplementation(() => mockTheme);

    await waitFor(() => expect(getByRole('slider-handle')).toHaveStyle('background-color', 'primaryDark.600'));

    expect(jest.mocked(mockTheme.applyDarkStyles)).toHaveBeenCalledTimes(1);
  });
});