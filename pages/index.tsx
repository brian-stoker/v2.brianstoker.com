import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Divider from "@mui/material/Divider";
import { PRODUCTS } from 'src/products';
import BrandingCssVarsProvider from 'src/BrandingCssVarsProvider';
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";
import Hero from "../src/components/home/HeroMain";
import { pdfjs } from 'react-pdf';

function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}
export function HomeView({ HomeMain, previews = false}: { previews?: boolean, HomeMain: React.ComponentType<any> }) {
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
            url: 'https://brianstoker.com/',
            logo: 'https://brianstoker/static/logo.png'
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
    </main>
    <Divider/>
    <AppFooter/>
  </BrandingCssVarsProvider>

}

function MainView() {
  return (<React.Fragment>
      <Hero/>

    </React.Fragment>)
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={ HomeMain || MainView } />;
}
