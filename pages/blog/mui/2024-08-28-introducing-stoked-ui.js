import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2024-08-28-introducing-stoked-ui.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
