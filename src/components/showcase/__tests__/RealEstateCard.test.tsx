import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { RealEstateCard } from './RealEstateCard';

describe('RealEstateCard', () => {
  const realEstateCard = (props: any) => <RealEstateCard {...props} />;

  beforeEach(() => {
    // setup props and mock dependencies here
  });

  afterEach(() => {
    // cleanup props and mock dependencies here
  });

  it('renders without crashing', () => {
    const props = {
      sx: {},
    };
    render(realEstateCard(props));
    expect(screen.getByTestId('real-estate-card')).not.toBeNull();
  });

  it('renders card media correctly', () => {
    const props = {
      sx: {
        p: '10px',
      },
    };
    render(realEstateCard(props));
    const cardMedia = screen.getByRole('img');
    expect(cardMedia).toHaveAttribute('src', '/static/images/cards/real-estate.png');
  });

  it('renders Chip component correctly', () => {
    const props = {
      sx: {
        p: '10px',
      },
    };
    render(realEstateCard(props));
    const chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('aria-label', 'Confidence score: 85%');
  });

  it('renders conditional rendering correctly', () => {
    const props = {
      sx: {
        p: '10px',
      },
    };
    render(realEstateCard(props));
    expect(screen.getByRole('img')).not.toBeNull();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/static/images/cards/real-estate.png');
  });

  it('renders Chip with confidence score correctly', () => {
    const props = {
      sx: {
        p: '10px',
      },
    };
    render(realEstateCard(props));
    const chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('aria-label', 'Confidence score: 85%');
  });

  it('renders Chip with correct color and icon style', () => {
    const props = {
      sx: {
        p: '10px',
      },
    };
    render(realEstateCard(props));
    const chip = screen.getByRole('button');
    expect(chip).toHaveStyle({ fontSize: 16 });
  });

  it('calls onClick callback on click', () => {
    const onClickCallback = jest.fn();
    const props = {
      sx: {
        p: '10px',
      },
      onClick,
    };
    render(realEstateCard(props));
    fireEvent.click(screen.getByRole('button'));
    expect(onClickCallback).toHaveBeenCalledTimes(1);
  });

  it('renders with valid sx prop', () => {
    const props = {
      sx: {
        p: 2,
        display: 'flex',
        flexWrap: 'wrap',
        zIndex: 1,
        boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
      },
    };
    render(realEstateCard(props));
    expect(screen.getByTestId('real-estate-card')).toHaveStyle({
      p: 2,
      display: 'flex',
      flexWrap: 'wrap',
      zIndex: 1,
      boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
    });
  });

  it('renders with invalid sx prop', () => {
    const props = {
      sx: null,
    };
    render(realEstateCard(props));
    expect(screen.getByTestId('real-estate-card')).toHaveStyle({ p: undefined, display: undefined });
  });

  snapshotTest(' renders real estate card with correct layout', () => {
    const props = {
      sx: {
        p: 2,
        display: 'flex',
        flexWrap: 'wrap',
        zIndex: 1,
        boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
      },
    };
    render(realEstateCard(props));
    expect(screen.getByTestId('real-estate-card')).toMatchSnapshot();
  });
});