import * as React from 'react';
import Container from '@mui/material/Container';
import Box, {BoxProps} from '@mui/material/Box';
import {alpha} from '@mui/material/styles';

interface SelectionProps extends BoxProps {
  bg?: 'white' | 'comfort' | 'dim' | 'gradient' | 'transparent';
  /**
   * Less vertical spacing
   */
  cozy?: boolean;
  noPaddingBottom?: boolean;
  containerSx?: BoxProps['sx'];
}

const map = {
  white: {
    light: 'common.white',
    dark: 'primaryDark.900',
  },
  comfort: {
    light: 'grey.50',
    dark: 'primaryDark.900',
  },
  dim: {
    light: 'primaryDark.700',
    dark: 'primaryDark.700',
  },
  transparent: {
    light: 'transparent',

    dark: 'transparent',
  },
};

const Section = React.forwardRef<HTMLDivElement, SelectionProps>(function Section(props, ref) {
  const { bg = 'white', children, sx, cozy = false, noPaddingBottom = false, containerSx, ...other } = props;

  return (
    <Box
      id={'section'}
      ref={ref}
      {...other}
      sx={[
        (theme) => ({
          ...(bg === 'gradient'
            ? {
                background: `linear-gradient(#FFF 0%, ${
                  theme.palette.primary[50]
                } 100%)`,
                ...theme.applyDarkStyles({
                  background: `linear-gradient(${
                    theme.palette.primaryDark[900]
                  } 0%, ${alpha(theme.palette.primary[900], 0.2)} 100%)`,
                }),
              }
            : {
                bgcolor: map[bg].light,
                ...theme.applyDarkStyles({
                  bgcolor: map[bg].dark,
                }),
              }),
          py: cozy ? { xs: 6, sm: 5, md: 6 } : { xs: 4, sm: 7, md: 8 },
          pb: noPaddingBottom ? '0 !important' : undefined,
          overflow: 'hidden',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Container
        maxWidth={false}
        sx={[
          {
            maxWidth: { xs: '100%', lg: '1140px' },
            mx: 'auto',
            px: { xs: '10px', sm: '10px', md: '10px', lg: 4 },
          },
          ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
        ]}
      >
        {children}
      </Container>
    </Box>
  );
});

export default Section;
