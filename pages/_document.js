import * as React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { getInitColorSchemeScript as getMuiInitColorSchemeScript } from '@mui/material/styles';
import { getMetaThemeColor } from '@stoked-ui/docs/branding';

// Removed autoprefixer dependency
const prefixer = null;
const cleanCSS =
  process.env.NODE_ENV === 'production' ? new (require('clean-css'))() : null;

export default class MyDocument extends Document {
  render() {
    const { canonicalAsServer, userLanguage } = this.props;

    return (
      <Html lang={userLanguage} data-mui-color-scheme="light" data-joy-color-scheme="light">
        <Head>
          {/* Favicons */}
          <link
            href="/favicon-black.png"
            rel="icon"
            media="(prefers-color-scheme: light)"
          />
          <link
            href="/favicon.ico"
            rel="icon"
            media="(prefers-color-scheme: dark)"
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png"/>
          <link rel="manifest" href="/static/site.webmanifest.json"/>
          <link rel="mask-icon" href="/static/safari-pinned-tab.svg" color="#5bbad5"/>
          <meta name="msapplication-TileColor" content="#2d89ef"/>
          <meta name="theme-color" content={getMetaThemeColor('light')}
                media="(prefers-color-scheme: light)"/>
          <meta name="theme-color" content={getMetaThemeColor('dark')}
                media="(prefers-color-scheme: dark)"/>
          <link rel="canonical" href={`https://brianstoker.com${canonicalAsServer}`}/>
          <link rel="alternate" href={`https://www.brianstoker.com${canonicalAsServer}`}
                hrefLang="x-default"/>

          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Archivo+Black&display=swap"
            rel="stylesheet"/>
          <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet"/>
    
          {/* Preload Fonts */}
          {this.renderFontPreloads()}

          {/* Inline Font Styles for fallback */}
          {this.renderInlineFontStyles()}
        </Head>
        <body>
        {getMuiInitColorSchemeScript()}
        <Main/>
        <NextScript/>
        </body>
      </Html>
    );
  }

  renderFontPreloads() {
    const fonts = [
      {href: '/static/fonts/GeneralSans-Semibold-subset.woff2', family: 'General Sans', weight: 600 },
      { href: '/static/fonts/ArchivoBlack-Regular.woff2', family: 'Archivo Black', weight: 400 },
      { href: '/static/fonts/IBMPlexSans-Regular-subset.woff2', family: 'IBM Plex Sans', weight: 400 },
    ];

    return fonts.map((font) => (
      <link
        key={font.href}
        rel="preload"
        href={font.href}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    ));
  }

  renderInlineFontStyles() {
    const fontFaces = [
      {
        family: 'General Sans',
        src: '/static/fonts/GeneralSans-Semibold-subset.woff2',
        weight: 600,
      },
      {
        family: 'Archivo Black',
        src: '/static/fonts/ArchivoBlack-Regular.woff2',
        weight: 400,
      },
      {
        family: 'IBM Plex Sans',
        src: '/static/fonts/IBMPlexSans-Regular-subset.woff2',
        weight: 400,
      },
    ];

    return fontFaces.map((font, index) => (
      <style
        key={index}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: '${font.family}';
              font-style: normal;
              font-weight: ${font.weight};
              font-display: swap;
              src: url('${font.src}') format('woff2');
            }
          `,
        }}
      />
    ));
  }
}
