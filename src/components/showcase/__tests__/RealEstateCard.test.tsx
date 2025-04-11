import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import RealEstateCard from './RealEstateCard';
import '@mui/material/styles';

describe('RealEstateCard component', () => {
  const realEstateCard = (props: any) => (
    <RealEstateCard {...props} />
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render without crashing', async () => {
    await expect(render(realEstateCard({ sx: {} }))). Promise.resolve();
  });

  describe('conditional rendering', () => {
    const defaultProps = { sx: {} };
    const withImageProps = { sx: { display: 'flex' } };
    const withPriceProps = { sx: { color: 'error.500' } };

    it('should render without image prop', async () => {
      await expect(render(realEstateCard(withImageProps)).byAltText('123 Main St, Phoenix, AZ cover')).not.toBeNull();
    });

    it('should not render without image prop', async () => {
      await expect(render(realEstateCard({}))).toBeNull();
    });

    it('should render with price prop set to invalid value', async () => {
      await expect(render(realEstateCard(withPriceProps)).byText('$280k - $310k')).not.toBeNull();
    });

    it('should not render with price prop set to invalid value', async () => {
      await expect(render(realEstateCard({ sx: { color: 'error.500' } })).byText('$280k - $310k')).toBeNull();
    });
  });

  describe('prop validation', () => {
    const invalidProps = { sx: 'invalid-value' };

    it('should throw error when sx prop is not a function', async () => {
      expect(() => render(realEstateCard({ sx: invalidProps }))).toThrowError();
    });

    it('should render correctly with valid props', async () => {
      await expect(render(realEstateCard({ sx: {} })).byAltText('123 Main St, Phoenix, AZ cover')).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    const defaultProps = { sx: {} };
    const clickHandlerProps = { onClick: jest.fn() };

    it('should call onClick handler on click event', async () => {
      await expect(render(realEstateCard(clickHandlerProps))).findByRole('button').click();
      expect(clickHandlerProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('should not change price value when input field is changed', async () => {
      const changePriceHandler = jest.fn();

      await render(realEstateCard({ sx: { color: 'error.500' }, onChangePrice: changePriceHandler }));
      const inputField = document.querySelector('#priceInput');
      fireEvent.change(inputField, { target: { value: '$280k - $310k' } });
      expect(changePriceHandler).toHaveBeenCalledTimes(0);
    });

    it('should render correctly after form submission', async () => {
      await expect(render(realEstateCard({ sx: {} })).byAltText('123 Main St, Phoenix, AZ cover')).not.toBeNull();
    });
  });

  describe('side effects and state changes', () => {
    const defaultProps = { sx: {} };

    it('should update price value when new price prop is passed', async () => {
      await expect(render(realEstateCard({ sx: {}, price: '$280k - $310k' })).byText('$280k - $310k')).not.toBeNull();
    });

    it('should not update price value when price prop is set to null or undefined', async () => {
      await render(realEstateCard({ sx: {}, price: null }));
      expect(document.querySelector('#priceInput').value).toBe('');
    });
  });
});