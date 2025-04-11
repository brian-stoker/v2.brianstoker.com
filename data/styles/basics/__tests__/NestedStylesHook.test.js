import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import NestedStylesHook from './NestedStylesHook';

describe('NestedStylesHook', () => {
  let wrapper;
  const classes = {};

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = render(<NestedStylesHook />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders paragraph and span when present', () => {
      const { getByText } = render(<NestedStylesHook />);
      expect(getByText('This is green since it is inside the paragraph')).toBeInTheDocument();
      expect(getByText('and this is blue since it is inside the span')).toBeInTheDocument();
    });

    it('does not render paragraph and span when absent', () => {
      const { queryByText } = render(<NestedStylesHook />);
      expect(queryByText('This is green since it is inside the paragraph')).not.toBeInTheDocument();
      expect(queryByText('and this is blue since it is inside the span')).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('renders with default classes when no props provided', () => {
      const { getByText } = render(<NestedStylesHook />);
      expect(getByText('This is red since it is inside the root')).toBeInTheDocument();
    });

    it('renders with custom classes when props provided', () => {
      classes.root = 'custom-class';
      const { getByText } = render(<NestedStylesHook classes={classes} />);
      expect(getByText('This is red since it is inside the root')).toHaveClass('custom-class');
    });

    it('throws error when invalid prop provided', () => {
      expect(() => render(<NestedStylesHook invalidProp='test' />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    let input;

    beforeEach(() => {
      input = wrapper.getByPlaceholderText('');
    });

    it('calls onChange when input changes', () => {
      const onChangeMock = jest.fn();
      wrapper.addEventListener('change', onChangeMock);
      input.value = 'test';
      input.dispatchEvent(new Event('change'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('renders as expected', async () => {
      await waitFor(() => expect(wrapper).toMatchSnapshot());
    });
  });
});