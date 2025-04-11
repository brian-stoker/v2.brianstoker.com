import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DesignKitFAQ from './DesignKitFAQ'; // Import the component you want to test
import { accordionMockData, gridMockProps, linkMockData } from './mocks'; // Mock data for testing

describe('DesignKitFAQ', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(<DesignKitFAQ />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('displays accordion items', () => {
    const accordionItems = wrapper.findAll(byRole('region'));

    expect(accordionItems.length).toBe(5);
  });

  it('displays links in accordions', () => {
    const accordionSummaryContent = wrapper.findAll(byText(/FAQ/));

    expect(accordionSummaryContent.length).toBe(5);

    accordionSummaryContent.forEach((item) => {
      expect(item).toHaveAttribute('href');
    });
  });

  it('renders paper component with link to sales contact', () => {
    const paperComponent = wrapper.find(Paper);
    const button = paperComponent.find(Button);

    expect(button).toHaveAttribute('href');

    expect(paperComponent).toHaveStyleRule('border-color', 'grey.300');
  });

  it('displays contact form in paper component', async () => {
    await waitFor(() => {
      return wrapper.find(Paper).find('input[type="email"]');
    });

    const emailInput = wrapper.find('input[type="email"]');

    fireEvent.change(emailInput, { target: 'test@example.com' });
  });
});