import * as React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-engineer-x.md?muiMarkdown';

export default function Page() {
  return <TopLayoutCareers {...pageProps} />;
}
