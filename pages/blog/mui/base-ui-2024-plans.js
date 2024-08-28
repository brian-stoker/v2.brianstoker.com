import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './base-ui-2024-plans.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
