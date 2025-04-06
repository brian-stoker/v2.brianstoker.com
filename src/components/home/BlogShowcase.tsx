import * as React from 'react';
import Stack from '@mui/material/Stack';
import  {PostPreviewBox} from '../../../pages/bstoked.plan';
import {BlogPost} from "../../../lib/sourcing";

export default function BlogShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{

  const [stories, _] = React.useState<{topStory: BlogPost, rest: BlogPost[]}>({topStory: showcaseContent[0], rest: showcaseContent.slice(1)});
  return <>
    <PostPreviewBox post={stories.topStory} />
    <Stack gap={1} direction={'row'} alignContent={'center'} height={'100%'}>
      {stories.rest.map((blog: BlogPost) => <PostPreviewBox post={blog} size={'mini'} />)}
    </Stack>
  </>
}
