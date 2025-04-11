import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-core-v5-migration-update.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders without crashing', () => {
    it('should render correctly', () => {
      expect(page).toBeTruthy();
    });
  });

  describe('Conditional rendering', () => {
    it('should render docs correctly', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('should render default text if no docs', () => {
      const docsWithoutTitle = 'No title provided';
      const { getByText } = render(<TopLayoutBlog docs={docsWithoutTitle} />);
      expect(getByText(`No title provided`)).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('should validate docs prop as string', () => {
      expect(() => render(<TopLayoutBlog docs="string" />)).not.toThrowError();
      expect(() => render(<TopLayoutBlog docs={1} />)).toThrowError(TypeError);
    });
  });

  describe('User interactions', () => {
    it('should call click handler when button clicked', () => {
      const mockClick = jest.fn();
      const { getByText } = page;
      fireEvent.click(getByText('Button text'));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should update state when input changes', () => {
      const mockhandleChange = jest.fn();
      const { getByPlaceholderText, getByLabelText } = page;
      fireEvent.change(getByPlaceholderText('Input text'), { target: { value: 'newValue' } });
      expect(mockhandleChange).toHaveBeenCalledTimes(1);
    });

    it('should submit form when submitted', () => {
      const mockhandleSubmit = jest.fn();
      const { getByLabelText, getByText } = page;
      fireEvent.click(getByText('Submit button'));
      expect(mockhandleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects and state changes', () => {
    it('should update state when user input is submitted', async () => {
      const mockUpdateState = jest.fn();
      const { getByPlaceholderText, getByLabelText } = page;
      await waitFor(() => fireEvent.change(getByPlaceholderText('Input text'), { target: { value: 'newValue' } }));
      expect(mockUpdateState).toHaveBeenCalledTimes(1);
    });
  });

  it('should match snapshot', () => {
    expect(render(<Page />)).toMatchSnapshot();
  });
});