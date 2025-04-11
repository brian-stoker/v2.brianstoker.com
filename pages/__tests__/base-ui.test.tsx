import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUI from './BaseUI';
import { createBrowserMockProvider } from 'stoked-ui-utils';
import { Head } from '@stoked-ui/docs';

describe('Base UI', () => {
  const createApp = () => {
    return render(
      <BrandingCssVarsProvider>
        <Head title="Test Title" description="Test Description" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </BrandingCssVarsProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = createApp();
    expect(container).toBeTruthy();
  });

  describe('Head component', () => {
    it('renders with default title and description', async () => {
      const { getByText, getAllByRole } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description="Test Description" />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Test Title')).toBeInTheDocument();
      expect(getByText('Test Description')).toBeInTheDocument();

      const metaTags = getAllByRole('name');
      expect(metaTags).toHaveLength(2);
    });

    it('renders with custom title and description', async () => {
      const { getByText, getAllByRole } = render(
        <BrandingCssVarsProvider>
          <Head title="Custom Title" description="Custom Description" />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Custom Title')).toBeInTheDocument();
      expect(getByText('Custom Description')).toBeInTheDocument();

      const metaTags = getAllByRole('name');
      expect(metaTags).toHaveLength(2);
    });

    it('should have correct link when card prop is provided', async () => {
      const { getByLinkText } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description="Test Description" card="/static/social-previews/baseui-preview.jpg" />
        </BrandingCssVarsProvider>,
      );

      expect(getByLinkText('/static/social-previews/baseui-preview.jpg')).toBeInTheDocument();
    });
  });

  describe('AppHeader component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeader />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Base UI')).toBeInTheDocument();
    });

    it('renders with custom repository prop', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeader gitHubRepository="https://github.com/brian-stoker" />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('https://github.com/brian-stoker')).toBeInTheDocument();
    });

    it('should throw an error when repository prop is missing', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeader />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Base UI')).toBeInTheDocument();

      expect(() => render(<AppHeader />)).toThrowError();
    });
  });

  describe('AppFooter component', () => {
    it('renders without crashing', async () => {
      const { container } = render(
        <BrandingCssVarsProvider>
          <AppFooter />
        </BrandingCssVarsProvider>,
      );

      expect(container).toBeTruthy();
    });
  });

  describe('BaseUIHero component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeaderBanner />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Base UI')).toBeInTheDocument();
    });
  });

  describe('BaseUIComponents component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeaderBanner />
          <BaseUIComponents />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Components')).toBeInTheDocument();
    });
  });

  describe('BaseUICustomization component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeaderBanner />
          <BaseUIComponents />
          <BaseUICustomization />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Customization')).toBeInTheDocument();
    });
  });

  describe('BaseUITestimonial component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeaderBanner />
          <BaseUIComponents />
          <BaseUICustomization />
          <BaseUITestimonial />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('Testimonials')).toBeInTheDocument();
    });
  });

  describe('BaseUIEnd component', () => {
    it('renders with default props', async () => {
      const { getByText } = render(
        <BrandingCssVarsProvider>
          <AppHeaderBanner />
          <BaseUIComponents />
          <BaseUICustomization />
          <BaseUITestimonial />
          <BaseUIEnd />
        </BrandingCssVarsProvider>,
      );

      expect(getByText('End')).toBeInTheDocument();
    });
  });

  it('should render components in the correct order', async () => {
    const { getByText, getAllByRole } = render(
      <BrandingCssVarsProvider>
        <AppHeaderBanner />
        <BaseUIComponents />
        <BaseUICustomization />
        <BaseUITestimonial />
        <BaseUIEnd />
      </BrandingCssVarsProvider>,
    );

    expect(getByText('Components')).toBeInTheDocument();
    expect(getByText('Customization')).toBeInTheDocument();
    expect(getByText('Testimonials')).toBeInTheDocument();
    expect(getByText('End')).toBeInTheDocument();
  });
});