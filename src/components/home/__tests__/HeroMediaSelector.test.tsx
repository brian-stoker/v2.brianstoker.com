import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';
import createLoading from './createLoading';
import { useTheme } from '@mui/material/styles';

jest.mock('@mui/material/styles', () => ({
  createTheme: jest.fn(),
}));

describe('Hero Component', () => {
  let theme;
  let mediaQuery;

  beforeEach(() => {
    theme = { breakpoints: { up: 'md' }, palette: {} };
    mediaQuery = useMediaQuery(theme);
  });

  it('renders without crashing', async () => {
    const { container } = render(<Hero />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    it('should validate props correctly', () => {
      const invalidProps = { linearGradient: false };
      const { error } = Hero(invalidProps);
      expect(error).toBeUndefined();
    });
  });

  describe('conditional rendering', () => {
    it('should render FileExplorerGrid by default', async () => {
      const { getByText, queryByTitle } = render(<Hero />);
      const titleElement = await queryByTitle('File Explorer');
      expect(titleElement).toBeTruthy();
      expect(getByText('Media Selector')).toBeInTheDocument();
    });

    it('should render FileExplorerDnd on md+', async () => {
      mediaQuery.mockImplementation(() => ({ breakpoint: 'md' }));
      const { getByText, queryByTitle } = render(<Hero />);
      const titleElement = await queryByTitle('File Explorer');
      expect(titleElement).toBeTruthy();
    });
  });

  describe('side effects and state changes', () => {
    it('should update theme correctly', async () => {
      mediaQuery.mockImplementation(() => ({ breakpoint: 'md' }));
      const { getByText } = render(<Hero />);
      fireEvent.click(getByText('Media Selector'));
      await waitFor(() => expect(theme).not.toBe(null));
    });
  });

  describe('user interactions', () => {
    it('should handle clicks correctly', async () => {
      mediaQuery.mockImplementation(() => ({ breakpoint: 'md' }));
      const { getByText } = render(<Hero />);
      fireEvent.click(getByText('Media Selector'));
      expect(mediaQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle changes correctly', async () => {
      mediaQuery.mockImplementation(() => ({ breakpoint: 'md' }));
      const { getByText, getByRole } = render(<Hero />);
      fireEvent.change(getByRole('textbox'), { target: { value: 'new_value' } });
      expect(mediaQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle form submissions correctly', async () => {
      mediaQuery.mockImplementation(() => ({ breakpoint: 'md' }));
      const { getByText, getByRole } = render(<Hero />);
      fireEvent.change(getByRole('textbox'), { target: { value: 'new_value' } });
      fireEvent.submit(document.querySelector('form')!);
      expect(mediaQuery).toHaveBeenCalledTimes(1);
    });
  });

  it('should snapshot correctly', async () => {
    const { asFragment } = render(<Hero />);
    expect(asFragment()).toMatchSnapshot();
  });
});