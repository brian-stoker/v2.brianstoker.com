import * as React from 'react';
import MediaShowcase from './MediaShowcase';

export default function ImageShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return <MediaShowcase
    sx={{
      width: '100%',
      height: '100%',
      '& img': {
        height: '100%',
        width: '100%',
        maxHeight: { xs: '500px', md: '100%' }
      }
    }}
    showcaseContent={
      <img
        src={showcaseContent}
        alt={''}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    }
  />
}
