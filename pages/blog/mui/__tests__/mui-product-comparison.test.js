import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-product-comparison.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).not.toBeNull();
  });

  describe('props', () => {
    const validProps = { docs: docs };
    const invalidProp = 'invalid-prop';

    it('renders with valid props', () => {
      const { container } = render(<TopLayoutBlog {...validProps} />);
      expect(container).toHaveTextContent(docs);
    });

    it('throws an error for invalid prop', () => {
      expect(() => render(<TopLayoutBlog docs={invalidProp} />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    const withDocs = { docs: docs };
    const withoutDocs = {};

    it('renders with docs', () => {
      const { container } = render(<TopLayoutBlog {...withDocs} />);
      expect(container).toHaveTextContent(docs);
    });

    it('does not render without docs', () => {
      const { container } = render(<TopLayoutBlog {...withoutDocs} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('user interactions', () => {
    let changeInputEvent;

    beforeEach(() => {
      changeInputEvent = jest.fn();
    });

    it('calls onInputChange when input changes', () => {
      const { getByPlaceholderText } = page;
      const inputField = getByPlaceholderText('docs');
      fireEvent.change(inputField, { target: { value: 'new-docs' } });
      expect(changeInputEvent).toHaveBeenCalledTimes(1);
      expect(changeInputEvent).toHaveBeenCalledWith('new-docs');
    });

    it('does not call onInputChange when no changes', () => {
      const { getByPlaceholderText } = page;
      const inputField = getByPlaceholderText('docs');
      fireEvent.change(inputField, { target: { value: 'no-changes' } });
      expect(changeInputEvent).not.toHaveBeenCalled();
    });

    it('calls onSubmit when form is submitted', () => {
      const submitButton = page.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      expect(changeInputEvent).toHaveBeenCalledTimes(1);
      expect(changeInputEvent).toHaveBeenCalledWith('new-docs');
    });
  });
});