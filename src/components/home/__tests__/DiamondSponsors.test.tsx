import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DiamondSponsors from './DiamondSponsors.test.tsx';
import { useInView } from 'react-intersection-observer';
import { createMockRef, createMockInView } from '../tests/mocks';

const DIAMONDs = [
  {
    src: '/static/images/bs.logo.svg',
    name: 'Stoked',
    description: 'Nothing to see here.',
    href: 'https://brianstoker.com/',
  }
];

describe('DiamondSponsors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<DiamondSponsors />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders sponsor cards when in view', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: true }));
      const { getAllByRole } = render(<DiamondSponsors />);
      expect(getAllByRole('img')).toHaveLength(DIAMONDs.length);
    });

    it('renders sponsored card when out of view', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getAllByRole } = render(<DiamondSponsors />);
      expect(getAllByRole('img')).toHaveLength(0);
    });

    it('renders sponsored card when out of view with root margin', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      render(<DiamondSponsors />);
      const { getByText } = render(<DiamondSponsors />);
      expect(getByText('Become our sponsor!')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts DIAMONDs prop as array', async () => {
      useInView.mockImplementation(() => ({ ref: null, inView: false }));
      const { getByText } = render(<DiamondSponsors DIAMONDs={DIAMONDs} />);
      expect(getByText(DIAMONDs[0].name)).toBeInTheDocument();
    });

    it('rejects invalid DIAMONDs prop as array', async () => {
      useInView.mockImplementation(() => ({ ref: null, inView: false }));
      const { getByText } = render(<DiamondSponsors DIAMONDs={[]}>);
      expect(getByText(DIAMONDs[0].name)).not.toBeInTheDocument();
    });

    it('rejects invalid maxNumberOfDiamondSponsors prop as number', async () => {
      useInView.mockImplementation(() => ({ ref: null, inView: false }));
      const { getByText } = render(<DiamondSponsors maxNumberOfDiamondSponsors={10.5} />);
      expect(getByText(DIAMONDs[0].name)).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('triggers in view event on sponsor card click', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getByRole } = render(<DiamondSponsors />);
      expect(getByRole('img')).toHaveLength(DIAMONDs.length);
      fireEvent.click(getByRole('img'));
      expect(useInView).toHaveBeenCalledTimes(1);
    });

    it('triggers form submission on sponsor card click', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getByRole } = render(<DiamondSponsors />);
      expect(getByRole('img')).toHaveLength(DIAMONDs.length);
      fireEvent.click(getByRole('img'));
      fireEvent.change(getByRole('input'), { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));
    });

    it('triggers in view event on button click', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getByRole } = render(<DiamondSponsors />);
      expect(getByRole('img')).toHaveLength(DIAMONDs.length);
      fireEvent.click(document.querySelector('button'));
      expect(useInView).toHaveBeenCalledTimes(1);
    });

    it('triggers form submission on button click', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getByRole } = render(<DiamondSponsors />);
      expect(getByRole('img')).toHaveLength(DIAMONDs.length);
      fireEvent.click(document.querySelector('button'));
      fireEvent.change(document.querySelector('input'), { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));
    });
  });

  describe('root margin', () => {
    it('displays sponsored content with root margin when out of view', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      const { getByText } = render(<DiamondSponsors />);
      expect(getByText('Become our sponsor!')).toBeInTheDocument();
    });

    it('displays sponsored content with root margin when out of view with maxNumberOfDiamondSponsors', async () => {
      const ref = createMockRef();
      useInView.mockImplementation(() => ({ ref, inView: false }));
      render(<DiamondSponsors />);
      const { getByText } = render(<DiamondSponsors />);
      expect(getByText('Become our sponsor!')).toBeInTheDocument();
    });
  });
});