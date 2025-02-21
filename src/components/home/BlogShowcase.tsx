import * as React from 'react';
import MediaShowcase from './MediaShowcase';/*
import  {PostPreviewBox} from '../../../pages/blog';
import {BlogPost} from "../../../lib/sourcing";
*/

export default function BlogShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  /*const preview= <PostPreviewBox {...showcaseContent as BlogPost} />*/
  return <MediaShowcase showcaseContent={<></>} />
}
