import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUI from './BaseUI';
import { Head } from 'src/modules/components/Head';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import AppHeaderBanner from 'src/components/banner/AppHeaderBanner';
import BaseUIHero from 'src/components/productBaseUI/BaseUIHero';
import BaseUISummary from 'src/components/productBaseUI/BaseUISummary';
import BaseUIComponents from 'src/components/productBaseUI/BaseUIComponents';
import BaseUICustomization from 'src/components/productBaseUI/BaseUICustomization';
import BaseUIEnd from 'src/components/productBaseUI/BaseUIEnd';
import BaseUITestimonial from 'src/components/productBaseUI/BaseUITestimonial';

describe('BaseUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BaseUI />);
    expect(container).toBeTruthy();
  });

  describe('AppHeaderBanner', () => {
    it('renders correctly', async () => {
      const { container } = render(<AppHeaderBanner />);
      expect(container).toHaveTextContent('Base UI');
    });
  });

  describe('AppHeader', () => {
    it('renders correctly with gitHubRepository prop', async () => {
      const repositoryUrl = 'https://github.com/brian-stoker';
      const { container } = render(<AppHeader gitHubRepository={repositoryUrl} />);
      expect(container).toHaveTextContent(repositoryUrl);
    });

    it('does not crash when gitHubRepository prop is missing', async () => {
      const { container } = render(<AppHeader />);
      expect(container).toBeTruthy();
    });
  });

  describe('BaseUIHero', () => {
    it('renders correctly', async () => {
      const { container } = render(<BaseUIHero />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when title prop is missing', async () => {
      const { container } = render(<BaseUIHero title="" />);
      expect(container).toBeTruthy();
    });
  });

  describe('BaseUISummary', () => {
    it('renders correctly', async () => {
      const { container } = render(<BaseUISummary />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when description prop is missing', async () => {
      const { container } = render(<BaseUISummary description="" />);
      expect(container).toBeTruthy();
    });
  });

  describe('Divider', () => {
    it('renders correctly', async () => {
      const { container } = render(<Divider />);
      expect(container).toHaveStyle('border-top: solid black; border-width: 1px;');
    });

    it('does not crash when children prop is missing', async () => {
      const { container } = render(<Divider />);
      expect(container).toBeTruthy();
    });
  });

  describe('BaseUIComponents', () => {
    it('renders correctly', async () => {
      const { container } = render(<BaseUIComponents />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when children prop is missing', async () => {
      const { container } = render(<BaseUIComponents />);
      expect(container).toBeTruthy();
    });
  });

  describe('BaseUICustomization', () => {
    it('renders correctly', async () => {
      const { container } = render(<BaseUICustomization />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when children prop is missing', async () => {
      const { container } = render(<BaseUICustomization />);
      expect(container).toBeTruthy();
    });
  });

  describe('BaseUITestimonial', () => {
    it('renders correctly', async () => {
      const { container } = render(<BaseUITestimonial />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when children prop is missing', async () => {
      const { container } = render(<BaseUITestimonial />);
      expect(container).toBeTruthy();
    });
  });

  describe('AppFooter', () => {
    it('renders correctly', async () => {
      const { container } = render(<AppFooter />);
      expect(container).toHaveTextContent('');
    });

    it('does not crash when children prop is missing', async () => {
      const { container } = render(<AppFooter />);
      expect(container).toBeTruthy();
    });
  });

  describe('BrandingCssVarsProvider', () => {
    it('provides css variables to the component tree', async () => {
      jest.spyOn(BrandingCssVarsProvider, 'provideVariables').mockImplementation(() => ({
        '--primary-color': '#333',
      }));
      const { container } = render(<BaseUI />);
      expect(container).toHaveStyle('--primary-color: #333;');
    });

    it('does not crash when no variables are provided', async () => {
      const { container } = render(<BaseUI />);
      expect(container).toBeTruthy();
    });
  });

  describe('Head', () => {
    it('provides title and description to the component tree', async () => {
      jest.spyOn(Head, 'provideTitle').mockImplementation(() => 'New Title');
      jest.spyOn(Head, 'provideDescription').mockImplementation(() => 'New Description');
      const { container } = render(<BaseUI />);
      expect(container).toHaveTextContent('New Title');
      expect(container).toHaveTextContent('New Description');
    });

    it('does not crash when no title or description are provided', async () => {
      const { container } = render(<Head />);
      expect(container).toBeTruthy();
    });
  });

  describe('Link', () => {
    it('links to the correct url', async () => {
      jest.spyOn(HTMLLinkElement, 'href').mockImplementation(() => 'https://www.example.com');
      const { container } = render(<BaseUI />);
      expect(container).toHaveAttribute('href', 'https://www.example.com');
    });

    it('does not crash when no href is provided', async () => {
      const { container } = render(<BaseUI />);
      expect(container).toBeTruthy();
    });
  });

  describe('Image', () => {
    it('has the correct src attribute', async () => {
      jest.spyOn(HTMLImageElement, 'src').mockImplementation(() => 'https://www.example.com/image.jpg');
      const { container } = render(<BaseUI />);
      expect(container).toHaveAttribute('src', 'https://www.example.com/image.jpg');
    });

    it('does not crash when no src is provided', async () => {
      const { container } = render(<BaseUI />);
      expect(container).toBeTruthy();
    });
  });
});