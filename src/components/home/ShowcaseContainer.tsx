import * as React from 'react';
import Box, {BoxProps} from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import NoSsr from '@mui/material/NoSsr';
import Frame from 'src/components/action/Frame';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function ShowcaseContainer({
  preview,
  code,
  sx,
}: {
  preview?: React.ReactNode;
  code?: React.ReactNode;
  sx?: BoxProps['sx'];
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [codeOpen, setCodeOpen] = React.useState(!isMobile);

  React.useEffect(() => {
    setCodeOpen(!isMobile);
  }, [isMobile]);

  const codeContent = (
    <Frame.Info
      data-mui-color-scheme="dark"
      sx={[
        { p: 2, borderTop: 0 },
        isMobile
          ? (themeArg) => ({
              border: 0,
              borderTop: '1px solid',
              borderColor: themeArg.palette.grey[200],
              ...themeArg.applyDarkStyles({
                borderColor: themeArg.palette.primaryDark[700],
              }),
            })
          : {},
      ]}
    >
      <NoSsr>{code}</NoSsr>
    </Frame.Info>
  );

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '& > div:first-of-type': {
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          },
          '& > div:last-of-type': {
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          },
          ...sx,
        }}
      >
        <Frame.Demo
          sx={{
            display: 'flex',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 220,
            p: 2,
          }}
        >
          {preview}
        </Frame.Demo>
        {code ? (
          isMobile ? (
            <Box
              sx={(themeArg) => ({
                border: '1px solid',
                borderTop: 0,
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                borderColor: themeArg.palette.grey[200],
                overflow: 'hidden',
                ...themeArg.applyDarkStyles({
                  borderColor: themeArg.palette.primaryDark[700],
                }),
              })}
            >
              <Button
                onClick={() => setCodeOpen((prev) => !prev)}
                endIcon={
                  <KeyboardArrowDownRounded
                    sx={{
                      transform: codeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                }
                fullWidth
                sx={{
                  justifyContent: 'space-between',
                  fontWeight: '600',
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                }}
              >
                {codeOpen ? 'Hide code' : 'View code'}
              </Button>
              <Collapse in={codeOpen} timeout={220} unmountOnExit>
                {codeContent}
              </Collapse>
            </Box>
          ) : (
            codeContent
          )
        ) : null}
      </Box>
    </Fade>
  );
}
