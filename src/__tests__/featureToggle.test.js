import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@stoked-ui/docs-markdown';
import FeatureToggle from './FeatureToggle';

describe('Feature Toggle', () => {
  const featureToggle = {
    enable_website_banner: false,
    enable_toc_banner: true,
    enable_docsnav_banner: false,
    enable_job_banner: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<FeatureToggle />);
      expect(container).not.toBeNull();
    });

    it('renders conditional banners based on feature toggle props', async () => {
      const { getByText, getAllByRole } = render(
        <FeatureToggle
          enable_website_banner={false}
          enable_toc_banner={true}
          enable_docsnav_banner={false}
          enable_job_banner={false}
        />
      );

      expect(getByText('TOC Banner')).toBeInTheDocument();
    });

    it('renders job banner when feature toggle is enabled', async () => {
      const { getByText, getAllByRole } = render(
        <FeatureToggle
          enable_website_banner={false}
          enable_toc_banner={true}
          enable_docsnav_banner={false}
          enable_job_banner={true}
        />
      );

      expect(getByText('Job Banner')).toBeInTheDocument();
    });

    it('does not render any banners when all features are disabled', async () => {
      const { getAllByRole } = render(
        <FeatureToggle
          enable_website_banner={false}
          enable_toc_banner={false}
          enable_docsnav_banner={false}
          enable_job_banner={false}
        />
      );

      expect(getAllByRole('region')).toHaveLength(0);
    });
  });

  describe('Prop Validation', () => {
    it('validates feature toggle props', async () => {
      const { getByText, getAllByRole } = render(
        <FeatureToggle
          enable_website_banner="invalid"
          enable_toc_banner={true}
          enable_docsnav_banner={false}
          enable_job_banner={false}
        />
      );

      expect(getByText('Invalid prop: enable_website_banner')).toBeInTheDocument();
    });

    it('validates all feature toggle props', async () => {
      const { getByText, getAllByRole } = render(
        <FeatureToggle
          enable_website_banner="invalid"
          enable_toc_banner={true}
          enable_docsnav_banner="invalid"
          enable_job_banner={false}
        />
      );

      expect(getByText('Invalid prop: enable_docsnav_banner')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('toggles banner when clicked', async () => {
      const { getByText } = render(
        <FeatureToggle
          enable_website_banner={false}
          enable_toc_banner={true}
          enable_docsnav_banner={false}
          enable_job_banner={false}
        />
      );

      const toggleButton = getByText('Toggle Banners');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(getByText('TOC Banner')).not.toBeInTheDocument();
        expect(getByText('Job Banner')).toBeInTheDocument();
      });
    });

    it('does not change banner when clicked while all features are disabled', async () => {
      const { getByText } = render(
        <FeatureToggle
          enable_website_banner={false}
          enable_toc_banner={false}
          enable_docsnav_banner={false}
          enable_job_banner={false}
        />
      );

      const toggleButton = getByText('Toggle Banners');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(getByText('TOC Banner')).toBeInTheDocument();
        expect(getByText('Job Banner')).not.toBeInTheDocument();
      });
    });

    it('updates banner text on input change', async () => {
      const { getByText, byRole } = render(
        <FeatureToggle
          enable_website_banner={true}
          enable_toc_banner={false}
          enable_docsnav_banner={false}
          enable_job_banner={false}
          value="new-value"
        />
      );

      const inputField = byRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new-value' } });

      await waitFor(() => {
        expect(getByText('Website Banner')).toBeInTheDocument();
        expect(getByText('TOC Banner')).not.toBeInTheDocument();
        expect(getByText('Job Banner')).not.toBeInTheDocument();
      });
    });
  });
});