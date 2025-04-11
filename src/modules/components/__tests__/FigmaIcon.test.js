import React from 'react';
import { createSvgIcon, SvgIconProps } from '@mui/material/utils';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('FigmaIcon', () => {
  const createMockIcon = (props: SvgIconProps) => {
    return (
      <div>
        {props.children}
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const props = {};
    render(createSvgIcon(props, 'Figma'));
  });

  it('renders with correct fill colors', () => {
    const props = {
      children: (
        <g fillRule="nonzero" fill="none">
          <path d="M8 24a4 4 0 004-4v-4H8a4 4 0 000 8z" fill="#0ACF83" />
          <path d="M4 12a4 4 0 014-4h4v8H8a4 4 0 01-4-4z" fill="#A259FF" />
          <path d="M4 4a4 4 0 014-4h4v8H8a4 4 0 01-4-4z" fill="#F24E1E" />
          <path d="M12 0h4a4 4 0 010 8h-4V0z" fill="#FF7262" />
          <path d="M20 12a4 4 0 11-8 0 4 4 0 018 0z" fill="#1ABCFE" />
        </g>,
      ),
    };
    const { container } = render(createMockIcon(props));
    expect(container).toMatchSnapshot();
  });

  it('renders with correct width and height', () => {
    const props = {};
    render(createSvgIcon(props, 'Figma'));
    expect(getComputedStyle(document.querySelector('div')).width).toBe('24px');
    expect(getComputedStyle(document.querySelector('div')).height).toBe('24px');
  });

  describe('props validation', () => {
    it('does not throw an error with valid props', () => {
      const props = {};
      render(createSvgIcon(props, 'Figma'));
    });

    it('throws an error with invalid props', () => {
      const props = { invalid: 'prop' };
      expect(() => render(createSvgIcon(props, 'Figma'))).toThrow();
    });
  });

  describe('user interactions', () => {
    const createMockIconWithEventListners = (props: SvgIconProps) => {
      return (
        <div>
          {props.children}
          <button onClick={() => console.log('Button clicked')}>Click me</button>
        </div>
      );
    };

    it('calls onClick event when button is clicked', () => {
      const props = {};
      render(createMockIcon(props), createMockIconWithEventListners(props));
      const button = document.querySelector('button');
      fireEvent.click(button!);
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick event when icon is clicked', () => {
      const props = { children: 'div' };
      render(createMockIcon(props), createMockIconWithEventListners(props));
      const icon = document.querySelector('.MuiSvgIcon-root');
      fireEvent.click(icon!);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('conditional rendering', () => {
    it('renders when children prop is truthy', () => {
      const props = { children: <div>Children</div> };
      render(createSvgIcon(props, 'Figma'));
    });

    it('does not render when children prop is falsy', () => {
      const props = {};
      render(createSvgIcon(props, 'Figma'));
    });
  });

  describe('edge cases', () => {
    it('handles null children prop correctly', () => {
      const props = { children: null };
      render(createSvgIcon(props, 'Figma'));
    });

    it('handles undefined children prop correctly', () => {
      const props = {};
      expect(() => render(createSvgIcon(props, 'Figma'))).toThrow();
    });
  });
});