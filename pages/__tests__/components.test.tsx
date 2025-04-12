import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ComponentPageData } from './components.test';
import { AppHeader, AppFooter, BrandingCssVarsProvider, Head, Link, List, ListItem, ListItemButton, Section, Typography } from '@stoked-ui/docs/components';
import { materialPages } from '../data/pages';
import { pageToTitleI18n } from 'src/modules/utils/helpers';
import { useTranslate } from '@stoked-ui/docs/i18n';

interface TestProps {
  pages?: ComponentPageData;
}

const setup = (props: TestProps) => {
  const t = useTranslate();
  return (
    <BrandingCssVarsProvider>
      <Head title="Components - SUI" description="SUI provides a simple, customizable, and accessible library of React components. Follow your own design system, or start with Material Design. You will develop React applications faster." />
      <AppHeader />
      <main id="main-content">
        <Section bg="gradient" sx={{ py: { xs: 2, sm: 4 } }}>
          <Typography component="h1" variant="h2" sx={{ mb: 4, pl: 1 }}>
            All Components
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {(props.pages?.children || []).map((page) => (
              <Box key={page.pathname} sx={{ pb: 2 }}>
                <Typography
                  component="h2"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: 'grey.600',
                    px: 1,
                  }}
                >
                  {pageToTitleI18n(page, t)}
                </Typography>
                <List>
                  {(page.children || []).map((nestedPage) => {
                    if (nestedPage.children) {
                      return (
                        <ListItem key={nestedPage.pathname} sx={{ py: 0, px: 1 }}>
                          <Box sx={{ width: '100%', pt: 1 }}>
                            <Typography
                              component="div"
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: 'grey.600',
                              }}
                            >
                              {pageToTitleI18n(nestedPage, t) || ''}
                            </Typography>
                            <List>{nestedPage.children.map(renderItem)}</List>
                          </Box>
                        </ListItem>
                      );
                    }
                    return renderItem(nestedPage);
                  })}
                </List>
              </Box>
            ))}
          </Box>
        </Section>
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
};

const ComponentPage = () => setup({ pages: materialPages[0].children });

describe('Components', () => {
  it('renders without crashing', async () => {
    const { container } = render(ComponentPage);
    expect(container).not.toBeNull();
  });

  describe('renderItem function', () => {
    it('calls correctly with a page data object', () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [
          { pathname: '/nested-test-page' },
        ],
      };
      const renderItemSpy = jest.spyOn(page, 'pathname');
      renderItem(page);
      expect(renderItemSpy).toHaveBeenCalledTimes(1);
    });

    it('calls correctly with a nested page data object', () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [
          {
            title: 'Nested Test Page',
            pathname: '/nested-test-page',
            children: [],
          },
        ],
      };
      const renderItemSpy = jest.spyOn(page, 'pathname');
      renderItem(page);
      expect(renderItemSpy).toHaveBeenCalledTimes(1);
    });

    it('calls correctly with a page data object that has no children', () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [],
      };
      const renderItemSpy = jest.spyOn(page, 'pathname');
      renderItem(page);
      expect(renderItemSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('render function', () => {
    it('calls correctly with a page data object', async () => {
      const { getByText } = render(ComponentPage);
      const pageTitle = getByText('Test Page');
      expect(pageTitle).not.toBeNull();
    });

    it('calls correctly with a nested page data object', async () => {
      const { getByText } = render(ComponentPage);
      const nestedPageTitle = getByText('Nested Test Page');
      expect(nestedPageTitle).not.toBeNull();
    });

    it('calls correctly with a page data object that has no children', async () => {
      const { getByText } = render(ComponentPage);
      const pageTitle = getByText('Test Page');
      expect(pageTitle).not.toBeNull();
    });
  });

  describe('Link component', () => {
    it('navigates to the correct URL when clicked', async () => {
      const { getByRole, getByText } = render(ComponentPage);
      const link = getByRole('link');
      fireEvent.click(link);
      expect(getByText('/test-page')).toBeInTheDocument();
    });

    it('calls correctly with a page data object that has no children', async () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [],
      };
      const { getByText } = render(setup({ pages: page }));
      const link = getByText(page.title);
      expect(link).not.toBeNull();
    });
  });

  describe('List component', () => {
    it('calls correctly with a nested page data object', async () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [
          {
            title: 'Nested Test Page',
            pathname: '/nested-test-page',
            children: [],
          },
        ],
      };
      const { getByText } = render(setup({ pages: page }));
      const nestedPageListTitle = getByText('Nested Test Page');
      expect(nestedPageListTitle).not.toBeNull();
    });

    it('calls correctly with a page data object that has no children', async () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [],
      };
      const { getByText } = render(setup({ pages: page }));
      const pageListTitle = getByText(page.title);
      expect(pageListTitle).not.toBeNull();
    });
  });

  describe('Typography component', () => {
    it('calls correctly with a page title', async () => {
      const t = useTranslate();
      const page = {
        title: 'Test Page',
        pathname: '/test-page',
        children: [],
      };
      const { getByText } = render(setup({ pages: page }));
      const pageTitle = getByText(page.title);
      expect(pageTitle).not.toBeNull();
    });
  });

  describe('Divider component', () => {
    it('renders correctly', async () => {
      const { container } = render(ComponentPage);
      const divider = container.querySelector('div');
      expect(divider).not.toBeNull();
    });
  });

  describe('AppHeader and AppFooter components', () => {
    it('renders correctly', async () => {
      const { container } = render(ComponentPage);
      const appHeader = container.querySelector('AppHeader');
      const appFooter = container.querySelector('AppFooter');
      expect(appHeader).not.toBeNull();
      expect(appFooter).not.toBeNull();
    });
  });
});