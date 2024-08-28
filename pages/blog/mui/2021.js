import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
