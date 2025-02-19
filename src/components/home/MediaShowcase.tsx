import * as React from 'react';
import {createTheme, Theme, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import {Data} from 'src/components/home/ElementPointer';
import Fade from "@mui/material/Fade";
import {SxProps} from "@mui/system";
import Frame from "../action/Frame";

export default function MediaShowcase({ sx, showcaseContent }: { sx?: SxProps<Theme>, showcaseContent?: any }): React.JSX.Element {
  const globalTheme = useTheme();
  const mode = globalTheme.palette.mode;
  const [element, setElement] = React.useState<Data>({ id: null, name: null, target: null });
  const [customized, setCustomized] = React.useState(false);


  const lineMapping: Record<string, number | number[]> = {
    card: [0, 20],
    cardmedia: [1, 5],
    stack: [6, 19],
    stack2: [7, 16],
    typography: 8,
    stack3: [9, 16],
    chip: [10, 14],
    rating: 15,
    switch: 18,
  };

  const theme = React.useMemo(
    () =>
      customized
        ? createTheme(globalTheme, {
          palette: {
            background: {
              default:
                mode === 'dark'
                  ? globalTheme.palette.primaryDark[900]
                  : globalTheme.palette.grey[50],
            },
          },
          shape: {
            borderRadius: 12,
          },
          shadows: ['none', '0px 4px 20px 0px hsla(210, 14%, 28%, 0.2)'],
          components: {
            MuiCard: {
              styleOverrides: {
                root: {
                  boxShadow:
                    mode === 'dark'
                      ? '0px 4px 12px rgba(0, 0, 0, 0.4)'
                      : '0px 4px 12px rgba(61, 71, 82, 0.1)',
                  backgroundColor:
                    mode === 'dark' ? globalTheme.palette.primaryDark[800] : '#fff',
                  border: '1px solid',
                  borderColor:
                    mode === 'dark'
                      ? globalTheme.palette.primaryDark[700]
                      : globalTheme.palette.grey[200],
                },
              },
            },
            MuiAvatar: {
              styleOverrides: {
                root: {
                  width: 50,
                  height: 50,
                  borderRadius: 99,
                },
              },
            },
            MuiSwich: globalTheme.components?.MuiSwitch,
            MuiChip: {
              styleOverrides: {
                filled: {
                  fontWeight: 'medium',
                  '&.MuiChip-colorSuccess': {
                    backgroundColor:
                      mode === 'dark'
                        ? globalTheme.palette.success[900]
                        : globalTheme.palette.success[100],
                    color:
                      mode === 'dark'
                        ? globalTheme.palette.success[100]
                        : globalTheme.palette.success[900],
                  },
                  '&.MuiChip-colorDefault': {
                    backgroundColor:
                      mode === 'dark'
                        ? globalTheme.palette.primaryDark[700]
                        : globalTheme.palette.grey[100],
                    color:
                      mode === 'dark'
                        ? globalTheme.palette.grey[200]
                        : globalTheme.palette.grey[800],
                  },
                },
              },
            },
          },
        })
        : createTheme({ palette: { mode: globalTheme.palette.mode } }),
    [customized, globalTheme, mode],
  );
  const highlightedLines = element.id ? lineMapping[element.id] : null;
  let startLine;
  if (highlightedLines !== null) {
    startLine = Array.isArray(highlightedLines) ? highlightedLines[0] : highlightedLines;
  }
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
          ...sx
        }}
      >
        <Frame.Demo
          sx={{
            display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: 220, p: 0,
          }}
        >
          {showcaseContent}
        </Frame.Demo>
      </Box>
    </Fade>
  );
}
