
import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import dynamic from 'next/dynamic'
import MediaShowcase from './MediaShowcase';
import "plyr-react/plyr.css";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

export default function VideoShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  const plyrProps = {
    source: {
      type: 'video' as 'audio' | 'video',
      title: showcaseContent.title,
      sources: [
        {
          src: showcaseContent.src,
          type: 'video/mp4',
        },
      ],
      poster: showcaseContent.poster,
    }, // https://github.com/sampotts/plyr#the-source-setter
  }

  return <NoSsr><MediaShowcase sx={{'& .plyr--video': { borderRadius: '12px'}}}  showcaseContent={<Plyr {...plyrProps} />} /></NoSsr>
}
