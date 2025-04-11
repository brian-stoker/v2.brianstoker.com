import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/technical-recruiter.md?muiMarkdown';

describe('TopLayoutCareers component', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = { ...pageProps };
    wrapper = render(<TopLayoutCareers {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders children when children are provided', () => {
      wrapper = render(<TopLayoutCareers {...props} children={<div>Test</div>} />);
      expect(wrapper getByText('Test')).toBeInTheDocument();
    });

    it('does not render children by default', () => {
      wrapper = render(<TopLayoutCareers {...props} />);
      expect(wrapper.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const invalidProps = { ...props, children: null };

    it('throws an error when children are not provided', () => {
      expect(() => render(<TopLayoutCareers {...invalidProps} />)).toThrowError(
        'children is required',
      );
    });

    it('does not throw an error when children are provided', () => {
      wrapper = render(<TopLayoutCareers {...props} children={<div>Test</div>} />);
      expect(() => render(<TopLayoutCareers {...invalidProps} />)).not.toThrowError(
        'children is required',
      );
    });
  });

  describe('user interactions', () => {
    it('calls handleSearch when search button is clicked', async () => {
      const mockSearch = jest.fn();
      props.onSearch = mockSearch;
      wrapper.getByRole('button', { name: /search/i }).click();
      expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('calls handleSubmit when form is submitted', async () => {
      const mockSubmit = jest.fn();
      props.onSubmit = mockSubmit;
      wrapper.getByRole('form').submit({
        target: { submit: () => {} },
      });
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when search button is clicked', async () => {
      const mockSearch = jest.fn();
      props.onSearch = mockSearch;
      wrapper.getByRole('button', { name: /search/i }).click();
      expect(props.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('side effects or state changes', () => {
    it('updates the component state when data is received from API', async () => {
      props.data = [{ id: '1' }];
      await waitFor(() => expect(wrapper.getByText('1')).toBeInTheDocument());
    });
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});