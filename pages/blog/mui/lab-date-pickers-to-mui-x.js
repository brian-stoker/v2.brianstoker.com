import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './lab-date-pickers-to-mui-x.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
