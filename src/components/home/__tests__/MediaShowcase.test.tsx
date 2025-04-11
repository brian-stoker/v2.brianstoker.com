import * as React from 'react';
import { alpha, ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import Frame from "../action/Frame";
import Fade from "@mui/material/Fade";

describe('MediaShowcase component', () => {
  const theme = createTheme();

  it('should render without crashing', () => {
    const showcaseContent = <div>Hello World!</div>;
    const mediaShowcase = <MediaShowcase sx={{ backgroundColor: 'red' }} showcaseContent={showcaseContent} />;
    expect(mediaShowcase).toBeTruthy();
  });

  describe('with props', () => {
    it('should validate sx prop', () => {
      expect(() => <MediaShowcase sx={alpha(1)} />).not.toThrowError();
    });

    it('should validate showcaseContent prop', () => {
      const invalidShowcaseContent = null;
      expect(() => <MediaShowcase showcaseContent={invalidShowcaseContent} />).toThrowError();

      const validShowcaseContent = <div>Hello World!</div>;
      const mediaShowcase = <MediaShowcase showcaseContent={validShowcaseContent} />;
      expect(mediaShowcase).toBeTruthy();
    });

    describe('with sx props', () => {
      it('should apply styles to children', () => {
        const showcaseContent = <div>Hello World!</div>;
        const mediaShowcase = <MediaShowcase sx={{ backgroundColor: 'red' }} showcaseContent={showcaseContent} />;
        expect(mediaShowcase).toHaveStyleRule('backgroundColor', alpha(1));
      });

      it('should not apply styles if no sx prop is provided', () => {
        const showcaseContent = <div>Hello World!</div>;
        const mediaShowcase = <MediaShowcase showcaseContent={showcaseContent} />;
        expect(mediaShowcase).not.toHaveStyleRule('backgroundColor');
      });
    });

    describe('with customized theme', () => {
      it('should render with correct colors', () => {
        const globalTheme = { palette: { mode: 'dark' } };
        const mediaShowcase = <MediaShowcase sx={{ backgroundColor: 'red' }} showcaseContent={<Frame.Demo />} useGlobalTheme={true} globalTheme={globalTheme} />;
        expect(mediaShowcase).toHaveStyleRule('backgroundColor', theme.palette.primaryDark[800]);
      });
    });
  });

  describe('with user interactions', () => {
    const showcaseContent = <div>Hello World!</div>;
    let mediaShowcase: JSX.Element;

    beforeEach(() => {
      mediaShowcase = <MediaShowcase showcaseContent={showcaseContent} />;
    });

    it('should handle click event', () => {
      const onClickMock = jest.fn();
      mediaShowcase = <MediaShowcase onClick={onClickMock} showcaseContent={showcaseContent} />;
      mediaShowcase.props.onClick();
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should handle input change event', () => {
      const onChangeMock = jest.fn();
      mediaShowcase = <MediaShowcase value={''} onChange={onChangeMock} showcaseContent={showcaseContent} />;
      mediaShowcase.props.onChange('');
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission event', () => {
      const onSubmitMock = jest.fn();
      mediaShowcase = <MediaShowcase onSubmit={onSubmitMock} showcaseContent={showcaseContent} />;
      mediaShowcase.props.onSubmit();
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('with side effects', () => {
    it('should handle useGlobalTheme prop', () => {
      const globalTheme = { palette: { mode: 'dark' } };
      let useGlobalThemeMock: boolean;
      let mediaShowcase: JSX.Element;

      beforeEach(() => {
        mediaShowcase = <MediaShowcase useGlobalTheme={useGlobalThemeMock} globalTheme={globalTheme} />;
      });

      it('should render with correct colors', () => {
        expect(useGlobalThemeMock).toBe(true);
      });
    });
  });
});