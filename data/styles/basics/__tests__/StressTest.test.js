import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import StressTest from './StressTest.test.js';
import Component from './Component.test.js';

describe('Component', () => {
  describe('rendering without crashing', () => {
    it('should not crash when rendering with valid props', () => {
      const { container } = render(<Component backgroundColor="#2196f3" />);
      expect(container).toBeTruthy();
    });

    it('should not crash when rendering with invalid props', () => {
      const { container } = render(<Component backgroundColor="invalid-color" />);
      expect(container).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('should render theme color correctly', () => {
      const { getByText } = render(
        <ThemeProvider theme={{ color: 'blue' }}>
          <Component backgroundColor="#2196f3" />
        </ThemeProvider>
      );
      expect(getByText('color: blue')).toBeTruthy();
    });

    it('should not render theme color when background-color is invalid', () => {
      const { queryByText } = render(
        <ThemeProvider theme={{ color: 'blue' }}>
          <Component backgroundColor="invalid-color" />
        </ThemeProvider>
      );
      expect(queryByText('color: blue')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate backgroundColor prop correctly', () => {
      const { getByText } = render(
        <Component backgroundColor="#2196f3" />
      );
      expect(getByText('backgroundColor: #2196f3')).toBeTruthy();
    });

    it('should not validate backgroundColor prop with invalid value', () => {
      const { queryByText } = render(<Component backgroundColor="invalid-color" />);
      expect(queryByText('backgroundColor: invalid-color')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should update backgroundColor on input change', async () => {
      const { getByLabelText, getByValue } = render(
        <Component backgroundColor="#2196f3" />
      );
      const colorInput = getByLabelText('theme color: ');
      fireEvent.change(colorInput, { target: { value: 'red' } });
      await waitFor(() => expect(getByValue('#ff0000')).toBeTruthy());
    });

    it('should update background-color property on input change', async () => {
      const { getByLabelText, getByValue } = render(
        <Component backgroundColor="#2196f3" />
      );
      const colorInput = getByLabelText('theme color: ');
      fireEvent.change(colorInput, { target: { value: 'red' } });
      await waitFor(() => expect(getByValue('#ff0000')).toBeTruthy());
    });

    it('should update theme color on input change', async () => {
      const { getByLabelText, getByValue } = render(
        <ThemeProvider theme={{ color: 'blue' }}>
          <Component backgroundColor="#2196f3" />
        </ThemeProvider>
      );
      const colorInput = getByLabelText('theme color: ');
      fireEvent.change(colorInput, { target: { value: 'red' } });
      await waitFor(() => expect(getByText('color: red')).toBeTruthy());
    });

    it('should update background-color property on input change when invalid', async () => {
      const { getByLabelText, getByValue } = render(
        <Component backgroundColor="invalid-color" />
      );
      const colorInput = getByLabelText('theme color: ');
      fireEvent.change(colorInput, { target: { value: 'red' } });
      await waitFor(() => expect(getByValue('#ff0000')).toBeTruthy());
    });
  });

  describe('side effects and state changes', () => {
    it('should update rendered count correctly', async () => {
      const { getByText } = render(<Component backgroundColor="#2196f3" />);
      expect(getByText('rendered 1 times')).toBeTruthy();
      await waitFor(() => expect(getByText('rendered 2 times')).toBeTruthy());
    });

    it('should not update theme color when background-color is invalid', async () => {
      const { queryByText } = render(
        <ThemeProvider theme={{ color: 'blue' }}>
          <Component backgroundColor="invalid-color" />
        </ThemeProvider>
      );
      await waitFor(() => expect(queryByText('color: blue')).not.toBeInTheDocument());
    });
  });

  describe('snapshot tests', () => {
    it('should match the component\'s snapshot', async () => {
      const { asFragment } = render(<Component backgroundColor="#2196f3" />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should not match the component\'s snapshot when invalid props are used', async () => {
      const { asFragment } = render(<Component backgroundColor="invalid-color" />);
      expect(asFragment()).not.toMatchSnapshot();
    });
  });
});