import * as React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from 'src/layouts/Section';
import {
  ADVANCED_CUSTOMERS, CORE_CUSTOMERS, DESIGNKITS_CUSTOMERS, TEMPLATES_CUSTOMERS,
} from 'src/components/home/CompaniesGrid';

export { CORE_CUSTOMERS,  DESIGNKITS_CUSTOMERS, TEMPLATES_CUSTOMERS };

const CompaniesGrid = dynamic(() => import('./CompaniesGrid'));

export default function References({
  companies,
}: {
  companies:
    | typeof CORE_CUSTOMERS
    | typeof ADVANCED_CUSTOMERS
    | typeof DESIGNKITS_CUSTOMERS
    | typeof TEMPLATES_CUSTOMERS;
}) {
  return (
    <Section cozy bg="transparent">
      <Box sx={{ minHeight: { xs: 236, sm: 144, md: 52 } }}>
        <CompaniesGrid data={companies} />
      </Box>
      <Typography
        textAlign="center"
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 4,
          mx: 'auto',
          maxWidth: 400,
          minHeight: 42, // hard-coded to reduce CLS (layout shift)
        }}
      >
        Industry leaders trust Stoked Consulting to deliver an unrivaled experience for both developers and users.
      </Typography>
    </Section>
  );
}
