'use client';

import * as React from 'react';
import {Document, Page, pdfjs} from 'react-pdf';
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useWindowWidth} from "../hooks/useWindowSize";
import ButtonGroup from "@mui/material/ButtonGroup";
import Fab from '@mui/material/Fab';
import {ArrowBackIos, ArrowForwardIos} from "@mui/icons-material";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Section from 'src/layouts/Section';
import {HomeView} from "./index";
import NextLink from 'next/link';
import { IconButton, SvgIcon, Tooltip, alpha } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`).toString();

const options = {
  cMapUrl: '/cmaps/', standardFontDataUrl: '/standard_fonts/',
};

// Removed maxWidth constraint - let container determine width
const StyledDoc = styled(Document)(() => ({
  // Remove CSS overrides - let react-pdf handle dimensions natively
  alignContent: 'center',
  justifyItems: 'center',
  textAlign: 'center',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '100%',
  position: "relative",
  flexShrink: 1,

  "&:hover .page-controls": {
    opacity: 1,
  },

  "& .page-controls": {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    background: "white",
    opacity: '0',
    transform: "translateX(-50%)",
    transition: "opacity ease-in-out 0.2s",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    color: "black",
    display: 'flex',
    flexDirection: 'row',
    zIndex: 4,
    "& span": {
      font: "inherit",
      fontSize: ".8em",
      padding: "0 .5em",
      alignContent: 'center',
    },

    "& button": {
      width: "44px",
      height: "44px",
      background: "white",
      border: 0,
      font: "inherit",
      fontSize: ".8em",
      color: 'black',
      borderRadius: "8px",

      "&:enabled:hover": {
        cursor: "pointer",
        backgroundColor: "#e6e6e6",
      },

      "&:first-child": {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },

      "&:last-child": {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
    },
  },
}));

export function PdfDoc () {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);

  function onDocumentLoadSuccess(onLoadParams: { numPages: number }) {
    setNumPages(onLoadParams.numPages);
    setPageNumber(1);
  }

  // Use ResizeObserver for responsive sizing as per documentation
  React.useEffect(() => {
    const calculateWidth = () => {
      if (containerRef.current) {
        // Get the actual parent container's width
        const parent = containerRef.current.parentElement;
        const parentWidth = parent ? parent.getBoundingClientRect().width : window.innerWidth;

        // More aggressive padding to ensure it fits
        const padding = 64; // 32px on each side minimum
        const maxWidth = Math.min(
          parentWidth - padding,
          window.innerWidth - padding,
          850 // Max width for readability
        );

        console.log('Parent width:', parentWidth, 'Window width:', window.innerWidth, 'Calculated:', maxWidth);
        return maxWidth;
      }
      return null;
    };

    const resizeObserver = new ResizeObserver(() => {
      const width = calculateWidth();
      if (width && width > 0) {
        setContainerWidth(width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      // Get initial width
      const initialWidth = calculateWidth();
      if (initialWidth && initialWidth > 0) {
        setContainerWidth(initialWidth);
      }
    }

    // Also listen to window resize
    const handleResize = () => {
      const width = calculateWidth();
      if (width && width > 0) {
        setContainerWidth(width);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    console.info('pageNumber', pageNumber, 'containerWidth:', containerWidth);
  }, [pageNumber, containerWidth])

  // PDF SVG component - no props needed since they're not being used
  const WordSvg = () => (<svg viewBox="-0.12979372698077785 0 32.12979372698078 32" xmlns="http://www.w3.org/2000/svg" width="2500" height="2480"><path d="M30.667 2H9.333A1.333 1.333 0 0 0 8 3.333V9l12 3.5L32 9V3.333A1.333 1.333 0 0 0 30.667 2z" fill="#41a5ee"/><path d="M32 9H8v7l12 3.5L32 16z" fill="#2b7cd3"/><path d="M32 16H8v7l12 3.5L32 23z" fill="#185abd"/><path d="M32 23H8v5.667A1.333 1.333 0 0 0 9.333 30h21.334A1.333 1.333 0 0 0 32 28.667z" fill="#103f91"/><path d="M16.667 7H8v19h8.667A1.337 1.337 0 0 0 18 24.667V8.333A1.337 1.337 0 0 0 16.667 7z" opacity=".1"/><path d="M15.667 8H8v19h7.667A1.337 1.337 0 0 0 17 25.667V9.333A1.337 1.337 0 0 0 15.667 8z" opacity=".2"/><path d="M15.667 8H8v17h7.667A1.337 1.337 0 0 0 17 23.667V9.333A1.337 1.337 0 0 0 15.667 8z" opacity=".2"/><path d="M14.667 8H8v17h6.667A1.337 1.337 0 0 0 16 23.667V9.333A1.337 1.337 0 0 0 14.667 8z" opacity=".2"/><path d="M1.333 8h13.334A1.333 1.333 0 0 1 16 9.333v13.334A1.333 1.333 0 0 1 14.667 24H1.333A1.333 1.333 0 0 1 0 22.667V9.333A1.333 1.333 0 0 1 1.333 8z" fill="#185abd"/><path d="M11.95 21h-1.8l-2.1-6.9-2.2 6.9h-1.8l-2-10h1.8l1.4 7 2.1-6.8h1.5l2 6.8 1.4-7h1.7z" fill="#fff"/><path d="M0 0h32v32H0z" fill="none"/></svg>);
  const WordIconCustom = <SvgIcon component={WordSvg} inheritViewBox fontSize='small' />;

  const WordButton = <Tooltip title={('Download Word')} enterDelay={300}>
              <IconButton
                component={'a'}
                target="_blank"
                sx={{
                  position: "absolute",
                  zIndex: 999999,
                  top: '16px',
                  right: 'calc((16px * 2) + 56px)',
                  width: '56px',
                  height: '56px',
                  color: 'hsl(210, 14%, 13%)',  // Opaque version - removed alpha
                  '&:hover': {
                    color: 'hsl(210, 14%, 20%)',  // Slightly lighter on hover
                  },
                  backgroundColor: (theme) => 
                  alpha(theme.palette.background.paper, 0.6), // semi-transparent look
                  backdropFilter: 'blur(6px)', // optional glass effect
                  borderRadius: '12px',
                  boxShadow: 3,
                }}
                color="primary"
                href={'/static/resume/brian-stoker-resume.docx'}
                download
                rel="noopener"
                data-ga-event-category="header"
                data-ga-event-action="word"
              >
                {WordIconCustom}
              </IconButton>
            </Tooltip>    
  const PdfSvg = () => (
    <svg viewBox="0 0 40 40">
      <g id="SVGRepo_bgCarrier" strokeWidth="0" transform="matrix(5.286275, 0, 0, 5.286275, 165.441635, 117.065567)" ></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" transform="matrix(5.286275, 0, 0, 5.286275, 165.441635, 117.065567)"></g>
      <g id="SVGRepo_iconCarrier" transform="matrix(3.217015, 0, 0, 3.217015, -16.08363, -48.230076)">
        <path d="M 15.934 23.058 C 15.696 23.129 15.347 23.137 14.972 23.082 C 14.57 23.024 14.16 22.901 13.758 22.72 C 14.476 22.616 15.033 22.648 15.51 22.817 C 15.623 22.857 15.809 22.964 15.934 23.058 Z M 11.925 22.399 C 11.896 22.407 11.867 22.415 11.839 22.423 C 11.645 22.475 11.457 22.527 11.276 22.572 L 11.032 22.634 C 10.54 22.759 10.037 22.886 9.541 23.037 C 9.729 22.582 9.905 22.122 10.076 21.673 C 10.203 21.34 10.333 20.999 10.467 20.664 C 10.536 20.776 10.607 20.889 10.68 21.001 C 11.017 21.514 11.441 21.989 11.925 22.399 Z M 10.675 17.269 C 10.707 17.83 10.585 18.37 10.408 18.888 C 10.189 18.248 10.087 17.54 10.36 16.969 C 10.431 16.822 10.488 16.744 10.525 16.703 C 10.583 16.792 10.659 16.991 10.675 17.269 Z M 8.108 24.381 C 7.985 24.601 7.859 24.807 7.731 25.001 C 7.42 25.469 6.913 25.97 6.652 25.97 C 6.626 25.97 6.595 25.966 6.55 25.918 C 6.52 25.887 6.516 25.865 6.517 25.835 C 6.526 25.663 6.754 25.357 7.084 25.073 C 7.384 24.815 7.722 24.586 8.108 24.381 Z M 16.764 23.083 C 16.724 22.51 15.76 22.142 15.75 22.139 C 15.377 22.006 14.972 21.942 14.512 21.942 C 14.019 21.942 13.488 22.014 12.805 22.173 C 12.198 21.743 11.673 21.204 11.282 20.607 C 11.109 20.343 10.953 20.08 10.817 19.823 C 11.148 19.032 11.447 18.181 11.392 17.227 C 11.349 16.463 11.004 15.949 10.535 15.949 C 10.214 15.949 9.937 16.188 9.712 16.658 C 9.31 17.496 9.416 18.568 10.025 19.848 C 9.806 20.364 9.602 20.899 9.404 21.416 C 9.159 22.06 8.905 22.724 8.62 23.355 C 7.82 23.672 7.163 24.056 6.615 24.527 C 6.256 24.835 5.823 25.307 5.799 25.799 C 5.787 26.03 5.866 26.243 6.027 26.413 C 6.199 26.594 6.414 26.689 6.651 26.689 C 7.434 26.689 8.187 25.614 8.33 25.398 C 8.617 24.965 8.886 24.482 9.15 23.924 C 9.814 23.684 10.522 23.505 11.208 23.332 L 11.453 23.269 C 11.638 23.222 11.83 23.17 12.027 23.117 C 12.235 23.06 12.45 23.002 12.667 22.946 C 13.372 23.394 14.129 23.686 14.868 23.794 C 15.49 23.884 16.043 23.832 16.417 23.637 C 16.754 23.461 16.772 23.191 16.764 23.083 Z" fill="#EB5757"></path>
      </g>
    </svg>
  );
  const PdfIconCustom = <SvgIcon component={PdfSvg} inheritViewBox fontSize='small' />;
  const PdfButton = <Tooltip title={('Download PDF')} enterDelay={300}>
              <IconButton
                component={'a'}
                target="_blank"
                sx={{
                  position: "absolute",
                  zIndex: 999,
                  top: '16px',
                  right: '16px',
                  width: '56px',
                  height: '56px',
                  color: 'hsl(210, 14%, 13%)',  // Opaque version - removed alpha
                  '&:hover': {
                    color: 'hsl(210, 14%, 20%)',  // Slightly lighter on hover
                  },
                  backgroundColor: (theme) => 
                  alpha(theme.palette.background.paper, 0.6), // semi-transparent look
                  backdropFilter: 'blur(6px)', // optional glass effect
                  borderRadius: '12px',
                  boxShadow: 3,
                }}
                color="primary"
                href={'/static/resume/brian-stoker-resume.pdf'}
                download
                rel="noopener"
                data-ga-event-category="header"
                data-ga-event-action="pdf"
              >
                {PdfIconCustom}
              </IconButton>
            </Tooltip>            
  return (
    <div
    ref={containerRef}
    style={{
      width: '100%',
      padding: '0',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center'
    }}
    className="resume-pdf-doc">
      {containerWidth && (
        <Box
          sx={[{
            position: 'relative',
            borderRadius: '8px',
            boxShadow: 'rgba(16, 36, 94, 0.16) 0px 15px 20px 0px',
          },
          (theme) =>
            theme.applyStyles('dark', {
              boxShadow: 'rgba(210, 210, 210, 0.1) 0px 15px 30px 0px',
          }),
          {
            width: 'fit-content',
            position: 'relative',
            margin: '0',
            padding: 0
          }
        ]}>
       

        <StyledDoc
          file={'/static/resume/brian-stoker-resume.pdf'}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          >
          {/* Buttons placed outside StyledDoc so they appear above the PDF canvas */}
          <Box
            sx={{
              position: 'relative',
              padding: 0,
              width: 'fit-content'
            }}
          >
          {WordButton}
          {PdfButton}
          </Box>
        <ButtonGroup
        variant="outlined"
        aria-label="Basic button group"
        className="page-controls"
        sx={[
          {
            boxShadow: 'rgba(16, 36, 94, 0.16) 0px 15px 30px 0px!important',
          },
          (theme) =>
            theme.applyStyles('dark', {
              boxShadow: 'rgba(210, 210, 210, 0.1) 0px 15px 30px 0px!important',
            }),
        ]}>
        <Fab
          disabled={!numPages || pageNumber === 1}
          onClick={() => { setPageNumber(pageNumber - 1) }}
          aria-label="previous page">
          <ArrowBackIos />
        </Fab>
        <Button disabled color={'info'} sx={{ px: 4, overflow: 'hidden', whiteSpace: 'nowrap', '& p': {color: 'black'}, background: 'white!important'}}>
          <Typography sx={{ alignContent: 'center',  }}>
            {pageNumber}
            {' '}
            of
            {' '}
            {numPages}
          </Typography>
        </Button>
        <Fab
          disabled={!numPages || pageNumber >= numPages}
          onClick={() => { setPageNumber(pageNumber + 1) }}
          aria-label="next page">
          <ArrowForwardIos />
        </Fab>
      </ButtonGroup>
      <Page
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        width={containerWidth}
      />
    </StyledDoc>
    </Box>
      )}
    </div>
  );


}
