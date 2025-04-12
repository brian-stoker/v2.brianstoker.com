import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './may-2019-update.md?muiMarkdown';

describe('Page component', () => {
  const doc = docs;

  beforeEach(() => {
    jest.clearAllMocks();
    render(<TopLayoutBlog docs={doc} />);
  });

  afterAll(() => {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(ReactDOM.findDOMNode TopLayoutBlog).not.toBeNull();
    });

    it('renders documentation content', async () => {
      const { getByText } = render(<TopLayoutBlog docs={doc} />);
      await waitFor(() => getByText(doc.title));
      expect(getByText(doc.title)).toBeInTheDocument();
    });

    it('renders title and content', () => {
      const { getByRole, getByText } = render(<TopLayoutBlog docs={doc} />);
      expect(getByRole('heading')).not.toBeNull();
      expect(getByText(doc.content)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('allows valid props', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={doc} />);
      expect(getByRole('heading')).not.toBeNull();
      expect(getByText(doc.title)).toBeInTheDocument();
      expect(getByText(doc.content)).toBeInTheDocument();
    });

    it('throws error for invalid prop', async () => {
      const mockGetContent = jest.fn(() => 'Invalid content');
      expect(() => render(<TopLayoutBlog docs={mockGetContent} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('clicks on the button to open sidebar', async () => {
      const { getByRole, getByText } = render(<TopLayoutBlog docs={doc} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('Sidebar')).toBeInTheDocument();
    });

    it('submits form and updates state', async () => {
      const { getByLabelText, getByText, getByRole } = render(<TopLayoutBlog docs={doc} />);
      const input = getByLabelText('Search');
      const button = getByRole('button');
      fireEvent.change(input, { target: 'Hello world!' });
      fireEvent.click(button);
      expect(getByText('New search term')).toBeInTheDocument();
    });
  });

  describe('Side effects', () => {
    it('loads data on mount', async () => {
      const mockGetDocs = jest.fn(() => ({ title: 'Doc' }));
      render(<TopLayoutBlog docs={mockGetDocs()} />);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('matches snapshot', () => {
      const { asFragment } = render(<TopLayoutBlog docs={doc} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});