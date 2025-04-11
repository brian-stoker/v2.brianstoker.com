import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppNavIcons from './AppNavIcons';
import standardNavIcons from './standardNavIcons';
import pageComponent from './pageComponent';

type Props = {
  pathname: string;
  title?: string;
  icon?: any;
  linkProps?: object;
};

describe('pageComponent', () => {
  const mocks = {
    getNavigationLinks: jest.fn(() => []),
    navigateToLink: jest.fn(),
    navigateFromPage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<pageComponent {...mocks} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('renders links when pathname is a string', async () => {
      const { getAllByRole } = render(<pageComponent {...mocks} pathname="/versions" />);
      const links = await getAllByRole('link');
      expect(links).toHaveLength(1);
    });

    it('renders link when pathname is an object with title and icon', async () => {
      const { getByText, getByAltText } = render(
        <pageComponent {...mocks} pathname={{ pathname: 'https://mui.com/store/', title: 'Templates' }} />
      );
      expect(getByText('Templates')).toBeInTheDocument();
      expect(getByAltText(standardNavIcons.ReaderIcon)).toBeInTheDocument();
    });

    it('renders when pathname is an object with only icon and linkProps', async () => {
      const { getByRole } = render(
        <pageComponent {...mocks} pathname={{ pathname: 'https://mui.com/store/', icon: standardNavIcons.ReaderIcon, linkProps: {} }} />
      );
      expect(getByRole('icon')).toBeInTheDocument();
    });

    it('does not render when pathname is null or undefined', async () => {
      const { container } = render(<pageComponent {...mocks} pathname={null} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error if pathname is null or undefined', () => {
      expect(() => render(<pageComponent {...mocks} pathname={undefined} />)).toThrowError();
    });

    it('throws an error if title is not a string', () => {
      const mock = {
        pathname: '/versions',
        icon: standardNavIcons.ReaderIcon,
        linkProps: {},
      };
      expect(() => render(<pageComponent {...mocks} pathname={mock.pathname} title={123} />)).toThrowError();
    });

    it('throws an error if icon is not a React element or a string', () => {
      const mock = {
        pathname: '/versions',
        title: 'Templates',
        linkProps: {},
      };
      expect(() => render(<pageComponent {...mocks} pathname={mock.pathname} icon="icon" />)).toThrowError();
    });

    it('throws an error if linkProps is not an object', () => {
      const mock = {
        pathname: '/versions',
        title: 'Templates',
        icon: standardNavIcons.ReaderIcon,
      };
      expect(() => render(<pageComponent {...mocks} pathname={mock.pathname} title={mock.title} linkProps={123} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it(' navigates to the link when clicked', async () => {
      const { getByText } = render(
        <pageComponent {...mocks} pathname={{ pathname: 'https://mui.com/store/', title: 'Templates' }} />
      );
      const linkElement = await getByText('Templates');
      fireEvent.click(linkElement);
      expect(mocks.navigateToLink).toHaveBeenCalledTimes(1);
    });

    it(' updates the nav bar when input changes', async () => {
      const { getByPlaceholderText } = render(<pageComponent {...mocks} pathname={{ pathname: '/versions' }} />);
      const inputField = await getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: 'search query' } });
      expect(mocks.getNavigationLinks).toHaveBeenCalledTimes(1);
    });

    it(' navigates from the page when back button is clicked', async () => {
      mocks.navigateToLink.mockImplementationOnce(() => Promise.resolve());
      const { getByRole } = render(<pageComponent {...mocks} pathname={{ pathname: 'https://mui.com/store/' }} />);
      const backButton = await getByRole('back');
      fireEvent.click(backButton);
      expect(mocks.navigateFromPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it(' updates the navigation links when new data is received from API', async () => {
      mocks.getNavigationLinks.mockImplementationOnce(async () => {
        return [
          { title: 'Templates', linkProps: { 'data-ga-event-category': 'store' } },
          { title: 'Versions', linkProps: {} },
        ];
      });
      const { getByText, getByAltText } = render(<pageComponent {...mocks} pathname={{ pathname: '/versions' }} />);
      await waitFor(() => expect(getByText('Templates')).toBeInTheDocument());
    });

    it(' updates the navigation links when new data is received from API', async () => {
      mocks.getNavigationLinks.mockImplementationOnce(async () => {
        return [
          { title: 'Store', linkProps: { 'data-ga-event-category': 'store' } },
          { title: 'Versions', linkProps: {} },
        ];
      });
      const { getByText, getByAltText } = render(<pageComponent {...mocks} pathname={{ pathname: '/versions' }} />);
      await waitFor(() => expect(getByText('Store')).toBeInTheDocument());
    });
  });

  it('returns a valid JSX element', () => {
    const component = render(<pageComponent {...mocks} />);
    expect(component).toMatchSnapshot();
  });
});