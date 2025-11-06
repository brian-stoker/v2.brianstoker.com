import React from 'react';
import Box from "@mui/material/Box";
import {HomeView} from "./index";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import LightboxGallery from "src/components/LightboxGallery";

const photography: string[] = [
  '/static/photography/alter.jpg',
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
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <Box sx={{
      fontSize: "1.6rem",
      lineHeight: '2.4rem',
      display: 'flex', justifyContent: 'center',
      margin: 10,
    }}>
      <ImageList variant="masonry" cols={3} gap={8} sx={{ maxWidth: 1120, overflow: 'visible'  }}>
        {photography.map((item, index) => (
          <ImageListItem key={index}>
            <img
              srcSet={`${item}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={`${item}`}
              alt={`photography ${index}`}
              loading="lazy"
              onClick={() => setOpenIndex(index)}
              style={{
                cursor: "pointer",
                borderRadius: 8,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Lightbox */}
      <LightboxGallery
        items={photography.map((src) => ({ src, type: "image" }))}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </Box>
  )
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView}/>;
}
