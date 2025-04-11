import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import createEmotionCache from './createEmotionCache';

describe('createEmotionCache', () => {
  let cache: any;

  beforeEach(() => {
    // Create a mock CSS class
    const mockClass = 'mock-class';
    global.document.createElement = jest.fn((type) => {
      return {
        type,
        props: { className: mockClass },
      };
    });

    // Reset document element creation after each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    cache = null;
  });

  it('renders without crashing', () => {
    const { container } = render(createEmotionCache());
    expect(container).toBeInTheDocument();
  });

  describe('props', () => {
    const props: any = {
      key: 'css',
      prepend: true,
      stylisPlugins: [prefixer, globalSelector],
    };

    it('renders with default props', () => {
      cache = createEmotionCache(props);
      expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      });
    });

    it('renders without prop errors', () => {
      const invalidProps = { key: 'css', prepend: null, stylisPlugins: [] };
      expect(() => createEmotionCache(invalidProps)).not.toThrow();
    });
  });

  describe('conditional rendering', () => {
    const props = {
      key: 'css',
      prepend: false,
      stylisPlugins: [prefixer, globalSelector],
    };

    it('renders without styles when prepend is false', () => {
      cache = createEmotionCache(props);
      expect(cache).toEqual({
        key: 'css',
        prepend: false,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      });
    });

    it('renders with styles when prepend is true', () => {
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, globalSelector] });
      expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      });
    });

    it('renders without styles when stylisPlugins is empty', () => {
      const props = { key: 'css', prepend: false, stylisPlugins: [] };
      cache = createEmotionCache(props);
      expect(cache).toEqual({
        key: 'css',
        prepend: false,
        stylisPlugins: [],
      });
    });
  });

  describe('user interactions', () => {
    const props = {
      key: 'css',
      prepend: true,
      stylisPlugins: [prefixer, globalSelector],
    };

    it('calls the globalSelector function on element click', async () => {
      const mockGlobalSelector = jest.fn();
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      const { getByText } = render(createEmotionCache());
      fireEvent.click(getByText('mock-class'));
      await waitFor(() => expect(mockGlobalSelector).toHaveBeenCalledTimes(1));
    });

    it('calls the globalSelector function on element change', async () => {
      const mockGlobalSelector = jest.fn();
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      const { getByText } = render(createEmotionCache());
      fireEvent.change(getByText('mock-class'), { target: { className: '' } });
      await waitFor(() => expect(mockGlobalSelector).toHaveBeenCalledTimes(1));
    });

    it('calls the globalSelector function on form submission', async () => {
      const mockGlobalSelector = jest.fn();
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      const { getByText } = render(createEmotionCache());
      fireEvent.change(getByText('mock-class'), { target: { className: '' } });
      fireEvent.submit(getByText('Mock Form'));
      await waitFor(() => expect(mockGlobalSelector).toHaveBeenCalledTimes(1));
    });
  });

  describe('state changes', () => {
    const props = {
      key: 'css',
      prepend: true,
      stylisPlugins: [prefixer, globalSelector],
    };

    it('sets the cache when the globalSelector function is updated', async () => {
      const mockGlobalSelector = jest.fn();
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      });

      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      await waitFor(() => expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      }));
    });

    it('sets the cache when the style class is updated', async () => {
      const mockGlobalSelector = jest.fn();
      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      });

      cache = createEmotionCache({ key: 'css', prepend: true, stylisPlugins: [prefixer, mockGlobalSelector] });
      fireEvent.click(getByText('mock-class'));
      await waitFor(() => expect(cache).toEqual({
        key: 'css',
        prepend: true,
        stylisPlugins: [
          prefixer,
          (element) => globalSelector(element),
        ],
      }));
    });
  });

  it.snapshot('renders with default props', () => {
    const { container } = render(createEmotionCache());
    expect(container).toMatchSnapshot();
  });
});