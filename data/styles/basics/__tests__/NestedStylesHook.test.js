import { render, fireEvent, waitFor } from '@testing-library/react';
import NestedStylesHook from './NestedStylesHook';
import React from 'react';

jest.mock('@mui/styles', () => ({
  makeStyles: jest.fn(() => {
    return {
      root: {
        color: 'red',
      },
    };
  }),
}));

describe('Nested Styles Hook', () => {
  it('renders without crashing', async () => {
    const { container } = render(<NestedStylesHook />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders paragraph correctly', async () => {
      const { getByText } = render(<NestedStylesHook />);
      expect(getByText('This is green since it is inside the paragraph')).toBeInTheDocument();
    });

    it('renders span correctly', async () => {
      const { getByText } = render(<NestedStylesHook />);
      expect(getByText('and this is blue since it is inside the span')).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('passes with valid props', async () => {
      const props = {
        name: 'John Doe',
        age: 30,
      };
      const { container } = render(<NestedStylesHook {...props} />);
      expect(container).toBeInTheDocument();
    });

    it('fails with invalid props (missing prop)', async () => {
      const { getByText } = render(<NestedStylesHook />);
      expect(getByText('Missing required prop')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('renders correctly after clicking on paragraph', async () => {
      const { getByText, getByRole } = render(<NestedStylesHook />);
      const paragraph = getByText('This is green since it is inside the paragraph');
      fireEvent.click(paragraph);
      expect(getByRole('region')).toBeInTheDocument();
    });

    it('renders correctly after clicking on span', async () => {
      const { getByText, getByRole } = render(<NestedStylesHook />);
      const span = getByText('and this is blue since it is inside the span');
      fireEvent.click(span);
      expect(getByRole('region')).toBeInTheDocument();
    });

    it('renders correctly after changing paragraph text', async () => {
      const { getByText, getByType } = render(<NestedStylesHook />);
      const paragraph = getByText('This is green since it is inside the paragraph');
      const inputField = getByType('input');
      fireEvent.change(inputField, { target: { value: 'New Text' } });
      expect(paragraph).toHaveTextContent('This is New Text since it is inside the paragraph');
    });

    it('renders correctly after submitting form', async () => {
      const { getByText, getByRole } = render(<NestedStylesHook />);
      const inputField = getByType('input');
      const submitButton = getByRole('button');
      fireEvent.change(inputField, { target: { value: 'New Text' } });
      fireEvent.click(submitButton);
      expect(getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Snapshot Test', () => {
    it('matches the expected output', async () => {
      const { asFragment } = render(<NestedStylesHook />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});