import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const photography: string[] = [
  '/static/photography/alter.jpg',
  '/static/photography/art.jpg',
  '/static/photography/bed-selfie.jpg',
  '/static/photography/bar.jpg',
  '/static/photography/building.jpg',
  '/static/photography/circle-self-portrait.jpg',
  '/static/photography/drinking.jpg',
  '/static/photography/faith-boat.jpg',
  '/static/photography/magic-bus.jpg',
  '/static/photography/send-nudes.jpg',
  '/static/photography/stallion.jpg'
]

function MainView() {
  return (
    <Box sx={{
      fontSize: "1.6rem",
      lineHeight: '2.4rem',
      display: 'flex', justifyContent: 'center',
      margin: 10,
    }}>
      <ImageList variant="masonry" cols={3} gap={8}>
        {photography.map((item, index) => (
          <ImageListItem key={index}>
            <img
              srcSet={`${item}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={`${item}`}
              alt={'art image'}
              loading="lazy"
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  )
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView}/>;
}
