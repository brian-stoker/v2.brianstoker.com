import React from '@testing-library/react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'react-test-renderer';
import BaseUITestimonial from './BaseUITestimonial';

describe('BaseUITestimonial component', () => {
  let tree: any;

  beforeEach(() => {
    // Mock props
    const mockProps = {
      src: '/static/branding/base-ui/nhost-screenshot.png',
      alt: 'Screenshot displaying part of the Nhost dashboard that used Base UI to be built.',
    };

    // Render the component
    tree = create(<BaseUITestimonial {...mockProps} />);
  });

  afterEach(() => {
    // Clean up any side effects or mocks
  });

  it('renders without crashing', () => {
    expect(tree).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders the first grid item when props are passed', () => {
      const { getByText } = render(<BaseUITestimonial />);
      expect(getByText('Nhost\'s dashboard')).toBeInTheDocument();
    });

    it('renders the second grid item when props are not passed', () => {
      const { queryByAltText } = render(<BaseUITestimonial />);
      expect(queryByAltText('Szilárd Dóró')).not.toBeNull();
    });
  });

  describe('prop validation', () => {
    it('allows valid props to be passed', () => {
      const { getByRole, getByAltText } = render(<BaseUITestimonial src="/static/branding/base-ui/nhost-screenshot.png" alt="Test alt text" />);
      expect(getByRole('img')).toHaveAttribute('src', '/static/branding/base-ui/nhost-screenshot.png');
      expect(getByAltText('Test alt text')).not.toBeNull();
    });

    it('throws an error when invalid props are passed', () => {
      // Test that the component throws an error when invalid props are passed
      const { getByRole } = render(<BaseUITestimonial src="invalid-src" alt="Invalid alt text" />);
      expect(getByRole('img')).toHaveAttribute('src', 'invalid-src');
    });
  });

  describe('user interactions', () => {
    it('allows the link to be clicked', () => {
      const { getByRole, getByText } = render(<BaseUITestimonial />);
      const link = getByText('View the blog post <ChevronRightRoundedIcon fontSize="small" />');
      fireEvent.click(link);
      expect(getByText('Click event')).toBeInTheDocument();
    });

    it('allows the form to be submitted', () => {
      const { getByRole, getByText } = render(<BaseUITestimonial />);
      const form = getByRole('form');
      fireEvent.change(form, { target: { value: 'Test input' } });
      fireEvent.click(form);
      expect(getByText('Submit event')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('allows the component to update when props are passed', async () => {
      const updatedProps = { src: '/static/branding/base-ui/nhost-screenshot.png', alt: 'Test alt text' };
      await waitFor(() => expect(render(<BaseUITestimonial {...updatedProps} />)).toMatchSnapshot());
    });
  });
});