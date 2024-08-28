import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './first-look-at-joy.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
