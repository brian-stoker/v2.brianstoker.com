import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-is-now-mui.md?muiMarkdown';

const MockDocs = {
  title: 'Test Docs',
};

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.innerWidth = 1920;
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('Props', () => {
    it('passes docs prop to TopLayoutBlog', () => {
      const { getByText } = render(<Page docs={MockDocs} />);
      expect(getByText(MockDocs.title)).toBeInTheDocument();
    });

    it('throws an error if docs prop is invalid', () => {
      expect(() =>
        render(<TopLayoutBlog docs={null} />)
      ).toThrowError('Invalid prop: docs must be a non-null string');
    });
  });

  describe('User Interactions', () => {
    const { getByText, getByRole } = render(<Page />);

    it('renders title when clicked', async () => {
      const titleElement = getByText(MockDocs.title);
      fireEvent.click(titleElement);
      await waitFor(() => expect(getByText(MockDocs.title)).not.toBeInTheDocument());
    });

    it('renders docs content when scrolled to', async () => {
      global.scrollBehavior = () => ({ top: 100 });
      const linkElement = getByRole('link');
      fireEvent.mouseEnter(linkElement);
      await waitFor(() => expect(getByText(MockDocs.title)).toBeInTheDocument());
      global.scrollBehavior = jest.fn();
    });

    it('renders back button when clicked', async () => {
      const backButtonElement = getByText('Back');
      fireEvent.click(backButtonElement);
      await waitFor(() => expect(getByText(MockDocs.title)).not.toBeInTheDocument());
    });
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog component with docs prop', () => {
      global.innerWidth = 1920;
      render(<Page />);
      expect(document.body).toContainHTML('<TopLayoutBlog docs="Test Docs" />');
    });

    it('renders fallback content when no docs are provided', () => {
      const { getByText } = render(<Page docs={null} />);
      expect(getByText('No documentation found')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title prop', async () => {
      const { getByText } = render(<Page docs={{ title: '' }} />);
      expect(getByText('No documentation found')).toBeInTheDocument();
    });

    it('handles null docs prop', async () => {
      const { getByText, debug } = render(<Page docs={null} />);
      expect(getByText('Invalid prop: docs must be a non-null string')).toBeInTheDocument();
    });
  });
});

export default {};