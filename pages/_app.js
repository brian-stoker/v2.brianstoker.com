import { SessionProvider } from "next-auth/react";
import { DocsProvider } from "@stoked-ui/docs/DocsProvider";

const docsConfig = {
  LANGUAGES: ['en'],
  LANGUAGES_SSR: ['en'],
  LANGUAGES_IN_PROGRESS: [],
  LANGUAGES_IGNORE_PAGES: () => false,
};

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <DocsProvider config={docsConfig} defaultUserLanguage="en">
        <Component {...pageProps} />
      </DocsProvider>
    </SessionProvider>
  );
}