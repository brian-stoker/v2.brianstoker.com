import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useInView } from 'react-intersection-observer';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRounded from '@mui/icons-material/AddRounded';
import Grid from '@mui/material/Unstable/Grid2';
import SponsorCard from 'src/components/home/SponsorCard';
import { Link } from '@stoked-ui/docs/Link';
import ROUTES from 'src/route';

const mockUseInView = jest.fn();

jest.mock('react-intersection-observer', () => ({
  ...jest.requireActual('react-intersection-observer'),
  useInView: mockUseInView,
}));

const GOLDs = [
  {
    src: '/static/sponsors/tidelift.svg',
    name: 'Tidelift',
    description: 'Enterprise-ready open-source software.',
    href: 'https://tidelift.com/subscription/pkg/npm-material-ui?utm_source=npm-material-ui&utm_medium=referral&utm_campaign=homepage',
  },
  // ... rest of the GOLDs
];

const GoldSponsors = React.memo(() => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '500px',
  });
  return (
    <div ref={ref}>
      <Typography
        component="h3"
        variant="h6"
        fontWeight="bold"
        sx={(theme) => ({
          mt: 4,
          mb: 1.5,
          background: `linear-gradient(90deg, ${theme.palette.warning[500]} 50%, ${
            theme.palette.warning[700]
          } 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          ...theme.applyDarkStyles({
            background: `linear-gradient(90deg, ${
              theme.palette.warning[400]
            } 50%, ${theme.palette.warning[700]} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }),
        })}
      >
        Gold
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {GOLDs.map((item) => (
          <Grid key={item.name} xs={12} sm={6} md={4} lg={3}>
            <SponsorCard inView={inView} item={item} />
          </Grid>
        ))}
        <Grid xs={12} sm={6} md={4} lg={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderStyle: 'dashed',
            }}
          >
            <IconButton
              aria-label="Sponsor SUI"
              component="a"
              href={ROUTES.goldSponsor}
              target="_blank"
              rel="noopener"
              color="primary"
            >
              <AddRounded />
            </IconButton>
            <div>
              <Typography variant="body2" color="text.primary" fontWeight="bold">
                Become a sponsor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find out how{' '}
                <Link href={ROUTES.goldSponsor} target="_blank" rel="noopener">
                  you can support SUI.
                </Link>
              </Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
});

describe('GoldSponsors', () => {
  it('renders the Gold sponsors', async () => {
    const { getByRole, getByText } = render(<GoldSponsors />);
    await waitFor(() => expect(getByText('Gold')).toBeInTheDocument());
    await waitFor(() => expect(getByRole('listitem')).toHaveLength(GOLDs.length));
    expect(mockUseInView).toHaveBeenCalledTimes(1);
  });

  it('renders the Paper component', async () => {
    const { getByRole, getByText } = render(<GoldSponsors />);
    await waitFor(() => expect(getByRole('paper')).toBeInTheDocument());
  });

  it('renders the IconButton', async () => {
    const { getByRole, getByText } = render(<GoldSponsors />);
    await waitFor(() => expect(getByText('Become a sponsor')).toBeInTheDocument());
    await waitFor(() => expect(getByRole('button')).toBeInTheDocument());
  });

  it('clicks the Paper button', async () => {
    const { getByRole, getByText } = render(<GoldSponsors />);
    await waitFor(() => expect(getByRole('paper')).toBeInTheDocument());
    await fireEvent.click(getByText('Become a sponsor'));
    expect(mockUseInView).toHaveBeenCalledTimes(1);
  });
});