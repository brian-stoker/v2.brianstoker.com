import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { configure as vitestConfigure } from 'vitest';
import userEvent from '@testing-library/user-event';
import FeatureToggle from './FeatureToggle';

const FeatureToggleMock = ({ enable_website_banner, enable_toc_banner, enable_docsnav_banner, enable_job_banner }) => {
  return <div>Feature Toggle Mock</div>;
};

vitestConfigure({
  test: {
    coverageDirectory: '.coverage',
  },
});

describe('Feature Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<FeatureToggle />);
    expect(container).toBeInTheDocument();
  });

  describe('Props', () => {
    it('accepts valid props', async () => {
      const mockProps = {
        enable_website_banner: true,
        enable_toc_banner: false,
        enable_docsnav_banner: false,
        enable_job_banner: false,
      };
      render(<FeatureToggle {...mockProps} />);
      expect(FeatureToggleMock).toHaveProp('enable_website_banner', mockProps.enable_website_banner);
    });

    it('rejects invalid props', async () => {
      const mockProps = {
        enable_website_banner: 'invalid',
        enable_toc_banner: false,
        enable_docsnav_banner: false,
        enable_job_banner: false,
      };
      expect(() => render(<FeatureToggle {...mockProps} />)).toThrowError();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders website banner when enabled', async () => {
      const { getByText } = render(<FeatureToggle enable_website_banner />);
      expect(getByText('Website Banner')).toBeInTheDocument();
    });

    it('does not render website banner when disabled', async () => {
      const { queryByText } = render(<FeatureToggle enable_website_banner={false} />);
      expect(queryByText('Website Banner')).not.toBeInTheDocument();
    });

    it('renders toc banner when enabled', async () => {
      const { getByText } = render(<FeatureToggle enable_toc_banner />);
      expect(getByText('TOC Banner')).toBeInTheDocument();
    });

    it('does not render toc banner when disabled', async () => {
      const { queryByText } = render(<FeatureToggle enable_toc_banner={false} />);
      expect(queryByText('TOC Banner')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('clicks on banner with correct classes', async () => {
      const { getByText, getByRole } = render(<FeatureToggle />);
      const banner = getByRole('button');
      expect(banner).toHaveClass('feature-toggle-banner-clicked');
      fireEvent.click(banner);
      expect(banner).not.toHaveClass('feature-toggle-banner-clicked');
    });

    it('clicks on banner with correct classes', async () => {
      const { getByText, getByRole } = render(<FeatureToggle enable_website_banner />);
      const banner = getByRole('button');
      expect(banner).toHaveClass('feature-toggle-banner-enabled');
      fireEvent.click(banner);
      expect(banner).not.toHaveClass('feature-toggle-banner-enabled');
    });

    it('changes input field with correct classes', async () => {
      const { getByLabelText, getByRole } = render(<FeatureToggle />);
      const inputField = getByLabelText('Input Field');
      userEvent.type(inputField, 'test');
      expect(inputField).toHaveClass('feature-toggle-input-field-changed');
    });

    it('form submission works correctly', async () => {
      const { getByRole, getByLabelText } = render(<FeatureToggle />);
      const inputField = getByLabelText('Input Field');
      userEvent.type(inputField, 'test');
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(getByRole('form')).toHaveClass('feature-toggle-form-submitted');
    });
  });

  describe('Side Effects', () => {
    it('state changes correctly when banner is clicked', async () => {
      const { getByText, getByRole } = render(<FeatureToggle />);
      const banner = getByRole('button');
      fireEvent.click(banner);
      expect(FeatureToggleMock.props).toHaveProperty('updateState');
    });

    it('state changes correctly when input field changes', async () => {
      const { getByLabelText, getByRole } = render(<FeatureToggle />);
      const inputField = getByLabelText('Input Field');
      userEvent.type(inputField, 'test');
      expect(FeatureToggleMock.props).toHaveProperty('updateState');
    });

    it('form submission updates state correctly', async () => {
      const { getByRole, getByLabelText } = render(<FeatureToggle />);
      const inputField = getByLabelText('Input Field');
      userEvent.type(inputField, 'test');
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(FeatureToggleMock.props).toHaveProperty('updateState');
    });
  });

  it('renders correctly with mock props', async () => {
    render(<FeatureToggleMock />);
    expect(FeatureToggleMock).toMatchSnapshot();
  });
});