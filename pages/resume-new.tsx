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

type PDFFile = string | File | null;
const test = ':)';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`).toString();

const options = {
  cMapUrl: '/cmaps/', standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;
const StyledDoc = styled(Document)(() => ({
  "& .react-pdf__Page": {
    aspectRatio: "1 / 1.35",
    position: "relative",
    width: '100%',
    borderRadius: '12px',
    alignContent: 'center',
    justifyItems: 'center',
    textAlign: 'center',
  },
  alignContent: 'center',
  justifyItems: 'center',
  textAlign: 'center',
  borderRadius: '12px',
  width: '100%',
  position: "relative",

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

export function PdfDoc ({ pdfWidth }: { pdfWidth?: number }) {
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  function onDocumentLoadSuccess(onLoadParams: { numPages: number }) {
    setNumPages(onLoadParams.numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber(pageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }


  const [containerRef, setContainerRef] = React.useState<Box | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>();

  const onResize = React.useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);



  React.useEffect(() => {
    console.info('pageNumber', pageNumber);
  }, [pageNumber])
  return (
    <Box ref={setContainerRef}
         sx={[
           {
             boxShadow: 'rgba(16, 36, 94, 0.2) 0px 30px 40px 0px',
           },
           (theme) =>
             theme.applyStyles('dark', {
               boxShadow: 'rgba(255, 255, 255, 0.33) 0px 30px 40px 0px',
           }),
           {
             width: '100%',
             display:'flex'
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
          (theme) => ({
            boxShadow: 'rgba(16, 36, 94, 0.2) 0px 30px 40px 0px!important',
          }),
          (theme) =>
            theme.applyStyles('dark', {
              boxShadow: 'rgba(255, 255, 255, 0.33) 0px 30px 40px 0px!important',
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
    </Box>);


}

export default function Resume({pdfMinWidth = 900}: { pdfMinWidth?: number }) {
  const windowWidth = useWindowWidth();
  const iconWidth = windowWidth && windowWidth < pdfMinWidth ? 0 : 100;
  const margin = windowWidth && windowWidth < pdfMinWidth ? 48 * 2 : 48;
  const maxWidth = 1025;
  const pdfWidth = Math.min((windowWidth ? windowWidth : maxWidth) - iconWidth - margin, maxWidth);
  const Container = styled(Box)<{ minWidth: number }>(({minWidth = 300}) => ({


    "& .resume-icons": {
      display: "flex",
      flexDirection: "column",
    },

    "& .resume-containers": {
      display: "flex",
      flexDirection: "row",
    },

    [`@media only screen and (max-width: ${minWidth}px)`]: {
      "& .resume-icons": {
        flexDirection: "row",
        justifyContent: "right",
      },
      "& .resume-containers": {
        flexDirection: "column",
      },
    },
  }));

  return (<Container className='' minWidth={pdfMinWidth} sx={{
    fontSize: "1.6rem", lineHeight: '2.4rem', display: 'flex', justifyContent: 'center'
  }}>
    <Box sx={{minWidth: `${pdfMinWidth}px`, margin: 5, maxWidth: `${maxWidth}px`,}}>
      <div className={'resume-containers'}>
        <PdfDoc pdfWidth={pdfWidth}/>
        <div className={'resume-icons'}>
          <a href='/static/resume/brian-stoker-resume.pdf' download><img src='/static/icons/pdf.svg'
                                                                         alt={'download pdf'}
                                                                         style={{
                                                                           height: '62px',
                                                                           margin: '15px 10px 30px 30px'
                                                                         }}/></a>
          <a href='/static/resume/brian-stoker-resume.docx' download><img
            src='/static/icons/docx.svg'
            alt={'download word doc'}
            style={{
              height: '70px', margin: '11px 10px 0px 20px'
            }}/></a>
        </div>
      </div>
      <Box sx={{height: '112px'}}/>
      <Divider/>
    </Box>
  </Container>);
}
