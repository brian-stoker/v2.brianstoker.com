import * as React from 'react';
import { useTheme, styled, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import SvgIcon from '@mui/material/SvgIcon';
import SuiSvg from 'public/static/logo-no-padding.svg';



export type IconImageProps = {
  name:
    | 'product-core'
    | 'product-advanced'
    | 'product-toolpad'
    | 'product-templates'
    | 'product-designkits'
    | 'pricing/x-plan-pro'
    | 'pricing/x-plan-premium'
    | 'pricing/x-plan-community'
    | 'pricing/yes'
    | 'pricing/no'
    | 'pricing/time'
    | 'companies/spotify'
    | 'companies/amazon'
    | 'companies/nasa'
    | 'companies/netflix'
    | 'companies/unity'
    | 'companies/shutterstock'
    | 'companies/southwest'
    | 'companies/boeing'
    | 'companies/siemens'
    | 'companies/deloitte'
    | 'companies/apple'
    | 'companies/twitter'
    | 'companies/salesforce'
    | 'companies/verizon'
    | 'companies/atandt'
    | 'companies/patreon'
    | 'companies/ebay'
    | 'companies/samsung'
    | 'companies/volvo'
    | string
    | 'sui-logo'
    | React.ReactElement;
  height?: number;
  mode?: '' | 'light' | 'dark';
  sx?: SxProps<Theme>;
  width?: number;
} & Omit<JSX.IntrinsicElements['img'], 'ref'>;

const Img = styled('img')({
  display: 'inline-block',
  verticalAlign: 'bottom',
  maxWidth: '100%',
  height: 'auto'
});

let neverHydrated = true;

export default function IconImage(props: IconImageProps) {
  const { height: heightProp, name, width: widthProp, mode: modeProp, ...other } = props;
  const theme = useTheme();
  const [firstRender, setFirstRender] = React.useState(true);
  React.useEffect(() => {
    setFirstRender(false);
    neverHydrated = false;
  }, []);
  // Handle React elements directly
  if (React.isValidElement(name)) {
    return name;
  }

  const mode = modeProp ?? (theme.palette.mode as any);

  // Type guard to ensure name is a string for the remaining code
  if (typeof name !== 'string') {
    return null;
  }

  let defaultWidth: number = 74;
  let defaultHeight: number = 74;

  if (name.startsWith('product-')) {
    defaultWidth = 74;
    defaultHeight = 74;
  } else if (name.startsWith('pricing/x-plan-')) {
    defaultWidth = 13;
    defaultHeight = 15;
  } else if (['pricing/yes', 'pricing/no', 'pricing/time'].indexOf(name) !== -1) {
    defaultWidth = 18;
    defaultHeight = 18;
  } else if (name === 'sui-logo') {
    return (
      <SvgIcon
        component={SuiSvg}
        inheritViewBox
        sx={{
          width: widthProp ?? 30,
          height: heightProp ?? 30,
          maxWidth: widthProp ?? 30,
          maxHeight: heightProp ?? 30,
          flexShrink: 0,
          display: 'inline-block'
        }}
      />
    );
  }

  const width = widthProp ?? defaultWidth;
  const height = heightProp ?? defaultHeight;

  // First time render with a theme depend image
  if (firstRender && neverHydrated && mode !== '') {
    if (other.loading === 'eager') {
      return (
        <Box sx={{ '& svg': { fill: 'pink' } }}>
          <style >{`
            path { fill: pink; } 
          `}</style>
          <Img
            className="only-light-mode-v3"
            style={{ color: 'pink' }}
            src={`/static/branding/${name}-light.svg`}
            alt=""
            width={width}
            height={height}
            {...other}
            loading="lazy"
          />
          <Img
            className="only-dark-mode-v2"
            src={`/static/branding/${name}-dark.svg`}
            alt=""
            width={width}
            height={height}
            {...other}
            loading="lazy"
          />
        </Box>
      );
    }

    // Prevent hydration mismatch between the light and dark mode image source.
    return <Box component="span" sx={{ width, height, display: 'inline-block' }} />;
  }

  return (
    <Img
      src={`/static/branding/${name}${mode ? `-${mode}` : ''}.svg`}
      alt=""
      loading="lazy"
      width={width}
      height={height}
      {...other}
    />
  );
}
