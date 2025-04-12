import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2019.md?muiMarkdown';

jest.mock('./mocks/external-dependency');

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('renders correctly with valid props', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('Title')).toBeInTheDocument();
    });

    it('does not render when docs prop is falsy', () => {
      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText('Title')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is invalid', () => {
      expect(() => <TopLayoutBlog docs="invalid" />).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('clicks the title', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const title = getByText('Title');
      fireEvent.click(title);
      expect(screen.getByRole('button')).toHaveClass('active');
    });

    it('saves changes to input field', async () => {
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('Input field placeholder');
      fireEvent.change(inputField, { target: { value: 'New text' } });
      expect(getByPlaceholderText('Input field placeholder')).toHaveValue('New text');
    });

    it('submits the form', async () => {
      const { getByRole, getByText } = render(<TopLayoutBlog docs={docs} />);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(getByText('Form submitted')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('calls the external dependency when updated', async () => {
      jest.mock('./mocks/external-dependency', () => ({
        update: jest.fn(),
      }));
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      fireEvent.click(getByText('Update'));
      expect(jest.mocked(externalDependency.update)).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});