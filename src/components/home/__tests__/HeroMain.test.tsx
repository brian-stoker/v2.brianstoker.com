import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Hero from './HeroMain';

jest.mock('../../products', () => ({
  ALL_PRODUCTS: [],
  products: jest.fn(),
}));

describe('Hero Component', () => {
  beforeEach(() => {
    global.localStorage.clear();
    window.matchMedia = jest.fn(() => ({ matches: false }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Hero />);
    expect(container).toBeInTheDocument();
  });

  it('renders player cards when globalTheme is defined', async () => {
    const globalTheme = { breakpoints: { up: 'md' }, themeMode: 'dark' };
    useTheme.mockImplementation(() => globalTheme);
    const { getByText } = render(<Hero />);
    expect(getByText(ALL_PRODUCTS[0].name)).toBeInTheDocument();
  });

  it('renders player cards when isMdUp is true', async () => {
    const { getByText } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: true }));
    expect(getByText(ALL_PRODUCTS[0].name)).toBeInTheDocument();
  });

  it('does not render player cards when globalTheme is undefined', async () => {
    useTheme.mockImplementationOnce(() => null);
    const { queryByText } = render(<Hero />);
    expect(queryByText '').not.toBeInTheDocument();
  });

  it('calls products function on mount', async () => {
    const productsSpy = jest.spyOn(Hero, 'products');
    const { getByText } = render(<Hero />);
    await waitFor(() => expect(productsSpy).toHaveBeenCalledTimes(1));
  });

  it('renders GetStartedButtons when isMdUp is true', async () => {
    const { getByText, getByRole } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: true }));
    expect(getByText('Get started')).toBeInTheDocument();
    expect(getByRole('button')).toHaveAttribute('aria-label', 'primary');
  });

  it('renders GradientText when isMdUp is true', async () => {
    const { getByText, getByRole } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: true }));
    expect(getByText('Get started')).toBeInTheDocument();
    expect(getByRole('heading')).toHaveStyle('font-family: "Montserrat"');
  });

  it('renders Box and Typography components', async () => {
    const { getByText, getByRole } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: true }));
    expect(getByText(ALL_PRODUCTS[0].name)).toBeInTheDocument();
    expect(getByRole('group')).toHaveStyle({
      display: 'flex',
      flexWrap: 'wrap',
    });
  });

  it('calls GetStartedButtons function when primary button is clicked', async () => {
    const getStartedButtonsSpy = jest.spyOn(GetStartedButtons, 'onClick');
    const { getByText } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: true }));
    const primaryButton = getByRole('button', { name: 'primary' });
    fireEvent.click(primaryButton);
    expect(getStartedButtonsSpy).toHaveBeenCalledTimes(1);
  });

  it('renders GetStartedButtons when local storage has "heroShown" as true', async () => {
    localStorage.setItem('heroShown', 'true');
    const { getByText, getByRole } = render(<Hero />);
    window.matchMedia.mockImplementation(() => ({ matches: false }));
    expect(getByText('Get started')).toBeInTheDocument();
    expect(getByRole('button')).toHaveAttribute('aria-label', 'primary');
  });
});