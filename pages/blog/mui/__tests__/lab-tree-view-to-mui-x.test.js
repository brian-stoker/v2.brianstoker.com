import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import docs from './lab-tree-view-to-mui-x.md?muiMarkdown';

describe('LabTree View To MUI X component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(wrapper).toBeTruthy();
    });

    it('should render TopLayoutBlog component with docs prop', () => {
      expect(wrapper.container.querySelector('TopLayoutBlog')).toBeInTheDocument();
      expect(wrapper.container.querySelector('TopLayoutBlog').props.docs).toBe(docs);
    });

    describe('Conditional Rendering', () => {
      it('should render content when docs prop is not empty', () => {
        const wrapper = render(<Page />);
        expect(wrapper.container.querySelector('.doc-content')).toBeInTheDocument();
      });

      it('should not render content when docs prop is empty', () => {
        const wrapper = render(<Page docs="" />);
        expect(wrapper.container.querySelector('.doc-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Props Validation', () => {
    it('should throw an error when docs prop is undefined', () => {
      expect(() => render(<Page docs={undefined} />)).toThrowError();
    });

    it('should not throw an error when docs prop is a string', () => {
      expect(() => render(<Page docs="some-content" />)).not.toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('should update docs prop on input change', () => {
      const { getByPlaceholderText, getByTestId } = wrapper;
      const inputField = getByPlaceholderText('Enter content');
      const expectedDocs = 'some-content';

      fireEvent.change(inputField, { target: { value: expectedDocs } });

      expect(wrapper.container.querySelector('.doc-content')).toHaveTextContent(expectedDocs);
    });

    it('should submit form on click', async () => {
      const { getByPlaceholderText, getByTestId } = wrapper;
      const inputField = getByPlaceholderText('Enter content');
      const button = getByText('Submit');

      fireEvent.change(inputField, { target: { value: 'some-content' } });
      fireEvent.click(button);

      await waitFor(() => expect(wrapper.container.querySelector('.doc-content')).toHaveTextContent('some-content'));
    });

    it('should not update docs prop on click', () => {
      const { getByPlaceholderText, getByTestId } = wrapper;
      const inputField = getByPlaceholderText('Enter content');
      const button = getByText('Click me');

      fireEvent.click(button);

      expect(wrapper.container.querySelector('.doc-content')).not.toHaveUpdated();
    });
  });

  describe('Side Effects', () => {
    it('should update docs prop on mount', async () => {
      const { getByPlaceholderText, getByTestId } = wrapper;
      const inputField = getByPlaceholderText('Enter content');
      const expectedDocs = 'some-content';

      await waitFor(() => expect(wrapper.container.querySelector('.doc-content')).toHaveTextContent(expectedDocs));
    });
  });

  it('should match snapshot', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});