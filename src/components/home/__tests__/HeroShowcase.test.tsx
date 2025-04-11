import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HeroShowcase from './HeroShowcase.test.tsx';

const products = require('../../products').default;
const { createMediaQueryValue } = require('@mui/material/useMediaQuery');

describe('HeroShowcase', () => {
  const initialTheme = useTheme();

  beforeEach(() => {
    jest.clearAllMocks();
    global.theme = initialTheme;
  });

  afterEach(() => {
    // Clean up mocks and other setup
  });

  it('renders without crashing', async () => {
    expect.assertions(1);
    await render(<Hero productId="mock-id" />);
    const component = render(<Hero productId="mock-id" />);
    expect(component).toBeTruthy();
  });

  it('renders loading indicator when no product is loaded', async () => {
    expect.assertions(1);
    await render(<Hero productId="non-existent-id" />);
    const loadingIndicator = document.querySelector('.loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('renders product preview when product exists', async () => {
    expect.assertions(1);
    await render(<Hero productId="mock-id" />);
    const productPreview = document.querySelector('#product-preview');
    expect(productPreview).toBeInTheDocument();
  });

  it('displays error message when product fails to load', async () => {
    expect.assertions(1);
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error()));
    await render(<Hero productId="non-existent-id" />);
    const errorMessage = document.querySelector('#error-message');
    expect(errorMessage).toBeInTheDocument();
  });

  it('supports theme change using media query', async () => {
    expect.assertions(1);
    const createMediaQueryValueSpy = jest.fn((value) => value);
    useMediaQuery.mockImplementation(createMediaQueryValue);
    await render(<Hero productId="mock-id" />);
    const themeSwitchButton = document.querySelector('.theme-switch-button');
    fireEvent.click(themeSwitchButton);
    expect(createMediaQueryValue).toHaveBeenCalledTimes(1);
  });

  it('supports theme change using theme switch button', async () => {
    expect.assertions(1);
    await render(<Hero productId="mock-id" />);
    const themeSwitchButton = document.querySelector('.theme-switch-button');
    fireEvent.click(themeSwitchButton);
    global.theme = { palette: { primaryDark: '#333' } };
    const newTheme = useTheme();
    expect(newTheme.palette.primaryDark).toBe('#333');
  });

  it('supports product change using theme switch button', async () => {
    expect.assertions(1);
    await render(<Hero productId="mock-id" />);
    const themeSwitchButton = document.querySelector('.theme-switch-button');
    fireEvent.click(themeSwitchButton);
    const themeSwitchMenu = document.querySelector('.theme-switch-menu');
    fireEvent.click(themeSwitchMenu.querySelector('option[value="product-2"]'));
    expect(0).not.toBe rendered;
  });

  it('renders loading indicator with dynamic component', async () => {
    const LoadingDynamic = createLoading((sx) =>
      sx({
        borderRadius: 1,
        bgcolor: 'grey.100',
      })
    );
    await render(<Hero productId="mock-id" />);
    const loadingIndicator = document.querySelector('.loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('renders snapshot', async () => {
    await render(<Hero productId="mock-id" />);
    const renderedComponent = render(<Hero productId="mock-id" />);
    expect(renderedComponent.asElement()).toMatchSnapshot();
  });
});