import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppHeaderBanner from './AppHeaderBanner.test.tsx';
import { FeatureToggleMock, RoutingMock } from './mocks';

describe('AppHeaderBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering without crashing', () => {
    it('renders without crashing with valid props', async () => {
      const { container } = render(
        <FeatureToggleMock>
          <AppHeaderBanner />
        </FeatureToggleMock>
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Conditional rendering', () => {
    it('renders default hiring message when feature toggle is disabled', async () => {
      const { getByText } = render(
        <FeatureToggleMock disableWebsiteBanner={true}>
          <AppHeaderBanner />
        </FeatureToggleMock>
      );
      expect(getByText('We're hiring a Designer, Full-stack Engineer, React Community Engineer, and more!')).toBeInTheDocument();
    });

    it('renders survey message when feature toggle is enabled', async () => {
      const { getByText } = render(
        <FeatureToggleMock disableWebsiteBanner={false}>
          <AppHeaderBanner />
        </FeatureToggleMock>
      );
      expect(getByText('Influence SUI's 2024 roadmap! Participate in the latest')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('throws an error when invalid props are passed', async () => {
      await expect(() => render(<AppHeaderBanner />)).toThrowError(
        'AppHeaderBanner received an invalid prop: bannerMessage'
      );
    });
  });

  describe('User interactions', () => {
    let appHeaderBannerRef;

    beforeEach(() => {
      appHeaderBannerRef = render(
        <FeatureToggleMock disableWebsiteBanner={false}>
          <AppHeaderBanner />
        </FeatureToggleMock>
      ).container;
    });

    it('dispatches a click event when the link is clicked', async () => {
      const link = appHeaderBannerRef.querySelector('a') as HTMLAnchorElement;
      fireEvent.click(link);
      expect(link.dataset.clicked).toBe('true');
    });

    it('renders the correct message with a click event', async () => {
      await waitFor(() => {
        const defaultHiringMessageText = appHeaderBannerRef
          .querySelector('.MuiTypography-bodyMedium')
          .textContent;
        expect(defaultHiringMessageText).toBe(
          'We\'re hiring a Designer, Full-stack Engineer, React Community Engineer, and more!'
        );
      });
    });

    it('renders the correct message when the link is hovered', async () => {
      await waitFor(() => {
        const surveyMessageText = appHeaderBannerRef
          .querySelector('.MuiTypography-bodyMedium')
          .textContent;
        expect(surveyMessageText).toBe(
          'Influence SUI\'s 2024 roadmap! Participate in the latest'
        );
      });
    });

    it('renders a link with focus', async () => {
      const link = appHeaderBannerRef.querySelector('a') as HTMLAnchorElement;
      link.focus();
      expect(link.getAttribute('aria-focused')).toBe('true');
    });

    it('renders the default message without any input changes', async () => {
      const defaultHiringMessageText = appHeaderBannerRef
        .querySelector('.MuiTypography-bodyMedium')
        .textContent;
      expect(defaultHiringMessageText).toBe(
        'We\'re hiring a Designer, Full-stack Engineer, React Community Engineer, and more!'
      );
    });

    it('renders the survey message with an input change', async () => {
      await waitFor(() => {
        const surveyMessageText = appHeaderBannerRef
          .querySelector('.MuiTypography-bodyMedium')
          .textContent;
        expect(surveyMessageText).toBe(
          'Influence SUI\'s 2024 roadmap! Participate in the latest'
        );
      });
    });

    it('renders the default hiring message when form is submitted', async () => {
      const defaultHiringMessageText = appHeaderBannerRef
        .querySelector('.MuiTypography-bodyMedium')
        .textContent;
      await waitFor(() => {
        fireEvent.change(appHeaderBannerRef.querySelector('input') as HTMLInputElement);
        expect(defaultHiringMessageText).toBe(
          'We\'re hiring a Designer, Full-stack Engineer, React Community Engineer, and more!'
        );
      });
    });
  });

  describe('Mocked dependencies', () => {
    it('returns the correct banner message with FeatureToggleMock', async () => {
      const { getByText } = render(<AppHeaderBanner />);
      expect(getByText('Influence SUI\'s 2024 roadmap! Participate in the latest')).toBeInTheDocument();
    });

    it('renders default hiring message when RoutingMock is used', async () => {
      const { getByText } = render(
        <RoutingMock>
          <AppHeaderBanner />
        </RoutingMock>
      );
      expect(getByText('We\'re hiring a Designer, Full-stack Engineer, React Community Engineer, and more!')).toBeInTheDocument();
    });
  });

  describe('Snapshot testing', () => {
    it('renders correctly with snapshot test', async () => {
      const { asFragment } = render(<AppHeaderBanner />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});