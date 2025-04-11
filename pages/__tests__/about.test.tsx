import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import About from './about.test';
import { Head } from '../src/modules/components/Head';

jest.mock('../src/modules/components/Head');

describe('About component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<About />);
    expect(container).toBeInTheDocument();
  });

  describe('AppHeaderBanner prop', () => {
    it('renders AppHeaderBanner when provided', () => {
      const { getByText, getByRole } = render(
        <About AppHeaderBanner={<AppHeaderBanner />}
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('banner')).toBeInTheDocument();
    });

    it('does not render AppHeaderBanner when not provided', () => {
      const { queryByText, queryByRole } = render(<About />);
      expect(queryByText('Test')).not.toBeInTheDocument();
      expect(queryByRole('banner')).not.toBeInTheDocument();
    });
  });

  describe('AppHeader prop', () => {
    it('renders AppHeader when provided', () => {
      const { getByText, getByRole } = render(
        <About AppHeader={<AppHeader />}
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('header')).toBeInTheDocument();
    });

    it('does not render AppHeader when not provided', () => {
      const { queryByText, queryByRole } = render(<About />);
      expect(queryByText('Test')).not.toBeInTheDocument();
      expect(queryByRole('header')).not.toBeInTheDocument();
    });
  });

  describe('main-content section', () => {
    it('renders main content when provided', async () => {
      const { getByText, getByRole } = render(
        <About>
          <OurValues />
        </About>
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('region')).toBeInTheDocument();
    });

    it('does not render main content when not provided', async () => {
      const { queryByText, queryByRole } = render(<About />);
      expect(queryByText('Test')).not.toBeInTheDocument();
      expect(queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('Head component with title and description props', () => {
    it('renders Head with title prop when provided', async () => {
      const { getByText, getByRole } = render(
        <About>
          <Head title="Test" />
        </About>
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('article')).toBeInTheDocument();
    });

    it('does not render Head with title prop when not provided', async () => {
      const { queryByText, queryByRole } = render(<About />);
      expect(queryByText('Test')).not.toBeInTheDocument();
      expect(queryByRole('article')).not.toBeInTheDocument();
    });
  });

  describe('Head component with card and alt props', () => {
    it('renders Head with card prop when provided', async () => {
      const { getByText, getByRole } = render(
        <About>
          <Head
            title="Test"
            card="/static/social-previews/about-preview.jpg"
            alt="SUI team"
          />
        </About>
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('article')).toBeInTheDocument();
    });

    it('renders Head with card prop when not provided', async () => {
      const { getByText, getByRole } = render(
        <About>
          <Head title="Test" />
        </About>
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('article')).toBeInTheDocument();
    });
  });

  describe('BrandColorProvider prop', () => {
    it('renders BrandingCssVarsProvider when provided', async () => {
      const { getByText, getByRole } = render(
        <About>
          <BrandingCssVarsProvider />
        </About>
      );
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByRole('region')).toBeInTheDocument();
    });

    it('does not render BrandingCssVarsProvider when not provided', async () => {
      const { queryByText, queryByRole } = render(<About />);
      expect(queryByText('Test')).not.toBeInTheDocument();
      expect(queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls Head click handler when AppHeaderBanner is clicked', async () => {
      const { getByText, getByRole } = render(
        <About>
          <AppHeaderBanner onClick={() => console.log('Clicked!')} />
        </About>
      );
      const banner = getByRole('banner');
      fireEvent.click(banner);
      expect(console).toHaveLoggedValue('Clicked!');
    });

    it('calls Head click handler when AppHeader is clicked', async () => {
      const { getByText, getByRole } = render(
        <About>
          <AppHeader onClick={() => console.log('Clicked!')} />
        </About>
      );
      const header = getByRole('header');
      fireEvent.click(header);
      expect(console).toHaveLoggedValue('Clicked!');
    });
  });

  describe('Snapshot test', () => {
    it('matches the snapshot', async () => {
      const { asFragment } = render(<About />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});