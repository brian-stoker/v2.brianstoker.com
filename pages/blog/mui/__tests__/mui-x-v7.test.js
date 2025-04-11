import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v7.md?muiMarkdown';

describe('Page component', () => {
  const docs = docs;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders top layout blog with correct props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders default message when no props are provided', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      expect(getByText('Default message')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const invalidDocs = {};

    it('throws an error with invalid docs prop', async () => {
      await expect(() => render(<TopLayoutBlog docs={invalidDocs} />)).rejects.toThrowError(
        expect.stringContaining('Invalid docs prop')
      );
    });

    it('renders successfully with valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls callback when button is clicked', async () => {
      const mockCallback = jest.fn();
      const { getByRole, getByText } = render(
        <TopLayoutBlog docs={docs} onButtonClicked={mockCallback} />
      );
      const button = getByRole('button');
      fireEvent.click(button);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('calls callback when form is submitted', async () => {
      const mockCallback = jest.fn();
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={docs} onSubmitForm={mockCallback} />
      );
      const input = getByRole('textbox');
      const submitButton = getByRole('button');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(submitButton);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('updates state correctly when callback is called', async () => {
      const [state, setState] = React.useState(null);
      const { getByRole } = render(
        <TopLayoutBlog docs={docs} onButtonClicked={() => setState(true)} />
      );
      const button = getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(state).toBe(true));
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});