import * as React from 'react';
import Stack from '@mui/material/Stack';
// import  {PostPreviewBox} from '../../../pages/bstoked.plan';

export default function BlogShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{

  return <Stack gap={2} alignContent={'center'} height={'100%'}>
    {/* {showcaseContent.map((blog: BlogPost) => <PostPreviewBox post={blog} />)} */}
  </Stack>
}
