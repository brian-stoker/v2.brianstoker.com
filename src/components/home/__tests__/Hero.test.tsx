import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';
import { createLoading, ThemeToggleButton, ThemeChip, ThemeDatePicker, NotificationCard, TaskCard, PlayerCard, ThemeTimeline, ThemeAccordion, FolderTable, ThemeSlider, ThemeTabs } from './components';
import { MuiThemeProvider } from '@mui/material/styles';

describe('Hero', () => {
  let theme;
  let heroContainer;

  beforeEach(() => {
    theme = { breakpoints: { md: '200px' } };
    heroContainer = render(
      <MuiThemeProvider theme={theme}>
        <Hero />
      </MuiThemeProvider>,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(heroContainer).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders TaskCard on small screens and up', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero isMdUp />
        </MuiThemeProvider>,
      );
      expect(getByText('TaskCard')).toBeInTheDocument();
    });

    it('renders ThemeChip on small screens and up', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero isMdUp />
        </MuiThemeProvider>,
      );
      expect(getByText('ThemeChip')).toBeInTheDocument();
    });

    it('renders NotificationCard on small screens and up', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero isMdUp />
        </MuiThemeProvider>,
      );
      expect(getByText('NotificationCard')).toBeInTheDocument();
    });
  });

  describe('props validation', () => {
    it('renders without crashing when given valid props', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero linearGradient left="test" rightSx={{ p: '10px' }} right={{ test: 'test' }} />
        </MuiThemeProvider>,
      );
      expect(getByText('test')).toBeInTheDocument();
    });

    it('throws an error when given invalid props', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero linearGradient left="test" rightSx={{ p: '10px' }} right={{ invalidProp: 'invalid' }} />
        </MuiThemeProvider>,
      );
      expect(getByText('Invalid prop')).toBeInTheDocument();
    });
  });

  describe('GetStartedButtons', () => {
    it('renders GetStartedButtons with correct label and url', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero />
        </MuiThemeProvider>,
      );
      expect(getByText('Discover the Core libraries')).toBeInTheDocument();
      expect(getByLinkHref('/core/')).toBeInTheDocument();
    });

    it('calls getStarted button clicked callback when clicked', async () => {
      const getStartedButtonClicked = jest.fn();
      render(
        <MuiThemeProvider theme={theme}>
          <Hero getStartedButtonClicked={getStartedButtonClicked} />
        </MuiThemeProvider>,
      );
      const getByText = render(
        <MuiThemeProvider theme={theme}>
          <Hero />
        </MuiThemeProvider>,
      );
      expect(getByText('Discover the Core libraries')).toBeInTheDocument();
      fireEvent.click(getByText('Discover the Core libraries'));
      expect(getStartedButtonClicked).toHaveBeenCalledTimes(1);
    });
  });

  describe('right container', () => {
    it('renders right container on small screens and up', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero isMdUp />
        </MuiThemeProvider>,
      );
      expect(getByText('ThemeChip')).toBeInTheDocument();
    });

    it('renders ThemeAccordion', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <Hero />
        </MuiThemeProvider>,
      );
      expect(getByText('ThemeAccordion')).toBeInTheDocument();
    });
  });
});