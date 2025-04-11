import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import constants from './constants';

describe('Constants', () => {
  const { CODE_VARIANTS, LANGUAGES_LABEL, CODE_STYLING, GA_ADS_DISPLAY_RATIO } = constants;

  beforeEach(() => {
    // setup any mocks or test dependencies here
  });

  afterEach(() => {
    // cleanup any mocks or test dependencies here
  });

  it('renders without crashing', () => {
    const { container } = render(<constants />);
    expect(container).toBeInTheDocument();
  });

  it('renders all prop types', () => {
    expect(CODE_VARIANTS).toEqual({
      JS: 'JS',
      TS: 'TS',
    });
    expect(LANGUAGES_LABEL).toEqual([
      {
        code: 'en',
        text: 'English',
      },
    ]);
    expect(CODE_STYLING).toEqual({
      SYSTEM: 'SUI System',
      TAILWIND: 'Tailwind',
      CSS: 'CSS',
    });
    expect(GA_ADS_DISPLAY_RATIO).toBe(0.1);
  });

  it('renders all conditional rendering paths', () => {
    const { container } = render(<constants />);
    expect(container).toMatchSnapshot();
  });

  describe('prop validation', () => {
    it('throws an error if CODE_VARIANTS is invalid', () => {
      expect(() => constants({})).toThrowError(
        'Invalid prop: CODE_VARIANTS. Expected object with keys JS, TS'
      );
    });

    it('throws an error if LANGUAGES_LABEL is invalid', () => {
      expect(() => constants({ LANGUAGES_LABEL: undefined })).toThrowError(
        'Invalid prop: LANGUAGES_LABEL. Expected array of objects with code and text properties'
      );
    });
  });

  describe('user interactions', () => {
    it('does not submit form on click', async () => {
      const { getByText, getByRole } = render(<constants />);
      const button = getByText('Click me');
      fireEvent.click(button);
      expect(getByText('Form submitted')).not.toBeInTheDocument();
    });

    it('updates state when input changes', async () => {
      const { getByPlaceholderText, getByRole } = render(<constants />);
      const input = getByPlaceholderText('Type something');
      fireEvent.change(input, { target: { value: 'Hello World' } });
      expect(getByText('Updated text')).toBeInTheDocument();
    });

    it('submits form on submit', async () => {
      const { getByText, getByRole } = render(<constants />);
      const button = getByText('Submit');
      fireEvent.click(button);
      expect(getByText('Form submitted')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('calls external API when updated', async () => {
      const fetchMock = jest.fn(() => Promise.resolve());
      const { container } = render(<constants />, { wrapper: () => <div>...</div>, global: { fetch: fetchMock } });
      // simulate update
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test', () => {
    it('matches the snapshot', async () => {
      const { container } = render(<constants />);
      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});