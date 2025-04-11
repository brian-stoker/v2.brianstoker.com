import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DiamondSponsors from './DiamondSponsors.test.tsx';
import useInView from 'react-intersection-observer';

jest.mock('react-intersection-observer', () => ({
  ...jest.requireActual('react-intersection-observer'),
  useInView: () => {
    const ref = React.createRef();
    return {
      ref,
      inView: false,
    };
  },
}));

const mockGridItem = (item) => <SponsorCard logoSize={64} inView={false} item={item} />;

describe('DiamondSponsors', () => {
  const { container, getByText } = render(<DiamondSponsors />);
  let ref;

  beforeEach(() => {
    ref = React.createRef();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(container).toBeTruthy();
  });

  it('should render all diamond sponsors', () => {
    const sponsorCards = mockGridItem(DIAMONDs[0]);
    const grid = getByText('Diamond');
    expect(grid.children.length).toBe(DIAMONDs.length);
    expect(sponsorCards).toBeInTheDocument();
  });

  it('should render the available spot for sponsorship', () => {
    const sponsorCards = Array.from({ length: DIAMONDs.length }, mockGridItem);
    const grid = getByText('Diamond');
    expect(grid.children.length).toBe(DIAMONDs.length + 1);
    const availableSpot = spyOn(getByText, 'Become our sponsor!');
    expect(sponsorCards).toBeInTheDocument();
    expect(availableSpot).not.toHaveBeenCalled();

    const addSponsorButton = grid.querySelector('Paper > IconButton');
    fireEvent.click(addSponsorButton);
    expect(availableSpot).toHaveBeenCalledTimes(1);
  });

  it('should validate props correctly', () => {
    const mockProps = { items: {} };

    const component = render(<DiamondSponsors {...mockProps} />);
    expect(component).toBeTruthy();

    // Add tests for other props as needed
  });

  it('should trigger side effect when sponsorship spot is available', () => {
    jest.spyOn(DiamondSponsors.prototype, 'useEffect');

    const component = render(<DiamondSponsors />);
    expect(DiamondSponsors.useEffect).toHaveBeenCalledTimes(1);
  });
});

const spyOn = (method: any) => {
  return (...args: any[]) => {
    method(...args);
    return true;
  };
};

const DIAMONDs = [
  {
    src: '/static/images/bs.logo.svg',
    name: 'Stoked',
    description: 'Nothing to see here.',
    href: 'https://brianstoker.com/',
  }
];