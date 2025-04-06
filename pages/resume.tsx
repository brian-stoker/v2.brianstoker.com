import React, {useState} from 'react';
import {Document, Page} from 'react-pdf';
import {useWindowWidth} from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {HomeView} from "./index";
import {PdfDoc } from "./resume-new";


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
      position: relative;
    }
      
    .resume-icons-container {
      position: absolute;
      left: -70px;
      z-index: -100;
      transition: left 0.15s ease-in-out, z-index 0s;
    }

    .resume-containers {
      display: flex;
      flex-direction: row;
    }

    .master-container:hover .resume-icons-container {
      left: 0px;
      z-index: 100;
      transition: left 0.3s ease-in-out, z-index 0s 0.3s;
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
      fontSize: "1.6rem", 
      lineHeight: '2.4rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <Box sx={{
        maxWidth: '1300px '
      }}
      className={'master-container'}>
      <Box sx={{minWidth: `${pdfMinWidth}px`, margin: 5, maxWidth: `${maxWidth}px`,}} >
        <style>
          {css(pdfMinWidth)}
        </style>
        <div className={'resume-containers'}>
          <PdfDoc pdfWidth={pdfWidth}/>
          <div className={'resume-icons'}>
            <div className={'resume-icons-container'}>
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
        </div>
        <Box sx={{height: '112px'}}/>
      </Box>
    </Box>
  </Box>)
}

export default function Home({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={PdfDocView}/>;
}
