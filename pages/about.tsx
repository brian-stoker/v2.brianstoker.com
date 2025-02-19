import * as React from 'react';
import Divider from '@mui/material/Divider';
import AppHeader from '../src/layouts/AppHeader';
import AppFooter from '../src/layouts/AppFooter';
import AboutHero from '../src/components/about/AboutHero';
import OurValues from '../src/components/about/OurValues';
import Team from '../src/components/about/Team';
import Head from '../src/modules/components/Head';
import BrandingCssVarsProvider from '../src/BrandingCssVarsProvider';
import AppHeaderBanner from '../src/components/banner/AppHeaderBanner';

export default function About() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="About us - SUI"
        description="SUI is a 100% remote globally distributed team, supported by a community of thousands
        of developers all across the world."
        card="/static/social-previews/about-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <AboutHero />
        <Divider />
        <OurValues />
        <Divider />
        <Team />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
