import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import PricingList from './PricingList.test.tsx';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from './testTheme';
import { LicenseModelContextValue, LicensingModelValue } from 'src/components/pricing/LicensingModelContext';

describe('Pricing List', () => {
  const pricingList = (
    <MuiThemeProvider theme={theme}>
      <PricingList />
    </MuiThemeProvider>
  );

  beforeEach(() => {
    // setup a test store
    window.__STORAGEDOC__ = {};
    document.body.style.marginBottom = 'auto';
  });

  afterEach(() => {
    // cleanup test store
    delete window.__STORAGEDOC__;
    if (globalThis.document) {
      globalThis.document.body.style.marginBottom = '';
    }
  });

  it('renders without crashing', () => {
    expect(render(pricingList)).not.toThrow();
  });

  describe('Plan component', () => {
    const plan: PlanName = 'community';
    const benefits: Array<string> = ['benefit1', 'benefit2'];
    const unavailable = false;
    const sx = { color: '#333' };

    it('renders plan name and price', async () => {
      const { getByText, getByRole } = render(
        <PricingList>
          <Plan
            plan={plan}
            benefits={benefits}
            unavailable={unavailable}
            sx={sx}
          />
        </PricingList>
      );

      expect(getByText(plan)).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();

      const planPrice = getByText(benefits[0]);
      expect(planPrice).toHaveStyle({
        color: '#333',
      });
    });

    it('renders unavailable button when unavailable', async () => {
      const { getByRole } = render(
        <PricingList>
          <Plan
            plan={plan}
            benefits={benefits}
            unavailable={unavailable}
            sx={sx}
          />
        </PricingList>
      );

      expect(getByRole('button')).toBeInTheDocument();
      expect(getByRole('button').getAttribute('disabled')).toBe('true');
    });

    it('renders link with correct href when plan is pro or premium', async () => {
      const { getByText } = render(
        <PricingList>
          <Plan
            plan={plan}
            benefits={benefits}
            unavailable={unavailable}
            sx={sx}
          />
        </PricingList>
      );

      expect(getByText(plan)).toBeInTheDocument();

      // act on link to see if it takes the correct route
      const button = getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.location).toHavePathname('/pro');
      });
    });

    it('renders benefit icons', async () => {
      const { getAllByRole } = render(
        <PricingList>
          <Plan
            plan={plan}
            benefits={benefits}
            unavailable={unavailable}
            sx={sx}
          />
        </PricingList>
      );

      expect(getAllByRole('img')).toHaveLength(benefits.length);
    });
  });

  describe('Tabs component', () => {
    it('renders tabs with correct labels', async () => {
      const { getByText } = render(
        <PricingList>
          <Tabs value={0} variant="fullWidth" onChange={() => {}} />
        </PricingList>
      );

      expect(getByText('Community')).toBeInTheDocument();
      expect(getByText('Pro')).toBeInTheDocument();
      expect(getByText('Premium')).toBeInTheDocument();
    });

    it('renders active tab when selected', async () => {
      const { getByText } = render(
        <PricingList>
          <Tabs value={0} variant="fullWidth" onChange={() => {}} />
        </PricingList>
      );

      expect(getByText('Community')).toBeInTheDocument();

      // act on link to see if it changes the active tab
      const tabButton = getByText('Pro');
      fireEvent.click(tabButton);

      await waitFor(() => {
        expect(getByText('Pro')).toHaveClass('Mui-selected');
      });
    });
  });

  describe('PricingTable component', () => {
    const plans: Array<PlanName> = ['community'];
    it('renders column header', async () => {
      const { getByText } = render(
        <PricingList>
          <PricingTable columnHeaderHidden plans={plans} />
        </PricingList>
      );

      expect(getByText(plans[0])).toBeInTheDocument();
    });

    it('renders plan details when selected tab has plan details', async () => {
      const { getByText, getByRole } = render(
        <PricingList>
          <Tabs value={1} variant="fullWidth" onChange={() => {}} />
          <PricingTable columnHeaderHidden plans={['pro']} />
        </PricingList>
      );

      expect(getByRole('button')).toBeInTheDocument();

      // act on link to see if it shows the correct plan details
      const tabButton = getByText('Pro');
      fireEvent.click(tabButton);

      await waitFor(() => {
        expect(getByText('Plan name')).toBeInTheDocument();
      });
    });

    it('renders pricing table when plans are available', async () => {
      const { getAllByRole } = render(
        <PricingList>
          <Tabs value={1} variant="fullWidth" onChange={() => {}} />
          <PricingTable columnHeaderHidden plans={['pro']} />
        </PricingList>
      );

      expect(getAllByRole('table')).toHaveLength(1);
    });
  });

  it('uses the correct license model when pro plan is selected', async () => {
    const contextValue: LicenseModelContextValue = { value: LicensingModelValue.pro };
    render(
      <MuiThemeProvider theme={theme}>
        <PricingList />
        <LicenseModelProvider value={contextValue} />
      </MuiThemeProvider>
    );

    // act on link to see if it takes the correct route
    const button = getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(document.location).toHavePathname('/pro');
    });

    // check that the correct license model is being used
    expect(contextValue.value).toBe(LicensingModelValue.pro);
  });
});