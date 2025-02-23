import React from 'react';
import Box from "@mui/material/Box";
import {HomeView} from "./index";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const art: string[] = [
  '/static/art/wild-eyes.jpg',
  '/static/art/starry-fire.jpg',
  '/static/art/red-swirl.jpg',
  '/static/art/trees.jpg',
  '/static/art/office.jpg',
  '/static/art/omar-rodriguez-lopez.jpg',
  '/static/art/orange-heaven.jpg',
  '/static/art/fire.jpg',
  '/static/art/electric.jpg',
  '/static/art/bedroom-graffiti.jpg',
  '/static/art/backyard.jpg',
  '/static/art/trees.jpg'
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
        {art.map((item, index) => (
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
