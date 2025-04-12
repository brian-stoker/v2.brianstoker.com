import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-sync-plugin.md?muiMarkdown';

const Page = () => {
  return <TopLayoutBlog docs={docs} />;
};

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders with docs prop', async () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText(/introducing-sync-plugin/)).toBeInTheDocument();
    });

    it('does not render without docs prop', async () => {
      const { container } = render(<Page />);
      expect(container).not.toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('validates docs prop type', async () => {
      const mockedGetDocs = jest.fn(() => ({ doc1: 'doc1', doc2: 'doc2' }));
      jest.spyOn(TopLayoutBlog, 'getDocs').mockImplementation(mockedGetDocs);
      const { getByText } = render(<Page />);
      expect(getByText(/doc1/i)).toBeInTheDocument();
    });

    it('throws error without docs prop type', async () => {
      jest.spyOn(TopLayoutBlog, 'getDocs').mockImplementation(() => null);
      await expect(() => render(<Page />)).rejects.toThrowError(
        /Expected 'docs' to be a required prop/
      );
    });
  });

  describe('user interactions', () => {
    it('triggers click event on button', async () => {
      const { getByRole } = render(<Page />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(TopLayoutBlog.buttonClicked).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('updates docs prop on user input change', async () => {
      const { getByPlaceholderText } = render(<Page />);
      const input = getByPlaceholderText('new doc');
      fireEvent.change(input, { target: { value: 'new doc' } });
      expect(TopLayoutBlog.docs).toEqual({ doc1: 'new doc', doc2: 'doc2' });
    });
  });

  describe('snapshot testing', () => {
    it('matches the rendered output', async () => {
      const { asFragment } = render(<Page />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});