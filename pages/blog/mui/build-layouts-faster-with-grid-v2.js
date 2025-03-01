import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './build-layouts-faster-with-grid-v2.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
