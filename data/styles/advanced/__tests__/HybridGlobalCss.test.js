import React from 'react';
import { render } from '@testing-library/react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import HybridGlobalCss from './HybridGlobalCss';

jest.mock('@mui/styles', () => ({
  makeStyles: jest.fn(() => ({})),
}));

describe('Hybrid Global CSS Component', () => {
  let wrapper;
  const useGlobalStyles = jest.fn();

  beforeEach(() => {
    wrapper = render(<HybridGlobalCss />);
    useGlobalStyles.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  it('renders with classes applied correctly', () => {
    const { getByText } = wrapper;
    expect(getByText('child')).toHaveStyleRule('height', '8px');
  });

  describe('conditional rendering', () => {
    it('renders child element when condition is true', () => {
      useGlobalStyles.mockImplementation(() => ({ root: { height: '100' } }));
      const { getByText } = render(<HybridGlobalCss />);
      expect(getByText('child')).toBeInTheDocument();
    });

    it('does not render child element when condition is false', () => {
      useGlobalStyles.mockImplementation(() => ({ root: { height: '' } }));
      const { queryByText } = render(<HybridGlobalCss />);
      expect(queryByText('child')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('passes when all props are valid', () => {
      const props = {};
      render(<HybridGlobalCss {...props} />);
      expect(useGlobalStyles).toHaveBeenCalledTimes(1);
    });

    it('throws an error when prop is invalid', () => {
      const props = { foo: 'bar' };
      expect(() => render(<HybridGlobalCss {...props} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('renders child element on click', () => {
      useGlobalStyles.mockImplementation(() => ({ root: { height: '100' } }));
      const { getByText, fireEvent } = render(<HybridGlobalCss />);
      fireEvent.click(getByText('child'));
      expect(getByText('child')).toHaveStyleRule('height', '8px');
    });

    it('does not render child element on non-click interactions', () => {
      useGlobalStyles.mockImplementation(() => ({ root: { height: '100' } }));
      const { getByText, getByRole } = render(<HybridGlobalCss />);
      fireEvent.click(getByText('child'));
      expect(getByRole('button')).not.toBeInTheDocument();
    });
  });

  it('renders without crashing when side effects occur', () => {
    useGlobalStyles.mockImplementation(() => ({ root: { height: '100' } }));
    const { getByText } = render(<HybridGlobalCss />);
    expect(getByText('child')).toHaveStyleRule('height', '8px');
  });

  it('snapshot test', () => {
    const { asFragment } = render(<HybridGlobalCss />);
    expect(asFragment()).toMatchSnapshot();
  });
});