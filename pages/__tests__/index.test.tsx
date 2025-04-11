import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './HomeView';
import AppHeaderBanner from '../src/components/banner/AppHeaderBanner';
import Head from '../src/modules/components/Head';
import NewsletterToast from '../src/components/home/NewsletterToast';
import Hero from '../src/components/home/HeroMain';
import {PRODUCTS} from 'src/products';

jest.mock('next/dynamic');

const HomeMain = 'MainView';

describe('HomeView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<HomeView HomeMain={HomeMain} />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders MainView by default', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={HomeMain} />);
      expect(getByText('Stoked UI')).toBeInTheDocument();
      expect(queryByText('Hero')).not.toBeInTheDocument();
    });

    it('renders Hero when isClient is true', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={HomeMain} isClient={true} />);
      expect(getByText('Stoked UI')).toBeInTheDocument();
      expect(getByText('Hero')).toBeInTheDocument();
    });

    it('does not render Hero when isClient is false', async () => {
      const { queryByText, queryByRole } = render(<HomeView HomeMain={HomeMain} isClient={false} />);
      expect(queryByText('Stoked UI')).toBeInTheDocument();
      expect(queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('props validation', () => {
    it('throws an error when HomeMain is not a function', async () => {
      await expect(() => render(<HomeView HomeMain='nonFunction' />)).rejects.toThrowError('Expected HomeMain to be a function');
    });

    it('does not throw an error when HomeMain is undefined', async () => {
      const { container } = render(<HomeView HomeMain={undefined} />);
      expect(container).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls setIsClient when isClient changes', async () => {
      const setIsClientMock = jest.fn();
      const { getByText } = render(<HomeView HomeMain={HomeMain} isClient={true} />);
      fireEvent.click(getByText('Stoked UI'));
      await waitFor(() => expect(setIsClientMock).toHaveBeenCalledTimes(1));
    });

    it('calls Head.setPage when HomeHeader changes', async () => {
      const setHomePageMock = jest.fn();
      const { getByText } = render(<HomeView HomeMain={HomeMain} isClient={true} />);
      fireEvent.click(getByText('Stoked UI'));
      await waitFor(() => expect(setHomePageMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('renders BrandingCssVarsProvider on every render', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={HomeMain} />);
      fireEvent.renderOnce(getByText('Stoked UI'));
      await waitFor(() => expect(queryByText('BrandingCssVarsProvider')).not.toBeInTheDocument());
    });
  });

  it('renders with correct props', async () => {
    const { getByText, queryByText } = render(<HomeView HomeMain={HomeMain} />);
    expect(getByText('Stoked UI')).toBeInTheDocument();
    expect(queryByText('HomeView')).not.toBeInTheDocument();
  });

  it('snapshot test', async () => {
    const { asFragment } = render(<HomeView HomeMain={HomeMain} />);
    expect(asFragment()).toMatchSnapshot();
  });
});