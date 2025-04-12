import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from '../src/modules/components/TopLayoutBlog';

describe('TopLayoutBlog component', () => {
  const initialDocs = {
    title: 'Test Docs',
    author: 'John Doe',
    date: '2022-01-01',
    description: 'This is a test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog docs={initialDocs} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders title when present', () => {
      const { getByText } = render(
        <TopLayoutBlog docs={{ ...initialDocs, title: '' }} />
      );
      expect(getByText(initialDocs.title)).toBeInTheDocument();
    });

    it('does not render title when absent', () => {
      const { queryByText } = render(<TopLayoutBlog docs={{}} />);
      expect(queryByText '').not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts expected props', () => {
      const { container } = render(<TopLayoutBlog docs={initialDocs} />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid prop types', () => {
      const invalidProps = { nonExistentProp: 'value' };
      expect(() =>
        render(<TopLayoutBlog docs={invalidProps} />)
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('renders correctly when clicking on title', () => {
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={initialDocs} />
      );
      const link = getByText(initialDocs.title);
      fireEvent.click(link);
      expect(getByRole('nav')).toBeInTheDocument();
    });

    it('renders correctly when clicking on author', () => {
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={initialDocs} />
      );
      const link = getByText(initialDocs.author);
      fireEvent.click(link);
      expect(getByRole('nav')).toBeInTheDocument();
    });

    it('renders correctly when clicking on date', () => {
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={initialDocs} />
      );
      const link = getByText(initialDocs.date);
      fireEvent.click(link);
      expect(getByRole('nav')).toBeInTheDocument();
    });

    it('renders correctly when clicking on description', () => {
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={initialDocs} />
      );
      const link = getByText(initialDocs.description);
      fireEvent.click(link);
      expect(getByRole('nav')).toBeInTheDocument();
    });
  });

  it('side effect rendering when rendered correctly', () => {
    const { container } = render(<TopLayoutBlog docs={initialDocs} />);
    expect(container).toHaveStyle(`
      /* some styles here */
    `);
  });

  it('renders snapshot test', () => {
    const { asFragment } = render(<TopLayoutBlog docs={initialDocs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});