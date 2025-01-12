import React from 'react';
import Box from "@mui/material/Box";
import {HomeView} from "./index";
import VideoGallery from "../src/components/video/videos";

export interface IMovie  { url: string, img: string, title: string }

const videos = [
  {
    id: '0',
    poster: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
    thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
    title: 'Normal Guy',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
    type: 'video/quicktime' ,
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      defaultMuted: true,
      disablePictureInPicture: true,
    },
  },{
    id: '1',
    poster: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
    thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
    title: 'Golden Stream',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
    type: 'video/mp4',
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      defaultMuted: true,
      disablePictureInPicture: true,
    },

  },{
    id: '2',
    poster: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png',
    thumb: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png',
    title: 'Tell Me Mister',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4',
    type: 'video/mp4' ,
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      defaultMuted: true,
      disablePictureInPicture: true,
    },
  },
  // Add more video objects as needed
];

function MainView() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box ref={containerRef}>
      <VideoGallery videos={videos} />
    </Box>
  )
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView}/>;
}
