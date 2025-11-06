import React from 'react';
import Box from "@mui/material/Box";
import { HomeView } from "./index";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import LightboxGallery from "src/components/LightboxGallery"; // import the lightbox component

const art = [
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
  '/static/art/trees.jpg',
];

function MainView() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", margin: 10 }}>
      <ImageList variant="masonry" cols={3} gap={8} sx={{ maxWidth: 1120, overflow: 'visible' }}>
        {art.map((item, index) => (
          <ImageListItem key={index}>
            <img
              src={item}
              alt={`art ${index}`}
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
        items={art.map((src) => ({ src, type: "image" }))}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </Box>
  );
}

export default function Home({ HomeMain }: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView} />;
}
