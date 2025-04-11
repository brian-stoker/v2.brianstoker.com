import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, beforeEach, afterEach, test } from 'vitest';
import BuildServiceWorker from './BuildServiceWorker';

describe('BuildServiceWorker component', () => {
  const mockRun = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    test('renders without crashing', async () => {
      await render(<BuildServiceWorker />);
      expect(mockRun).not.toHaveBeenCalled();
    });

    test('renders with uuid prop', async () => {
      const { getByText } = render(<BuildServiceWorker uuid="test-uuid" />);
      expect(getByText(`// uuid: ${new Date().toISOString()}`)).toBeInTheDocument();
    });

    test('renders without uuid prop', async () => {
      await render(<BuildServiceWorker />);
      expect(mockRun).not.toHaveBeenCalled();
    });
  });

  describe('prop validation', () => {
    test('valid uuid prop', async () => {
      await render(<BuildServiceWorker uuid="test-uuid" />);
      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    test('invalid uuid prop', async () => {
      const { getByText } = render(<BuildServiceWorker uuid=" invalid-uuid" />);
      expect(getByText(`// uuid: ${new Date().toISOString()}`)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    test('calls run when component mounts', async () => {
      await render(<BuildServiceWorker />);
      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    test('does not call run when uuid prop is invalid', async () => {
      const { getByText } = render(<BuildServiceWorker uuid="invalid-uuid" />);
      expect(getByText(`// uuid: ${new Date().toISOString()}`)).toBeInTheDocument();
      await Promise.resolve();
      expect(mockRun).not.toHaveBeenCalled();
    });
  });

  describe('side effects', () => {
    test('calls run when component is updated', async () => {
      const { getByText } = render(<BuildServiceWorker />);
      // wait for uuid to be updated
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(getByText(`// uuid: ${new Date().toISOString()}`)).toBeInTheDocument();
    });
  });

  test('returns correct string', async () => {
    const { getByText } = render(<BuildServiceWorker />);
    expect(getByText('Successfully built service worker')).toBeInTheDocument();
  });
});