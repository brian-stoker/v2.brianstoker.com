import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ProductsSwitcher } from './ProductsSwitcher.test.tsx';
import { PRODUCTS, ProductStackProps, ProductSwipeableProps } from '../../products';

describe('ProductsSwitcher component', () => {
  let props: ProductStackProps;
  let setProductIndexSpy: jest.Mock;

  beforeEach(() => {
    setProductIndexSpy = jest.fn();
    props = {
      inView: true,
      productIndex: 0,
      setProductIndex: setProductIndexSpy,
    };
  });

  it('renders without crashing', async () => {
    const { container } = render(<ProductsSwitcher {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe('Conditional rendering', () => {
    it('renders products swipeable when in view and below md', async () => {
      props.isBelowMd = true;
      const { getByText } = render(<ProductsSwitcher {...props} />);
      expect(getByText('Product Swipeable')).toBeInTheDocument();
    });

    it('renders product stack when not in view or above md', async () => {
      props.inView = false;
      const { getByText } = render(<ProductsSwitcher {...props} />);
      expect(getByText('Product Stack')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('throws an error for invalid props type', () => {
      try {
        <ProductsSwitcher invalidProps />;
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('does not throw an error for valid props type', async () => {
      const { container } = render(<ProductsSwitcher {...props} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls setProductIndex when clicking the component', async () => {
      const { getByText } = render(<ProductsSwitcher {...props} />);
      const element = getByText('Set Product Index');
      fireEvent.click(element);
      expect(setProductIndexSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call setProductIndex when clicking outside the component', async () => {
      const { getByText, container } = render(<ProductsSwitcher {...props} />);
      const outsideElement = container.querySelector('.outside-element');
      if (outsideElement) {
        fireEvent.click(outsideElement);
      }
      expect(setProductIndexSpy).not.toHaveBeenCalled();
    });

    it('does not call setProductIndex when submitting a form', async () => {
      const { getByText } = render(<ProductsSwitcher {...props} />);
      const submitButton = getByText('Submit');
      fireEvent.submit(document.querySelector('form'));
      expect(setProductIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe('Side effects and state changes', () => {
    it('calls setProductIndex when the product index changes', async () => {
      props.productIndex = 1;
      const { getByText } = render(<ProductsSwitcher {...props} />);
      expect(setProductIndexSpy).toHaveBeenCalledTimes(2);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});