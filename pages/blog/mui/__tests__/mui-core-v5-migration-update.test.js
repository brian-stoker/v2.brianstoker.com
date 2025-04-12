import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-core-v5-migration-update.md?muiMarkdown';

jest.mock('./mocks/top-layout-blog', () => ({
  default: () => {
    return <div>Mocked TopLayoutBlog</div>;
  },
}));

describe('TopLayoutBlog component test suite', () => {
  let { getByText } = render(<Page />);
  const mockProps = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.XMLHttpRequest = null;
  });

  it('renders without crashing', () => {
    expect(getByText('Mocked TopLayoutBlog')).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('renders when props are valid', () => {
      const { queryByTitle } = render(<TopLayoutBlog {...mockProps} />);
      expect(queryByTitle).not.toBeNull();
    });

    it('does not render when props are invalid', () => {
      const invalidMockProps = {};
      const { queryByTitle } = render(<TopLayoutBlog {...invalidMockProps} />);
      expect(queryByTitle).toBeNull();
    });
  });

  describe('Prop validation', () => {
    it('allows valid props to pass through', () => {
      const { getByText } = render(<TopLayoutBlog {...mockProps} />);
      expect(getByText('Mocked TopLayoutBlog')).toBeInTheDocument();
    });

    it('throws an error when invalid props are provided', () => {
      const invalidMockProps = {};
      expect(() => render(<TopLayoutBlog {...invalidMockProps} />)).toThrowError(
        'Invalid prop: docs',
      );
    });
  });

  describe('User interactions', () => {
    it('renders correctly when clicked', () => {
      const { getByText } = render(<Page />);
      const buttonElement = getByText('Click me');
      fireEvent.click(buttonElement);
      expect(getByText('Mocked TopLayoutBlog')).toBeInTheDocument();
    });

    it('renders correctly when input changes', () => {
      const { getByText, getByRole } = render(<TopLayoutBlog {...mockProps} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(getByText('Mocked TopLayoutBlog')).toBeInTheDocument();
    });

    it('renders correctly when form is submitted', () => {
      const { getByText, getByRole } = render(<TopLayoutBlog {...mockProps} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      const submitButtonElement = getByRole('button', { name: /submit/i });
      fireEvent.click(submitButtonElement);
      expect(getByText('Mocked TopLayoutBlog')).toBeInTheDocument();
    });
  });

  it('side effect testing - render updated docs on change of mock data', () => {
    let count = 0;
    jest
      .spyOn(TopLayoutBlog, 'docs')
      .mockImplementation(() => {
        expect(mockProps.docs).not.toEqual(docs);
        return docs;
      });
    const { getByText } = render(<TopLayoutBlog {...mockProps} />);
    fireEvent.change(document.querySelector('input'), {
      target: { value: 'new Mocked Docs' },
    });
    count++;
    expect(count, 1);
  });

  it('should match snapshot when valid props are provided', () => {
    const { asFragment } = render(<TopLayoutBlog {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});