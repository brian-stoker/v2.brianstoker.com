import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import Templates from './Templates.test.tsx';

describe('Templates Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset all state after each test
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Templates />);
    expect(container).toMatchSnapshot();
  });

  describe('Head Component Props', () => {
    it('valid title', async () => {
      const mockTitle = 'Test Title';
      const { container, getByText } = render(
        <BrandingCssVarsProvider>
          <Head title={mockTitle} description="Test Description" card="/static/social-previews/templates-preview.jpg" />
        </BrandingCssVarsProvider>
      );
      expect(getByText(mockTitle)).toBeInTheDocument();
    });

    it('invalid title', async () => {
      const mockTitle = undefined;
      const { container, getByText } = render(
        <BrandingCssVarsProvider>
          <Head title={mockTitle} description="Test Description" card="/static/social-previews/templates-preview.jpg" />
        </BrandingCssVarsProvider>
      );
      expect(() => getByText('')).not.toThrowError();
    });

    it('valid description', async () => {
      const mockDescription = 'Test Description';
      const { container, getByText } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description={mockDescription} card="/static/social-previews/templates-preview.jpg" />
        </BrandingCssVarsProvider>
      );
      expect(getByText(mockDescription)).toBeInTheDocument();
    });

    it('invalid description', async () => {
      const mockDescription = undefined;
      const { container, getByText } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description={mockDescription} card="/static/social-previews/templates-preview.jpg" />
        </BrandingCssVarsProvider>
      );
      expect(() => getByText('')).not.toThrowError();
    });

    it('valid card', async () => {
      const mockCard = '/static/social-previews/templates-preview.jpg';
      const { container, getByRole } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description="Test Description" card={mockCard} />
        </BrandingCssVarsProvider>
      );
      expect(getByRole('img')).toHaveAttribute('src', mockCard);
    });

    it('invalid card', async () => {
      const mockCard = undefined;
      const { container, getByRole } = render(
        <BrandingCssVarsProvider>
          <Head title="Test Title" description="Test Description" card={mockCard} />
        </BrandingCssVarsProvider>
      );
      expect(() => getByRole('img')).not.toThrowError();
    });
  });

  describe('AppHeaderBanner Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<AppHeaderBanner />);
      expect(container).toMatchSnapshot();
    });

    it('invalid children', async () => {
      const mockChildren = undefined;
      const { container, getByText } = render(
        <AppHeaderBanner>{mockChildren}</AppHeaderBanner>
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('AppHeader Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<AppHeader />);
      expect(container).toMatchSnapshot();
    });

    it('invalid title', async () => {
      const mockTitle = undefined;
      const { container, getByText } = render(
        <AppHeader title={mockTitle} />
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('TemplateHero Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TemplateHero />);
      expect(container).toMatchSnapshot();
    });

    it('invalid children', async () => {
      const mockChildren = undefined;
      const { container, getByText } = render(
        <TemplateHero>{mockChildren}</TemplateHero>
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('ValueProposition Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<ValueProposition />);
      expect(container).toMatchSnapshot();
    });

    it('invalid title', async () => {
      const mockTitle = undefined;
      const { container, getByText } = render(
        <ValueProposition title={mockTitle} />
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('TemplateDemo Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TemplateDemo />);
      expect(container).toMatchSnapshot();
    });

    it('invalid children', async () => {
      const mockChildren = undefined;
      const { container, getByText } = render(
        <TemplateDemo>{mockChildren}</TemplateDemo>
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('Testimonials Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<Testimonials />);
      expect(container).toMatchSnapshot();
    });

    it('invalid children', async () => {
      const mockChildren = undefined;
      const { container, getByText } = render(
        <Testimonials>{mockChildren}</Testimonials>
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });

  describe('HeroEnd Component Props', () => {
    it('renders without crashing', async () => {
      const { container } = render(<HeroEnd />);
      expect(container).toMatchSnapshot();
    });

    it('invalid children', async () => {
      const mockChildren = undefined;
      const { container, getByText } = render(
        <HeroEnd>{mockChildren}</HeroEnd>
      );
      expect(() => getByText('')).not.toThrowError();
    });
  });
});