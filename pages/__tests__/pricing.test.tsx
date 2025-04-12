import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Pricing from './Pricing';

describe('Pricing component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Pricing />);
    expect(container).toBeTruthy();
  });

  describe('HeroPricing component', () => {
    it('renders HeroPricing correctly', () => {
      const { getByText } = render(<Pricing />);
      expect(getByText('Hero Pricing')).toBeInTheDocument();
    });
  });

  describe('LicensingModelProvider', () => {
    let mockLicensingModelContext;

    beforeEach(() => {
      mockLicensingModelContext = {
        value: 'mock-model',
        setValue: jest.fn(),
      };
    });

    it('renders LicensingModelProvider with correct children', () => {
      const { getByText } = render(
        <Pricing>
          <LicensingModelProvider value={mockLicensingModelContext}>
            {/* Mobile, Tablet */}
            <Container sx={{ display: { xs: 'block', md: 'none' }, pb: 3, mt: '-1px' }}>
              <PricingList />
            </Container>
            {/* Desktop */}
            <Container sx={{ display: { xs: 'none', md: 'block' } }}>
              <PricingTable />
            </Container>
          </LicensingModelProvider>
        </Pricing>,
      );
      expect(getByText('Mock Model')).toBeInTheDocument();
    });

    it('calls setValue with correct value when updated', () => {
      const { getByText } = render(
        <Pricing>
          <LicensingModelProvider value={mockLicensingModelContext}>
            {/* Mobile, Tablet */}
            <Container sx={{ display: { xs: 'block', md: 'none' }, pb: 3, mt: '-1px' }}>
              <PricingList />
            </Container>
            {/* Desktop */}
            <Container sx={{ display: { xs: 'none', md: 'block' } }}>
              <PricingTable />
            </Container>
          </LicensingModelProvider>,
        </Pricing>,
      );
      fireEvent.change(getByText('Mock Model'), { target: { value: 'new-value' } });
      expect(mockLicensingModelContext.setValue).toHaveBeenCalledWith('new-value');
    });
  });

  describe('PricingList component', () => {
    it('renders PricingList correctly', () => {
      const { getByText } = render(
        <Pricing>
          <Container sx={{ display: { xs: 'block', md: 'none' }, pb: 3, mt: '-1px' }}>
            <PricingList />
          </Container>
        </Pricing>,
      );
      expect(getByText('Pricing List')).toBeInTheDocument();
    });
  });

  describe('PricingTable component', () => {
    it('renders PricingTable correctly', () => {
      const { getByText } = render(
        <Pricing>
          <Container sx={{ display: { xs: 'none', md: 'block' } }}>
            <PricingTable />
          </Container>
        </Pricing>,
      );
      expect(getByText('Pricing Table')).toBeInTheDocument();
    });
  });

  describe('Testimonials component', () => {
    it('renders Testimonials correctly', () => {
      const { getByText } = render(
        <Pricing>
          <Testimonials />
        </Pricing>,
      );
      expect(getByText('Testimonials')).toBeInTheDocument();
    });
  });

  describe('AppHeader and AppFooter components', () => {
    it('renders AppHeader and AppFooter correctly', () => {
      const { getByText } = render(
        <Pricing>
          <AppHeader />
          <AppFooter />
        </Pricing>,
      );
      expect(getByText('App Header')).toBeInTheDocument();
      expect(getByText('App Footer')).toBeInTheDocument();
    });
  });

  describe('HeroEnd component', () => {
    it('renders HeroEnd correctly', () => {
      const { getByText } = render(
        <Pricing>
          <HeroEnd />
        </Pricing>,
      );
      expect(getByText('Hero End')).toBeInTheDocument();
    });
  });
});