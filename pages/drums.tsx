import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";
import Card from '@mui/material/Card';
import {CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Button } from '@mui/base/Button';

export interface IMovie  { url: string, img: string, title: string }

const drums: IMovie[] = [
  {url: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4', img: 'https://cenv-public.s3.amazonaws.com/golden-stream.png', title: 'golden stream'},
  {url: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4', img: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png', title: 'tell me mister'},
  {url: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov', img: 'https://cenv-public.s3.amazonaws.com/normal-guy.png', title: 'normal guy'}
]

function MainView() {

  return (
    <Box sx={{
      fontSize: "1.6rem",
      lineHeight: '2.4rem',
      display: 'grid', justifyContent: 'center',
      flexDirection: 'column',
      width: '100%'
    }}>
      {drums.map(drum => {
        return <Card sx={(theme) => ({ maxWidth: 350, margin: 2, background: theme.palette.action.selected })}>
          <CardActionArea>
            <CardMedia
              component={'video'}
              src={drum.url}
              poster={drum.img}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {drum.title}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      })}

    </Box>
  )
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={MainView}/>;
}
