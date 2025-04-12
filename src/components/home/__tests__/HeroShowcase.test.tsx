import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PRODUCTS } from '../../products';

interface HeroProps extends BoxProps {
  productId: string;
}

const Loading = dynamic(() => import('../../components/Loading'));

describe('Hero component', () => {
  let theme;
  let heroProps;

  beforeEach(() => {
    heroProps = { productId: 'test-id' };
    theme = useTheme();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Hero {...heroProps} />);
    expect(container).not.toThrowError();
  });

  describe('conditional rendering', () => {
    it('renders loading indicator when data is not available', async () => {
      const { container, getByText } = render(
        <Hero productId="non-existent-id" />,
      );
      await waitFor(() => expect(getByText('Loading...')).toBeInTheDocument());
    });

    it('renders product preview when data is available', async () => {
      const { container, getByText } = render(<Hero {...heroProps} />);
      await waitFor(() => expect(getByText('Product Preview')).toBeInTheDocument());
    });
  });

  describe('prop validation', () => {
    it('throws error when productId prop is missing', () => {
      expect(
        render(
          <Hero
            productId={undefined}
            />
        ).throwError,
      ).toBeInstanceOf(Error);
    });

    it('renders without errors when productId prop is present', async () => {
      const { container } = render(<Hero {...heroProps} />);
      expect(container).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('renders correct product preview on click', async () => {
      const mockNavigate = jest.fn();
      const { getByText } = render(
        <Hero productId={heroProps.productId} />
      );
      const productPreviewButton = getByText('Product Preview');
      fireEvent.click(productPreviewButton);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('renders loading indicator when clicking on button', async () => {
      const mockLoadingComponent = jest.fn();
      const { container } = render(
        <Hero productId={heroProps.productId} />,
      );
      const loadingIndicator = container.querySelector('.MuiBox-root--primary');
      fireEvent.click(loadingIndicator);
      expect(mockLoadingComponent).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('renders correct product preview with updated theme', async () => {
      const mockUpdatedTheme = jest.fn();
      const { container } = render(
        <Hero productId={heroProps.productId} />,
      );
      theme.applyDarkStyles({});

      const darkProductPreview = container.querySelector('.MuiBox-root--primary');
      expect(darkProductPreview).toHaveStyle('background-color: #333');

      theme.applyLightStyles({});
      const lightProductPreview = container.querySelector('.MuiBox-root--primary');
      expect(lightProductPreview).toHaveStyle('background-color: #fff');

      theme.applyDarkStyles({});

      mockUpdatedTheme();
    });
  });
});