import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeTimeline } from './ThemeTimeline';

jest.mock('@mui/material', () => ({
  ...require('@mui/material'),
  MuiCard: {
    style: jest.fn(),
    variant: 'outlined',
  },
  MuiBox: {
    sx: jest.fn((props) => props),
  },
}));

describe('BasicTimeline Component', () => {
  const theme = {
    palette: {
      primary: {
        main: '#2196f3',
        darker: '#1a2d40',
        lighter: '#b0bec5',
      },
      grey: {
        200: '#f7f7f7',
        500: '#d3d3d3',
        800: '#b3b3b3',
        900: '#a2184c',
      },
    },
    theme: {
      applyDarkStyles: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeTimeline />);
    expect(container).toBeInTheDocument();
  });

  describe('props', () => {
    it('should validate props with valid data', () => {
      const { getByText } = render(<ThemeTimeline />);
      expect(getByText('Install one of our production-ready libraries to get your next app started inevitably')).toBeInTheDocument();
    });

    it('should not accept invalid props', () => {
      expect(
        render(<ThemeTimeline invalidProp="invalid-value" />)
      ).toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('renders TimelineItem with correct styles', () => {
      const { getByText, getAllByRole } = render(<ThemeTimeline />);
      const timelineItems = getAllByRole('listitem');
      expect(timelineItems.length).toBe(3);
      timelineItems.forEach((item) => {
        expect(item).toHaveStyle({
          height: '24px',
          width: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: 0.3,
          bgcolor: 'primary.50',
          color: 'primary.600',
          border: '1px solid',
          borderColor: 'primary.100',
        });
      });
    });

    it('renders TimelineContent with correct styles', () => {
      const { getAllByRole } = render(<ThemeTimeline />);
      const timelineItems = getAllByRole('listitem');
      timelineItems.forEach((item) => {
        expect(item).toHaveStyle({
          fontSize: '0.875rem',
          color: 'grey.800',
        });
      });
    });

    it('renders TimelineSeparator with correct styles', () => {
      const { getByText } = render(<ThemeTimeline />);
      expect(getByText('Install one of our production-ready libraries to get your next app started inevitably')).toHaveStyle({
        fontSize: '0.875rem',
        color: 'grey.800',
      });
    });

    it('renders TimelineDot with correct styles', () => {
      const { getAllByRole } = render(<ThemeTimeline />);
      const timelineItems = getAllByRole('listitem');
      timelineItems.forEach((item) => {
        expect(item).toHaveStyle({
          zIndex: 1,
          padding: '3px',
          boxShadow: 'none',
          margin: '15px 0',
          border: 'none',
          bgcolor: 'primary.500',
        });
      });
    });

    it('renders TimelineConnector with correct styles', () => {
      const { getAllByRole } = render(<ThemeTimeline />);
      const timelineItems = getAllByRole('listitem');
      timelineItems.forEach((item) => {
        expect(item).toHaveStyle({
          bgcolor: 'primary.100',
        });
      });
    });

    it('renders with correct styles for dark theme', () => {
      jest.spyOn(theme.theme, 'applyDarkStyles').mockImplementation(() => {});
      const { getByText } = render(<ThemeTimeline />);
      expect(getByText('Install one of our production-ready libraries to get your next app started inevitably')).toHaveStyle({
        fontSize: '0.875rem',
        color: 'grey.100',
      });
    });
  });

  describe('event listeners', () => {
    it('should call onListItemClick event when clicked', async () => {
      const { getByRole } = render(<ThemeTimeline />);
      const timelineItem = getByRole('listitem');
      fireEvent.click(timelineItem);
      await waitFor(() => expect(jest.fn().mock.calls.length).toBe(1));
    });
  });
});