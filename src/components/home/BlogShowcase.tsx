import * as React from 'react';
import Stack from '@mui/material/Stack';
import  {PostPreviewBox} from '../../../pages/bstoked.plan';
import {BlogPost} from "../../../lib/sourcing";

export default function BlogShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {

  return <Stack gap={4} alignContent={'center'} height={'100%'}>
    {showcaseContent.map((blog: BlogPost) => <PostPreviewBox {...blog as BlogPost} />)}
  </Stack>
}
