import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import NpmCopyButton from './NpmCopyButton';

describe('NpmCopyButton component', () => {
  const installation = 'https://example.com/installation';
  let mockClick;

  beforeEach(() => {
    mockClick = jest.fn();
  });

  afterEach(() => {
    mockClick.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = render(<NpmCopyButton installation={installation} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('displays the copy icon when not copied', () => {
      const { getByText } = render(<NpmCopyButton installation={installation} />);
      expect(getByText('$')).toBeInTheDocument();
      expect(getByText('<ContentCopyRounded />')).not.toBeInTheDocument();
    });

    it('displays the check icon when copied', () => {
      const { getByText, getByRole } = render(<NpmCopyButton installation={installation} copied={true} />);
      expect(getByText('$')).toBeInTheDocument();
      expect(getByRole('img', { name: 'CheckRounded' })).toBeInTheDocument();
    });
  });

  describe('props validation', () => {
    it('throws an error when installation prop is missing', () => {
      expect(() => render(<NpmCopyButton />)).toThrowError();
    });

    it('passes through other props to the button element', () => {
      const { getByText } = render(<NpmCopyButton installation={installation} onClick={mockClick} />);
      expect(getByText('$')).toBeInTheDocument();
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('user interactions', () => {
    it('calls onClick when the button is clicked', () => {
      const { getByText } = render(<NpmCopyButton installation={installation} onClick={mockClick} />);
      const button = getByText('$');
      fireEvent.click(button as React.ReactElement);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when the copy icon is clicked', () => {
      const { getByText, getByRole } = render(<NpmCopyButton installation={installation} copied={false} />);
      const button = getByText('$');
      fireEvent.click(getByRole('img', { name: 'ContentCopyRounded' }));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when the copy icon is clicked when already copied', () => {
      const { getByText, getByRole } = render(<NpmCopyButton installation={installation} onClick={mockClick} copied={true} />);
      const button = getByText('$');
      fireEvent.click(getByRole('img', { name: 'CheckRounded' }));
      expect(mockClick).not.toHaveBeenCalled();
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<NpmCopyButton installation={installation} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});