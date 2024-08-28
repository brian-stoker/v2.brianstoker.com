import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-is-now-mui.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
