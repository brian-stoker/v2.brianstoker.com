import React from 'react';
import { render } from '@testing-library/react';
import UserFeedbacks from './UserFeedbacks';

describe('UserFeedbacks component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<UserFeedbacks />);
    expect(container).toBeInTheDocument();
  });

  it('renders the correct number of testimonial components', () => {
    const { getAllByRole } = render(<UserFeedbacks />);
    const testimonials = getAllByRole('testimonial');
    expect(testimonials.length).toBe(4);
  });

  it(' renders the correct quote and profile information for each testimonial', () => {
    const { getByText, getAllByRole } = render(<UserFeedbacks />);
    const testimonials = getAllByRole('testimonial');
    testimonials.forEach((testimonial) => {
      expect(testimonial).toHaveTextContent(/Gustavo de Paula/);
      expect(testimonial).toHaveTextContent('After much research on React component libraries, we decided to ditch our in-house library for Stoked UI, using its powerful customization system to implement our Design System.');
    });
  });

  it('renders the correct typography and colors', () => {
    const { getByRole } = render(<UserFeedbacks />);
    const testimonialText = getByRole('quote');
    expect(testimonialText).toHaveStyle({
      color: '#FFF',
      fontSize: '15px',
    });
    expect(getByRole('testimonial')).toHaveStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
    });
  });

  it('has the correct styles on the Grid container', () => {
    const { getByRole } = render(<UserFeedbacks />);
    expect(getByRole('grid-container')).toHaveStyle({
      mt: 4,
      backgroundColor: 'rgba(255,255,255,0.01)',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      overflow: 'clip',
      '> :nth-of-type(1)': { borderBottom: `1px solid #000` },
      '> :nth-of-type(2)': {
        borderBottom: `1px solid #000`,
        borderRight: { xs: 0, sm: `1px solid #000` },
      },
      '> :nth-of-type(3)': { borderBottom: `1px solid #000` },
      '> :nth-of-type(4)': {
        borderRight: { xs: 0, sm: `1px solid #000` },
        borderBottom: { xs: `1px solid #000`, sm: 0 },
      },
    });
  });

});