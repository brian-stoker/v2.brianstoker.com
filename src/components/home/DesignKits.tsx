import * as React from 'react';
import {alpha, styled} from '@mui/material/styles';
import {AvatarProps} from '@mui/material/Avatar';
import Box, {BoxProps} from '@mui/material/Box';
import Slide from 'src/components/animation/Slide';
import FadeDelay from 'src/components/animation/FadeDelay';

const ratio = 900 / 494;

// 'transparent' is interpreted as transparent black in Safari
// See https://css-tricks.com/thing-know-gradients-transparent-black/
const transparent = 'rgba(255,255,255,0)';

const Image = styled('img')(({ theme }) => ({
  display: 'block',
  width: 200,
  height: 200 / ratio,
  [theme.breakpoints.up('sm')]: {
    width: 300,
    height: 300 / ratio,
  },
  [theme.breakpoints.up('md')]: {
    width: 450,
    height: 450 / ratio,
  },
  border: '6px solid',
  borderColor: theme.palette.grey[400],
  borderRadius: theme.shape.borderRadius,
  objectFit: 'cover',
  transitionProperty: 'all',
  transitionDuration: '150ms',
  boxShadow: '0 4px 20px rgba(61, 71, 82, 0.2)',
  ...theme.applyDarkStyles({
    borderColor: theme.palette.grey[800],
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
  }),
}));

const Anchor = styled('a')(({ theme }) => [
  {
    display: 'inline-block',
    position: 'relative',
    transition: 'all 120ms ease',
    borderRadius: '50%',
    border: '1px solid',
    borderColor: theme.palette.grey[200],
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary[200], 0.3)}`,
    backgroundColor: '#FFF',
    '&:hover, &:focus': {
      borderColor: theme.palette.primary[300],
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary[400], 0.3)}`,
      backgroundColor: theme.palette.primary[50],
    },
  } as const,
  theme.applyDarkStyles({
    backgroundColor: alpha(theme.palette.primaryDark[900], 0.8),
    borderColor: theme.palette.primaryDark[600],
    boxShadow: `0 2px 12px ${alpha(theme.palette.primaryDark[800], 0.5)}`,
    '&:hover, &:focus': {
      backgroundColor: alpha(theme.palette.primary[900], 0.8),
      borderColor: theme.palette.primary[700],
      boxShadow: `0 2px 16px 0 ${alpha(theme.palette.primary[800], 0.5)}`,
    },
  }),
]);

const DesignToolLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<{ brand: 'figma' | 'sketch' | 'adobexd' }>
>(function DesignToolLink(props, ref) {
  const { brand, ...other } = props;
  return (
    <Anchor
      ref={ref}
      aria-label="Go to SUI Store"
      href={
        {
          figma:
            'https://stoked-ui.com/store/items/figma-react/?utm_source=marketing&utm_medium=referral&utm_campaign=home-products',
          sketch:
            'https://stoked-ui.com/store/items/sketch-react/?utm_source=marketing&utm_medium=referral&utm_campaign=home-products',
          adobexd:
            'https://stoked-ui.com/store/items/adobe-xd-react/?utm_source=marketing&utm_medium=referral&utm_campaign=home-products',
        }[brand]
      }
      target="_blank"
      {...other}
    />
  );
});

const DesignToolLogo = React.forwardRef<
  HTMLImageElement,
  { brand: 'figma' | 'sketch' | 'adobexd' } & AvatarProps
>(function DesignToolLogo({ brand, ...props }, ref) {
  return (
    <Box
      ref={ref}
      {...props}
      sx={{
        display: 'flex',
        p: 2,
        borderRadius: '50%',
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      }}
    >
      <img
        src={`/static/branding/design-kits/${brand}-logo.svg`}
        alt=""
        loading="lazy"
        width="60"
        height="60"
      />
    </Box>
  );
});

export function PrefetchDesignKitImages() {
  return (
    <Box
      sx={{
        width: 0,
        height: 0,
        position: 'fixed',
        zIndex: -100,
        '& > img': {
          position: 'absolute',
        },
        opacity: '0',
      }}
    >
      <img src="/static/branding/design-kits/designkits1.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits2.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits3.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits4.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits5.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits6.jpeg" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits-figma.png" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits-sketch.png" alt="" loading="lazy" />
      <img src="/static/branding/design-kits/designkits-xd.png" alt="" loading="lazy" />
    </Box>
  );
}

const defaultSlideUp = {
  '0%': {
    transform: 'translateY(-300px)',
  },
  '100%': {
    transform: 'translateY(-20px)',
  },
};
export function DesignKitImagesSet1({
  keyframes = defaultSlideUp,
  ...props
}: BoxProps & { keyframes?: Record<string, object> }) {
  return (
    <Slide animationName="designkit-slideup" {...props} keyframes={keyframes}>
      <FadeDelay delay={400}>
        <Image src="/static/branding/design-kits/designkits1.jpeg" alt="" />
      </FadeDelay>
      <FadeDelay delay={200}>
        <Image src="/static/branding/design-kits/designkits3.jpeg" alt="" />
      </FadeDelay>
      <FadeDelay delay={0}>
        <Image src="/static/branding/design-kits/designkits5.jpeg" alt="" />
      </FadeDelay>
    </Slide>
  );
}

const defaultSlideDown = {
  '0%': {
    transform: 'translateY(150px)',
  },
  '100%': {
    transform: 'translateY(-80px)',
  },
};
export function DesignKitImagesSet2({
  keyframes = defaultSlideDown,
  ...props
}: BoxProps & { keyframes?: Record<string, object> }) {
  return (
    <Slide animationName="designkit-slidedown" {...props} keyframes={keyframes}>
      <FadeDelay delay={100}>
        <Image src="/static/branding/design-kits/designkits2.jpeg" alt="" />
      </FadeDelay>
      <FadeDelay delay={300}>
        <Image src="/static/branding/design-kits/designkits4.jpeg" alt="" />
      </FadeDelay>
      <FadeDelay delay={500}>
        <Image src="/static/branding/design-kits/designkits6.jpeg" alt="" />
      </FadeDelay>
    </Slide>
  );
}

export function DesignKitTools({ disableLink, ...props }: { disableLink?: boolean } & BoxProps) {
  function renderTool(brand: 'figma' | 'sketch' | 'adobexd') {
    if (disableLink) {
      return <DesignToolLogo brand={brand} />;
    }
    return (
      <DesignToolLink brand={brand}>
        <DesignToolLogo brand={brand} />
      </DesignToolLink>
    );
  }
  return (
    <Box
      {...props}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        display: 'grid',
        gap: { xs: 3, lg: 6 },
        py: 4,
        gridTemplateColumns: '1fr 1fr 1fr',
        '& .MuiAvatar-root': {
          width: { xs: 80, sm: 100 },
          height: { xs: 80, sm: 100 },
        },
        ...props.sx,
      }}
    >
      <FadeDelay delay={200}>{renderTool('figma')}</FadeDelay>
      <FadeDelay delay={400}>{renderTool('sketch')}</FadeDelay>
      <FadeDelay delay={600}>{renderTool('adobexd')}</FadeDelay>
    </Box>
  );
}

function DesignKits() {
  return (
    <Box
      sx={{
        mx: { xs: -2, sm: -3, md: 0 },
        my: { md: -18 },
        height: { xs: 300, sm: 360, md: 'calc(100% + 320px)' },
        overflow: 'hidden',
        position: 'relative',
        width: { xs: '100vw', md: '50vw' },
      }}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          width: '100%',
          height: '100%',
          bgcolor: 'grey.50',
          opacity: 0.6,
          zIndex: 1,
          ...theme.applyDarkStyles({
            bgcolor: 'primaryDark.900',
          }),
        })}
      />
      <Box
        sx={(theme) => ({
          display: { xs: 'block', md: 'none' },
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to bottom, ${
            theme.palette.primary[50]
          } 0%, ${transparent} 30%, ${transparent} 70%, ${
            theme.palette.primary[50]
          } 100%)`,
          zIndex: 2,
          ...theme.applyDarkStyles({
            background: `linear-gradient(to bottom, ${
              theme.palette.primaryDark[900]
            } 0%, ${alpha(theme.palette.primaryDark[900], 0)} 30%, ${alpha(
              theme.palette.primaryDark[900],
              0,
            )} 70%, ${theme.palette.primaryDark[900]} 100%)`,
          }),
        })}
      />
      <Box
        sx={(theme) => ({
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: 0,
          left: 0,
          width: 400,
          height: '100%',
          background: `linear-gradient(to right, ${
            theme.palette.primary[50]
          }, ${transparent})`,
          zIndex: 2,
          ...theme.applyDarkStyles({
            background: `linear-gradient(to right, ${
              theme.palette.primaryDark[900]
            }, ${alpha(theme.palette.primaryDark[900], 0)})`,
          }),
        })}
      />
      <DesignKitTools
        sx={{
          top: { xs: '50%', md: 'calc(50% + 80px)', xl: '50%' },
          transform: { xs: 'translate(-50%, -50%)' },
          left: { xs: 'min(50%, 500px)' },
        }}
      />
      <Box
        sx={{
          // need perspective on this wrapper to work in Safari
          position: 'relative',
          height: '100%',
          perspective: '1000px',
        }}
      >
        <Box
          sx={{
            left: '36%',
            position: 'absolute',
            display: 'flex',
            transform: 'translateX(-40%) rotateZ(30deg) rotateX(8deg) rotateY(-8deg)',
            transformOrigin: 'center center',
          }}
        >
          <DesignKitImagesSet1 />
          <DesignKitImagesSet2 sx={{ ml: { xs: 2, sm: 4, md: 8 } }} />
        </Box>
      </Box>
    </Box>
  );
}
