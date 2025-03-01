import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { InfoCard } from '@stoked-ui/docs/InfoCard';

const content = [
  {
    title: 'Stoked UI for Figma',
    link: 'https://stoked-ui.github.io/store/items/figma-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-figma',
    svg: (
      <img
        src={`/static/branding/design-kits/figma-logo.svg`}
        alt="Figma logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
  {
    title: 'Stoked UI for Sketch',
    link: 'https://stoked-ui.github.io/store/items/sketch-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-sketch',
    svg: (
      <img
        src={`/static/branding/design-kits/sketch-logo.svg`}
        alt="Sketch logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
  {
    title: 'Stoked UI for Adobe XD',
    link: 'https://stoked-ui.github.io/store/items/adobe-xd-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-adobe-xd',
    svg: (
      <img
        src={`/static/branding/design-kits/adobexd-logo.svg`}
        alt="Adobe XD logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
];

export default function MaterialUIDesignResources() {
  return (
    <Grid container spacing={2}>
      {content.map(({ svg, title, link }) => (
        <Grid key={title} xs={12} sm={4}>
          <InfoCard classNameTitle="algolia-lvl3" link={link} title={title} svg={svg} dense />
        </Grid>
      ))}
    </Grid>
  );
}
