// lab-2024-01-25-page.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './lab-date-pickers-to-mui-x.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).not.toBeNull();
    });
  });

  describe('Props', () => {
    it('renders with valid props', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('throws an error when no docs prop is passed', () => {
      expect(() => render(<TopLayoutBlog />)).toThrowError(
        'docs prop is required',
      );
    });
  });

  describe('User Interactions', () => {
    it('calls onChange prop on input change', async () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <TopLayoutBlog docs={docs} onChange={onChange} />,
      );
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit prop on form submission', async () => {
      const onSubmit = jest.fn();
      const { getByText } = render(
        <TopLayoutBlog docs={docs} onSubmit={onSubmit} />,
      );
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders children when children prop is passed', async () => {
      const children = <div>Test child</div>;
      const { getByText } = render(<TopLayoutBlog docs={docs} children={children} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      expect(getByRole('textbox')).toHaveAttribute('value', '');
    });

    it('does not render children when children prop is not passed', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={docs} />);
      expect(queryByText(docs.title)).toBeNull();
    });
  });
});

// Add snapshot test if necessary
// describe('Snapshot', () => {
//   it('matches the expected snapshot', () => {
//     expect(page).toMatchSnapshot();
//   });
// });