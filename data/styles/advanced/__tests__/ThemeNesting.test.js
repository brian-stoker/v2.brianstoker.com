import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeNesting from './ThemeNesting.test.js';
import ThemeProvider from '@mui/styles/ThemeProvider';
import { create } from 'jest- mock-extended';

describe('ThemeNesting component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const theme = {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    };
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ThemeNesting />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders DeepChild with outer theme', async () => {
    const theme = {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    };
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <ThemeNesting />
      </ThemeProvider>
    );
    expect(getByText('Theme nesting')).toBeInTheDocument();
  });

  it('renders DeepChild with inner theme', async () => {
    create(() => ({
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
    }));

    const { getByText } = render(
      <ThemeProvider theme={({ background, boxShadow }) => ({ background, boxShadow })}>
        <ThemeNesting />
      </ThemeProvider>
    );
    expect(getByText('Theme nesting')).toBeInTheDocument();
  });

  it('renders DeepChild with mixed themes', async () => {
    create(() => ({
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    }));

    const { getByText } = render(
      <ThemeProvider theme={({ background, boxShadow }) => ({ background, boxShadow })}>
        <ThemeNesting />
      </ThemeProvider>
    );

    create(() => ({
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
    }));

    const nestedTheme = {
      ...getByText('Theme nesting').parentElement.getAttribute(
        'data-theme'
      ).split(':')[1],
      ...getByText('Theme nesting').parentElement.getAttribute(
        'data-theme'
      ).split(':')[2],
    };

    expect(getByText('Theme nesting')).toHaveStyleRule(
      'background',
      nestedTheme.background
    );

    expect(getByText('Theme nesting')).toHaveStyleRule(
      'boxShadow',
      nestedTheme.boxShadow
    );
  });

  it('does not throw an error when prop is missing', async () => {
    const { container } = render(<ThemeNesting />);
    expect(container).toBeInTheDocument();
  });
});