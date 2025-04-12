import React from 'react';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  PRODUCTS,
  ProductStackProps,
  ProductSwipeableProps
} from "../../products";
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ProductsSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    expect(() => render(<ProductsSwitcher {...props} />)).not.toThrow();
  });

  it('renders stack component when in view', async () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    const { getByText } = render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Stack')).toBeInTheDocument());
  });

  it('renders swipeable component when below md', async () => {
    const props: ProductStackProps = {
      inView: false,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    const { getByText } = render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Swipeable')).toBeInTheDocument());
  });

  it('renders swipeable component when below md and in view', async () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Swipeable')).toBeInTheDocument());
  });

  it('calls setProductIndex when switching products', async () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    userEvent.click(getByText('Stack'));
    await waitFor(() => expect(props.setProductIndex).toHaveBeenCalledTimes(1));
  });

  it('calls setProductIndex when switching products with swipeable', async () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    userEvent.click(getByText('Swipeable'));
    await waitFor(() => expect(props.setProductIndex).toHaveBeenCalledTimes(1));
  });

  it('renders stack component with valid props', async () => {
    const props: ProductStackProps = {
      inView: true,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Stack')).toBeInTheDocument());
  });

  it('does not render stack component with invalid props', async () => {
    const props: ProductStackProps = {
      inView: false,
    };
    render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Stack')).not.toBeInTheDocument());
  });

  it('renders swipeable component with valid props', async () => {
    const props: ProductStackProps = {
      inView: false,
      productIndex: 0,
      setProductIndex: jest.fn(),
    };
    render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Swipeable')).toBeInTheDocument());
  });

  it('does not render swipeable component with invalid props', async () => {
    const props: ProductStackProps = {
      inView: true,
    };
    render(<ProductsSwitcher {...props} />);
    await waitFor(() => expect(getByText('Swipeable')).not.toBeInTheDocument());
  });
});