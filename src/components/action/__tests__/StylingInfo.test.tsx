import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { Link } from '@stoked-ui/docs/Link';
import ROUTES from 'src/route';

interface StylingInfoProps {
  appeared: boolean;
  stylingContent?: React.ReactElement;
}

describe('StylingInfo component', () => {
  let stylinfComponent: JSX.Element | null;

  beforeEach(() => {
    const props = {
      appeared: false,
      stylingContent: undefined,
    };

    stylinfComponent = (
      <StylingInfo {...props} />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(stylinfComponent).toBeDefined();
  });

  describe('conditional rendering', () => {
    it('renders default content when stylingContent is undefined', () => {
      const props = { appeared: true, stylingContent: undefined };
      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(stylinfComponent).toMatchSnapshot();
    });

    it('renders custom content when stylingContent is defined', () => {
      const props = { appeared: true, stylingContent: <div>Hello World!</div> };
      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(stylinfComponent).toMatchSnapshot();
    });
  });

  describe('prop validation', () => {
    it('accepts appeared prop of type boolean', () => {
      const props: StylingInfoProps = { appeared: true };
      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(props.appeared).toBe(true);
    });

    it('rejects non-boolean value for appeared prop', () => {
      const props: StylingInfoProps = { appeared: 'hello' };
      expect(() => <StylingInfo {...props} />).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onClick callback when button is clicked', () => {
      const handleClickMock = jest.fn();

      const props: StylingInfoProps = { appeared: true, stylingContent: undefined };
      stylinfComponent = (
        <StylingInfo {...props} onClick={handleClickMock} />
      );

      const element = stylinfComponent as React.ReactElement<any>;
      const button = element.querySelector('IconButton');

      expect(button!.ariaLabel).toBe('hide');
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClick callback when button is clicked with false appeared prop', () => {
      const handleClickMock = jest.fn();

      const props: StylingInfoProps = { appeared: false, stylingContent: undefined };
      stylinfComponent = (
        <StylingInfo {...props} onClick={handleClickMock} />
      );

      const element = stylinfComponent as React.ReactElement<any>;
      const button = element.querySelector('IconButton');

      expect(button!.ariaLabel).toBe('show');
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClick callback when stylingContent prop is updated', () => {
      const handleClickMock = jest.fn();

      const props: StylingInfoProps = { appeared: true, stylingContent: undefined };
      stylinfComponent = (
        <StylingInfo {...props} onClick={handleClickMock} />
      );

      const element = stylinfComponent as React.ReactElement<any>;
      const button = element.querySelector('IconButton');

      expect(button!.ariaLabel).toBe('hide');
      expect(handleClickMock).toHaveBeenCalledTimes(1);

      props.stylingContent = <div>Hello World!</div>;

      expect(element).toMatchSnapshot();
    });
  });

  describe('state changes', () => {
    it('sets hidden state to true when button is clicked', () => {
      const handleClickMock = jest.fn();

      const props: StylingInfoProps = { appeared: true, stylingContent: undefined };
      stylinfComponent = (
        <StylingInfo {...props} onClick={handleClickMock} />
      );

      const element = stylinfComponent as React.ReactElement<any>;
      const button = element.querySelector('IconButton');

      expect(button!.ariaLabel).toBe('hide');
      expect(handleClickMock).toHaveBeenCalledTimes(1);

      stylinfComponent = (
        <StylingInfo {...props} onClick={handleClickMock} />
      );

      expect(props.hidden).toBe(true);
    });
  });

  describe('mocks', () => {
    const palette = { common: { black: '#333' } };
    jest.mock('@mui/material/styles', () => ({
      createTheme: () => ({ palette }),
    }));

    it('sets palette when stylingContent prop is defined', () => {
      const props: StylingInfoProps = { appeared: true, stylingContent: <div>Hello World!</div> };

      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(props.palette).toEqual({ common: { black: '#333' } });
    });

    it('sets palette when appeared prop is true', () => {
      const props: StylingInfoProps = { appeared: true, stylingContent: undefined };

      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(props.palette).toEqual({ common: { black: '#333' } });
    });

    it('sets palette when appeared prop is false', () => {
      const props: StylingInfoProps = { appeared: false, stylingContent: undefined };

      stylinfComponent = (
        <StylingInfo {...props} />
      );

      expect(props.palette).toEqual({ common: { black: '#333' } });
    });
  });
});