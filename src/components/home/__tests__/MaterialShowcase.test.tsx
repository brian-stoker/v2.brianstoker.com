import * as React from 'react';
import { alpha, ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button, { buttonClasses } from '@mui/material/Button';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/components/markdown/MarkdownElement';
import MaterialDesignDemo, { componentCode } from 'src/components/home/MaterialDesignDemo';
import ShowcaseContainer from 'src/components/home/ShowcaseContainer';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import StylingInfo from 'src/components/action/StylingInfo';
import FlashCode from 'src/components/animation/FlashCode';

describe('MaterialShowcase', () => {
  const initialTheme = useTheme();
  const initialCustomized = false;

  beforeEach(() => {
    jest.clearAllMocks();
    global.theme = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => render(<MaterialShowcase />)).not.toThrow();
  });

  describe('props validation', () => {
    const theme = createTheme({ palette: { mode: 'light' } });
    const customized = false;

    it('should not throw an error when passing a valid theme object', () => {
      expect(() => render(<MaterialShowcase theme={theme} customized={customized} />)).not.toThrow();
    });

    it('should throw an error when passing a null theme object', () => {
      expect(() => render(<MaterialShowcase theme={null} customized={customized} />)).toThrowError(
        'Invalid theme object',
      );
    });
  });

  describe('showcase container props', () => {
    const preview = <ThemeProvider theme={initialTheme}>{/* Preview component */}</ThemeProvider>;
    const code = <div data-mui-color-scheme="dark">/* Code component */</div>;

    it('should pass the correct theme to the pointer container', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().pointerContainer.props.theme).toBe(initialTheme);
    });

    it('should pass the correct props to the button components', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().buttons[0].props.onClick).toHaveBeenCalledTimes(1);
      expect(wrapper.instance().buttons[1].props.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('pointer container props', () => {
    it('should pass the correct onElementChange prop to the MaterialDesignDemo component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().pointerContainer.props.onElementChange).toBeInstanceOf(Function);
    });
  });

  describe('flash code props', () => {
    it('should pass the correct startLine and endLine props to the FlashCode component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().flashCode.props.startLine).toBeInstanceOf(Number);
      expect(wrapper.instance().flashCode.props.endLine).toBeInstanceOf(Number);
    });
  });

  describe('highlighted code props', () => {
    it('should pass the correct component to the HighlightedCode component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().highlightedCode.props.component).toBe(MarkdownElement);
    });

    it('should pass the correct language prop to the HighlightedCode component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().highlightedCode.props.language).toBe('jsx');
    });
  });

  describe('styling info props', () => {
    it('should pass the correct appeared prop to the StylingInfo component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().stylingInfo.props.appeared).toBe(initialCustomized);
    });

    it('should pass the correct sx prop to the StylingInfo component', () => {
      const wrapper = render(<MaterialShowcase preview={preview} code={code} />);
      expect(wrapper.instance().stylingInfo.props.sx).toEqual({ mx: -2 });
    });
  });
});