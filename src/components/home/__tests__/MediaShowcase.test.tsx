import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import Frame from "../action/Frame";
import Fade from "@mui/material/Fade";

describe('MediaShowcase component', () => {
  const theme = createTheme();
  const defaultProps = {
    sx: {},
    showcaseContent: null
  };

  beforeEach(() => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <MediaShowcase {...defaultProps} />
      </ThemeProvider>
    );
    expect(document.querySelector('.MuiBox')).not.toBeNull();
  });

  describe('prop validation', () => {
    it('should accept valid sx props', () => {
      const props = { ...defaultProps, sx: { display: 'flex' } };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).toHaveStyle('display: flex');
    });

    it('should reject invalid sx props', () => {
      const props = { ...defaultProps, sx: { nonExistentProperty: 'value' } };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).not.toHaveStyle('nonExistentProperty');
    });

    it('should accept valid showcaseContent prop', () => {
      const props = { ...defaultProps, showcaseContent: 'Hello World' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).toHaveTextContent('Hello World');
    });

    it('should reject invalid showcaseContent prop', () => {
      const props = { ...defaultProps, showcaseContent: null };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).not.toHaveTextContent();
    });
  });

  describe('conditional rendering', () => {
    it('should render Frame.Demo when showcaseContent is provided', () => {
      const props = { ...defaultProps, showcaseContent: 'Hello World' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).toHaveChildElement('Frame.Demo');
    });

    it('should not render Frame.Demo when showcaseContent is not provided', () => {
      const props = { ...defaultProps, showcaseContent: null };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).not.toHaveChildElement('Frame.Demo');
    });
  });

  describe('user interactions', () => {
    it('should update state when user input changes', () => {
      const props = { ...defaultProps, showcaseContent: 'Hello World' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      const inputField = document.querySelector('input');
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      expect(props.showcaseContent).toBe('New Value');
    });

    it('should not update state when user clicks outside', () => {
      const props = { ...defaultProps, showcaseContent: 'Hello World' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      const inputField = document.querySelector('input');
      fireEvent.click(document.body);
      expect(props.showcaseContent).toBe('Hello World');
    });
  });

  describe('line mapping', () => {
    it('should render highlighted lines when element.id is provided', () => {
      const props = { ...defaultProps, showcaseContent: '<div id="1"></div><div id="2"></div>' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).toHaveChildElement('div');
    });

    it('should not render highlighted lines when element.id is not provided', () => {
      const props = { ...defaultProps, showcaseContent: '<div id="1"></div>' };
      render(
        <ThemeProvider theme={theme}>
          <MediaShowcase {...props} />
        </ThemeProvider>
      );
      expect(document.querySelector('.MuiBox')).not.toHaveChildElement('div');
    });
  });
});