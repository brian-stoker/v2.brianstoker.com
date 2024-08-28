import * as React from 'react';
import MediaShowcase from './MediaShowcase';
import { PdfDoc } from '../../../pages/resume';


export default function PdfShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element {
  return <MediaShowcase sx={{'& .react-pdf__Document .react-pdf__Page, canvas': { borderRadius: '8px'}}} showcaseContent={<PdfDoc pdfWidth={545} />} />
}
