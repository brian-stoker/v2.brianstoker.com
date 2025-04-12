import React from '@stoked-ui/docs/React';
import { render, fireEvent } from '@testing-library/react';
import OurValues from './OurValues';
import ROUTES from 'src/route';
import { createMemoryHistory } from 'history';
import { Link as RouterLink } from 'react-router-dom';

const mockValues = [
  {
    title: 'Put community first',
    description: "We never lose sight of who we're serving and why.",
    lightIcon: 'url(/static/branding/about/illustrations/community-light.svg)',
    darkIcon: 'url(/static/branding/about/illustrations/community-dark.svg)',
    width: 92,
    height: 84,
  },
];

const mockProps = {
  section: <Section cozi />,
};

describe('OurValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<OurValues />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders section headline', async () => {
      mockProps.section = <SectionHeadline />;
      const { getByText } = render(<OurValues {...mockProps} />);
      expect(getByText('Our values')).toBeInTheDocument();
    });
    it('renders grid container with 3 columns', async () => {
      const { getByRole } = render(<OurValues {...mockProps} />);
      expect(getByRole('griditem')).toHaveLength(3);
    });
    it('renders paper component', async () => {
      mockProps.values = [];
      const { getAllByRole } = render(<OurValues {...mockProps} />);
      expect(getAllByRole('paper')).toHaveLength(1);
    });
  });

  describe('prop validation', () => {
    it('throws error with invalid values prop', async () => {
      mockProps.values = 'invalid-values';
      await expect(render(<OurValues {...mockProps} />)).rejects.toThrowError(
        'Invalid value type'
      );
    });
    it('renders without crashing with valid values prop', async () => {
      const { container } = render(<OurValues {...mockProps} />);
      expect(container).toBeTruthy();
    });
  });

  describe('user interactions', () => {
    it('clicks on section headline link', async () => {
      mockProps.section = <SectionHeadline />;
      const { getByText, getByRole } = render(<OurValues {...mockProps} />);
      const linkElement = getByText('Our values');
      expect(getByRole('link')).toBeInTheDocument();
      fireEvent.click(linkElement);
    });
  });

  describe('side effects', () => {
    it('calls ROUTES with navigation route', async () => {
      mockProps.section = <SectionHeadline />;
      jest.spyOn(ROUTES, 'navigateTo');
      const { getByRole } = render(<OurValues {...mockProps} />);
      expect(getByRole('link')).toBeInTheDocument();
      fireEvent.click(getByRole('link'));
    });
  });

  it('snapshot test', () => {
    mockProps.values = mockValues;
    const { asFragment, getByRole } = render(<OurValues {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});