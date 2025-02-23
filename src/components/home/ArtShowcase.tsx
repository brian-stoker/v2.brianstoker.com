import * as React from 'react';
import Box from '@mui/material/Box';
import Fade from "@mui/material/Fade";
import Frame from "../action/Frame";

export default function ArtShowcase() {
  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '& > div:first-of-type': {
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          },
          '& > div:last-of-type': {
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          },
        }}
      >
        <Frame.Demo
          sx={{
            display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: 220, p: 2,
          }}
        >
          <img src={'/static/art/wild-eyes.jpg'} alt={'wild eyes'} width={545} style={{borderRadius: '12px'}}/>
        </Frame.Demo>
      </Box>
    </Fade>
  );
}
