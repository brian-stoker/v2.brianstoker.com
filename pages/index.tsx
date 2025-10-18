import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Divider from "@mui/material/Divider";
import {BrandingCssVarsProvider} from '@stoked-ui/docs';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";
import Hero from "../src/components/home/HeroMain";
import {BlogPost, getAllBlogPosts} from "../lib/sourcing";

export function HomeView({ HomeMain, mostRecentPosts = []}: { mostRecentPosts?: BlogPost[], HomeMain: React.ComponentType<any> }) {

  const Main: React.ComponentType<{mostRecentPosts?: BlogPost[]}> = HomeMain;
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

    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NoSsr>
        <NewsletterToast/>
      </NoSsr>
      <AppHeaderBanner/>
      <AppHeader/>
      <main id="main-content" style={{ flex: 1 }}>
        {isClient ? <Main mostRecentPosts={mostRecentPosts}/> : ''}
      </main>
      <Divider/>
      <AppFooter/>
    </div>
  </BrandingCssVarsProvider>

}

function MainView({ mostRecentPosts = []}: { mostRecentPosts?: BlogPost[] }) {
  return (<Hero mostRecentPosts={mostRecentPosts}/>);
}


export const getStaticProps = async () => {
  const {allBlogPosts} = await getAllBlogPosts();
  return {
    props: {
      mostRecentPosts: allBlogPosts.slice(0, 5),
    },
  };
};

export default function Home(data: { mostRecentPosts: BlogPost[] }) {
  return <HomeView HomeMain={ MainView } mostRecentPosts={data.mostRecentPosts}/>;
}
