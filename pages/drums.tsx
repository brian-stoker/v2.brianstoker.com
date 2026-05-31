import React from 'react';
import Box from "@mui/material/Box";
import {HomeView} from "./index";
import VideoGallery from "../src/components/video/videos";

export interface IMovie  { url: string, img: string, title: string }

const videos = [
  {
    id: '0',
    poster: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/normal-guy.png',
    thumb: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/normal-guy.png',
    title: 'Normal Guy',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/normal-guy.mp4',
    type: 'video/quicktime' ,
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      muted: true,
      disablePictureInPicture: true,
    },
  },{
    id: '1',
    poster: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/golden-streams.png',
    thumb: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/golden-streams.png',
    title: 'Golden Stream',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/golden-streams.mp4',
    type: 'video/mp4',
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      muted: true,
      disablePictureInPicture: true,
    },

  },{
    id: '2',
    poster: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/train.png',
    thumb: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/train.png',
    title: 'Train',
    by: 'Chase, Anthony, and Brian Stoker',
    src: 'https://cdn.stokd.cloud/brian.stokd.cloud/drums/train.mp4',
    type: 'video/mp4' ,
    attributes: {
      preload: 'metadata',
      controls: true,
      playsInline: true,
      muted: true,
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
