import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";
import Card from '@mui/material/Card';
import {CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Button } from '@mui/base/Button';
import VideoGallery from "./videos";

export interface IMovie  { url: string, img: string, title: string }

const videos = [
  {
    src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
    subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png'
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
    thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
    subHtml: `<h4>'Golden Stream' by Chase, Anthony, and Derp</h4>`,
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4',
    subHtml: `<h4>'Tell Me Mister' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png',
  },
  // Add more video objects as needed
];

function MainView() {

  return (
    <VideoGallery title={'drums'} videos={videos}/>
  )
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView}/>;
}
