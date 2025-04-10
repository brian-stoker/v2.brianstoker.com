import * as React from 'react';
import NextHead from 'next/head';
import {useRouter} from 'next/router';
import {LANGUAGES_SSR} from 'config';
import {useTranslate, useUserLanguage} from '@stoked-ui/docs/i18n';
import {pathnameToLanguage} from 'src/modules/utils/helpers';
import localFont from 'next/font/local'

// #major-version-switch
const HOST = process.env.PULL_REQUEST_ID
  ? `https://deploy-preview-${process.env.PULL_REQUEST_ID}--${process.env.NETLIFY_SITE_NAME}.netlify.app`
  : 'https://brianstoker.com';

interface HeadProps {
  card?: string;
  children?: React.ReactNode;
  description: string;
  disableAlternateLocale?: boolean;
  largeCard?: boolean;
  title: string;
  type?: string;
}
const archivo = localFont({ src: '../../../public/static/fonts/ArchivoBlack-Regular.ttf', weight: '400', variable: '--archivo' });

export default function Head(props: HeadProps) {

  const t = useTranslate();
  const {
    card = '/static/social-previews/home-preview.jpg',
    children,
    description = t('strapline'),
    disableAlternateLocale = false,
    largeCard = true,
    title = t('headTitle'),
    type = 'website',
  } = props;
  const userLanguage = useUserLanguage();
  const router = useRouter();
  const { canonicalAs } = pathnameToLanguage(router.asPath);
  const preview = card.startsWith('http') ? card : `${HOST}${card}`;

  const logoCss = `.stoked-font {
    font-family: "Archivo Black", sans-serif;
    font-weight: 400;
    font-style: normal;
  }`;
  return (<NextHead>
    <title>{title}</title>
    <meta name="description" content={description}/>
    {/* X */}
    <meta name="twitter:card" content={largeCard ? 'summary_large_image' : 'summary'}/>
    {/* https://x.com/MUI_hq */}
    <meta name="twitter:site" content="@MUI_hq"/>
    {/* #major-version-switch */}
    <meta name="twitter:title" content={title}/>
    <meta name="twitter:description" content={description}/>
    <meta name="twitter:image" content={preview}/>
    {/* Facebook */}
    <meta property="og:type" content={type}/>
    <meta property="og:title" content={title}/>
    {/* #major-version-switch */}
    <meta property="og:url" content={`${HOST}${router.asPath}`}/>
    <meta property="og:description" content={description}/>
    <meta property="og:image" content={preview}/>
    <meta property="og:ttl" content="604800"/>
    {/* Algolia */}
    <meta name="docsearch:language" content={userLanguage}/>
    {/* #major-version-switch */}
    <meta name="docsearch:version" content="master"/>
    <style>{logoCss}</style>
    {children}
  </NextHead>);
}
