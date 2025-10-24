'use client';

import * as React from 'react';
import {useResizeObserver} from '@wojtekmaj/react-hooks';
import {Document, Page, pdfjs} from 'react-pdf';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
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

type PDFFile = string | File | null;
const test = ':)';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`).toString();

const options = {
  cMapUrl: '/cmaps/', standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

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

  return (
    <div ref={containerRef} style={{
      width: '100%',
      maxWidth: '100%',
      padding: '0 16px',
      boxSizing: 'border-box'
    }}>
      {containerWidth && (
        <Box
             sx={[
               {
                 boxShadow: 'rgba(16, 36, 94, 0.1) 0px 15px 20px 0px',
               },
               (theme) =>
                 theme.applyStyles('dark', {
                   boxShadow: 'rgba(210, 210, 210, 0.06) 0px 15px 20px 0px',
               }),
               {
                 width: '100%',
                 maxWidth: containerWidth,
                 position: 'relative',
                 margin: '0 auto'
               }
             ]}>
        <StyledDoc
          file={'/static/resume/brian-stoker-resume.pdf'}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          >
        <ButtonGroup
        variant="outlined"
        aria-label="Basic button group"
        className="page-controls"
        sx={[
          {
            boxShadow: 'rgba(16, 36, 94, 0.1) 0px 15px 20px 0px!important',
          },
          (theme) =>
            theme.applyStyles('dark', {
              boxShadow: 'rgba(210, 210, 210, 0.16) 0px 15px 20px 0px!important',
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
