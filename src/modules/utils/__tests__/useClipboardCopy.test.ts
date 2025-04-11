import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useClipboardCopy } from './useClipboardCopy';

jest.mock('clipboard-copy', () => ({
  async copy(text: string) {
    // Mock clipboardCopy implementation
    return Promise.resolve();
  },
}));

describe('useClipboardCopy', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any mock calls made previously
  });

  it('renders without crashing', () => {
    const { result, waitForNextUpdate } = renderHook(useClipboardCopy);
    expect(result.current).not.toBeNull();
    waitForNextUpdate();
  });

  describe('copy function', () => {
    it('calls copy with correct text when called', async () => {
      // Arrange
      const text = 'mocked-text';
      const { result, waitForNextUpdate } = renderHook(useClipboardCopy);
      const mockCopy = jest.fn(() => Promise.resolve());

      // Act
      await result.current.copy(text);

      // Assert
      expect(mockCopy).toHaveBeenCalledTimes(1);
      expect(mockCopy).toHaveBeenCalledWith(text);
    });

    it('calls copy with correct text after timeout', async () => {
      // Arrange
      const text = 'mocked-text';
      const { result, waitForNextUpdate } = renderHook(useClipboardCopy);

      // Act
      await new Promise(resolve => setTimeout(resolve, 1200));
      result.current.copy(text);

      // Assert
      expect(result.current.isCopied).toBe(true);
    });

    it('sets isCopied to false after timeout', async () => {
      // Arrange
      const text = 'mocked-text';
      const { result, waitForNextUpdate } = renderHook(useClipboardCopy);

      // Act
      await new Promise(resolve => setTimeout(resolve, 1200));
      result.current.copy(text);
      await new Promise(resolve => setTimeout(resolve));

      // Assert
      expect(result.current.isCopied).toBe(false);
    });

    it('calls copy with valid props', async () => {
      const text = 'mocked-text';
      const { result } = renderHook(useClipboardCopy);

      try {
        await result.current.copy(text);
      } catch (error) {
        // ignore error
      }

      expect(result.current.isCopied).toBe(true);
    });

    it('does not call copy with invalid props', async () => {
      const text = 'mocked-text';
      const { result, waitForNextUpdate } = renderHook(useClipboardCopy);

      try {
        await result.current.copy(null); // Invalid prop
      } catch (error) {
        expect(error).not.toBeDefined();
      }

      expect(result.current.isCopied).toBe(false);
    });
  });

  it('returns correct initial state', () => {
    const { result, waitForNextUpdate } = renderHook(useClipboardCopy);

    expect(result.current.isCopied).toBe(false);
  });

  describe('side effects', () => {
    it('sets mounted to true when component mounts', () => {
      // Arrange
      const { result } = renderHook(useClipboardCopy);

      // Act
      result.rerender();

      // Assert
      expect(result.current.mounted).toBe(true);
    });

    it('sets mounted to false when component unmounts', () => {
      // Arrange
      const { result } = renderHook(useClipboardCopy);

      // Act
      result.rerender();
      result.current.copy('mocked-text');

      result.unrender();

      // Assert
      expect(result.current.mounted).toBe(false);
    });
  });

  describe('snapshot test', () => {
    it('matches snapshot', async () => {
      const { result } = renderHook(useClipboardCopy);

      await new Promise(resolve => setTimeout(resolve));
      result.current.copy('mocked-text');

      expect(result.current.isCopied).toBe(true);
    });
  });
});