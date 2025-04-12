import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import createEmotionCache from './createEmotionCache';

describe('Create Emotion Cache', () => {
  let cache;
  let renderWithCache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = createEmotionCache();
    renderWithCache = (component: React.ReactElement) => {
      const { result } = render(component, {
        wrapper: ({ children }) => <div>{cache}</div>,
      });
      return result;
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Render', () => {
    it('should render without crashing', async () => {
      const { container } = renderWithCache(<Element />);
      expect(container).toBeInstanceOf(Object);
    });

    it('should render with prefixer and global selector', async () => {
      const { container } = renderWithCache(<Element />);
      expect(container.querySelector('[data-prefixed]="')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept a key prop', async () => {
      const { container } = renderWithCache(
        <Element key="test-key" />,
      );
      expect(container.querySelector('[data-key="test-key"]')).toBeInTheDocument();
    });

    it('should not crash with invalid key prop', async () => {
      const { container } = renderWithCache(<Element key="non-existent-key" />);
      expect(container).toBeInstanceOf(Object);
    });
  });

  describe('Conditional Rendering', () => {
    it('should render CSS if prepend is true', async () => {
      const { container } = renderWithCache(
        <Element prepend={true} />,
      );
      expect(container.querySelector('[data-prepend]').classList.contains('css')).toBe(true);
    });

    it('should not render CSS if prepend is false', async () => {
      const { container } = renderWithCache(<Element />);
      expect(container.querySelector('[data-prepend]')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle clicks on the cache component', async () => {
      const handleCacheClick = jest.fn();
      const { getByText } = renderWithCache(
        <Element onClick={handleCacheClick}>Click me!</Element>,
      );
      await waitFor(() => expect(handleCacheClick).toHaveBeenCalledTimes(1));
    });

    it('should not crash with invalid key prop on click', async () => {
      const { container } = renderWithCache(<Element key="non-existent-key" />);
      const handleCacheClick = jest.fn();
      container.querySelector('element')?.addEventListener('click', handleCacheClick);
      expect(handleCacheClick).not.toHaveBeenCalled();
    });
  });

  describe('Snapshot Test', () => {
    it('should match the snapshot', async () => {
      const { asFragment } = renderWithCache(<Element />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});