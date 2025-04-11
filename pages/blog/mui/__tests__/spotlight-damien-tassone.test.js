import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './spotlight-damien-tassone.md?muiMarkdown';

describe('Page component', () => {
  let document;

  beforeEach(() => {
    document = { element: { innerHTML: '' } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should pass when all props are valid', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('should fail when docs prop is missing', () => {
      expect(() => render(<TopLayoutBlog />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders with default values', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders error message when docs prop is invalid', async () => {
      const { getByText, queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText(/Error: docs prop is required/)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should update the props when clicked', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText(docs.title);
      fireEvent.click(button);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('should update the props when input changes', async () => {
      const { getByText, byPlaceholderText } = render(<TopLayoutBlog docs={docs} />);
      const inputField = byPlaceholderText('Enter a title');
      fireEvent.change(inputField, { target: { value: 'New Title' } });
      expect(getByText('New Title')).toBeInTheDocument();
    });

    it('should update the props when form is submitted', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText(docs.title);
      fireEvent.click(button);
      expect(document.element.innerHTML).toBe(`\n\n## ${docs.title}\n\n${docs.content}\n`);
    });
  });

  describe('side effects', () => {
    it('should update the DOM when props change', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(document.element.innerHTML).toBe(`\n\n## ${docs.title}\n\n${docs.content}\n`);
    });
  });

  // Snapshot test
  it('should match the expected snapshot', () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toMatchSnapshot();
  });
});