import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v7-beta.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
