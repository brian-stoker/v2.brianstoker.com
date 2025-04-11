import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, describeBlock, describeSnapshot } from 'vitest';
import App from './App';

describe('App', () => {
  describe('renders without crashing', () => {
    it('renders component without crashing', async () => {
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describeBlock(
    'conditional rendering',
    [
      {
        title: 'when props are truthy',
        test: () => {
          const { getByText } = render(<App theme="light" />);
          expect(getByText('Light')).toBeInTheDocument();
        },
      },
      {
        title: 'when props are falsy',
        test: () => {
          const { getByText } = render(<App theme="dark" />);
          expect(getByText('Dark')).toBeInTheDocument();
        },
      },
    ],
  );

  describeBlock(
    'prop validation',
    [
      {
        title: 'valid props',
        test: async () => {
          await waitFor(() => {
            const { getByText } = render(<App theme="light" />);
            expect(getByText('Light')).toBeInTheDocument();
          });
        },
      },
      {
        title: 'invalid props',
        test: async () => {
          const mockThrow = jest.fn();
          jest.spyOn(App, 'validateTheme').mockImplementation(mockThrow);
          await waitFor(() => {
            expect(mockThrow).toHaveBeenCalledTimes(1);
          });
          await waitFor(() => {
            render(<App theme=" invalid" />);
          });
        },
      },
    ],
  );

  describe('user interactions', () => {
    it('changes color on click', async () => {
      const { getByText } = render(<App theme="light" />);
      const colorButton = await getByText('Light');
      fireEvent.click(colorButton);
      expect(document.body.style.backgroundColor).toBe('rgb(240, 242, 244)');
    });

    it('changes theme on input change', async () => {
      const { getByPlaceholderText } = render(<App />);
      const themeInput = await getByPlaceholderText('Theme');
      fireEvent.change(themeInput, { target: { value: 'dark' } });
      expect(document.body.style.backgroundColor).toBe('rgb(33, 33, 33)');
    });

    it('submits form', async () => {
      const { getByPlaceholderText, getByText } = render(<App />);
      const themeInput = await getByPlaceholderText('Theme');
      const submitButton = await getByText('Submit');
      fireEvent.change(themeInput, { target: { value: 'light' } });
      fireEvent.click(submitButton);
      expect(document.body.style.backgroundColor).toBe('rgb(240, 242, 244)');
    });
  });

  describeBlock(
    'side effects',
    [
      {
        title: 'fetches data when theme changes',
        test: async () => {
          const mockFetch = jest.fn();
          jest.spyOn(App, 'fetchTheme').mockImplementation(mockFetch);
          await waitFor(() => {
            render(<App theme="light" />);
            expect(mockFetch).toHaveBeenCalledTimes(1);
          });
        },
      },
    ],
  );

  describeSnapshot('renders with correct styles', () => {
    it('matches snapshot', async () => {
      const { container } = render(<App />);
      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});