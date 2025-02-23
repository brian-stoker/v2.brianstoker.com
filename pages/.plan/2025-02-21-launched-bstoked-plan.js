import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import {docs} from './2025-02-21-launched-bstoked-plan.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
