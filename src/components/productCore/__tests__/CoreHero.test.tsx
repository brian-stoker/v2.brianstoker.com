import { render } from '@testing-library/react';
import React from 'react';
import CoreHero from './CoreHero';

describe('Core Hero Component', () => {
  const renderComponent = (props: any) =>
    render(<CoreHero {...props} />);

  beforeEach(() => {
    // Mock external dependencies
    jest.spyOn(Console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console log behavior
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderComponent({});

    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders headline and title correctly', () => {
      const { getByText, getByRole } = renderComponent({
        headLine: 'Headline',
        title: 'Title',
      });

      expect(getByText('Headline')).toBeInTheDocument();
      expect(getByText('Title')).toBeInTheDocument();

      expect(getByRole('heading')).toBeInTheDocument();
    });

    it('renders description correctly', () => {
      const { getByText } = renderComponent({
        headLine: 'Headline',
        title: 'Title',
      });

      expect(getByText('Get a growing list of React components and utilities, ready-to-use, free forever,')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error for invalid prop', async () => {
      const { error } = renderComponent({
        noProp: 'Invalid Prop',
      });

      expect(error).toBeInstanceOf(Error);
    });

    it('does not throw error for valid props', async () => {
      const { error } = renderComponent({
        headLine: 'Headline',
        title: 'Title',
      });

      expect(error).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('clicks on icon image renders correct component', async () => {
      const { getByText, getByRole } = renderComponent({
        headLine: 'Headline',
        title: 'Title',
        clickIconImage: true,
      });

      expect(getByText('SUI Core')).toBeInTheDocument();

      // Add additional assertions for button click interactions
    });
  });

  describe('snapshot test', () => {
    it('renders correct layout', () => {
      const { asFragment } = renderComponent({
        headLine: 'Headline',
        title: 'Title',
      });

      expect(asFragment()).toMatchSnapshot();
    });
  });
});