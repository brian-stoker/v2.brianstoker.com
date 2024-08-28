import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './remote-award-win-2024.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
