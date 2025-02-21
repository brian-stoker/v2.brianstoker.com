import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import TemplateHero from 'src/components/productTemplate/TemplateHero';
import ValueProposition from 'src/components/home/ValueProposition';
import TemplateDemo from 'src/components/productTemplate/TemplateDemo';
import Testimonials from 'src/components/home/Testimonials';
import HeroEnd from 'src/components/home/HeroEnd';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import References, { TEMPLATES_CUSTOMERS } from 'src/components/home/References';
import AppHeaderBanner from 'src/components/banner/AppHeaderBanner';

export default function Templates() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Fully built Stoked UI templates - SUI"
        description="A collection of 4.5 average rating templates, selected and curated by SUI's team of maintainers to get your projects up and running today."
        card="/static/social-previews/templates-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <TemplateHero />
        <References companies={TEMPLATES_CUSTOMERS} />
        <Divider />
        <ValueProposition />
        <Divider />
        <TemplateDemo />
        <Divider />
        <Testimonials />
        <Divider />
        <HeroEnd />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
