import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, beforeEach, afterEach } from '@vitest/core';
import { bootstrap } from './bootstrap';

describe('Bootstrap Component', () => {
  const setup = (props) => render(<Bootstrap {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders without crashing', async () => {
    const { container } = setup({});

    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    test('renders code block when language is provided', async () => {
      const { container, getByText } = setup({
        language: 'java',
      });

      expect(getByText(/java/)).not.toBeNull();
    });

    test('does not render code block when language is not provided', async () => {
      const { container } = setup({});

      expect(container).not.toContainElement(null);
    });
  });

  describe('prop validation', () => {
    test('accepts valid props', async () => {
      const { container, getByText } = setup({
        language: 'java',
        code: 'System.out.println("Hello World");',
      });

      expect(getByText(/java/)).not.toBeNull();
    });

    test('rejects invalid props', async () => {
      const { container, getByText } = setup({
        language: '',
        code: 'System.out.println("Hello World");',
      });

      expect(getByText(/java/)).toBeNull();
    });
  });

  describe('user interactions', () => {
    test('allows language selection by changing language prop', async () => {
      const { getByText, getByRole } = setup({
        code: 'System.out.println("Hello World");',
      });

      fireEvent.change(getByRole('combobox'), { target: { value: 'python' } });
      expect(getByText(/python/)).not.toBeNull();
    });

    test('allows code changes by changing code prop', async () => {
      const { getByText, getByRole } = setup({
        language: 'java',
      });

      fireEvent.change(getByRole('textbox'), { target: { value: 'System.out.println("Hello World");' } });
      expect(getByText(/hello world/)).not.toBeNull();
    });

    test('allows code changes by clicking on the code box', async () => {
      const { getByText, getByRole } = setup({
        language: 'java',
      });

      fireEvent.click(getByText(/java/));
      expect(getByText(/hello world/)).not.toBeNull();
    });
  });

  describe('side effects', () => {
    test('includes a side effect that changes the component state', async () => {
      const { getByText, getByRole } = setup({
        language: 'java',
      });

      fireEvent.click(getByRole('combobox'));
      expect(getByText(/python/)).not.toBeNull();
    });
  });
});