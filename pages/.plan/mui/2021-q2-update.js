import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-q2-update.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
