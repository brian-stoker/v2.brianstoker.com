import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrandingTheme } from './BrandingTheme';
import { createMockBrand, createMockThemeContext } from './mocks';

describe('BrandingTheme', () => {
  const brandingTheme = new BrandingTheme();
  let context;

  beforeEach(() => {
    context = createMockThemeContext();
    brandingTheme.setup(context);
  });

  afterEach(() => {
    brandingTheme teardown();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BrandingTheme {...brandingTheme.props} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('renders fallback content when branding theme is not set', async () => {
      context.brandingTheme = null;
      const { getByText, container } = render(<BrandingsTheme {...brandingTheme.props} />);
      expect(getByText('Fallback content')).toBeInTheDocument();
      expect(container).not.toBeEmptyDOMElement();
    });

    it('renders custom branding theme when provided', async () => {
      context.brandingTheme = createMockBrand();
      const { getByText, container } = render(<BrandingTheme {...brandingTheme.props} />);
      expect(getByText('Custom branding theme')).toBeInTheDocument();
      expect(container).not.toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('throws an error when branding theme is not provided', async () => {
      context.brandingTheme = null;
      await expect(brandingTheme.setup(context)).rejects.toThrowError(
        'Branding theme is required'
      );
    });

    it('allows custom branding theme to be passed', async () => {
      const mockBrand = createMockBrand();
      context.brandingTheme = mockBrand;
      await expect(brandingTheme.setup(context)).resolves.not.toThrow();
    });
  });

  describe('user interactions', () => {
    let mockClose;

    beforeEach(() => {
      mockClose = jest.fn();
    });

    it('handles close button click', async () => {
      context.brandingTheme = createMockBrand();
      const { getByText } = render(<BrandingTheme {...brandingTheme.props} />);
      fireEvent.click(getByText('Close'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('state changes', () => {
    it('updates theme state when branding theme is changed', async () => {
      context.brandingTheme = createMockBrand();
      const { getByText } = render(<BrandingTheme {...brandingTheme.props} />);
      fireEvent.change(getByText('Theme'), { target: 'New Theme' });
      expect(context.theme).toBe('New Theme');
    });
  });

  it('renders as a component with default props', () => {
    const { container } = render(<BrandingTheme />);
    expect(container).toBeInTheDocument();
  });

  it('renders with custom props', async () => {
    const mockProps = {
      brandingTheme: createMockBrand(),
      // Add other props here
    };
    const { getByText, container } = render(<BrandingTheme {...mockProps} />);
    expect(getByText('Custom branding theme')).toBeInTheDocument();
    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders with a snapshot', async () => {
    const mockProps = {
      brandingTheme: createMockBrand(),
      // Add other props here
    };
    const { container } = render(<BrandingTheme {...mockProps} />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});