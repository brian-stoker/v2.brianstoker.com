import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, withTheme } from '@mui/styles';
import DeepChildRaw from './DeepChildRaw'; // Replace with actual import path
import DeepChild from './DeepChild';

const theme = {
  spacing: '8px',
};

describe('WithTheme component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<DeepChild />);
      expect(container).toBeTruthy();
    });

    it('renders DeepChild component with correct theme spacing', () => {
      const { getByText } = render(<DeepChild />);
      expect(getByText('spacing 8px')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('renders without crashing when theme prop is provided', () => {
      const themeProp = { spacing: '16px' };
      const { container } = render(
        <ThemeProvider theme={themeProp}>
          <DeepChild />
        </ThemeProvider>
      );
      expect(container).toBeTruthy();
    });

    it('does not render without crashing when theme prop is not provided', () => {
      const { container } = render(<DeepChild />);
      expect(container).toBeFalsy();
    });
  });

  describe('prop validation', () => {
    it('throws an error when theme prop is not provided', () => {
      expect(() =>
        render(<DeepChild />,
          { throws: true }
        )
      ).toThrowError('theme is required');
    });

    it('does not throw an error when theme prop is provided', () => {
      const themeProp = { spacing: '16px' };
      render(
        <ThemeProvider theme={themeProp}>
          <DeepChild />
        </ThemeProvider>
      );
    });
  });

  describe('user interactions', () => {
    it('does not change spacing on click', () => {
      const { getByText } = render(<DeepChild />);
      const spanElement = getByText('spacing 8px');
      fireEvent.click(spanElement);
      expect(spanElement.textContent).toBe('spacing 8px');
    });

    it('changes spacing when input changes', () => {
      const { getByText, getByLabel } = render(<DeepChild />);
      const spanElement = getByText('spacing 8px');
      const inputElement = getByLabel('spacing');
      fireEvent.change(inputElement, { target: { value: '32px' } });
      expect(spanElement.textContent).toBe('spacing 32px');
    });

    it('submits form without crashing', () => {
      const { getByText, getByLabel } = render(<DeepChild />);
      const spanElement = getByText('spacing 8px');
      const inputElement = getByLabel('spacing');
      fireEvent.change(inputElement, { target: { value: '32px' } });
      fireEvent.submit(document.body);
      expect(spanElement.textContent).toBe('spacing 32px');
    });
  });

  describe('side effects', () => {
    it('updates theme when spacing prop changes', async () => {
      const updateThemeSpy = jest.spyOn(theme, 'spacing');
      render(<DeepChild />);
      fireEvent.change(document.body, { type: 'input', value: '32px' });
      await waitFor(() => expect(updateThemeSpy).toHaveBeenCalledTimes(1));
    });

    it('does not update theme when spacing prop does not change', async () => {
      const updateThemeSpy = jest.spyOn(theme, 'spacing');
      render(<DeepChild />);
      fireEvent.change(document.body, { type: 'input', value: '16px' });
      await waitFor(() => expect(updateThemeSpy).not.toHaveBeenCalled());
    });
  });

  describe('snapshot tests', () => {
    it('renders with correct theme spacing', () => {
      const { container } = render(<DeepChild />);
      expect(container).toMatchSnapshot();
    });

    it('renders without crashing when theme prop is provided', () => {
      const themeProp = { spacing: '16px' };
      const { container } = render(
        <ThemeProvider theme={themeProp}>
          <DeepChild />
        </ThemeProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});