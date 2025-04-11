import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import PricingList from './PricingList.test.tsx';
import '@stoked-ui/docs/Link';

describe('PricingList component', () => {
  const pricingListProps = {
    planIndex: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<PricingList {...pricingListProps} />);
    expect(findElementByRole('tablist')).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('displays plans when planIndex is greater than or equal to 0', async () => {
      pricingListProps.planIndex = 1;
      render(<PricingList {...pricingListProps} />);
      expect(findElementByRole('tab')).toHaveLength(2);
    });

    it('displays plan when planIndex is less than 0', async () => {
      pricingListProps.planIndex = -1;
      render(<PricingList {...pricingListProps} />);
      expect(findElementByRole('tab')).not.toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('throws an error when planIndex is not a number', async () => {
      pricingListProps.planIndex = 'test';
      render(<PricingList {...pricingListProps} />);
      expect(findElementByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls onChange when tab is clicked', async () => {
      const onChangeMock = jest.fn();
      pricingListProps.onChange = onChangeMock;
      render(<PricingList {...pricingListProps} />);
      fireEvent.click(findElementByRole('tab'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when tab is selected', async () => {
      const onChangeMock = jest.fn();
      pricingListProps.onChange = onChangeMock;
      render(<PricingList {...pricingListProps} />);
      fireEvent.click(findElementByRole('tab'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls setPlanIndex when link is clicked', async () => {
      const setPlanIndexMock = jest.fn();
      pricingListProps.setPlanIndex = setPlanIndexMock;
      render(<PricingList {...pricingListProps} />);
      fireEvent.click(findElementByRole('link'));
      expect(setPlanIndexMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('PricingTable component', () => {
    it('renders plans when plans are provided', async () => {
      pricingListProps.plans = ['community'];
      render(<PricingList {...pricingListProps} />);
      expect(findElementByRole('table')).toBeInTheDocument();
    });

    it('does not display plan when plans are not provided', async () => {
      pricingListProps.plans = [];
      render(<PricingList {...pricingListProps} />);
      expect(findElementByRole('table')).not.toBeInTheDocument();
    });
  });
});

const findElementByRole = (role: string) => document.querySelector(`[role="${role}"]`);
const findLinkByRole = () => document.querySelector('[aria-label="Link"]');
const findTabByRole = () => document.querySelector('[role="tab"]');