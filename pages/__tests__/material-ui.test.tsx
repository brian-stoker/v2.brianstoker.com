import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MaterialUI from './MaterialUI';
import Head from './components/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import AppHeader from './layouts/AppHeader';
import MaterialHero from './productMaterial/MaterialHero';
import MaterialComponents from './productMaterial/MaterialComponents';
import MaterialTheming from './productMaterial/MaterialTheming';
import MaterialStyling from './productMaterial/MaterialStyling';
import MaterialTemplates from './productMaterial/MaterialTemplates';
import MaterialDesignKits from './productMaterial/MaterialDesignKits';
import MaterialEnd from './productMaterial/MaterialEnd';
import References, { CORE_CUSTOMERS } from './components/home/References';
import AppFooter from './layouts/AppFooter';
import AppHeaderBanner from './banner/AppHeaderBanner';

jest.mock('@stoked-ui/docs', () => ({
  BrandingCssVarsProvider: jest.fn(),
}));

describe('MaterialUI component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering tests', () => {
    it('renders without crashing', async () => {
      const { container } = render(<MaterialUI />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Conditional rendering tests', () => {
    it('renders Head component', async () => {
      const { getByText } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('Stoked UI: React components that implement Material Design')).toBeInTheDocument());
    });

    it('renders AppHeaderBanner component', async () => {
      const { getByText } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('AppHeaderBanner')).toBeInTheDocument());
    });

    it('renders AppHeader component', async () => {
      const { getByText } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('AppHeader')).toBeInTheDocument());
    });

    it('renders References component with valid props', async () => {
      const { getByText } = render(<References companies={CORE_CUSTOMERS} />);
      await waitFor(() => expect(getByText(CORE_CUSTOMERS.join(', '))).toBeInTheDocument());
    });

    it('renders MaterialEnd component', async () => {
      const { getByText } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('MaterialEnd')).toBeInTheDocument());
    });
  });

  describe('Prop validation tests', () => {
    it('validates title prop for Head component', async () => {
      const headProps = { title: '' };
      const { error } = render(<Head {...headProps} />);
      expect(error).toBeInstanceOf(Error);
    });

    it('validates description prop for Head component', async () => {
      const headProps = { description: '' };
      const { error } = render(<Head {...headProps} />);
      expect(error).toBeInstanceOf(Error);
    });

    it('validates card prop for Head component', async () => {
      const headProps = { card: undefined };
      const { error } = render(<Head {...headProps} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('User interaction tests', () => {
    it('triggers gitHubRepository link click', async () => {
      const { getByText, getAllByRole } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('gitHubRepository')).toBeInTheDocument());
      const link = document.querySelector(`a:has(${getByText('gitHubRepository')})`);
      fireEvent.click(link);
    });

    it('triggers AppHeaderBanner click', async () => {
      const { getByText, getAllByRole } = render(<MaterialUI />);
      await waitFor(() => expect(getByText('AppHeaderBanner')).toBeInTheDocument());
      const bannerLink = document.querySelector(`a:has(${getByText('AppHeaderBanner')})`);
      fireEvent.click(bannerLink);
    });
  });

  describe('Snapshot tests', () => {
    it('renders MaterialUI component with correct styles', async () => {
      const { asFragment } = render(<MaterialUI />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});