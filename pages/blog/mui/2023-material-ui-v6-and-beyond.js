import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-material-ui-v6-and-beyond.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
