import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { styled } from '@mui/material/styles';
import Typography from "@mui/material/Typography";

// Responsive settings for react-multi-carousel
const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

// Styled components
const FullScreenSlide = styled('div')(({theme}) => ({
  width: '100vw',
  height: '900px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.background.default,
}));

const Video = styled('video')({
  maxWidth: '100%',
  maxHeight: '800px',
})

const ThumbnailsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '16px',
  marginBottom: '24px'
})

const Thumbnail = styled('img')({
  width: '130px',
  height: '100px',
  objectFit: 'cover',
  margin: '0 8px',
  cursor: 'pointer',
  borderRadius: '8px',
  border: '2px solid transparent',
  '&:hover': {
    borderColor: 'white',
  }
})

// Main component
const VideoGallery = ({videos}: { videos: any[] }) => {

  const carouselRef = React.useRef<Carousel>(null);

  const handleSwitch = (previousSlide: number, currentSlide: number) => {
    const currentVid = document.getElementById(`slide-video-${previousSlide}`) as HTMLVideoElement;
    if (currentVid) {
      currentVid.pause();
    }
    const newVid = document.getElementById(`slide-video-${currentSlide}`) as HTMLVideoElement;
    if (newVid) {
      newVid.play();
    }
  }

  const handleThumbnailClick = (index: number) => {
    console.log('index', index, carouselRef.current, carouselRef.current?.context);

    if (carouselRef.current) {
      const previousSlide = carouselRef.current.state.currentSlide;
      carouselRef.current.goToSlide(index );
      handleSwitch(previousSlide, index);
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      videos.forEach((video, index) => {
        const currentP = document.getElementById(`slide-title-${index}`) as HTMLParagraphElement;
        if (currentP) {
          currentP.innerText = video.title;
        }
        const currentBy = document.getElementById(`slide-by-${index}`) as HTMLParagraphElement;
        if (currentBy) {
          currentBy.innerText = video.by;
        }
      });
    }, 1000)

  }, [])
  return (
    <div>
      <Carousel
        ref={carouselRef}
        responsive={responsive}
        showDots
        swipeable
        draggable
        keyBoardControl
        afterChange={(newSlide) => console.log(`Slide is now ${newSlide}`)}
        beforeChange={(nextSlide, state) => {
          console.info('nextSlide', nextSlide, 'nextSlide', state.currentSlide);
          handleSwitch(state.currentSlide, nextSlide);
          }
        }
      >
        {videos.map((video, index) => (
          <FullScreenSlide key={index}>
            <div style={{ display: 'flex', flexDirection: 'column'}}>
              <Video id={`slide-video-${index}`} src={video.src} {...video.attributes} poster={video.poster} >
                Your browser does not support the video tag.
              </Video>
              <Typography id={`slide-title-${index}`} variant="subtitle1" fontWeight="semiBold" style={{textAlign: 'center'}} />
              <Typography id={`slide-by-${index}`} variant="body1" gutterBottom style={{textAlign: 'center'}} />
            </div>
          </FullScreenSlide>
        ))}
      </Carousel>
      <ThumbnailsContainer>
        {videos.map((video, index) => (
          <Thumbnail
            key={index}
            src={video.thumb}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </ThumbnailsContainer>
    </div>
  );
};

export default VideoGallery;
