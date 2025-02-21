import * as React from 'react';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import HeroPricing from 'src/components/pricing/HeroPricing';
import PricingTable from 'src/components/pricing/PricingTable';
import PricingList from 'src/components/pricing/PricingList';
import Testimonials from 'src/components/home/Testimonials';
import PricingWhatToExpect from 'src/components/pricing/PricingWhatToExpect';
import PricingFAQ from 'src/components/pricing/PricingFAQ';
import HeroEnd from 'src/components/home/HeroEnd';
import AppFooter from 'src/layouts/AppFooter';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import AppHeaderBanner from 'src/components/banner/AppHeaderBanner';
import { LicensingModelProvider } from 'src/components/pricing/LicensingModelContext';

export default function Pricing() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Pricing - SUI"
        description="The community edition lets you get going right away. Switch to a commercial plan for more components & technical support."
        card="/static/social-previews/pricing-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <HeroPricing />
        <Divider />
        <LicensingModelProvider>
          {/* Mobile, Tablet */}
          <Container sx={{ display: { xs: 'block', md: 'none' }, pb: 3, mt: '-1px' }}>
            <PricingList />
          </Container>
          {/* Desktop */}
          <Container sx={{ display: { xs: 'none', md: 'block' } }}>
            <PricingTable />
          </Container>
        </LicensingModelProvider>
        <PricingWhatToExpect />
        <Divider />
        <PricingFAQ />
        <Divider />
        <Testimonials />
        <Divider />
        <HeroEnd />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
