import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-mid-v6-features.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
