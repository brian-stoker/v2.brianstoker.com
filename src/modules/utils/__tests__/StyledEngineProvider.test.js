import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createCache, CacheProvider } from '@emotion/react';
import styled from 'styled-components';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { ThemeProvider } from '@mui/material/styles';

describe('StyledEngineProvider component', () => {
  const cacheLtr = createCache({
    key: 'ltr',
    prepend: true,
  });

  const theme = {
    direction: 'ltr',
  };

  beforeEach(() => {
    globalTheme = { ...theme };
    renderTheme();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(render(<StyledEngineProvider cacheLtr={cacheLtr} />)).not.toThrow();
  });

  describe('conditional rendering', () => {
    const rtl = theme.direction === 'rtl';

    beforeEach(() => {
      renderTheme();
    });

    it('renders with ltr styles when theme direction is ltr', () => {
      expect(render(<StyledEngineProvider cacheLtr={cacheLtr} />)).not.toContain(rtlPlugin);
    });

    it('renders with rtl styles when theme direction is rtl', () => {
      globalTheme.direction = 'rtl';
      renderTheme();
      expect(render(<StyledEngineProvider cacheLtr={cacheLtr} />)).toContain(rtlPlugin);
    });
  });

  describe('prop validation', () => {
    const invalidCache = { invalid: true };

    it('throws an error when prop is invalid', () => {
      expect(() => render(<StyledEngineProvider cacheLtr={invalidCache} />)).toThrow();
    });

    it('renders with valid cache props', () => {
      expect(render(<StyledEngineProvider cacheLtr={cacheLtr} />)).not.toThrow();
    });
  });

  describe('user interactions', () => {
    const mockTheme = { direction: 'ltr' };

    beforeEach(() => {
      renderTheme();
    });

    it('calls theme change function when RTL button is clicked', async () => {
      const onThemeChangeMock = jest.fn();
      globalTheme.direction = 'rtl';
      document.body.innerHTML = '<button onclick="changeTheme()">';

      await render(
        <ThemeProvider theme={mockTheme}>
          <StyledEngineProvider cacheLtr={cacheLtr} />
        </ThemeProvider>,
      );

      fireEvent.click(document.querySelector('button'));

      expect(onThemeChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls theme change function when LTR button is clicked', async () => {
      const onThemeChangeMock = jest.fn();
      globalTheme.direction = 'ltr';
      document.body.innerHTML = '<button onclick="changeTheme()">';

      await render(
        <ThemeProvider theme={mockTheme}>
          <StyledEngineProvider cacheLtr={cacheLtr} />
        </ThemeProvider>,
      );

      fireEvent.click(document.querySelector('button'));

      expect(onThemeChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    const mockCache = createCache({
      key: 'mock',
      prepend: true,
    });

    it('calls cache update function when theme changes', async () => {
      const onCacheUpdateMock = jest.fn();
      globalTheme.direction = 'rtl';

      await render(
        <ThemeProvider theme={globalTheme}>
          <StyledEngineProvider cacheLtr={cacheLtr} />
        </ThemeProvider>,
      );

      expect(onCacheUpdateMock).toHaveBeenCalledTimes(1);
    });
  });

  function renderTheme() {
    document.body.innerHTML = `
      <button onclick="changeTheme()">
        ${globalTheme.direction === 'rtl' ? 'RTL' : 'LTR'}
      </button>
      <StyledEngineProvider cacheLtr={cacheLtr} />
    `;
  }
});

export default StyledEngineProvider;