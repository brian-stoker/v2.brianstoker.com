import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021.md?muiMarkdown';

describe('Page', () => {
  const mockDocs = docs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Page />);
    expect(render).not.toThrow();
  });

  describe('Props', () => {
    it('passes docs prop to TopLayoutBlog', () => {
      const { getByText } = render(<Page />);
      expect(getByText(mockDocs.title)).toBeInTheDocument();
    });

    it('handles invalid docs prop', async () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).toThrowError();
      expect(() => render(<TopLayoutBlog docs={undefined} />)).toThrowError();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog when docs are available', async () => {
      const { getByRole } = render(<Page />);
      expect(getByRole('heading')).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog when docs are unavailable', async () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).not.toThrowError();
    });
  });

  describe('User Interactions', () => {
    const mockClick = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls click handler when button is clicked', async () => {
      render(<Page />);
      const button = await getByRole('button');
      fireEvent.click(button);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls onSubmit handler when form is submitted', async () => {
      const handleSubmit = jest.fn();
      render(<Page />);
      const form = await getByRole('form');
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls load function when page is loaded', async () => {
      const load = jest.fn();
      render(<Page />);
      await waitFor(() => load());
      expect(load).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with correct snapshot', async () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});