import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Custom404 from './Custom404.test.tsx';
import Head from '../Head.test.tsx';

describe('Custom404 component', () => {
  beforeEach(() => {
    // setup props
    props = {
      // Add any setup props here before each test
    };
  });

  it('renders without crashing', async () => {
    const { container } = render(<Custom404 {...props} />);
    expect(container).toBeTruthy();
  });

  it('renders all components', async () => {
    const { getByText, getByRole } = render(<Custom404 {...props} />);
    const head = getByRole('header');
    const appHeaderBanner = getByText('App Header Banner');
    const appHeader = getByText('App Header');
    expect(head).toBeInTheDocument();
    expect(appHeaderBanner).toBeInTheDocument();
    expect(appHeader).toBeInTheDocument();
  });

  it('renders NotFoundHero', async () => {
    const { getByRole } = render(<Custom404 {...props} />);
    const notFoundHero = getByRole('main');
    expect(notFoundHero).toBeInTheDocument();
  });

  it('renders AppFooter', async () => {
    const { getByText } = render(<Custom404 {...props} />);
    const appFooter = getByText('App Footer');
    expect(appFooter).toBeInTheDocument();
  });

  it('renders Divider component', async () => {
    const { getByRole } = render(<Custom404 {...props} />);
    const divider = getByRole('separator');
    expect(divider).toBeInTheDocument();
  });

  it('prop validation - valid props', async () => {
    const { getByText, getByRole } = render(
      <Custom404 title="Test Title" description="Test Description" />
    );
    const head = getByRole('header');
    const appHeaderBanner = getByText('App Header Banner');
    expect(head).toBeInTheDocument();
    expect(appHeaderBanner).toBeInTheDocument();
  });

  it('prop validation - invalid props', async () => {
    expect(() =>
      render(<Custom404 title="" description="Test Description" />)
    ).toThrowError();
  });

  it('should call Head component with correct prop values', async () => {
    const head = jest.fn();
    const { rerender } = render(
      <Custom404 title="Test Title" description="Test Description" head={head} />
    );
    expect(head).toHaveBeenCalledTimes(1);
    expect(head).toHaveBeenCalledWith({ title: 'Test Title', description: 'Test Description' });
  });

  it('should call AppHeaderBanner component with correct prop values', async () => {
    const appHeaderBanner = jest.fn();
    const { rerender } = render(
      <Custom404
        title="Test Title"
        description="Test Description"
        head={head}
        appHeaderBanner={appHeaderBanner}
      />
    );
    expect(appHeaderBanner).toHaveBeenCalledTimes(1);
    expect(appHeaderBanner).toHaveBeenCalledWith();
  });

  it('should call AppHeader component with correct prop values', async () => {
    const appHeader = jest.fn();
    const { rerender } = render(
      <Custom404
        title="Test Title"
        description="Test Description"
        head={head}
        appHeaderBanner={appHeaderBanner}
        appHeader={appHeader}
      />
    );
    expect(appHeader).toHaveBeenCalledTimes(1);
    expect(appHeader).toHaveBeenCalledWith();
  });

  it('should call AppFooter component with correct prop values', async () => {
    const appFooter = jest.fn();
    const { rerender } = render(
      <Custom404
        title="Test Title"
        description="Test Description"
        head={head}
        appHeaderBanner={appHeaderBanner}
        appHeader={appHeader}
        appFooter={appFooter}
      />
    );
    expect(appFooter).toHaveBeenCalledTimes(1);
    expect(appFooter).toHaveBeenCalledWith();
  });

  it('should render AppHeader and AppFooter correctly when AppHeaderBanner is present', async () => {
    const { getByText, getByRole } = render(
      <Custom404 title="Test Title" description="Test Description">
        <AppHeaderBanner />
      </Custom404>
    );
    expect(getByText('App Header')).toBeInTheDocument();
    expect(getByRole('main')).toBeInTheDocument();
  });

  it('should call AppHeader and AppFooter correctly when AppHeaderBanner is not present', async () => {
    const { getByText, getByRole } = render(<Custom404 title="Test Title" description="Test Description" />);
    expect(getByText('App Header')).toBeInTheDocument();
    expect(getByRole('main')).toBeInTheDocument();
  });

  it('should call AppFooter correctly when AppHeader is not present', async () => {
    const { getByText, getByRole } = render(<Custom404 title="Test Title" description="Test Description" />);
    expect(getByText('App Footer')).toBeInTheDocument();
    expect(getByRole('main')).toBeInTheDocument();
  });

  it('should call AppFooter correctly when AppHeader is not present', async () => {
    const { getByText, getByRole } = render(<Custom404 title="Test Title" description="Test Description" />);
    expect(getByText('App Footer')).toBeInTheDocument();
    expect(getByRole('main')).toBeInTheDocument();
  });

  it('should call AppFooter correctly when both AppHeader and AppFooter are present', async () => {
    const { getByText, getByRole } = render(
      <Custom404 title="Test Title" description="Test Description">
        <AppHeader />
      </Custom404>
    );
    expect(getByText('App Footer')).toBeInTheDocument();
  });

  it('should call AppFooter correctly when both AppHeader and AppFooter are not present', async () => {
    const { getByText, getByRole } = render(<Custom404 title="Test Title" description="Test Description" />);
    expect(getByText('App Footer')).toBeInTheDocument();
  });
});