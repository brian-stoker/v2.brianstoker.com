import * as React from 'react';
import Box, {BoxProps} from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import {unstable_useEnhancedEffect as useEnhancedEffect} from '@mui/utils';
import {alpha} from '@mui/material/styles';

interface HeroContainerProps {
  disableMobileHidden?: boolean;
  disableTabExclusion?: boolean;
  left: React.ReactElement;
  linearGradient?: boolean;
  right: React.ReactElement;
  rightSx?: BoxProps['sx'];
}

export default function HeroContainer(props: HeroContainerProps) {
  const {
    disableMobileHidden,
    disableTabExclusion = false,
    left,
    linearGradient,
    right,
    rightSx,
  } = props;
  const frame = React.useRef<HTMLDivElement>(null);

  useEnhancedEffect(() => {
    let obs: undefined | MutationObserver;
    function suppressTabIndex() {
      if (!disableTabExclusion) {
        const elements = frame.current!.querySelectorAll(
          'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
        );
        elements.forEach((elm) => {
          elm.setAttribute('tabindex', '-1');
        });
      }
    }
    if (typeof MutationObserver !== 'undefined' && frame.current) {
      obs = new MutationObserver(suppressTabIndex);
      obs.observe(frame.current, { childList: true, subtree: true });
    }
    return () => {
      if (obs) {
        obs.disconnect();
      }
    };
  }, [disableTabExclusion]);

  const renderRightWrapper = (sx?: BoxProps['sx']) => (
    <Box
      ref={frame}
      aria-hidden={disableTabExclusion ? undefined : 'true'}
      sx={[
        (theme) => ({
          minWidth: '70%',
          minHeight: { xs: 'auto', sm: 500 },
          height: 'calc(100vh - 120px)',
          maxHeight: { md: 950, xl: 1150 },
          borderBottomLeftRadius: 12,
          transition: 'max-height 0.3s',
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ...(linearGradient && {
            background: `radial-gradient(farthest-corner circle at 0% 0%, ${
              theme.palette.grey[50]
            } 0%, ${theme.palette.primary[50]} 100%)`,
          }),
        }),
        (theme) =>
          theme.applyDarkStyles({
            background: 'primaryDark.900',
            borderColor: 'primaryDark.700',
            ...(linearGradient && {
              background: `radial-gradient(farthest-corner circle at 0% 0%, ${alpha(
                theme.palette.primary[900],
                0.2,
              )} 0%, ${theme.palette.primaryDark[900]} 100%)`,
            }),
          }),
        ...(Array.isArray(sx) ? sx : [sx]),
        ...(Array.isArray(rightSx) ? rightSx : [rightSx]),
      ]}
    >
      {right}
    </Box>
  );
  if (disableMobileHidden) {
    return (
      <Box sx={{ overflow: 'hidden' }}>
        <Container
          sx={{
            minHeight: { xs: 'auto', sm: 500 },
            height: { md: 'calc(100vh - 120px)' },
            maxHeight: { md: 700, xl: 850 },
            transition: '0.3s',
          }}
        >
          <Grid container alignItems="center" sx={{ height: '100%', mx: 'auto' }}>
            <Grid
              item
              xs={12}
              md={7}
              lg={6}
              sx={{
                minWidth: '40%',
                display: { xs: 'flex', md: 'block' },
                minHeight: { xs: 500, sm: 700, md: 'initial' },
                m: 'auto',
                '& > *': {
                  m: { xs: 'auto', md: 'initial' },
                },
              }}
            >
              {left}
            </Grid>
            <Grid item xs={12} md={5} lg={6} sx={{ maxHeight: '100%' }}>
              {renderRightWrapper({
                height: {
                  xs: 'initial',
                  md: 'calc(100vh - 120px)',
                },
                borderLeftWidth: { xs: 0, md: 1 },
                borderBottomLeftRadius: { xs: 0, md: 12 },
                mx: { xs: -2, sm: -3, md: 'initial' },
              })}
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Container
        sx={{
          pt: { xs: 8, md: 0 },
          minHeight: { xs: 'auto', md: 500 },
          height: { md: 'calc(100vh - 120px)' },
          maxHeight: { md: 700, xl: 850 },
          transition: '0.3s',
        }}
      >
        <Grid container alignItems="center" wrap="nowrap" sx={{ height: '100%', mx: 'auto'}}>
          <Grid item md={7} lg={6} sx={{ m: 'auto', width: '30vw'  }}>
            {left}
          </Grid>
          <Grid
            item
            md={5}
            lg={6}
            sx={{ maxHeight: '100%', display: { xs: 'none', md: 'initial' }, width: '100vw'}}
          >
            {renderRightWrapper()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
