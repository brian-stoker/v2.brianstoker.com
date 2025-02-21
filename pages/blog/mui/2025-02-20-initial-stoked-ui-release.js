import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2025-02-20-initial-stoked-ui-release.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
