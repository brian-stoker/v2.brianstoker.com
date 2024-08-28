import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from 'src/modules/components/Head';
import BrandingCssVarsProvider from 'src/BrandingCssVarsProvider';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import AppHeaderBanner from 'src/components/banner/AppHeaderBanner';
import NotFoundHero from 'src/components/NotFoundHero';

export default function Custom404() {
  return (
    <BrandingCssVarsProvider>
      <Head title="404: This page could not be found - SUI" description="" />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <NotFoundHero />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
