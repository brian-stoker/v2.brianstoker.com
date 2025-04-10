import * as React from 'react';
import MediaShowcase from './MediaShowcase';

export default function ImageShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return <MediaShowcase sx={{ width: 'fit-content','& img': { height: '720px'}}} showcaseContent={<img src={showcaseContent} alt={''} style={{borderRadius: '12px', overflow: 'hidden', objectFit: 'cover' }}/>} />
}
