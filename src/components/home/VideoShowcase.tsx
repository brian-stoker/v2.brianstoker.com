import * as React from 'react';
import MediaShowcase from './MediaShowcase';
import Plyr from "plyr-react";
import "plyr-react/plyr.css";


export default function VideoShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  const plyrProps = {
    source: {
      type: 'video' as Plyr.MediaType,
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

  return <MediaShowcase sx={{'& .plyr--video': { borderRadius: '12px'}}}  showcaseContent={<Plyr {...plyrProps} />} />
}
