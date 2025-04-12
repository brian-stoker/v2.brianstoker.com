import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './december-2019-update.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders with docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('doc title')).toBeInTheDocument();
    });

    it('does not render without docs prop', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={undefined} />);
      expect(queryByText('doc title')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('doc title')).toBeInTheDocument();
    });

    it('rejects invalid docs prop (null)', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText('doc title')).toBeNull();
    });

    it('rejects invalid docs prop (undefined)', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={undefined} />);
      expect(queryByText('doc title')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('clicks the component', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const linkElement = document.querySelector('.link');
      fireEvent.click(linkElement);
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });

    it('changes input value', async () => {
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const inputElement = getByRole('textbox');
      fireEvent.change(inputElement, { target: { value: 'new value' } });
      expect(getByPlaceholderText('doc title')).toHaveValue('new value');
    });

    it('submits the form', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const submitButtonElement = document.querySelector('.submit-button');
      fireEvent.click(submitButtonElement);
      expect(global.console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('side effects and state changes', () => {
    it('updates the component state', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const updateButtonElement = document.querySelector('.update-button');
      fireEvent.click(updateButtonElement);
      expect(global.console.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('snapshot test', () => {
    it('renders with correct styles and content', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});