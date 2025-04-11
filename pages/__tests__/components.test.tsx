import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppHeader from './AppHeader';
import BrandingCssVarsProvider from '@stoked-ui/docs/BrandingCssVarsProvider';
import Head from './Head';
import Section from './Section';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { pageToTitleI18n } from './helpers';
import { useTranslate } from '@stoked-ui/docs/i18n';
import type { MuiPage } from '../src/MuiPage';
import materialPages from '../data/pages';

describe('Components', () => {
  const pages = materialPages;
  const componentPageData = pages.find(({ title }) => title === 'Components');
  const t = useTranslate();

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Components />);
  });

  it('renders all components correctly', async () => {
    const { getByText } = render(<Components />);
    expect(getByText(componentPageData?.title)).toBeInTheDocument();
    expect(
      getByText(
        pages.find((page) => page.title === 'Components').children[0].title
      )
    ).toBeInTheDocument();
  });

  it('renders list items with links correctly', async () => {
    const { getAllByRole } = render(<Components />);
    const linkItems = getAllByRole('link');
    expect(linkItems.length).toBe(pages.find((page) => page.title === 'Components').children[0].children.length);
    for (let i = 0; i < linkItems.length; i++) {
      const item = linkItems[i];
      expect(item.textContent).toContain(pageToTitleI18n(pages.find((page) => page.title === 'Components').children[0], t));
    }
  });

  it('renders list items with nested pages correctly', async () => {
    const { getAllByRole } = render(<Components />);
    const nestedLinkItems = getAllByRole('link');
    expect(nestedLinkItems.length).toBe(
      pages.find((page) => page.title === 'Components').children[0].children.reduce((acc, child) => acc + child.children.length, 0)
    );
    for (let i = 0; i < nestedLinkItems.length; i++) {
      const item = nestedLinkItems[i];
      expect(item.textContent).toContain(pageToTitleI18n(pages.find((page) => page.title === 'Components').children[0].children[i], t));
    }
  });

  it(' renders sections with correct styles', async () => {
    render(<Components />);
    const sectionElement = document.querySelector('#main-content > .MuiSection-root');
    expect(sectionElement.style.display).toBe('grid');
    expect(sectionElement.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(200px, 1fr))');
  });

  it('renders footer correctly', async () => {
    render(<Components />);
    const footerElement = document.querySelector('#main-content > .MuiAppFooter-root');
    expect(footerElement.textContent).toContain('SUI provides a simple, customizable, and accessible library of React components.');
  });

  it('renders branding css vars provider correctly', async () => {
    render(<Components />);
    const brandingCssVarsProviderElement = document.querySelector('#main-content > .MuiBrandingCssVarsProvider-root');
    expect(brandingCssVarsProviderElement.textContent).toBe('');
  });

  it('calls useTranslate hook correctly', async () => {
    const useTranslateSpy = jest.spyOn(useTranslate, 'useTranslate');
    render(<Components />);
    expect(useTranslateSpy).toHaveBeenCalledTimes(1);
  });

  it('renders with correct pageToTitleI18n', async () => {
    const { getByText } = render(<Components />);
    const linkItems = getAllByRole('link');
    for (let i = 0; i < linkItems.length; i++) {
      const item = linkItems[i];
      expect(item.textContent).toBe(pageToTitleI18n(pages.find((page) => page.title === 'Components').children[0], t));
    }
  });

  it('calls renderItem function correctly', async () => {
    const { getByText } = render(<Components />);
    const listItems = getAllByRole('listitem');
    for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i];
      expect(item.textContent).toBe(pageToTitleI18n(pages.find((page) => page.title === 'Components').children[0].children[i], t));
    }
  });

  it('calls fireEvent function correctly', async () => {
    render(<Components />);
    const linkElement = document.querySelector('#main-content > .MuiLink-root');
    fireEvent.click(linkElement);
    expect(console).not.toHaveBeenCalledWith(jasmine.any(string));
  });
});