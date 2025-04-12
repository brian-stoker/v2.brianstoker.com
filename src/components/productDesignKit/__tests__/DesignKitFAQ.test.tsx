import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DesignKitFAQ from './DesignKitFAQ'; // Import the component to test
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { createMockStore } from 'redux-mock-store';

// Mock store for testing
const middlewares = [createMockStore];
const store = middlewares.reduce(createMockStore, {});

describe('DesignKitFAQ', () => {
  beforeEach(() => {
    // Reset the store before each test
    store.clearActions();
  });

  it('renders FAQs', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DesignKitFAQ />
      </ThemeProvider>
    );

    expect(getByText('Frequently asked questions')).toBeInTheDocument();
  });

  it('expands and collapses Accordion items', () => {
    const { getAllByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <DesignKitFAQ />
      </ThemeProvider>
    );

    const accordionItem1 = getByText('What is the process for switching between Figma, Sketch, and Adobe XD kits?');
    const accordionItem2 = getByText('How do I get a discount for switching between these tools?');

    expect(getAllByRole('region')).toHaveLength(5);

    fireEvent.click(accordionItem1);
    expect(accordionItem1).toHaveClass('Mui-expanded');

    fireEvent.click(accordionItem1);
    expect(accordionItem1).not.toHaveClass('Mui-expanded');
  });

  it('renders Paper component', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <DesignKitFAQ />
      </ThemeProvider>
    );

    const paperComponent = getByRole('region');

    expect(paperComponent).toBeInTheDocument();
  });
});