import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './date-pickers-stable-v5.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
