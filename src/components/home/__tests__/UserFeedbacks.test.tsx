import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable/Grid2';
import MuiStatistics from 'src/components/home/MuiStatistics';
import {
  render,
  fireEvent,
} from '@testing-library/react';

interface FeedbackProps {
  quote: string;
  profile: {
    avatarSrc: string;
    avatarSrcSet: string;
    name: string;
    role: string;
    company?: React.ReactElement;
  };
}

function Feedback({ quote, profile }: FeedbackProps) {
  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFF',
      }}
    >
      <Typography
        sx={{
          mb: 2.5,
          lineHeight: 1.6,
          color: 'grey.200',
          fontSize: (theme) => theme.typography.pxToRem(15),
        }}
      >
        {quote}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={(theme) => ({
            p: 0.5,
            border: '1px solid',
            borderColor: 'primary.800',
            bgcolor: alpha(theme.palette.primary[900], 0.5),
            borderRadius: 99,
          })}
        >
          <Avatar
            srcSet={profile.avatarSrcSet}
            src={profile.avatarSrc}
            alt={`${profile.name}'s profile picture`}
            slotProps={{ img: { loading: 'lazy' } }}
            sx={{
              width: 36,
              height: 36,
            }}
          />
        </Box>
        <div>
          <Typography variant="body2" fontWeight="semiBold" color="text.primary">
            {profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.role}
          </Typography>
        </div>
        <Box sx={{ ml: 'auto' }}>{profile.company}</Box>
      </Box>
    </Box>
  );
}

export default function UserFeedbacks() {
  return (
    <Grid
      container
      sx={(theme) => ({
        mt: 4,
        backgroundColor: 'rgba(255,255,255,0.01)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'clip',
        '> :nth-of-type(1)': { borderBottom: `1px solid ${theme.palette.primaryDark[700]}` },
        '> :nth-of-type(2)': {
          borderBottom: `1px solid ${theme.palette.primaryDark[700]}`,
          borderRight: { xs: 0, sm: `1px solid ${theme.palette.primaryDark[700]}` },
        },
        '> :nth-of-type(3)': { borderBottom: `1px solid ${theme.palette.primaryDark[700]}` },
        '> :nth-of-type(4)': {
          borderRight: { xs: 0, sm: `1px solid ${theme.palette.primaryDark[700]}` },
          borderBottom: { xs: `1px solid ${theme.palette.primaryDark[700]}`, sm: 0 },
        },
      })}
    >
      <MuiStatistics />
      {TESTIMONIALS.map((item) => (
        <Grid key={item.profile.name} xs={12} sm={6}>
          <Feedback {...item} />
        </Grid>
      ))}
    </Grid>
  );
}

const TESTIMONIALS = [
  {
    quote: 'This is a great library!',
    profile: {
      avatarSrc: 'https://example.com/avatar1.png',
      avatarSrcSet: 'https://example.com/avatar1.png, https://example.com/avatar2.png',
      name: 'John Doe',
      role: 'Software Engineer',
    },
  },
  {
    quote: 'I love the customizability of this library!',
    profile: {
      avatarSrc: 'https://example.com/avatar2.png',
      avatarSrcSet: 'https://example.com/avatar1.png, https://example.com/avatar2.png',
      name: 'Jane Smith',
      role: 'UX Designer',
    },
  },
];

describe('UserFeedbacks', () => {
  it('renders Feedback component with quote and profile information', () => {
    const { getByText } = render(<UserFeedbacks />);
    expect(getByText('This is a great library!')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Software Engineer')).toBeInTheDocument();

    // Test Avatar image
    const avatar = getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.png');

    // Test Typography component for name and role
    const typographyName = getByText(/John Doe/);
    expect(typographyName).toHaveStyle({
      fontSize: '16px',
      fontWeight: 'semiBold',
      color: '#000',
    });

    const typographyRole = getByText('Software Engineer');
    expect(typographyRole).toHaveStyle({
      fontSize: '14px',
      color: '#333',
    });
  });

  it('renders Feedback component with quote and profile information (another test)', () => {
    const { getByText } = render(<UserFeedbacks />);
    expect(getByText('I love the customizability of this library!')).toBeInTheDocument();
    expect(getByText('Jane Smith')).toBeInTheDocument();
    expect(getByText('UX Designer')).toBeInTheDocument();

    // Test Avatar image
    const avatar = getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar2.png');

    // Test Typography component for name and role
    const typographyName = getByText(/Jane Smith/);
    expect(typographyName).toHaveStyle({
      fontSize: '16px',
      fontWeight: 'semiBold',
      color: '#000',
    });

    const typographyRole = getByText('UX Designer');
    expect(typographyRole).toHaveStyle({
      fontSize: '14px',
      color: '#333',
    });
  });
});