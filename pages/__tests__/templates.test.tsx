import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TemplateHero from 'src/components/productTemplate/TemplateHero';
import ValueProposition from 'src/components/home/ValueProposition';
import TemplateDemo from 'src/components/productTemplate/TemplateDemo';
import Testimonials from 'src/components/home/Testimonials';
import HeroEnd from 'src/components/home/HeroEnd';
import AppHeader from 'src/layouts/AppHeader';
import Head from 'src/modules/components/Head';
import AppFooter from 'src/layouts/AppFooter';
import { createMockBrandingCssVarsProvider } from './mocks';
import Templates from './Templates';

describe('Templates component', () => {
  const props = {
    title: 'Test Title',
    description: 'Test Description',
    card: '/static/social-previews/templates-preview.jpg'
  };

  let brandingCssVarsProviderMock;

  beforeEach(() => {
    brandingCssVarsProviderMock = createMockBrandingCssVarsProvider();
  });

  afterEach(() => {
    // Clean up mock props
  });

  it('renders without crashing', () => {
    const { container } = render(<Templates {...props} />);
    expect(container).toBeTruthy();
  });

  describe('AppHeaderBanner', () => {
    it('renders AppHeaderBanner component', async () => {
      const { getByText, waitFor } = render(<AppHeaderBanner />);
      await waitFor(() => expect(getByText('Test Banner')).toBeInTheDocument());
    });
  });

  describe('AppHeader', () => {
    it('renders AppHeader component with correct props', async () => {
      const { getByText, waitFor } = render(<AppHeader title={props.title} />);
      await waitFor(() => expect(getByText(props.title)).toBeInTheDocument());
    });

    it('calls Head component with correct props on mount', async () => {
      const headMock = jest.fn();
      const { rerender } = render(<AppHeader title={props.title} head={headMock} />);
      await waitFor(() => expect(headMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('Head', () => {
    it('calls Head component with correct props on mount', async () => {
      const headMock = jest.fn();
      const { rerender } = render(<Head title={props.title} description={props.description} card={props.card} head={headMock} />);
      await waitFor(() => expect(headMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('AppFooter', () => {
    it('renders AppFooter component without crashing', async () => {
      const { container } = render(<AppFooter />);
      expect(container).toBeTruthy();
    });
  });

  describe('TemplateHero', () => {
    it('renders TemplateHero component with correct props', async () => {
      const { getByText, waitFor } = render(<TemplateHero />);
      await waitFor(() => expect(getByText('Test Hero')).toBeInTheDocument());
    });

    it('calls Testimonials component on mount', async () => {
      const testimonialsMock = jest.fn();
      const { rerender } = render(<TemplateHero />, { wrapper: ({ children }) => <Testimonials {...children} /> });
      await waitFor(() => expect(testimonialsMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('ValueProposition', () => {
    it('renders ValueProposition component with correct props', async () => {
      const { getByText, waitFor } = render(<ValueProposition />);
      await waitFor(() => expect(getByText('Test Proposition')).toBeInTheDocument());
    });

    it('calls Testimonials component on mount', async () => {
      const testimonialsMock = jest.fn();
      const { rerender } = render(<ValueProposition />, { wrapper: ({ children }) => <Testimonials {...children} /> });
      await waitFor(() => expect(testimonialsMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('TemplateDemo', () => {
    it('renders TemplateDemo component with correct props', async () => {
      const { getByText, waitFor } = render(<TemplateDemo />);
      await waitFor(() => expect(getByText('Test Demo')).toBeInTheDocument());
    });

    it('calls HeroEnd component on mount', async () => {
      const heroEndMock = jest.fn();
      const { rerender } = render(<TemplateDemo />, { wrapper: ({ children }) => <HeroEnd {...children} /> });
      await waitFor(() => expect(heroEndMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('Testimonials', () => {
    it('renders Testimonials component with correct props', async () => {
      const { getByText, waitFor } = render(<Testimonials />);
      await waitFor(() => expect(getByText('Testimonials')).toBeInTheDocument());
    });

    it('calls HeroEnd component on mount', async () => {
      const heroEndMock = jest.fn();
      const { rerender } = render(<Testimonials />, { wrapper: ({ children }) => <HeroEnd {...children} /> });
      await waitFor(() => expect(heroEndMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('HeroEnd', () => {
    it('renders HeroEnd component without crashing', async () => {
      const { container } = render(<HeroEnd />);
      expect(container).toBeTruthy();
    });
  });
});