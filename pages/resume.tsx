import React, {useState} from 'react';
import {Document, Page} from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";

export function PdfDoc ({ pdfWidth }: { pdfWidth?: number }) {
  const [, setNumPages] = useState<number>();
  const [pageNumber,] = useState<number>(1);
  function onDocumentLoadSuccess({numPages}: { numPages: number }): void {
    setNumPages(numPages);
  }
  return <div className='react-pdf__Page'>
    <Document file='/static/resume/brian-stoker-resume.pdf' className='react-pdf__Page'
              onLoadSuccess={onDocumentLoadSuccess}>
      <Page className='react-pdf__Page' pageNumber={pageNumber} width={pdfWidth}
            renderAnnotationLayer={false} renderTextLayer={false}/>
    </Document>
  </div>;
}

export function PdfDocView({ pdfMinWidth = 900}: { pdfMinWidth?: number }) {
  const windowWidth = useWindowWidth();
  const iconWidth = windowWidth && windowWidth < pdfMinWidth ? 0 : 100;
  const margin = windowWidth && windowWidth < pdfMinWidth ? 48 * 2 : 48;
  const maxWidth = 1025;
  const pdfWidth = Math.min((windowWidth ? windowWidth : maxWidth) - iconWidth - margin, maxWidth);



  const css = (minWidth: number = 900) => {
    return `
    .react-pdf__Page {
      aspect-ratio: 1 / 1.35;
    }

    .resume-icons {
      display: flex;
      flex-direction: column;
    }

    .resume-containers {
      display: flex;
      flex-direction: row;
    }

    @media only screen and (max-width: ${minWidth}px) {
      .resume-icons {
        display: flex;
        flex-direction: row;
        justify-content: right;
      }
  
      .resume-containers {
        display: flex;
        flex-direction: column;
      }
    }`
  }

  return (<Box sx={{
      fontSize: "1.6rem", lineHeight: '2.4rem', display: 'flex', justifyContent: 'center'
    }}>
    <Box sx={{minWidth: `${pdfMinWidth}px`, margin: 5, maxWidth: `${maxWidth}px`,}}>
      <style>
        {css(pdfMinWidth)}
      </style>
      <div className={'resume-containers'}>
        <PdfDoc pdfWidth={pdfWidth}/>
        <div className={'resume-icons'}>
          <a href='/static/resume/brian-stoker-resume.pdf' download><img src='/static/icons/pdf.svg'
                                                                         alt={'download pdf'} style={{
            height: '62px', margin: '15px 10px 30px 30px'
          }}/></a>
          <a href='/static/resume/brian-stoker-resume.docx' download><img src='/static/icons/docx.svg'
                                                                          alt={'download word doc'}
                                                                          style={{
                                                                            height: '70px', margin: '11px 10px 0px 20px'
                                                                          }}/></a>
        </div>
      </div>
      <Box sx={{height: '112px'}}/>
      <Divider/>
    </Box>
  </Box>)
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={PdfDocView}/>;
}
