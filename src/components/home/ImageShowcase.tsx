import * as React from 'react';
import MediaShowcase from './MediaShowcase';


export default function ImageShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return <MediaShowcase showcaseContent={<img src={showcaseContent} alt={''} style={{borderRadius: '12px', overflow: 'hidden', objectFit: 'cover' }}/>} />
}
