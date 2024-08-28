import * as React from 'react';
import Typography from '@mui/material/Typography';
import Section from 'src/layouts/Section';
import DiamondSponsors from 'src/components/home/DiamondSponsors';
import GoldSponsors from 'src/components/home/GoldSponsors';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import GradientText from 'src/components/typography/GradientText';

export default function Sponsors() {
  return (
    <Section cozy>
      <SectionHeadline
        id="sponsors"
        overline="Sponsors"
        title={
          <Typography variant="h2" sx={{ my: 1 }}>
            <GradientText>You</GradientText> make this possible
          </Typography>
        }
        description="The development of these open-source tools is accelerated by our generous sponsors."
      />
      <DiamondSponsors />
      <GoldSponsors />
    </Section>
  );
}
