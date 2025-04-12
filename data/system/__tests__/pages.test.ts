import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MuiPage from './MuiPage';
import pagesApi from 'data/system/pagesApi';

const mockPages = [
  {
    pathname: '/system/getting-started-group',
    title: 'Getting started',
    children: [
      { pathname: '/system/getting-started', title: 'Overview' },
      { pathname: '/system/getting-started/installation' },
      { pathname: '/system/getting-started/usage' },
      { pathname: '/system/getting-started/the-sx-prop' },
      { pathname: '/system/getting-started/custom-components' },
      { pathname: '/system/getting-started/support' },
    ],
  },
  {
    pathname: '/style-utilities',
    children: [
      { pathname: '/system/properties' },
      { pathname: '/system/borders' },
      { pathname: '/system/display' },
      { pathname: '/system/flexbox' },
      { pathname: '/system/grid' },
      { pathname: '/system/palette' },
      { pathname: '/system/positions' },
      { pathname: '/system/shadows' },
      { pathname: '/system/sizing' },
      { pathname: '/system/spacing' },
      { pathname: '/system/screen-readers' },
      { pathname: '/system/typography' },
      { pathname: '/system/styled', title: 'styled' },
    ],
  },
  {
    pathname: '/system/react-',
    title: 'Components',
    children: [
      { pathname: '/system/react-box', title: 'Box' },
      { pathname: '/system/react-container', title: 'Container' },
      { pathname: '/system/react-grid', title: 'Grid' },
      { pathname: '/system/react-stack', title: 'Stack' },
    ],
  },
  {
    pathname: '/system/migration',
    title: 'Migration',
    children: [
      {
        pathname: '/system/migration/migrating-to-v6',
        title: 'Migrating to v6',
      },
    ],
  },
  {
    title: 'APIs',
    pathname: '/system/api',
    children: pagesApi,
  },
  {
    pathname: '/system/experimental-api',
    title: 'Experimental APIs',
    children: [
      {
        pathname: '/system/experimental-api/configure-the-sx-prop',
        title: 'Configure the sx prop',
      },
      {
        pathname: '/system/experimental-api/css-theme-variables',
        title: 'CSS Theme Variables',
      },
    ],
  },
  {
    pathname: '/system/styles',
    title: 'Styles',
    legacy: true,
    children: [
      { pathname: '/system/styles/basics' },
      { pathname: '/system/styles/advanced' },
      { pathname: '/system/styles/api', title: 'APIs' },
    ],
  },
];

describe('MuiPage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const props = {};
    const { container } = render(<MuiPage {...props} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    const pages = mockPages;

    it('renders children when pathname is present', async () => {
      const props = { pathname: '/system/getting-started-group' };
      const { container } = render(<MuiPage {...props} />);
      expect(container).toHaveTextContent(pages.find((page) => page.pathname === props.pathname).title);
    });

    it('does not render children when pathname is absent', async () => {
      const props = { pathname: '/non-existent' };
      const { container } = render(<MuiPage {...props} />);
      expect(container).not.toHaveTextContent(pages.find((page) => page.pathname === props.pathname).title);
    });
  });

  describe('prop validation', () => {
    it('does not accept invalid pathname prop', async () => {
      const props = { pathname: '/non-existent' };
      const { container } = render(<MuiPage {...props} />);
      expect(container).toHaveTextContent(pages.find((page) => page.pathname === props.pathname).title);
    });

    it('accepts valid pathname prop', async () => {
      const props = { pathname: '/system/getting-started-group' };
      const { container } = render(<MuiPage {...props} />);
      expect(container).toHaveTextContent(pages.find((page) => page.pathname === props.pathname).title);
    });
  });

  describe('user interactions', () => {
    it('calls navigateTo function when pathname is present', async () => {
      const props = { pathname: '/system/getting-started-group' };
      const navigateToMock = jest.fn();
      render(<MuiPage {...props} navigateTo={navigateToMock} />);
      fireEvent.click(container.querySelector('a'));
      expect(navigateToMock).toHaveBeenCalledTimes(1);
    });

    it('does not call navigateTo function when pathname is absent', async () => {
      const props = { pathname: '/non-existent' };
      const navigateToMock = jest.fn();
      render(<MuiPage {...props} navigateTo={navigateToMock} />);
      fireEvent.click(container.querySelector('a'));
      expect(navigateToMock).not.toHaveBeenCalled();
    });
  });

  describe('async navigation', () => {
    it('calls navigateTo function when pathname is present', async () => {
      const props = { pathname: '/system/getting-started-group' };
      const navigateToMock = jest.fn();
      render(<MuiPage {...props} navigateTo={navigateToMock} />);
      fireEvent.click(container.querySelector('a'));
      await waitFor(() => expect(navigateToMock).toHaveBeenCalledTimes(1));
    });

    it('does not call navigateTo function when pathname is absent', async () => {
      const props = { pathname: '/non-existent' };
      const navigateToMock = jest.fn();
      render(<MuiPage {...props} navigateTo={navigateToMock} />);
      fireEvent.click(container.querySelector('a'));
      await waitFor(() => expect(navigateToMock).not.toHaveBeenCalled());
    });
  });

  describe('styles and classes', () => {
    it('adds class to element when pathname is present', async () => {
      const props = { pathname: '/system/getting-started-group' };
      render(<MuiPage {...props} />);
      expect(container.querySelector('div')).toHaveClass('MuiPage--active');
    });

    it('does not add class to element when pathname is absent', async () => {
      const props = { pathname: '/non-existent' };
      render(<MuiPage {...props} />);
      expect(container.querySelector('div')).not.toHaveClass('MuiPage--active');
    });
  });
});