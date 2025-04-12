import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MaterialUI } from './MaterialUI';
import '@stoked-ui/docs';
import AppHeaderBanner from './AppHeaderBanner';

describe('MaterialUI component', () => {
  const mockGetCssVars = jest.fn();

  beforeEach(() => {
    mockGetCssVars.mockReset();
  });

  afterEach(() => {
    mockGetCssVars.mockClear();
  });

  it('renders without crashing', () => {
    render(<MaterialUI />);
    expect(screen.getByText('Stoked UI: React components that implement Material Design')).toBeInTheDocument();
  });

  describe('AppHeaderBanner prop', () => {
    const bannerProps = {
      src: 'https://example.com/banner.jpg',
      alt: 'Example banner image',
    };

    it('renders AppHeaderBanner with correct props', () => {
      render(<MaterialUI AppHeaderBanner={bannerProps} />);
      expect(screen.getByText(bannerProps.alt)).toBeInTheDocument();
      expect(screen.getByAltText(bannerProps.alt)).toBeInTheDocument();
    });

    it('does not crash when AppHeaderBanner prop is null', () => {
      render(<MaterialUI AppHeaderBanner={null} />);
      expect(() => screen.getByText('Stoked UI: React components that implement Material Design')).not.toThrow();
    });
  });

  describe('AppHeader prop', () => {
    const headerProps = {
      gitHubRepository: 'https://github.com/mui/material-ui',
    };

    it('renders AppHeader with correct props', () => {
      render(<MaterialUI AppHeader={headerProps} />);
      expect(screen.getByText('Stoked UI: React components that implement Material Design')).toBeInTheDocument();
    });

    it('does not crash when AppHeader prop is null', () => {
      render(<MaterialUI AppHeader={null} />);
      expect(() => screen.getByText('Stoked UI: React components that implement Material Design')).not.toThrow();
    });
  });

  describe('AppFooter prop', () => {
    const footerProps = {
      stackOverflowUrl: 'https://stackoverflow.com/questions/tagged/material-ui',
    };

    it('renders AppFooter with correct props', () => {
      render(<MaterialUI AppFooter={footerProps} />);
      expect(screen.getByText('Stoked UI: React components that implement Material Design')).toBeInTheDocument();
    });

    it('does not crash when AppFooter prop is null', () => {
      render(<MaterialUI AppFooter={null} />);
      expect(() => screen.getByText('Stoked UI: React components that implement Material Design')).not.toThrow();
    });
  });

  describe('AppHeaderBanner user interaction', () => {
    const bannerProps = {
      src: 'https://example.com/banner.jpg',
      alt: 'Example banner image',
    };

    it('calls click event on AppHeaderBanner with correct props', () => {
      render(<MaterialUI AppHeaderBanner={bannerProps} />);
      const bannerElement = screen.getByAltText(bannerProps.alt);
      fireEvent.click(bannerElement);
      expect(mockGetCssVars).toHaveBeenCalledTimes(1);
    });
  });

  describe('AppHeader user interaction', () => {
    const headerProps = {
      gitHubRepository: 'https://github.com/mui/material-ui',
    };

    it('calls click event on AppHeader with correct props', () => {
      render(<MaterialUI AppHeader={headerProps} />);
      const headerElement = screen.getByText('Stoked UI: React components that implement Material Design');
      fireEvent.click(headerElement);
      expect(mockGetCssVars).toHaveBeenCalledTimes(1);
    });
  });

  describe('AppFooter user interaction', () => {
    const footerProps = {
      stackOverflowUrl: 'https://stackoverflow.com/questions/tagged/material-ui',
    };

    it('calls click event on AppFooter with correct props', () => {
      render(<MaterialUI AppFooter={footerProps} />);
      const footerElement = screen.getByText('Stoked UI: React components that implement Material Design');
      fireEvent.click(footerElement);
      expect(mockGetCssVars).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test for MaterialUI component', () => {
    it('renders correct snapshot of MaterialUI component', () => {
      const { asFragment } = render(<MaterialUI />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});