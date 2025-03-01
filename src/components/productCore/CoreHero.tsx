import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Section from 'src/layouts/Section';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import GradientText from 'src/components/typography/GradientText';

import IconImage from 'src/components/icon/IconImage';

export default function CoreHero() {
  return (
    <Section cozy noPaddingBottom>
      <SectionHeadline
        alwaysCenter
        overline={
          <Stack direction="row" justifyContent="center" alignItems="center">
            <IconImage loading="eager" width={28} height={28} name="product-core" sx={{ mr: 1 }} />{' '}
            SUI Core
          </Stack>
        }
        title={
          <Typography component="h1" variant="h2" sx={{ textAlign: 'center' }} gutterBottom>
            Ready to use components <GradientText>free forever</GradientText>
          </Typography>
        }
        description="Get a growing list of React components and utilities, ready-to-use, free forever, and with
        accessibility always in mind. We've built the foundational UI blocks for your design system so you don't have to."
      />
    </Section>
  );
}
