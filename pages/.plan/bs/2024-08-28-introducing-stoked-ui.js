import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-stoked-ui.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
