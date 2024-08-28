import * as React from 'react';
import MediaShowcase from './MediaShowcase';


export default function ImageShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return <MediaShowcase showcaseContent={<img src={showcaseContent} alt={''} width={545} style={{borderRadius: '12px'}}/>} />
}
