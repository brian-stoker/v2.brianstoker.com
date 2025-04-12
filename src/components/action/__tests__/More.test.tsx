import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import More from './More';
import { ButtonBaseProps } from '@mui/material/ButtonBase';

describe('More component', () => {
  let moreRef;

  beforeEach(() => {
    moreRef = render(<More></More>).current;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(moreRef).toBeTruthy();
  });

  describe('props validation', () => {
    const props: ButtonBaseProps = {
      children: <div>Some content</div>,
      onClick: () => {},
      onFocusVisible: () => {},
    };

    it('accepts valid props', () => {
      expect(moreRef).toHaveStyleRule('p', '2px');
      expect(moreRef).toHaveStyleRule('display', 'flex');
      expect(moreRef).toHaveStyleRule('alignItems', 'center');
      expect(moreRef).toHaveStyleRule('justifyContent', 'flex-start');
    });

    it('rejects invalid props', () => {
      const invalidProps: ButtonBaseProps = {};

      expect(() => render(<More {...invalidProps} />)).toThrowError(
        TypeError
      );
    });
  });

  describe('conditional rendering', () => {
    const childrenProp = [
      <div>Some content</div>,
      <span>Another content</span>,
    ];

    it('renders children prop when present', () => {
      moreRef.children = childrenProp[0];

      expect(moreRef).toHaveStyleRule('width', '100%');

      expect(moreRef).toHaveTextContent('Some content');
    });

    it('does not render children prop when absent', () => {
      expect(moreRef).not.toHaveTextContent();
    });
  });

  describe('user interactions', () => {
    let mockRef;

    beforeEach(() => {
      mockRef = { scrollIntoView: jest.fn() };
    });

    it('calls onClick when button is clicked', () => {
      const mockonClick = jest.fn();

      moreRef.onClick(mockRef, mockonClick);

      fireEvent.click(moreRef);

      expect(mockonClick).toHaveBeenCalledTimes(1);
    });

    it('scrolls to ref element on focus', () => {
      fireEvent.mouseDown(moreRef, { currentTarget: mockRef });
      fireEvent.focus(moreRef);

      expect(mockRef.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it('calls onFocusVisible when button is focused and visible', async () => {
      const mockOnFocusVisible = jest.fn();

      moreRef.onFocusVisible = mockOnFocusVisible;

      fireEvent.focus(moreRef);

      await waitFor(() => expect(mockOnFocusVisible).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('applies theme styles when present', async () => {
      const darkStyles: { [key: string]: any } = {};

      moreRef sx = [
        (theme) => ({ ...darkStyles }),
        ...(Array.isArray(moreRef.sx) ? moreRef.sx : [moreRef.sx]),
      ];

      expect(darkStyles).toEqual({
        borderColor: `primaryDark.400`,
        bgcolor: `primary.900`,
      });
    });

    it('does not apply theme styles when absent', () => {
      expect(moreRef).not.toHaveStyleRule('borderColor');
      expect(moreRef).not.toHaveStyleRule('bgcolor');
    });
  });

  describe('snapshot test', () => {
    const expectedHtml = '<button>...</button>';

    it('matches the snapshot', () => {
      expect(render(<More></More>, { wrapper: 'div' })).toMatchSnapshot();
    });
  });
});