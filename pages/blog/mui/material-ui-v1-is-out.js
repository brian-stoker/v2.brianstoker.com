import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-v1-is-out.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
