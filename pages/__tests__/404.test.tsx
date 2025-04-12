import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/user-event';
import Custom404 from './Custom404.test.tsx';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import AppHeaderBanner from 'src/components/banner/AppHeaderBanner';
import NotFoundHero from 'src/components/NotFoundHero';
import { createProvider } from '@stoked-ui/docs';

describe('Custom404 Component', () => {
  const heading = document.createElement('h1');
  const mainContent = document.getElementById('main-content');

  beforeEach(() => {
    jest.clearAllMocks();
    render(<BrandingCssVarsProvider><Custom404 /></BrandingCssVarsProvider>, {
      container: document.body,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render without crashing', () => {
    expect(mainContent).toBeTruthy();
  });

  describe('Props', () => {
    it('should validate title prop', () => {
      const { getByText } = render(<Custom404 title="Test Title" />);
      expect(getByText('404: This page could not be found - SUI')).toBeInTheDocument();
    });

    it('should validate description prop', () => {
      const { getByText } = render(<Custom404 description="Test Description" />);
      expect(getByText('This page could not be found')).toBeInTheDocument();
    });

    it('should throw error when invalid props are passed', () => {
      expect(() =>
        render(<Custom404 title={null} description="" />),
      ).toThrowError();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render AppHeaderBanner', async () => {
      const { getByText } = render(<Custom404 />);
      await waitFor(() => expect(getByText('AppHeaderBanner')).toBeInTheDocument());
    });

    it('should render AppFooter', async () => {
      const { getByText } = render(<Custom404 />);
      await waitFor(() => expect(getByText('AppFooter')).toBeInTheDocument());
    });

    it('should not render AppHeader when title is null or empty', async () => {
      const { queryByTitle, queryByText } = render(<Custom404 title={null} />);
      await waitFor(() =>
        expect(queryByTitle('AppHeader')).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(queryByText('AppHeader')).toBeInTheDocument());
    });

    it('should not render AppFooter when footer is null', async () => {
      const { queryByTitle, queryByText } = render(<Custom404 />);
      await waitFor(() =>
        expect(queryByTitle('AppFooter')).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(queryByText('AppFooter')).toBeInTheDocument());
    });
  });

  describe('User Interactions', () => {
    it('should trigger AppHeaderBanner click event', async () => {
      const { getByText } = render(<Custom404 />);
      await screen.click(getByText('AppHeaderBanner'));
      expect(heading.textContent).toBe('Test Title');
    });

    it('should update heading text when AppHeaderBanner is clicked', async () => {
      const { getByText, getByRole } = render(<Custom404 />);
      const headerButton = getByRole('button', { name: 'AppHeaderBanner' });
      await screen.click(headerButton);
      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('should trigger AppFooter submit event when form is submitted', async () => {
      const { getByText, getByRole } = render(<Custom404 />);
      const footerForm = getByRole('form');
      fireEvent.submit(footerForm);
      expect(heading.textContent).toBe('Test Title');
    });
  });

  describe('Side Effects', () => {
    it('should update heading text when AppHeader is clicked', async () => {
      const { getByText, getByRole } = render(<Custom404 />);
      const headerButton = getByRole('button', { name: 'AppHeader' });
      await screen.click(headerButton);
      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('should update heading text when NotFoundHero is clicked', async () => {
      const { getByText, getByRole } = render(<Custom404 />);
      const notFoundHero = getByRole('button', { name: 'NotFoundHero' });
      await screen.click(notFoundHero);
      expect(getByText('Test Title')).toBeInTheDocument();
    });
  });

  it('should render correctly with BrandingCssVarsProvider', async () => {
    const provider = createProvider({ cssVars: { colorPrimary: '#333' } });
    const { getByText, queryByTitle } = render(<BrandingCssVarsProvider><Custom404 /></BrandingCssVarsProvider>, {
      wrapperElement: provider,
    });
    await waitFor(() => expect(getByText('404: This page could not be found - SUI')).toBeInTheDocument());
  });

  it('should re-render correctly when props change', async () => {
    const { getByText, queryByTitle } = render(<Custom404 />);
    expect(getByText('404: This page could not be found - SUI')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByTitle('AppHeaderBanner')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(getByText('Test Title')).toBeInTheDocument());
  });
});