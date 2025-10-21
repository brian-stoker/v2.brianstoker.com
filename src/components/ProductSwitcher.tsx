import * as React from 'react';
import dynamic from 'next/dynamic';
import { alpha, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Highlighter from "./action/Highlighter";
import { PRODUCTS } from '../products';
import IconButton from '@mui/material/IconButton/IconButton';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';

const SwipeableViews = dynamic(() => import('react-swipeable-views'), { ssr: false });

function ProductItem({
  icon,
  name,
  description,
  chip,
}: {
  icon: React.ReactNode;
  name: React.ReactNode;
  description: React.ReactNode;
  chip?: React.ReactNode;
}) {
  return (
    <Box
      component="span"
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            height: 32,
            width: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <span>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography color="text.primary" variant="body2" fontWeight="semiBold">
              {name}
            </Typography>
            {chip}
          </Box>
          <Typography color="text.secondary" variant="body2" fontWeight="regular" sx={{ my: 0.5 }}>
            {description}
          </Typography>
        </span>
      </Box>
    </Box>
  );
}

export default function ProductCarousel(props: {
  inView?: boolean;
  productIndex: number;
  setProductIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { inView = false, productIndex, setProductIndex } = props;
  const isBelowMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const liveProducts = PRODUCTS.live;

  const handleNext = React.useCallback(() => {
    setProductIndex((prev) => Math.min(prev + 1, liveProducts.length - 1));
  }, [liveProducts.length, setProductIndex]);

  const handleBack = React.useCallback(() => {
    setProductIndex((prev) => Math.max(prev - 1, 0));
  }, [setProductIndex]);

  const productItems = liveProducts.map((product, index) => (
    <ProductItem
      key={index}
      name={product.name}
      description={product.description}
      icon={product.icon}
    />
  ));
  
  return (
    <Box >
      <Box
        sx={{
          maxWidth: 'calc(100vw - 40px)',
          mb: 2,
          '& > div': { pr: '32%' },
        }}
      >
        {isBelowMd && inView && (
          <SwipeableViews
            index={productIndex}
            resistance
            enableMouseEvents
            onChangeIndex={(index) => setProductIndex(index)}
          >
            {liveProducts.map((_, index) => (
              <Highlighter
                key={index}
                disableBorder
                selected={productIndex === index}
                sx={{
                  width: '100%',
                  transition: '0.3s',
                  transform: productIndex !== index ? 'scale(0.9)' : 'scale(1)'
                }}
              >
                {productItems[index]}
              </Highlighter>
            ))}
          </SwipeableViews>
        )}
      </Box>
      <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' },  backgroundColor: 'transparent!important' }}>
        {liveProducts.map((_, index) => (
          <Highlighter
            key={index}
            disableBorder
            onClick={() => setProductIndex(index)}
            selected={productIndex === index}
          >
            {productItems[index]}
          </Highlighter>
        ))}
      </Stack>
      {/* Custom Mobile Stepper with Icons - Only show on mobile */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          mb: 2,
          px: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={handleBack}
          aria-label="Previous showcase"
          disabled={productIndex === 0}
        >
          <KeyboardArrowLeftRounded fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          {liveProducts.map((product, index) => (
            <Box
              key={index}
              onClick={() => setProductIndex(index)}
              sx={(theme) => ({
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: productIndex === index ? 1 : 0.4,
                backgroundColor: productIndex === index
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                transform: productIndex === index ? 'scale(1.2)' : 'scale(0.9)',
                '&:hover': {
                  opacity: 0.7,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                '& > *': {
                  width: '20px !important',
                  height: '20px !important',
                  fontSize: '20px !important',
                },
              })}
            >
              {product.icon}
            </Box>
          ))}
        </Box>

        <IconButton
          size="small"
          onClick={handleNext}
          aria-label="Next showcase"
          disabled={productIndex === liveProducts.length - 1}
        >
          <KeyboardArrowRightRounded fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
