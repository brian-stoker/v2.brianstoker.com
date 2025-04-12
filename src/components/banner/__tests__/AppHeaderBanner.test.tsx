import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AppHeaderBanner from './AppHeaderBanner.test.tsx';

describe('AppHeaderBanner component', () => {
  const FeatureToggleMock = {
    enable_website_banner: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AppHeaderBanner />);
    expect(screen.getByText(/Influence SUI's 2024 roadmap!/)).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    const featureToggleMock = {
      enable_website_banner: false,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders hiring message when enabled', () => {
      render(<AppHeaderBanner FeatureToggle={FeatureToggleMock} />);
      expect(screen.getByText(/We're hiring a Designer, Full-stack Engineer, React Community Engineer, and more!/)).toBeInTheDocument();
    });

    it('renders survey message when disabled', () => {
      const featureToggleMock = {
        enable_website_banner: true,
      };
      render(<AppHeaderBanner FeatureToggle={featureToggleMock} />);
      expect(screen.getByText(/Influence SUI's 2024 roadmap!/)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders default message with no props', () => {
      render(<AppHeaderBanner />);
      expect(screen.getByText(/We're hiring a Designer, Full-stack Engineer, React Community Engineer, and more!/)).toBeInTheDocument();
    });

    it('throws error when invalid prop is passed', () => {
      expect(() => render(<AppHeaderBanner invalidProp="test" />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    const featureToggleMock = {
      enable_website_banner: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('clicks link renders default message', () => {
      render(<AppHeaderBanner FeatureToggle={featureToggleMock} />);
      fireEvent.click(screen.getByRole('link'));
      expect(screen.getByText(/We're hiring a Designer, Full-stack Engineer, React Community Engineer, and more!/)).toBeInTheDocument();
    });

    it('clicks link with invalid prop renders error', () => {
      const featureToggleMock = {
        enable_website_banner: true,
      };
      render(<AppHeaderBanner FeatureToggle={featureToggleMock} invalidProp="test" />);
      fireEvent.click(screen.getByRole('link'));
      expect(screen.getByText(/Invalid prop passed!/)).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    const featureToggleMock = {
      enable_website_banner: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(' renders default message when no changes are made to the component state', () => {
      render(<AppHeaderBanner FeatureToggle={featureToggleMock} />);
      expect(screen.getByText(/We're hiring a Designer, Full-stack Engineer, React Community Engineer, and more!/)).toBeInTheDocument();
    });
  });
});