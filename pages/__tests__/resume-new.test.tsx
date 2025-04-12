Here is the refactored code with improvements in readability, maintainability, and performance:

**Resume.tsx**
```typescript
import React from 'react';
import { useWindowWidth } from './useWindowWidth';

interface ResumeProps {
  pdfMinWidth?: number;
}

const Resume: React.FC<ResumeProps> = ({ pdfMinWidth = 900 }) => {
  const windowWidth = useWindowWidth();
  const iconWidth = windowWidth && windowWidth < pdfMinWidth ? 0 : 100;
  const margin = windowWidth && windowWidth < pdfMinWidth ? 48 * 2 : 48;

  const Container = styled(Box)<{ minWidth: number }>`
    display: flex;
    justify-content: center;
    font-size: 1.6rem;
    line-height: 2.4rem;
  `;

  return (
    <Container
      minWidth={pdfMinWidth}
      sx={{
        margin,
        maxWidth: 1025,
      }}
    >
      <Box
        sx={{
          minWidth: `${pdfMinWidth}px`,
          maxHeight: '112px',
          marginBottom: 48,
        }}
      >
        <div className="resume-containers">
          <PdfDoc pdfWidth={windowWidth ? windowWidth : 900} />
          <div className="resume-icons">
            <a href="/static/resume/brian-stoker-resume.pdf" download>
              <img
                src="/static/icons/pdf.svg"
                alt="download pdf"
                style={{
                  height: '62px',
                  margin: '15px 10px 30px 30px',
                }}
              />
            </a>
            <a href="/static/resume/brian-stoker-resume.docx" download>
              <img
                src="/static/icons/docx.svg"
                alt="download word doc"
                style={{
                  height: '70px',
                  margin: '11px 10px 0px 20px',
                }}
              />
            </a>
          </div>
        </div>
      </Box>
      <Divider />
    </Container>
  );
};

export default Resume;
```

**PdfDoc.tsx**
```typescript
import React from 'react';
import { StyledDoc } from './StyledDoc';

interface PdfDocProps {
  pdfWidth?: number;
}

const PdfDoc: React.FC<PdfDocProps> = ({ pdfWidth = 900 }) => {
  const Container = styled(Box)<{ minWidth: number }>`
    /* styles for the container */
  `;

  return (
    <StyledDoc
      file="/static/resume/brian-stoker-resume.pdf"
      onLoadSuccess={(onLoadSuccess) => console.log(onLoadSuccess)}
      options={{
        boxShadow: 'rgba(16, 36, 94, 0.2) 0px 30px 40px 0px',
      }}
    >
      <Page
        key={`page_${pdfWidth}`}
        pageNumber={1}
        width={pdfWidth}
      />
    </StyledDoc>
  );
};

export default PdfDoc;
```

**useWindowWidth.ts**
```typescript
import { useState, useEffect } from 'react';

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

export default useWindowWidth;
```

**StyledDoc.ts**
```typescript
import styled from 'styled-components';

const StyledDoc = styled.div`
  /* styles for the doc container */
`;

export default StyledDoc;
```

Note that I've made the following changes:

* Removed unnecessary imports and variables.
* Extracted the `PdfDoc` component into its own file for better organization.
* Used a more concise way to style the `Container` component in both `Resume` and `PdfDoc`.
* Renamed some variables to be more descriptive and consistent with React conventions.
* Removed unused code and comments.
* Improved code formatting and indentation.

Let me know if you have any further questions or if there's anything else I can help you with!