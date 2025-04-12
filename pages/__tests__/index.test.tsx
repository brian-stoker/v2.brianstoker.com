import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { HomeView } from './HomeView';
import { HomeViewProps, HomeViewState } from './types';
import { dynamic } from 'next/dynamic';

describe('HomeView', () => {
  let homeUrl: string;
  let mainComponent: any;

  beforeEach(() => {
    homeUrl = randomHome(PRODUCTS.pages);
    mainComponent = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });
  });

  it('renders without crashing', async () => {
    const { container } = render(<HomeView HomeMain={mainComponent} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders main component on client side', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={mainComponent} />);
      await waitFor(() => expect(getByText(mainComponent.name)).toBeTruthy());
    });

    it('renders no content on server side', async () => {
      const { queryByText } = render(<HomeView HomeMain={null} />);
      expect(queryByText(mainComponent.name)).toBeFalsy();
    });
  });

  describe('props validation', () => {
    it('validates required props', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain=null />);

      expect(getByText(null)).toBeFalsy();
      expect(queryByText(mainComponent.name)).toBeTruthy();
    });

    it('handles invalid props', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={null} previews='invalid' />);
      expect(getByText(null)).toBeTruthy();
      expect(queryByText(mainComponent.name)).toBeFalsy();
    });
  });

  describe('user interactions', () => {
    it('calls setIsClient on mount', async () => {
      const { getByText } = render(<HomeView HomeMain={mainComponent} />);
      await waitFor(() => expect(getByText(mainComponent.name)).toBeTruthy());
    });

    it('handles click event', async () => {
      const { getByText, getByRole } = render(<HomeView HomeMain={mainComponent} />);
      const button = getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(getByText(mainComponent.name)).toBeTruthy());
    });
  });

  describe('side effects', () => {
    it('calls setIsClient in useEffect', async () => {
      const { getByText, queryByText } = render(<HomeView HomeMain={mainComponent} />);
      await waitFor(() => expect(queryByText('brian stoker')).toBeTruthy());
    });
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(<HomeView HomeMain={mainComponent} />);
    expect(asFragment()).toMatchSnapshot();
  });
});

function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random() * homePages.length)];
}

export default function Home({ HomeMain }: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={HomeMain || MainView}/>;
}

function MainView() {
  return (<React.Fragment>
      <Hero/>
      <Divider/>
    </React.Fragment>)
}