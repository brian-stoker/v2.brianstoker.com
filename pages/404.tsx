import * as React from 'react';
import NotFoundHero from 'src/components/NotFoundHero';
import {HomeView} from "./index";

export default function Error404() {
  return <HomeView HomeMain={ NotFoundHero}/>;
}

