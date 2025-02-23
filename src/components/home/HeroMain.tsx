import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PRODUCTS } from "../../products";
import {BlogPost} from "../../../lib/sourcing";


function createLoading(sx: BoxProps['sx']) {
  return function Loading() {
    return (
      <Box
        sx={[
          (theme) => ({
            borderRadius: 1,
            bgcolor: 'grey.100',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.800',
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  };
}

const PlayerCard = dynamic(() => import('../showcase/PlayerCard'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

export default function Hero({ mostRecentPosts = []}: { mostRecentPosts?: BlogPost[] }) {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));

  return (
    PRODUCTS.previews({mostRecentPosts})
  );
}
