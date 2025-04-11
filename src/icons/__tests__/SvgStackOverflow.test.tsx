import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SvgStackOverflow from './SvgStackOverflow';

describe('SvgStackOverflow component', () => {
  const props: SvgIconProps = {
    fontSize: '24px',
    color: 'currentColor',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SvgStackOverflow {...props} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders path when props are provided', async () => {
      const { getByPath } = render(<SvgStackOverflow {...props} />);
      const path = getByPath('M19.04 20.04v-5.87h1.99V22H3v-7.83h2v5.87h14.05-.01Z');
      expect(path).toBeTruthy();
    });

    it('renders fallback when props are not provided', async () => {
      const { getByText } = render(<SvgStackOverflow />);
      const fallback = getByText('Fallback text');
      expect(fallback).toBeTruthy();
    });
  });

  describe('prop validation', () => {
    it('accepts valid fontSize prop', async () => {
      const { container } = render(<SvgStackOverflow {...props} fontSize="24px" />);
      expect(container).toBeTruthy();
    });

    it('rejects invalid fontSize prop', async () => {
      const { container } = render(<SvgStackOverflow {...props} fontSize="invalid" />);
      expect(container).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('responds to click events', async () => {
      const { getByRole, getByText } = render(<SvgStackOverflow {...props} />);
      const icon = getByRole('img');
      fireEvent.click(icon);
      expect(getByText(props.fontSize)).toBeInTheDocument();
    });

    it('responds to input changes', async () => {
      const { getByRole, getByText } = render(<SvgStackOverflow {...props} />);
      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(getByText(props.fontSize)).toBeInTheDocument();
    });

    it('responds to form submissions', async () => {
      const { getByRole, getByText } = render(<SvgStackOverflow {...props} />);
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(getByText(props.fontSize)).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('calls onClick callback when props are provided', async () => {
      const onClickCallback = jest.fn();
      const { container } = render(<SvgStackOverflow {...props} onClick={onClickCallback} />);
      expect(onClickCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshots', () => {
    it('renders correctly when props are provided', async () => {
      const { asFragment } = render(<SvgStackOverflow {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});