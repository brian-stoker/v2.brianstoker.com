import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {PRODUCTS} from 'src/products';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";
import Hero from "../src/components/home/HeroMain";

function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random() * homePages.length)];
}
export function HomeView({ HomeMain, previews = false}: { previews?: boolean, HomeMain: React.ComponentType }) {
  const homeUrl = randomHome(PRODUCTS.pages);
  const RandomHome = dynamic(() => import((`.${homeUrl}main`)), {ssr: false});

  const Main: React.ComponentType = HomeMain || RandomHome;
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return <BrandingCssVarsProvider>
    <Head
      title="brian stoker"
      description="A spot to stuff my stash"
      card="/static/social-previews/home-preview.jpg"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stoked UI',
            url: 'https://stoked-ui.github.io.com/',
            logo: 'https://stoked-ui.github.io/static/logo.png',
            sameAs: ['https://x.com/MUI_hq', 'https://github.com/mui/', 'https://opencollective.com/mui-org',],
          }),
        }}
      />

    </Head>
    <NoSsr>
      <NewsletterToast/>
    </NoSsr>
    <AppHeaderBanner/>
    <AppHeader/>
    <main id="main-content">
      {isClient ? <Main/> : ''}
      {previews && PRODUCTS.previews()}
    </main>
    <AppFooter/>
  </BrandingCssVarsProvider>;
}

function MainView() {
  return (<React.Fragment>
      <Hero/>
      <Divider/>
    </React.Fragment>)
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={HomeMain || MainView}/>;
}
