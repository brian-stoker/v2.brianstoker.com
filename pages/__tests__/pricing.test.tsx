import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Pricing from './Pricing';
import { LicensingModelProvider } from './components/pricing/LicensingModelContext';

describe('Pricing component', () => {
  const mockHeadProps = {
    title: 'Test Title',
    description: 'Test Description',
    card: '/static/social-previews/pricing-preview.jpg',
  };

  const mockAppHeaderBannerProps = {
    bannerText: 'Test Banner Text',
  };

  const mockLicensingModelProviderValue = {
    licenseModel: 'testLicenseModel',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(container).toBeInTheDocument();
  });

  it('renders HeroPricing correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Hero Pricing')).toBeInTheDocument();
  });

  it('renders PricingTable correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Pricing Table')).toBeInTheDocument();
  });

  it('renders PricingList correctly for mobile and tablet', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Pricing List')).toBeInTheDocument();
  });

  it('renders PricingWhatToExpect correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('What to Expect')).toBeInTheDocument();
  });

  it('renders PricingFAQ correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('FAQ')).toBeInTheDocument();
  });

  it('renders Testimonials correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Testimonials')).toBeInTheDocument();
  });

  it('renders HeroEnd correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Hero End')).toBeInTheDocument();
  });

  it('renders AppHeader correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('App Header')).toBeInTheDocument();
  });

  it('renders AppFooter correctly', () => {
    const { getByText } = render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('App Footer')).toBeInTheDocument();
  });

  it('renders with valid props', () => {
    const { getByText } = render(
      <Pricing
        head={{ title: 'Test Title', description: 'Test Description' }}
        appHeaderBanner={{ bannerText: 'Test Banner Text' }}
        licensingModelProvider={{ licenseModel: 'testLicenseModel' }}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with invalid props', () => {
    const { getByText } = render(
      <Pricing
        head={{ title: null, description: 'Test Description' }}
        appHeaderBanner={{ bannerText: null }}
        licensingModelProvider={{ licenseModel: null }}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(getByText('Error')).toBeInTheDocument();
  });

  it('calls Head component with correct props', () => {
    const headProps = { title: 'Test Title', description: 'Test Description' };
    jest.spyOn(Head, 'default').mockImplementation(() => <div />);
    render(
      <Pricing
        head={headProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(Head.default).toHaveBeenCalledWith(headProps);
  });

  it('calls AppHeaderBanner component with correct props', () => {
    const appHeaderBannerProps = { bannerText: 'Test Banner Text' };
    jest.spyOn(AppHeaderBanner, 'default').mockImplementation(() => <div />);
    render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={appHeaderBannerProps}
        licensingModelProvider={LicensingModelProvider}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(AppHeaderBanner.default).toHaveBeenCalledWith(appHeaderBannerProps);
  });

  it('calls LicensingModelProvider component with correct props', () => {
    const licenseModel = 'testLicenseModel';
    jest.spyOn(LicensingModelProvider, 'default').mockImplementation(() => <div />);
    render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={{ licenseModel }}
        value={mockLicensingModelProviderValue}
      />,
    );
    expect(LicensingModelProvider.default).toHaveBeenCalledWith(licenseModel);
  });

  it('calls LicensingModelProvider component with correct value', () => {
    const licenseModel = 'testLicenseModel';
    jest.spyOn(LicensingModelProvider, 'default').mockImplementation(() => <div />);
    render(
      <Pricing
        head={mockHeadProps}
        appHeaderBanner={mockAppHeaderBannerProps}
        licensingModelProvider={{ licenseModel }}
        value={licenseModel}
      />,
    );
    expect(LicensingModelProvider.default).toHaveBeenCalledWith(licenseModel);
  });
});