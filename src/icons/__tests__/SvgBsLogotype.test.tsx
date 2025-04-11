import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SvgBsLogomark from './SvgBsLogomark';
import RootSvg from 'src/icons/RootSvg';

const MockTheme = {
  applyDarkStyles: (styles) => styles,
};

describe('Svg Bs Logomark', () => {
  const initialProps = {
    size: 24,
    fill: '#fff',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SvgBsLogomark {...initialProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders the root svg when props are provided', async () => {
      const { container } = render(<SvgBsLogomark size={24} fill="#fff" />);
      const rootSvg = container.querySelector(RootSvg);
      expect(rootSvg).toBeInTheDocument();
    });

    it('does not render anything when no props are passed', async () => {
      const { container } = render(<SvgBsLogomark />);
      expect(container).not.toContain(element => element instanceof RootSvg);
    });
  });

  describe('prop validation', () => {
    it('throws an error if size is invalid', async () => {
      expect(() =>
        render(<SvgBsLogomark size="invalid" fill="#fff" />)
      ).toThrowError();
    });

    it('does not throw an error when size is valid', async () => {
      const { container } = render(<SvgBsLogomark size={24} fill="#fff" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onSizeChange with the correct size when clicked', async () => {
      const mockOnSizeChange = jest.fn();
      const { container } = render(<SvgBsLogomark size={24} fill="#fff" />);
      const svg = container.querySelector(RootSvg);
      fireEvent.click(svg);
      expect(mockOnSizeChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSizeChange with the correct value when input changes', async () => {
      const mockOnSizeChange = jest.fn();
      const { container } = render(<SvgBsLogomark size={24} fill="#fff" />);
      const svg = container.querySelector(RootSvg);
      const sizeInput = container.querySelector('input[type="number"]');
      fireEvent.change(sizeInput, { target: { value: 36 } });
      expect(mockOnSizeChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('styles', () => {
    it('adds the correct style when fill prop is provided', async () => {
      const { container } = render(<SvgBsLogomark size={24} fill="#fff" />);
      const svg = container.querySelector(RootSvg);
      expect(svg.style.fill).toBe('#fff');
    });

    it('does not add any styles when fill prop is not provided', async () => {
      const { container } = render(<SvgBsLogomark size={24} />);
      const svg = container.querySelector(RootSvg);
      expect(svg.style.fill).not.toBeDefined();
    });
  });
});