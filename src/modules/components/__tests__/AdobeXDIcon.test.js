import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdobeXDIcon from './AdobeXDIcon';

jest.mock('@mui/material/utils', () => ({
  createSvgIcon: (props, id) => props,
}));

describe('AdobeXDIcon component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<AdobeXDIcon />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders with fillRule="nonzero" fill="none"', async () => {
      const { container } = render(
        <g fillRule="nonzero" fill="none">
          <path d="" fill="#470137" />
          <path d="" fill="#FF61F6" />
        </g>
      );
      expect(container).toMatchSnapshot();
    });

    it('renders without fillRule or fill', async () => {
      const { container } = render(<AdobeXDIcon />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', async () => {
      const { container } = render(
        <AdobeXDIcon fill="#FF61F6" />
      );
      expect(container).toMatchSnapshot();
    });

    it('rejects invalid fill prop', async () => {
      const { error } = render(<AdobeXDIcon fill="invalid" />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('user interactions', () => {
    it('responds to clicks', async () => {
      const { getByRole, getByText } = render(<AdobeXDIcon />);
      const icon = getByRole('img');
      fireEvent.click(icon);
      expect(getByText('Adobe XD')).toBeInTheDocument();
    });

    it('responds to input changes', async () => {
      const { getByRole, getByText, getByLabelText } =
        render(<AdobeXDIcon />);
      const inputField = getByLabelText('Search icon');
      fireEvent.change(inputField, { target: { value: 'searched' } });
      expect(getByText('searched')).toBeInTheDocument();
    });

    it('responds to form submissions', async () => {
      const { getByRole, getByText, getByLabelText } =
        render(<AdobeXDIcon />);
      const searchInput = getByLabelText('Search icon');
      const submitButton = getByText('Submit');
      fireEvent.change(searchInput, { target: { value: 'searched' } });
      fireEvent.click(submitButton);
      expect(getByText('searched')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('dispatches a call to the parent component\'s handleIconChange function', async () => {
      const mockHandleIconChange = jest.fn();
      render(<AdobeXDIcon onIconChange={mockHandleIconChange} />);
      fireEvent.click(document.querySelector('img'));
      expect(mockHandleIconChange).toHaveBeenCalledTimes(1);
    });
  });
});