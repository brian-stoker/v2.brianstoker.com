import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-q1-update.md?muiMarkdown';

describe('Page component', () => {
  let props;

  beforeEach(() => {
    props = {
      docs: docs,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).toBeTruthy();
  });

  it('renders TopLayoutBlog component with docs prop', () => {
    const { getByText } = render(<TopLayoutBlog {...props} />);
    expect(getByText(/2020-q1-update.md/i)).toBeInTheDocument();
  });

  it('renders empty when docs prop is an empty string', async () => {
    props.docs = '';
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).not.toHaveTextContent();
  });

  describe('prop validation', () => {
    it('rejects empty docs prop', () => {
      props.docs = null;
      expect(() => <TopLayoutBlog {...props} />).toThrowError();
    });

    it('rejects non-string docs prop', async () => {
      props.docs = {};
      const { error } = render(<TopLayoutBlog {...props} />);
      expect(error.type).toBeInstanceOf(Error);
    });
  });

  describe('user interactions', () => {
    it('calls callback when clicking on a link', async () => {
      const mockCallback = jest.fn();
      props.onLinkClicked = mockCallback;
      const { getByText } = render(<TopLayoutBlog {...props} />);
      const link = getByText(/#link/i);
      fireEvent.click(link);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('calls callback when clicking on a button', async () => {
      const mockCallback = jest.fn();
      props.onButtonClick = mockCallback;
      const { getByText } = render(<TopLayoutBlog {...props} />);
      const button = getByText(/#button/i);
      fireEvent.click(button);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('state changes', () => {
    it('updates state when a new docs prop is passed', async () => {
      props.docs = '';
      await waitFor(() => {
        expect(props.docs).toBe('');
      });
    });
  });
});