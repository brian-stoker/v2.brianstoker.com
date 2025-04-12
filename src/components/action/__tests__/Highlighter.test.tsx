import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ButtonBase, { ButtonBaseProps } from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import Highlighter from './Highlighter.test.tsx';

describe('Highlighter', () => {
  const createProps = (props?: Partial<ButtonBaseProps>) => ({
    disableBorder: props?.disableBorder,
    selectedBg: props?.selectedBg,
    selected: props?.selected,
    ...props,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const props = createProps({
      disableBorder: false,
      selectedBg: 'white',
      selected: true,
    });
    render(<Highlighter {...props} />);
  });

  describe('Conditional Rendering', () => {
    it('renders correctly when all props are true', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'comfort',
        selected: true,
      });
      expect(render(<Highlighter {...props} />).container).toHaveClass(
        'MuiButtonBase-root-1'
      );
    });

    it('renders correctly when disableBorder prop is true', () => {
      const props = createProps({
        disableBorder: true,
        selectedBg: 'white',
        selected: false,
      });
      expect(render(<Highlighter {...props} />).container).not.toHaveClass(
        'MuiButtonBase-root-1'
      );
    });

    it('renders correctly when selected prop is false', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'comfort',
        selected: false,
      });
      expect(render(<Highlighter {...props} />).container).not.toHaveClass(
        'MuiButtonBase-root-1'
      );
    });

    it('renders correctly when selected prop is true', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'comfort',
        selected: true,
      });
      expect(render(<Highlighter {...props} />).container).toHaveClass(
        'MuiButtonBase-root-1'
      );
    });
  });

  describe('Props Validation', () => {
    it('throws an error when disableBorder prop is undefined', () => {
      const props = createProps({
        selectedBg: 'comfort',
        selected: true,
      });
      expect(() => render(<Highlighter {...props} />)).toThrowError(
        'disableBorder is required.'
      );
    });

    it('throws an error when selected prop is undefined', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'comfort',
      });
      expect(() => render(<Highlighter {...props} />)).toThrowError(
        'selected is required.'
      );
    });

    it('renders correctly when all props are valid', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'white',
        selected: true,
      });
      expect(render(<Highlighter {...props} />).container).toHaveClass(
        'MuiButtonBase-root-1'
      );
    });

    it('renders correctly when some props are valid', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'white',
      });
      expect(render(<Highlighter {...props} />).container).toHaveClass(
        'MuiButtonBase-root-1'
      );
    });
  });

  describe('User Interactions', () => {
    it('scrolls to the element when clicked', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'white',
        selected: true,
      });
      const { getByText } = render(<Highlighter {...props} />);
      const button = getByText('Button');
      fireEvent.click(button);
      expect(document.body).toHaveElementByClass(
        'MuiButtonBase-root-1'
      );
    });

    it('scrolls to the element when focused', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'white',
        selected: true,
      });
      const { getByText } = render(<Highlighter {...props} />);
      const button = getByText('Button');
      fireEvent.focus(button);
      expect(document.body).toHaveElementByClass(
        'MuiButtonBase-root-1'
      );
    });

    it('does not scroll when disabled', () => {
      const props = createProps({
        disableBorder: false,
        selectedBg: 'white',
        selected: true,
      });
      const { getByText } = render(<Highlighter {...props} />);
      const button = getByText('Button');
      expect(document.body).not.toHaveElementByClass(
        'MuiButtonBase-root-1'
      );
    });
  });
});