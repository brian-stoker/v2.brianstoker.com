import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v6-alpha-zero.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<html><body></body></html>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    render(<Page />);
    expect(page).toBeTruthy();
  });

  describe('Props validation', () => {
    it('passes valid props', async () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText('Docs')).toBeInTheDocument();
    });

    it('rejects invalid prop types', async () => {
      const invalidPropType = 'string';
      const { error } = render(<Page docs={invalidPropType} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Conditional rendering', () => {
    it('renders TopLayoutBlog component', async () => {
      render(<Page />);
      expect(page).toHaveTextContent('Docs');
    });

    it('renders fallback content when docs prop is missing', async () => {
      const { getByText } = render(<Page />);
      expect(getByText('Fallback text')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls callback function when clicked', async () => {
      const callback = jest.fn();
      render(<Page docs={docs} onButtonClick={callback} />);
      fireEvent.click(page.getByText('Click me'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('updates input field when changed', async () => {
      const { getByPlaceholderText, getByTestId } = render(<Page docs={docs} />);
      const inputField = page.getByPlaceholderText('Input field');
      fireEvent.change(inputField, { target: { value: 'new text' } });
      expect(getByTestId('updated-input')).toHaveValue('new text');
    });

    it('submits form when clicked', async () => {
      render(<Page docs={docs} />);
      const form = page.getByRole('form');
      fireEvent.click(form);
      await waitFor(() => expect(page).not.toHaveTextContent('Submit button'));
    });
  });
});

export default { };