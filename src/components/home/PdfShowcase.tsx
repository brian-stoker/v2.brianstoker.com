import * as React from 'react';
import MediaShowcase from './MediaShowcase';
import {PdfDoc} from '../../../pages/resume-new';

export default function PdfShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return (
    <MediaShowcase
      sx={{
        overflow: 'hidden!important',
        width: '100%', borderRadius: '8px',
        '& .MuiBox-root': { overflow: 'hidden' },
        '& .react-pdf__Page, canvas': {   width: '100%', overflow: 'hidden' },
      }}
      showcaseContent={
      <PdfDoc pdfWidth={345} />
    } />
  )
}
