import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import W3CIcon from './W3CIcon'; // Import the component being tested
import createSvgIcon from '@mui/material/utils';

describe('W3CIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<W3CIcon />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    const invalidProps = ['invalidProp'];

    it('throws an error when receiving invalid props', () => {
      try {
        render(<W3CIcon {...{ invalidProps }} />);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toBe('Invalid prop: invalidProp');
      }
    });
  });

  describe('conditional rendering', () => {
    it('renders the icon correctly when receiving valid props', async () => {
      const { getByTitle } = render(<W3CIcon />);
      await waitFor(() => getByTitle('W3C'));
      expect(getByTitle('W3C')).toBeInTheDocument();
    });

    it('does not render the icon when receiving invalid props', async () => {
      const { queryByTitle } = render(<W3CIcon invalidProp="value" />);
      await waitFor(() => queryByTitle('W3C') === null);
      expect(queryByTitle('W3C')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('clicks the icon correctly', async () => {
      const { getByTitle } = render(<W3CIcon />);
      await waitFor(() => getByTitle('W3C'));
      const icon = getByTitle('W3C');
      fireEvent.click(icon);
      expect(icon).toHaveStyle('opacity: 0.8');
    });

    it('does not click the icon when receiving invalid props', async () => {
      const { queryByTitle } = render(<W3CIcon invalidProp="value" />);
      await waitFor(() => queryByTitle('W3C') === null);
      const icon = queryByTitle('W3C');
      fireEvent.click(icon);
      expect(icon).toBeNull();
    });
  });

  describe('side effects', () => {
    it('calls the createSvgIcon function correctly', async () => {
      const { getByTitle } = render(<W3CIcon />);
      await waitFor(() => getByTitle('W3C'));
      const icon = getByTitle('W3C');
      expect(createSvgIcon).toHaveBeenCalledTimes(1);
      expect(createSvgIcon).toHaveBeenCalledWith(
        <g fillRule="nonzero" fill="none">
          {/* ... */}
        </g>,
        'W3C',
      );
    });
  });
});