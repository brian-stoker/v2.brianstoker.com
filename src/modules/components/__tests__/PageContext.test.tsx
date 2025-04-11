import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'vitest';
import type { MuiPage, MuiProductId } from 'src/MuiPage';
import type { MuiPageProps, MuiProductInfoFromUrlProps } from 'src/modules/utils/getProductInfoFromUrl';

const PageContext = React.createContext<{
  activePage: MuiPage | null;
  pages: MuiPage[];
  productId: MuiProductId;
}>(undefined!);

if (process.env.NODE_ENV !== 'production') {
  PageContext.displayName = 'PageContext';
}

describe('MuiPageContext', () => {
  let pageContext: ReturnType<typeof create>;

  beforeEach(() => {
    pageContext = create({
      activePage: null,
      pages: [],
      productId: {} as MuiProductId,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<MuiPageContext />, { pageContext });
      expect(container).toBeTruthy();
    });

    it('renders active page when provided', async () => {
      const mockActivePage = { id: 1, name: 'Home' } as MuiPage;
      const { container } = render(
        <MuiPageContext.Provider value={{ activePage: mockActivePage, pages: [], productId: {} as MuiProductId }}>
          <div />
        </MuiPageContext.Provider>,
        { pageContext }
      );
      expect(container).toBeTruthy();
    });

    it('renders all pages when provided', async () => {
      const mockPages = [{ id: 1, name: 'Home' }, { id: 2, name: 'About' }] as MuiPage[];
      const { container } = render(
        <MuiPageContext.Provider value={{ activePage: null, pages: mockPages, productId: {} as MuiProductId }}>
          <div />
        </MuiPageContext.Provider>,
        { pageContext }
      );
      expect(container).toBeTruthy();
    });

    it('renders no pages when not provided', async () => {
      const { container } = render(<MuiPageContext />, { pageContext });
      expect(container).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid props', async () => {
      const mockProps: MuiProductInfoFromUrlProps = {
        activePage: null,
        pages: [],
        productId: {} as MuiProductId,
      };
      const { container } = render(<MuiPageContext {...mockProps} />, { pageContext });
      expect(container).toBeTruthy();
    });

    it('rejects invalid props (missing activePage)', async () => {
      const mockProps: MuiProductInfoFromUrlProps = {
        pages: [],
        productId: {} as MuiProductId,
      };
      expect(() => render(<MuiPageContext {...mockProps} />)).toThrowError();
    });

    it('rejects invalid props (missing pages)', async () => {
      const mockProps: MuiProductInfoFromUrlProps = {
        activePage: null,
        productId: {} as MuiProductId,
      };
      expect(() => render(<MuiPageContext {...mockProps} />)).toThrowError();
    });

    it('rejects invalid props (missing productId)', async () => {
      const mockProps: MuiProductInfoFromUrlProps = {
        activePage: null,
        pages: [],
      };
      expect(() => render(<MuiPageContext {...mockProps} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('renders active page when clicked', async () => {
      const mockActivePage = { id: 1, name: 'Home' } as MuiPage;
      const { getByText } = render(
        <MuiPageContext.Provider value={{ activePage: mockActivePage, pages: [], productId: {} as MuiProductId }}>
          <div />
        </MuiPageContext.Provider>,
        { pageContext }
      );
      const homeLink = getByText('Home');
      fireEvent.click(homeLink);
      expect(pageContext.activePage).toBe(mockActivePage);
    });

    it('navigates to all pages when clicked', async () => {
      const mockPages = [{ id: 1, name: 'Home' }, { id: 2, name: 'About' }] as MuiPage[];
      const { getByText } = render(
        <MuiPageContext.Provider value={{ activePage: null, pages: mockPages, productId: {} as MuiProductId }}>
          <div />
        </MuiPageContext.Provider>,
        { pageContext }
      );
      for (const page of mockPages) {
        const pageLink = getByText(page.name);
        fireEvent.click(pageLink);
        expect(pageContext.activePage).toBe(page);
        expect(pageContext.pages).toEqual(mockPages.filter((p) => p.id !== page.id));
      }
    });

    it('does not change active page when inactive', async () => {
      const mockActivePage = { id: 1, name: 'Home' } as MuiPage;
      const { getByText } = render(
        <MuiPageContext.Provider value={{ activePage: mockActivePage, pages: [], productId: {} as MuiProductId }}>
          <div />
        </MuiPageContext.Provider>,
        { pageContext }
      );
      const link = getByText('About');
      fireEvent.click(link);
      expect(pageContext.activePage).toBe(mockActivePage);
    });
  });

  describe('Snapshot Testing', () => {
    it('renders correctly', async () => {
      const mockProps: MuiProductInfoFromUrlProps = {
        activePage: null,
        pages: [],
        productId: {} as MuiProductId,
      };
      const { container } = render(<MuiPageContext {...mockProps} />);
      expect(container).toMatchSnapshot();
    });
  });
});