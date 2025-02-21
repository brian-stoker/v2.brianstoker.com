import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './v6-beta-pickers.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
